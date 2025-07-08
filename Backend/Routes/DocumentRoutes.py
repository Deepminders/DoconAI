from fastapi import APIRouter, UploadFile, File, Form
from Controllers.DocumentController import addDocument, downloadDocument, viewDocument, updateDocument, replaceDocument, deleteDocument, fetchRecents,getDocInfo, getDocsfromProject
router = APIRouter(prefix="/api/doc", tags=["Document"])

@router.post("/upload")
async def addDoc(file: UploadFile = File(...), doc_name: str = Form(...),proj_id:str = Form(...)):
    return await addDocument(file, doc_name, proj_id)

@router.get("/download/{doc_id}")
async def downloadDoc(doc_id:str):
    return await downloadDocument(doc_id)

@router.get("/view/{doc_id}")
async def viewDoc(doc_id:str):
    return await viewDocument(doc_id)

@router.put("/update/{doc_id}")
async def updateDoc(doc_id:str, new_name: str = Form(None),  new_category: str = Form(None), new_description: str = Form(None)):
    return await updateDocument(doc_id, new_name, new_category, new_description)

@router.put("/update/{doc_id}/file")
async def updateDocFile(doc_id:str, file: UploadFile = File(...), new_name: str = Form(None)):
    return await replaceDocument(doc_id, file=file, update_name=new_name)

@router.delete("/delete/{doc_id}")
async def deleteDoc(doc_id:str):
    return await deleteDocument(doc_id)


@router.get("/fetchall")
async def getAll():
    return await fetchRecents()

@router.get("/info/{docid}")
async def fetchDocInfo(docid:int):
    return await getDocInfo(docid)

@router.get("/project_docs/{proj_id}")
async def getProjectDocs(proj_id: str):
    return await getDocsfromProject(proj_id)