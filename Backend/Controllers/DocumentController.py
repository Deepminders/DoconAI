from fastapi import File, UploadFile, HTTPException, Form
from typing import Optional
from fastapi.responses import StreamingResponse, RedirectResponse,JSONResponse
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload
from google.oauth2 import service_account
from Config.db import document_collection, get_next_sequence_value
from pathlib import Path
from datetime import datetime
import fitz
import io
import requests

folder_id = "1GxNapTLGFcUmshr3ZEjBHSVy3BW8NdJr"
current_user = "Sample User"
SERVICE_ACCOUNT = Path(__file__).resolve().parent / '..' / "Config" / "file-service.json"
SERVICE_ACCOUNT = SERVICE_ACCOUNT.resolve()
SCOPES = ['https://www.googleapis.com/auth/drive.file']
credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=credentials)

if not drive_service:
    print("Failed to initialize Google Drive service")
else:
    print("Google Drive service initialized successfully")

print("Document Collection",document_collection)

async def addDocument(file: UploadFile = File(...),doc_name:str = Form(...)):
    """Upload a document to Google Drive and store metadata in MongoDB"""
    
    # Read file content once and reuse
    content = await file.read()
    docname = doc_name
    # Get document properties
    with fitz.open(filetype="pdf", stream=content) as doc:
        page_count = doc.page_count
    
    # Prepare file for Google Drive upload
    file_stream = io.BytesIO(content)
    media = MediaIoBaseUpload(
        file_stream, 
        mimetype=file.content_type,
        resumable=True
    )
    
    try:
        document_id = await get_next_sequence_value("document_id")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get document ID: {str(e)}"
        )
    
    # Upload to Google Drive
    try:
        drive_response = drive_service.files().create(
            body={
                "name": file.filename,
                "parents": [folder_id]
            },
            media_body=media,
            fields="id,size,modifiedTime"
        ).execute()
        
        file_id = drive_response.get("id")
        file_size = int(drive_response.get("size", len(content)))
        modified_time = drive_response.get("modifiedTime")
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Google Drive upload failed: {str(e)}"
        )
    
    # Prepare document metadata
    current_time = datetime.now().isoformat()
    file_info = {
        "document_id": document_id,
        "document_name": docname,
        "document_category": "uncategorized",  # Default, can be parameter
        "document_size": file_size,
        "document_path": f"gdrive:{file_id}",  # Using Google Drive ID as path
        "uploaded_by": current_user,
        "upload_date": current_time,
        "last_modified_date": modified_time or current_time,
        "page_count": page_count,
        "file_type": file.content_type,
        "download_link": f"https://drive.google.com/uc?export=download&id={file_id}",
        "document_link": f"https://drive.google.com/file/d/{file_id}/view",
        "google_drive_id": file_id,
        "original_upload": current_time
    }
    
    # Store in MongoDB
    try:
        result = await document_collection.insert_one(file_info)
        return {
            "status": "success",
            "message": "Document added successfully",
            "document_id": file_info["document_id"],
            "mongo_id": str(result.inserted_id),
            "drive_id": file_id,
            "links": {
                "download": file_info["download_link"],
                "view": file_info["document_link"]
            },
            "metadata": {
                "size": file_size,
                "pages": page_count,
                "type": file.content_type
            }
        }
    except Exception as e:
        # Cleanup from Drive if MongoDB insert failed
        try:
            drive_service.files().delete(fileId=file_id).execute()
        except:
            pass
            
        raise HTTPException(
            status_code=500,
            detail=f"Database insertion failed: {str(e)}"
        )
        
async def downloadDocument(docid: str):
    file = await document_collection.find_one({"document_id": int(docid)})
    if not file:
        raise HTTPException(status_code=404, detail="Document not found")

    file_id = file["google_drive_id"]
    request = drive_service.files().get_media(fileId=file_id)
    
    buffer = io.BytesIO()
    downloader = MediaIoBaseDownload(buffer, request)

    done = False
    while not done:
        status, done = downloader.next_chunk()

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type=file.get("file_type", "application/octet-stream"),
        headers={
            "Content-Disposition": f'attachment; filename="{file["document_name"]}"',
            "X-Page-Count": str(file.get("page_count", "")),
        }
    )
async def viewDocument(docid:str):
    file = await document_collection.find_one({"document_id":int(docid)})
    if not file:
        raise HTTPException(status_code=404, detail="Document not found")
    
    viewable_link = f"https://drive.google.com/file/d/{file['google_drive_id']}/view"
    return RedirectResponse(viewable_link)

async def updateDocument(
    docid: str,
    new_name: Optional[str] = Form(None),
    new_category: Optional[str] = Form(None),
    new_description: Optional[str] = Form(None)
):
    """
    Update document metadata in MongoDB and Google Drive
    Args:
        docid: Document ID to update
        new_name: New document name (optional)
        new_category: New category (optional)
        new_description: New description (optional)
    """
    try:
        # Convert docid to integer
        document_id = int(docid)
        
        # Find the document in MongoDB
        document = await document_collection.find_one({"document_id": document_id})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        update_data = {}
        drive_update_body = {}

        # Prepare MongoDB update data
        if new_name is not None:
            update_data["document_name"] = new_name
            drive_update_body["name"] = new_name

        if new_category is not None:
            update_data["document_category"] = new_category

        if new_description is not None:
            update_data["description"] = new_description

        # If no fields to update
        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No update data provided"
            )

        # Update MongoDB
        update_result = await document_collection.update_one(
            {"document_id": document_id},
            {"$set": update_data}
        )

        if update_result.modified_count == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to update document in database"
            )

        # Update Google Drive metadata if name changed
        if drive_update_body:
            try:
                drive_service.files().update(
                    fileId=document["google_drive_id"],
                    body=drive_update_body
                ).execute()
            except Exception as drive_error:
                logger.error(f"Google Drive update failed: {str(drive_error)}")
                # Rollback MongoDB update
                await document_collection.update_one(
                    {"document_id": document_id},
                    {"$set": {
                        "document_name": document["document_name"]
                    }}
                )
                raise HTTPException(
                    status_code=500,
                    detail="Failed to update document in Google Drive"
                )

        # Get updated document
        updated_doc = await document_collection.find_one({"document_id": document_id})

        return JSONResponse({
            "status": "success",
            "message": "Document updated successfully",
            "document_id": document_id,
            "updated_fields": list(update_data.keys()),
            "new_metadata": {
                "name": updated_doc.get("document_name"),
                "category": updated_doc.get("document_category"),
                "description": updated_doc.get("description")
            }
        })

    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document update failed: {str(e)}"
        )
        
        
async def replaceDocument(
    docid: str,
    file: UploadFile = File(...),
    update_name: Optional[bool] = Form(False)
):
    
    try:
        # Convert docid to integer
        document_id = int(docid)
        
        # Find the existing document
        existing_doc = await document_collection.find_one({"document_id": document_id})
        if not existing_doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Read new file content
        content = await file.read()
        
        # Get new file properties
        page_count = 0
        if file.content_type == "application/pdf":
            try:
                with fitz.open(stream=content, filetype="pdf") as doc:
                    page_count = doc.page_count
            except Exception as e:
                logger.warning(f"Could not get page count: {str(e)}")

        # Prepare file for Google Drive upload
        file_stream = io.BytesIO(content)
        media = MediaIoBaseUpload(
            file_stream,
            mimetype=file.content_type,
            resumable=True
        )

        # Update Google Drive file
        drive_update_body = {
            "media_body": media,
            "fields": "id,size,modifiedTime,webViewLink,webContentLink"
        }
        
        # Optionally update the name if requested
        if update_name:
            drive_update_body["body"] = {"name": file.filename}

        drive_response = drive_service.files().update(
            fileId=existing_doc["google_drive_id"],
            **drive_update_body
        ).execute()

        # Prepare update data for MongoDB
        update_data = {
            "document_size": int(drive_response.get("size", len(content))),
            "last_modified_date": drive_response.get("modifiedTime", datetime.now().isoformat()),
            "page_count": page_count,
            "file_type": file.content_type,
            "download_link": drive_response.get("webContentLink"),
            "document_link": drive_response.get("webViewLink"),
            "original_filename": file.filename
        }

        # Update document name if requested
        if update_name:
            update_data["document_name"] = update_name

        # Update MongoDB document
        await document_collection.update_one(
            {"document_id": document_id},
            {"$set": update_data}
        )

        # Get updated document
        updated_doc = await document_collection.find_one({"document_id": document_id})

        return JSONResponse({
            "status": "success",
            "message": "Document replaced successfully",
            "document_id": document_id,
            "updated_fields": list(update_data.keys()),
            "metadata": {
                "name": updated_doc["document_name"],
                "size": updated_doc["document_size"],
                "type": updated_doc["file_type"],
                "pages": updated_doc["page_count"]
            }
        })

    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document replacement failed: {str(e)}"
        )
async def deleteDocument(docid: str):
    """
    Delete a document and its record
    Args:
        docid: Document ID to delete
    Returns:
        JSON response with deletion status
    """
    try:
        # Convert docid to integer
        document_id = int(docid)
        
        # Find the document in MongoDB
        document = await document_collection.find_one({"document_id": document_id})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Delete from Google Drive first
        try:
            drive_service.files().delete(
                fileId=document["google_drive_id"]
            ).execute()
        except Exception as drive_error:
            raise HTTPException(
                status_code=500,
                detail=f"Google Drive deletion failed: {str(drive_error)}"
            )

        # Delete from MongoDB
        delete_result = await document_collection.delete_one({"document_id": document_id})
        
        if delete_result.deleted_count == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to delete document record from database"
            )

        return JSONResponse({
            "status": "success",
            "message": "Document deleted successfully",
            "document_id": document_id,
            "deleted_at": datetime.now().isoformat()
        })

    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID format"
        )
    except HTTPException:
        raise  # Re-raise existing HTTP exceptions
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document deletion failed: {str(e)}"
        )