from fastapi import File, UploadFile
from fastapi.responses import JSONResponse
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload,MediaIoBaseUpload
from google.oauth2 import service_account
import os
import fitz
import io
from Config.db import document_collection
from pathlib import Path

folder_id = "1GxNapTLGFcUmshr3ZEjBHSVy3BW8NdJr"

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

async def addDocument(file: UploadFile = File(...)):
    content = await file.read()
    with fitz.open(filetype="pdf", stream=content) as doc:
        page_count = doc.page_count
    
    # temp = f"temp_file_{file.filename}"
    # with open(temp, "wb") as f:
    #     f.write(content)
    
    file_stream = io.BytesIO(content)
    
    
    media = MediaIoBaseUpload(file_stream, mimetype=file.content_type,resumable=True)
    
    driver = drive_service.files().create(
        body={
            "name":file.filename,
            "parents":[folder_id]
        },
        media_body=media,
        fields = "id"
    ).execute()
    
    file_id = driver.get("id")
    file_url = f"https://drive.google.com/uc?export=download&id={file_id}"
    
    fileinfo = {    
        "file_id":file_id,
        "filename": file.filename,
        "no of pages":page_count,
        "Type":file.content_type,
        "Download_link":file_url,
        "Document_link":f"https://drive.google.com/file/d/{file_id}/view"
    }
    
    
    
    
    try:
        result = await document_collection.insert_one(fileinfo)
        return {
            "Message":"Document Added",
            "Insereted_ID":str(result.inserted_id),
            "Google Drive File ID":str(file_id),
            "Google Drive Link":f"https://drive.google.com/file/d/{file_id}/view"
        }
    except:
        return {
            "Error":"Document not added"
        }
        
        