from fastapi import APIRouter, UploadFile, File, Form
from Controllers import comparator_controller

router = APIRouter()


@router.post("/upload")
def upload_files(file: UploadFile = File(...)):
    """
    Upload two files and save them to /documents.
    """
    return comparator_controller.handle_upload(file)


@router.post("/compare")
async def compare_documents(
    file1_name: str = Form(...),
    file2_name: str = Form(...),
    comparison_type: str = Form(...),
    topic: str = Form(None)
):
    """
    Accepts two files and a comparison type.
    Passes them to handle_compare and returns the result.
    """
    return comparator_controller.handle_compare(file1_name, file2_name, comparison_type, topic)

@router.get("/document-list")
def get_document_list():
    """
    Returns a list of all documents in the /documents folder.
    """
    return comparator_controller.get_document_list()