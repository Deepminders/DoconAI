from fastapi import APIRouter, UploadFile, File
from Controllers.DocumentController import addDocument, downloadDocument, viewDocument
router = APIRouter(prefix="/api/doc", tags=["Document"])

@router.post("/upload")
async def addDoc(file: UploadFile = File(...)):
    return await addDocument(file)

@router.get("/download/{doc_id}")
async def downloadDoc(doc_id:str):
    return await downloadDocument(doc_id)

@router.get("/view/{doc_id}")
async def viewDoc(doc_id:str):
    return await viewDocument(doc_id)