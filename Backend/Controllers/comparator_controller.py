import os
import shutil
from fastapi.responses import JSONResponse
from fastapi import FastAPI, UploadFile, Form
from dotenv import load_dotenv
from comparator_Rag import create_vector_store
from comparator_Rag import compare_two_documents, numeric_cost_compare, timestamp_author_compare, smart_comparison



# Load env vars
load_dotenv()

# Folder where uploaded docs go
UPLOAD_DIR = "Uploaded_Documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Upload files

def handle_upload(file: UploadFile):
    """
    Save a single uploaded file to the documents folder.
    """
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # create vector store for the uploaded file
    create_vector_store(file.filename)

    return {
        "message": "File uploaded successfully.",
        "file": file.filename
    }


# Compare topic
def handle_compare(
    file1_name: str = Form(...),
    file2_name: str = Form(...),
    comparison_type: str = Form(...),
    topic: str = Form(None)
):
    # Ensure vector stores exist for both documents
    for file_name in [file1_name, file2_name]:
        vector_store_path = os.path.join("vector_store", file_name)
        if not os.path.exists(vector_store_path):
            create_vector_store(file_name)
            
    # Call the correct comparison function
    if comparison_type == "text":
        result = compare_two_documents(file1_name, file2_name, topic)
    elif comparison_type == "numeric":
        result = numeric_cost_compare(file1_name, file2_name)
    elif comparison_type == "timestamp":
        result = timestamp_author_compare(file1_name, file2_name)
    elif comparison_type == "smart":
        result = smart_comparison(file1_name, file2_name)
    else:
        return JSONResponse({"error": "Invalid comparison type"}, status_code=400)

    return {"result": result}

def get_document_list():
    """
    Returns a list of all documents in the /documents folder.
    """
    try:
        files = os.listdir(UPLOAD_DIR)
        return {"documents": files}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)