from pydantic import BaseModel

class UserModel(BaseModel):
    firstname:str
    lastname:str
    age:int
    username: str
    password: str
    email: str
    phone: str  