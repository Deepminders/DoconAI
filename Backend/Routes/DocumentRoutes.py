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
    proxy_download_document
)

router = APIRouter(prefix="/api/doc", tags=["Document"])

# --- Two-Step Upload Process ---

@router.post("/classify", summary="Step 1: Classify a document")
async def classify_doc(file: UploadFile = File(...)):
    """
    Upload a file to get a predicted category. This is the first step.
    The response will contain a `temp_file_path` which you must send
    to the `/upload` endpoint in the second step.
    """
    return await classify_and_stage_document(file)

@router.post("/upload", summary="Step 2: Confirm and Save Document")
async def add_doc(
    proj_id: str = Form(...),
    doc_name: str = Form(...),
    confirmed_category: str = Form(...),
    temp_file_path: str = Form(...),
    original_filename: str = Form(...)
):
    """
    This is the second step after classification. Provide the details
    from the classification step to finalize the upload.
    """
    return await addDocument(
        proj_id=proj_id,
        doc_name=doc_name,
        confirmed_category=confirmed_category,
        temp_file_path=temp_file_path,
        original_filename=original_filename
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
    confirmed_category: str = Form(...)
):
    """
    Replace the file for an existing document, creating a new version.
    Now includes automatic classification and category confirmation.
    """
    return await replaceDocument(doc_id, file=file, new_name=new_name, confirmed_category=confirmed_category)

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
async def download_doc(docid: str, version: Optional[int] = Query(None, description="Optional version number to download")):
    """
    Download a document. Fetches the latest version if no version is specified.
    """
    return await proxy_download_document(docid, version)