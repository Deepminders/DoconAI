from pydantic import BaseModel

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

class UserCreate(UserModel):
    password: str

class UserUpdate(BaseModel): 
    email: str 
    username: str 
    password: str 

class projectmcreate(BaseModel):
    username:str
    password:str
    role:str="project_manager"
    profile_updated:bool=False

class TokenResponse(BaseModel):
    access_token:str
    token_type:str