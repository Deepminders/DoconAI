from fastapi import APIRouter, UploadFile, File, Form, Query
from typing import Optional

# Import all the necessary functions from your controller
from Controllers.DocumentController import (
    classify_and_stage_document,
    addDocument,
    downloadDocument,
    viewDocument,
    updateDocument,
    replaceDocument,
    deleteDocument,
    fetchRecents,
    getDocInfo,
    getDocsfromProject,
    proxy_download_document,
    fetchProjectDocumentsByUser,
    fetchUserDocuments
)

router = APIRouter(prefix="/api/doc", tags=["Document"])

# --- Two-Step Upload Process ---

@router.post("/classify", summary="Step 1: Classify a document")
async def classify_doc(file: UploadFile = File(...)):
    return await classify_and_stage_document(file)

@router.post("/upload", summary="Step 2: Confirm and Save Document")
async def add_doc(
    proj_id: str = Form(...),
    doc_name: str = Form(...),
    confirmed_category: str = Form(...),
    temp_file_path: str = Form(...),
    original_filename: str = Form(...),
    user_id: str = Form(...)  # Added user_id parameter
):
    """
    Save a document after classification confirmation.
    
    Parameters:
    - proj_id: Project ID where the document belongs
    - doc_name: Name for the document
    - confirmed_category: Confirmed document category
    - temp_file_path: Temporary file path from classification step
    - original_filename: Original filename of the uploaded file
    - user_id: ID of the user uploading the document
    """
    return await addDocument(
        proj_id=proj_id,
        doc_name=doc_name,
        confirmed_category=confirmed_category,
        temp_file_path=temp_file_path,
        original_filename=original_filename,
        user_id=user_id  # Pass user_id to controller
    )

# --- Document Retrieval and Management ---

@router.get("/download/{doc_id}")
async def download_doc(doc_id: str, version: Optional[int] = Query(None, description="Optional version number to download")):
    """
    Download a document. Fetches the latest version if no version is specified.
    """
    return await downloadDocument(doc_id, version)

@router.get("/view/{doc_id}")
async def view_doc(doc_id: str, version: Optional[int] = Query(None, description="Optional version number to view")):
    """
    Redirect to a viewable link for a document. Shows the latest version if not specified.
    """
    return await viewDocument(doc_id, version)

@router.put("/update/{docid}")
async def update_doc_metadata(docid: str, new_name: Optional[str] = Form(None), new_category: Optional[str] = Form(None)):
    """
    Update a document's metadata (name, category).
    """
    return await updateDocument(docid, new_name, new_category)

@router.put("/update/{doc_id}/file")
async def update_doc_file(
    doc_id: str, 
    file: UploadFile = File(...), 
    new_name: Optional[str] = Form(None),
    confirmed_category: str = Form(...),
    user_id: str = Form(...)  # Added user_id parameter
):
    """
    Replace the file for an existing document, creating a new version.
    Now includes automatic classification, category confirmation, and user tracking.
    
    Parameters:
    - doc_id: ID of the document to update
    - file: New file to upload
    - new_name: Optional new name for the document
    - confirmed_category: Confirmed document category
    - user_id: ID of the user making the update
    """
    return await replaceDocument(
        doc_id, 
        file=file, 
        new_name=new_name, 
        confirmed_category=confirmed_category,
        user_id=user_id  # Pass user_id to controller
    )

@router.delete("/delete/{doc_id}")
async def delete_doc(doc_id: str):
    """
    Delete a document and all of its versions.
    """
    return await deleteDocument(doc_id)

# --- Information Retrieval ---

@router.get("/fetchall")
async def get_all_recents(limit: int = 10):
    """
    Fetch the most recently modified documents, with an optional limit.
    """
    return await fetchRecents()

@router.get("/info/{docid}")
async def fetch_doc_info(docid: int):
    """
    Fetch all metadata for a single document.
    """
    return await getDocInfo(docid)

@router.get("/ProjectDocs/{proj_id}")
async def get_project_docs(proj_id: str):
    """
    Get all documents for a specific project ID.
    """
    return await getDocsfromProject(proj_id)

# ---- laavanjan's direct download route ----

@router.get("/download_direct/{docid}")
async def download_doc_direct(docid: str, version: Optional[int] = Query(None, description="Optional version number to download")):
    """
    Download a document directly. Fetches the latest version if no version is specified.
    """
    return await proxy_download_document(docid, version)

@router.get("/user/{user_id}/project-documents")
async def get_user_project_documents(user_id: str):
    """
    Fetch all documents from projects assigned to a user.
    
    - If user is Project Manager or Project Owner: Returns all documents from their assigned projects
    - If user has other roles: Returns only documents they created
    
    Parameters:
    - user_id: The MongoDB ObjectId of the user (from staff collection)
    
    Returns:
    - recent_documents: List of all accessible documents
    - user_role: The user's role from staff collection
    - assigned_projects: List of project IDs the user is assigned to
    - access_level: "project_manager" or "own_documents_only"
    - count: Total number of documents returned
    """
    return await fetchProjectDocumentsByUser(user_id)

@router.get("/user/{user_id}/documents")
async def get_user_documents(user_id: str):
    """
    Fetch ALL documents uploaded by a specific user.
    
    This endpoint returns only documents that the user created/uploaded themselves,
    regardless of their role or project assignments.
    
    Parameters:
    - user_id: The user ID who uploaded the documents
    
    Returns:
    - recent_documents: List of all documents created by the user
    - user_id: The user ID that was queried
    - count: Total number of documents uploaded by the user
    
    Example: GET /api/doc/user/681c944f8dfa6f904a04ffec/documents
    """
    return await fetchUserDocuments(user_id)