from fastapi import File, UploadFile, HTTPException, Form
from typing import Optional, List
from fastapi.responses import StreamingResponse, RedirectResponse, JSONResponse
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload
from google.oauth2 import service_account
from Config.db import document_collection, get_next_sequence_value
from pathlib import Path
from datetime import datetime
import httpx
import fitz  # PyMuPDF
import io
import requests
import os
import tempfile
import logging
import docx # Required for reading .docx files
import google.generativeai as genai
from dotenv import load_dotenv
import time

# --- Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- LLM and API Key Configuration ---
try:
    load_dotenv()
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GOOGLE_API_KEY:
        logger.warning("GOOGLE_API_KEY not found in .env file. LLM classification will be disabled.")
        genai.configure(api_key="DUMMY_KEY") # Configure with a dummy to avoid errors on import
    else:
        genai.configure(api_key=GOOGLE_API_KEY)
except ImportError:
    logger.warning("'python-dotenv' not installed. Cannot load GOOGLE_API_KEY from .env file.")
    GOOGLE_API_KEY = None


# --- Google Drive Configuration ---
DRIVE_ROOT_FOLDER_ID = "1GxNapTLGFcUmshr3ZEjBHSVy3BW8NdJr" 
CURRENT_USER = "Sample User"

# --- Service Account Initialization ---
SERVICE_ACCOUNT_FILE = Path(__file__).resolve().parent / '..' / "Config" / "file-service.json"
SCOPES = ['https://www.googleapis.com/auth/drive.file']
try:
    credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    drive_service = build('drive', 'v3', credentials=credentials)
    logger.info("Google Drive service initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize Google Drive service: {e}")
    drive_service = None

# --- Keyword-based Classifier (Fallback) ---
def classify_document_simple(filename: str) -> str:
    """A simple keyword-based classifier used as a fallback."""
    filename_lower = filename.lower()
    if "boq" in filename_lower or "bill of quantities" in filename_lower: return "Bill of Quantities (BOQ)"
    if "contract" in filename_lower or "agreement" in filename_lower: return "Contracts and Agreements"
    if "tender" in filename_lower or "bid" in filename_lower: return "Tender Documents"
    if "progress" in filename_lower and "report" in filename_lower: return "Progress Reports"
    if "final" in filename_lower and "report" in filename_lower: return "Final Reports"
    if "cost" in filename_lower or "estimation" in filename_lower: return "Cost Estimations"
    if "invoice" in filename_lower or "payment" in filename_lower: return "Invoices and Financials"
    if "drawing" in filename_lower or "plan" in filename_lower: return "Drawings and Plans"
    if "permit" in filename_lower or "license" in filename_lower: return "Permits and Licenses"
    if "safety" in filename_lower or "compliance" in filename_lower: return "Safety and Compliance"
    return "Other"

# --- LLM-Powered Document Classifier ---
async def classify_document_with_llm(filename: str, content: bytes, file_type: str) -> str:
    """
    Predicts document category using the Gemini LLM with a few-shot prompt.
    Falls back to simple keyword-based classification if the API call fails or is not configured.
    """
    if not GOOGLE_API_KEY:
        logger.info("Using simple classifier because GOOGLE_API_KEY is not configured.")
        return classify_document_simple(filename)

    text_content = ""
    try:
        if file_type == "application/pdf":
            with fitz.open(stream=io.BytesIO(content), filetype="pdf") as doc:
                text_content = "".join(page.get_text() for page in doc)
        elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or filename.lower().endswith('.docx'):
            doc = docx.Document(io.BytesIO(content))
            text_content = "\n".join([para.text for para in doc.paragraphs])
        else:
            # Attempt to decode as text for other file types (e.g., .txt, .csv)
            text_content = content.decode('utf-8', errors='ignore')
    except Exception as e:
        logger.error(f"Failed to extract text from {filename}: {e}. Using fallback classifier.")
        return classify_document_simple(filename)

    if not text_content.strip():
        logger.warning(f"No text content could be extracted from {filename}. Using fallback classifier.")
        return classify_document_simple(filename)

    # Truncate content to a reasonable length for the API
    truncated_content = text_content[:8000]

    categories = [
        "Bill of Quantities (BOQ)", "Contracts and Agreements", "Tender Documents",
        "Progress Reports", "Final Reports", "Cost Estimations", "Invoices and Financials",
        "Drawings and Plans", "Permits and Licenses", "Safety and Compliance", "Other"
    ]
    
    # Few-shot prompt with high-quality examples to improve accuracy
    prompt = f"""
    You are an expert document classifier for the construction industry. Your task is to analyze the provided document content and classify it into exactly one of the following categories. Respond with ONLY the category name and nothing else.

    Categories: {', '.join(categories)}

    ---
    **Example 1:**
    Document Content: "This Agreement is made and entered into as of July 10, 2025, by and between Apex Construction Ltd. ('Contractor') and Elysian Properties Inc. ('Owner'). The Contractor shall provide all labor, materials, and equipment for the construction of the 'Azure Tower' project..."
    Category: Contracts and Agreements

    --- 
    **Example 2:**
    Document Content: "Weekly Progress Report #12. Period: July 1 - July 7, 2025. Project: Azure Tower. Summary: Concrete pouring for the 5th floor is 80% complete. Electrical rough-in is ongoing on floors 2 and 3. Safety inspection conducted on July 5, with no major findings. Upcoming Activities: Complete 5th-floor slab, begin framing on the 6th floor."
    Category: Progress Reports

    ---
    **Example 3:**
    Document Content: "Bill of Quantities - Item No. 3.1. Description: Reinforced Concrete Grade C35. Unit: Cubic Meter. Quantity: 1,200. Rate (USD): 150.00. Total (USD): 180,000.00."
    Category: Bill of Quantities (BOQ)

    ---
    **Document to Classify:**
    Document Filename: "{filename}"
    Document Content (excerpt):
    {truncated_content}
    ---
    Category:
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = await model.generate_content_async(prompt)
        predicted_category = response.text.strip()

        # Validate that the model's response is one of the allowed categories
        if predicted_category in categories:
            logger.info(f"LLM classified '{filename}' as '{predicted_category}'")
            return predicted_category
        else:
            logger.warning(f"LLM returned an invalid category: '{predicted_category}'. Using fallback.")
            return classify_document_simple(filename)
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}. Using fallback classifier.")
        return classify_document_simple(filename)


# --- Google Drive Helper Functions ---
def get_folder_id_by_name(folder_name: str, parent_id: str) -> str:
    """Get folder ID by name within a parent folder."""
    try:
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and '{parent_id}' in parents and trashed=false"
        response = drive_service.files().list(q=query, fields="files(id)").execute()
        files = response.get('files', [])
        return files[0]['id'] if files else None
    except Exception as e:
        logger.error(f"Error getting folder ID for {folder_name}: {e}")
        return None


def is_folder_empty(folder_id: str) -> bool:
    """Check if a folder is empty (contains no files or folders)."""
    try:
        query = f"'{folder_id}' in parents and trashed=false"
        response = drive_service.files().list(q=query, fields="files(id)", pageSize=1).execute()
        files = response.get('files', [])
        return len(files) == 0
    except Exception as e:
        logger.error(f"Error checking if folder {folder_id} is empty: {e}")
        return False


def get_or_create_drive_folder(name: str, parent_id: str) -> str:
    """Checks for a folder in Google Drive by name within a parent. Creates it if it doesn't exist."""
    if not drive_service:
        raise HTTPException(status_code=503, detail="Google Drive service is not available")
    
    try:
        # First, try to find existing folder
        existing_folder_id = get_folder_id_by_name(name, parent_id)
        if existing_folder_id:
            return existing_folder_id
        
        # Create new folder if it doesn't exist
        folder_metadata = {
            'name': name, 
            'mimeType': 'application/vnd.google-apps.folder', 
            'parents': [parent_id]
        }
        
        # Add retry mechanism for folder creation
        max_retries = 3
        for attempt in range(max_retries):
            try:
                folder = drive_service.files().create(body=folder_metadata, fields='id').execute()
                folder_id = folder.get('id')
                logger.info(f"Created new folder '{name}' with ID: {folder_id}")
                return folder_id
            except Exception as e:
                if "SSL" in str(e) or "EOF" in str(e) or "Connection" in str(e):
                    if attempt < max_retries - 1:
                        logger.warning(f"Network error creating folder on attempt {attempt + 1}/{max_retries}: {e}. Retrying...")
                        time.sleep(2 ** attempt)  # Exponential backoff
                        continue
                    else:
                        raise HTTPException(
                            status_code=503, 
                            detail="Network connectivity issue with Google Drive. Please check your internet connection and try again."
                        )
                else:
                    raise e
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Google Drive API error: {e}")
        if "SSL" in str(e) or "EOF" in str(e):
            raise HTTPException(
                status_code=503, 
                detail="Network connectivity issue with Google Drive. Please check your internet connection and try again."
            )
        elif "credentials" in str(e).lower():
            raise HTTPException(
                status_code=503, 
                detail="Google Drive authentication failed. Please check service account credentials."
            )
        else:
            raise HTTPException(
                status_code=503, 
                detail=f"Google Drive service error: {str(e)}"
            )


async def cleanup_empty_folders(document):
    """Clean up empty folders after deleting document files."""
    try:
        project_id = document.get("project_id")
        category = document.get("document_category")
        
        if not project_id or not category:
            return
        
        # Get project folder ID
        project_folder_id = get_folder_id_by_name(project_id, DRIVE_ROOT_FOLDER_ID)
        if not project_folder_id:
            return
        
        # Get category folder ID
        category_folder_id = get_folder_id_by_name(category, project_folder_id)
        if not category_folder_id:
            return
        
        # Check if category folder is empty
        if is_folder_empty(category_folder_id):
            try:
                drive_service.files().delete(fileId=category_folder_id).execute()
                logger.info(f"Deleted empty category folder: {category}")
            except Exception as e:
                logger.warning(f"Could not delete empty category folder {category}: {e}")
        
        # Check if project folder is empty (after potentially deleting category folder)
        if is_folder_empty(project_folder_id):
            try:
                drive_service.files().delete(fileId=project_folder_id).execute()
                logger.info(f"Deleted empty project folder: {project_id}")
            except Exception as e:
                logger.warning(f"Could not delete empty project folder {project_id}: {e}")
                
    except Exception as e:
        logger.warning(f"Error during folder cleanup: {e}")


# --- API Endpoints ---

async def classify_and_stage_document(file: UploadFile):
    """
    Step 1 of the upload process. Classifies the document and saves it temporarily.
    """
    content = await file.read()
    predicted_category = await classify_document_with_llm(file.filename, content, file.content_type)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
        tmp.write(content)
        temp_file_path = tmp.name
        
    return JSONResponse({
        "status": "pending_confirmation",
        "message": "Document classification predicted. Please confirm.",
        "predicted_category": predicted_category,
        "original_filename": file.filename,
        "temp_file_path": temp_file_path
    })

async def addDocument(
    proj_id: str,
    doc_name: str,
    confirmed_category: str,
    temp_file_path: str,
    original_filename: str
):
    """
    Step 2 of the upload process. Confirms the category and saves the document.
    """
    if not os.path.exists(temp_file_path):
        raise HTTPException(status_code=404, detail="Temporary file not found. The session may have expired. Please upload again.")

    with open(temp_file_path, "rb") as f:
        content = f.read()

    file_content_type = "application/octet-stream"
    if original_filename.lower().endswith('.pdf'): file_content_type = "application/pdf"
    elif original_filename.lower().endswith('.docx'): file_content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif original_filename.lower().endswith('.xls'): file_content_type = "application/vnd.ms-excel"
    elif original_filename.lower().endswith('.xlsx'): file_content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    page_count = 0
    if file_content_type == "application/pdf":
        try:
            with fitz.open(stream=io.BytesIO(content), filetype="pdf") as doc:
                page_count = doc.page_count
        except Exception as e:
            logger.warning(f"Could not get page count for PDF: {e}")

    project_folder_id = get_or_create_drive_folder(proj_id, DRIVE_ROOT_FOLDER_ID)
    category_folder_id = get_or_create_drive_folder(confirmed_category, project_folder_id)

    file_stream = io.BytesIO(content)
    media = MediaIoBaseUpload(file_stream, mimetype=file_content_type, resumable=True)
    
    drive_response = drive_service.files().create(
        body={"name": original_filename, "parents": [category_folder_id]},
        media_body=media,
        fields="id, size, modifiedTime, webViewLink"
    ).execute()
    
    file_id = drive_response.get("id")
    document_link = drive_response.get("webViewLink")
    download_link = f"https://drive.google.com/uc?export=download&id={file_id}"

    document_id = await get_next_sequence_value("document_id")
    current_time = datetime.now().isoformat()
    
    version_info = {
        "version": 1, "google_drive_id": file_id, "original_filename": original_filename,
        "document_size": int(drive_response.get("size", len(content))), "upload_date": current_time,
        "last_modified_date": drive_response.get("modifiedTime", current_time), "page_count": page_count,
        "file_type": file_content_type, "uploaded_by": CURRENT_USER,
        "document_link": document_link, "download_link": download_link
    }
    
    file_info = {
        "document_id": document_id, "project_id": proj_id, "document_name": doc_name,
        "document_category": confirmed_category, "current_version": 1, "last_modified_date": current_time,
        "document_link": document_link, "download_link": download_link, "versions": [version_info]
    }

    try:
        await document_collection.insert_one(file_info)
        os.remove(temp_file_path)
        return JSONResponse({
            "status": "success", "message": "Document added successfully",
            "document_id": file_info["document_id"], "drive_id": file_id, "version": 1,
            "links": {"view": document_link, "download": download_link}
        })
    except Exception as e:
        drive_service.files().delete(fileId=file_id).execute()
        os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Database insertion failed: {str(e)}")


async def replaceDocument(docid: str, file: UploadFile, new_name: str = None, confirmed_category: str = None):
    """Replaces an existing document, creating a new version in Drive and the database."""
    try:
        document_id = int(docid)
        existing_doc = await document_collection.find_one({"document_id": document_id})
        if not existing_doc:
            raise HTTPException(status_code=404, detail="Document not found")

        content = await file.read()
        
        # Get page count for PDF files
        page_count = 0
        if file.content_type == "application/pdf":
            try:
                with fitz.open(stream=io.BytesIO(content), filetype="pdf") as doc:
                    page_count = doc.page_count
            except Exception as e:
                logger.warning(f"Could not get page count for PDF: {e}")

        # Get project folder and create/get category folder
        project_folder_id = get_or_create_drive_folder(existing_doc["project_id"], DRIVE_ROOT_FOLDER_ID)
        category_folder_id = get_or_create_drive_folder(confirmed_category, project_folder_id)

        # Create a versioned filename
        new_version_number = existing_doc["current_version"] + 1
        base_name, extension = os.path.splitext(file.filename)
        new_filename = f"{base_name}_v{new_version_number}{extension}"

        # Upload the new file to Google Drive with retry mechanism
        file_stream = io.BytesIO(content)
        media = MediaIoBaseUpload(file_stream, mimetype=file.content_type, resumable=True)
        
        max_retries = 3
        drive_response = None
        
        for attempt in range(max_retries):
            try:
                drive_response = drive_service.files().create(
                    body={"name": new_filename, "parents": [category_folder_id]},
                    media_body=media,
                    fields="id, size, modifiedTime, webViewLink"
                ).execute()
                break
            except Exception as e:
                if "SSL" in str(e) or "EOF" in str(e) or "Connection" in str(e):
                    if attempt < max_retries - 1:
                        logger.warning(f"Network error uploading file on attempt {attempt + 1}/{max_retries}: {e}. Retrying...")
                        # Reset the file stream for retry
                        file_stream = io.BytesIO(content)
                        media = MediaIoBaseUpload(file_stream, mimetype=file.content_type, resumable=True)
                        time.sleep(2 ** attempt)  # Exponential backoff
                        continue
                    else:
                        raise HTTPException(
                            status_code=503, 
                            detail="Network connectivity issue with Google Drive. Please check your internet connection and try again."
                        )
                else:
                    raise HTTPException(
                        status_code=503, 
                        detail=f"Failed to upload file to Google Drive: {str(e)}"
                    )
        
        if not drive_response:
            raise HTTPException(status_code=503, detail="Failed to upload file to Google Drive after multiple attempts")
        
        file_id = drive_response.get("id")
        document_link = drive_response.get("webViewLink")
        download_link = f"https://drive.google.com/uc?export=download&id={file_id}"

        # Prepare the new version's metadata for MongoDB
        current_time = datetime.now().isoformat()
        new_version_data = {
            "version": new_version_number, "google_drive_id": file_id, "original_filename": file.filename,
            "document_size": int(drive_response.get("size", len(content))), "upload_date": current_time,
            "last_modified_date": drive_response.get("modifiedTime", current_time), "page_count": page_count,
            "file_type": file.content_type, "uploaded_by": CURRENT_USER,
            "document_link": document_link, "download_link": download_link
        }

        # Update the document in MongoDB with all fields that need updating
        update_query = {
            "$set": {
                "current_version": new_version_number,
                "last_modified_date": new_version_data["last_modified_date"],
                "document_link": document_link, 
                "download_link": download_link,
                "document_category": confirmed_category  # Update category
            },
            "$push": {"versions": new_version_data}
        }
        
        # Update document name if provided
        if new_name:
            update_query["$set"]["document_name"] = new_name

        result = await document_collection.update_one({"document_id": document_id}, update_query)
        
        if result.matched_count == 0:
            # If update failed, clean up the uploaded file
            try:
                drive_service.files().delete(fileId=file_id).execute()
            except Exception as cleanup_error:
                logger.error(f"Failed to cleanup uploaded file after database update failure: {cleanup_error}")
            raise HTTPException(status_code=404, detail="Document not found during update")

        # Get the updated document to return fresh data
        updated_doc = await document_collection.find_one({"document_id": document_id}, {"_id": 0})

        return JSONResponse({
            "status": "success", 
            "message": f"Document replaced successfully. New version is v{new_version_number}",
            "document_id": document_id, 
            "new_version": new_version_number, 
            "drive_id": file_id,
            "updated_document": updated_doc,  # Return full updated document for frontend refresh
            "updated_fields": {
                "document_name": new_name if new_name else existing_doc["document_name"],
                "document_category": confirmed_category,
                "version": new_version_number,
                "document_link": document_link,
                "download_link": download_link,
                "last_modified_date": new_version_data["last_modified_date"]
            }
        })

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error in replaceDocument: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred while replacing the document: {str(e)}"
        )

async def downloadDocument(docid: str, version: Optional[int] = None):
    """Download a document by streaming it through the API."""
    
    doc = await document_collection.find_one({"document_id": int(docid)})
    if not doc: 
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Find the correct version
    version_to_download = (doc["versions"][-1] if version is None 
                          else next((v for v in doc["versions"] if v["version"] == version), None))
    
    if not version_to_download or "download_link" not in version_to_download:
        raise HTTPException(status_code=404, detail=f"Download link for version {version or 'latest'} not found.")
    
    # Stream the file with redirect following
    async with httpx.AsyncClient(follow_redirects=True) as client:  # Enable redirects
        try:
            response = await client.get(version_to_download["download_link"])
            response.raise_for_status()
            
            # Get filename from document or create default
            filename = version_to_download.get("filename", f"document_{docid}.pdf")
            
            return StreamingResponse(
                io.BytesIO(response.content),
                media_type="application/octet-stream",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Download error: {str(e)}")
        
async def viewDocument(docid: str, version: Optional[int] = None):
    """Redirects to the viewable link for a specific document version."""
    doc = await document_collection.find_one({"document_id": int(docid)})
    if not doc: raise HTTPException(status_code=404, detail="Document not found")

    # Find the correct version, defaulting to the latest
    version_to_view = doc["versions"][-1] if version is None else next((v for v in doc["versions"] if v["version"] == version), None)
    
    if not version_to_view or "document_link" not in version_to_view:
        raise HTTPException(status_code=404, detail=f"View link for version {version or 'latest'} not found.")
        
    return RedirectResponse(url=version_to_view["document_link"])


async def updateDocument(docid: str, new_name: Optional[str] = None, new_category: Optional[str] = None):
    """Updates a document's metadata, such as its name or category."""
    if new_name is None and new_category is None: 
        raise HTTPException(status_code=400, detail="No update data provided")
    
    update_data = {"last_modified_date": datetime.now().isoformat()}
    if new_name is not None: update_data["document_name"] = new_name
    if new_category is not None: update_data["document_category"] = new_category
    
    result = await document_collection.update_one({"document_id": int(docid)}, {"$set": update_data})
    if result.matched_count == 0: 
        raise HTTPException(status_code=404, detail="Document not found")
    
    updated_doc = await document_collection.find_one({"document_id": int(docid)}, {"_id": 0})
    return JSONResponse({
        "status": "success", 
        "message": "Document updated successfully", 
        "document": updated_doc,
        "updated_fields": {k: v for k, v in update_data.items() if k != "last_modified_date"}
    })

async def deleteDocument(docid: str):
    """Deletes a document and all its versions from Google Drive and MongoDB."""
    document = await document_collection.find_one({"document_id": int(docid)})
    if not document: 
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not drive_service:
        raise HTTPException(status_code=503, detail="Google Drive service is not available")
    
    deleted_files = []
    failed_deletions = []
    
    # Delete all file versions from Google Drive
    for version in document.get("versions", []):
        file_id = version.get("google_drive_id")
        if not file_id:
            continue
            
        try:
            # Add retry mechanism for network issues
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    drive_service.files().delete(fileId=file_id).execute()
                    deleted_files.append(file_id)
                    logger.info(f"Successfully deleted file {file_id} from Google Drive")
                    break
                except Exception as e:
                    if "SSL" in str(e) or "EOF" in str(e) or "Connection" in str(e):
                        if attempt < max_retries - 1:
                            logger.warning(f"Network error on attempt {attempt + 1}/{max_retries} for file {file_id}: {e}. Retrying...")
                            time.sleep(2 ** attempt)  # Exponential backoff
                            continue
                        else:
                            logger.error(f"Failed to delete file {file_id} after {max_retries} attempts due to network issues: {e}")
                            failed_deletions.append({"file_id": file_id, "error": str(e)})
                    else:
                        logger.error(f"Could not delete file {file_id} from Drive: {e}")
                        failed_deletions.append({"file_id": file_id, "error": str(e)})
                    break
        except Exception as e:
            logger.error(f"Unexpected error deleting file {file_id}: {e}")
            failed_deletions.append({"file_id": file_id, "error": str(e)})
    
    # Now check and clean up empty folders
    try:
        await cleanup_empty_folders(document)
    except Exception as e:
        logger.warning(f"Failed to cleanup empty folders: {e}")
    
    # Delete the document record from MongoDB
    await document_collection.delete_one({"document_id": int(docid)})
    
    # Prepare response
    response_data = {
        "status": "success", 
        "message": "Document deleted successfully",
        "deleted_files_count": len(deleted_files),
        "failed_deletions_count": len(failed_deletions)
    }
    
    if failed_deletions:
        response_data["warning"] = f"Document deleted from database, but {len(failed_deletions)} file(s) could not be deleted from Google Drive due to network issues"
        response_data["failed_files"] = failed_deletions
    
    return JSONResponse(response_data)

async def fetchRecents():
    """Fetches the 10 most recently modified documents."""
    cursor = document_collection.find({}, {"_id": 0}).sort("last_modified_date", -1).limit(10)
    recent_docs = await cursor.to_list(length=10)
    return JSONResponse({"status": "success", "recent_documents": recent_docs})

async def getDocInfo(docid: int):
    """Retrieves all information for a single document by its ID."""
    doc = await document_collection.find_one({"document_id": docid}, {"_id": 0})
    if not doc: raise HTTPException(status_code=404, detail="Document not found")
    return JSONResponse({"status": "success", "document": doc})

async def getDocsfromProject(proj_id: str):
    """Retrieves all documents associated with a specific project ID."""
    cursor = document_collection.find({"project_id": proj_id}, {"_id": 0})
    project_docs = await cursor.to_list(length=None)
    return JSONResponse({"status": "success", "documents": project_docs})



#---- laavanjan's document route for direct download ----

async def proxy_download_document(docid: str, version: Optional[int] = None):
    doc = await document_collection.find_one({"document_id": int(docid)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Find the correct version, defaulting to the latest
    version_to_download = doc["versions"][-1] if version is None else next(
        (v for v in doc["versions"] if v["version"] == version), None
    )

    if not version_to_download or "download_link" not in version_to_download:
        raise HTTPException(status_code=404, detail=f"Download link for version {version or 'latest'} not found.")

    # Proxy the file from Google Drive
    download_url = version_to_download["download_link"]
    r = requests.get(download_url, stream=True)
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch file from Google Drive.")

    return StreamingResponse(
        r.iter_content(chunk_size=8192),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{doc["document_name"]}.pdf"'}
    )