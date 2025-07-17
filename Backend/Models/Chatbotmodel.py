from pydantic import BaseModel
from typing import Optional

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    user_id: Optional[str] = None
    session_id: str
    message: str

class ChatResponse(BaseModel):
    reply: str

class NewSessionRequest(BaseModel):
    title: Optional[str] = None
    user_id: Optional[str] = None

class SessionIDResponse(BaseModel):
    session_id: str
class RenameRequest(BaseModel):
    title: str