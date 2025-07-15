from pydantic import BaseModel, EmailStr
from typing import Optional


class UserModel(BaseModel):
    company_name: str
    first_name: str
    last_name: str
    username: str
    user_role: str
    gender:str
    email: str
    phone_number: str
    password: str
    profile_image_url: Optional[str] = None

class UserCreate(UserModel):
    password: str

class UserUpdate(BaseModel):
    company_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    password: Optional[str] = None
    profile_image_url: Optional[str] = None

class projectmcreate(BaseModel):
    username:str
    password:str
    role:str="project_manager"
    profile_updated:bool=False

class TokenResponse(BaseModel):
    access_token:str
    token_type:str

class PasswordResetRequest(BaseModel):
    email_or_username: str

class PasswordResetPayload(BaseModel):
    token: str
    new_password: str

class StaffCreateRequest(BaseModel):
    email: EmailStr
    user_role:str = "Staff"  # Default role for staff

class TokenData(BaseModel):
    sub: Optional[str] = None
    username: Optional[str] = None