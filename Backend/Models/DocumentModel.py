from pydantic import BaseModel

class DocumentModel(BaseModel):
    document_id: int
    project_id:str
    document_name: str
    document_category: str
    document_size: int
    document_path: str
    uploaded_by: str
    upload_date: str
    last_modified_date: str
    Download_link: str
    Document_link: str