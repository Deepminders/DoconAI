from fastapi import APIRouter, UploadFile, File
from Controllers.DocumentController import addDocument
router = APIRouter(prefix="/api/doc", tags=["Document"])

@router.post("/upload")
async def addDoc(file: UploadFile = File(...)):
    return await addDocument(file)