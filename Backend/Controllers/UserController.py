from Schemas.UserSchema import getIndividualUser, getAllUsers
from Config.db import user_collection
from Models.UserModel import UserModel, UserUpdate, projectmcreate
from bson import ObjectId
from pymongo import ReturnDocument
from fastapi import HTTPException
import random
import string 
from jose import JWTError,jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

async def add_user(user:UserModel)->dict:
    newuser = dict(user)
    hashed_password=get_password_hash(user.password)
    newuser["password"] = hashed_password

    try:
        result = await user_collection.insert_one(newuser)
        return {
            "Message":"User Created",
            "Insereted_ID":str(result.inserted_id)
        }
    except:
        return {
            "Error":"User not created"
        }

async def get_users()->dict: 
    return await getAllUsers(user_collection.find())

async def find_user(id:ObjectId)->dict:
    user = await user_collection.find_one({"_id":id})
    if user:
        return {
            "Message":"User found",
            "User":getIndividualUser(user)
        }
    else:
        return{
            "Error":"User not found"
        }
    
async def update_user(user_id: str, user_update: UserUpdate):
    update_data = user_update.model_dump(exclude_unset=True)
    #hash the password
    student = await user_collection.find_one({"_id": ObjectId(user_id)})
    if student:
        updated_student = await user_collection.update_one(
            {"_id": ObjectId(user_id)}, {"$set": update_data}
        )
        if updated_student.modified_count > 0:  # Check if any document was modified
            return {"success": True, "message": "User updated successfully"}
        return {"success": False, "message": "No changes were made"}
    
    return {"success": False, "message": "User not found"}

async def delete_user(user_id: str):
    result = await user_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}


def generatepssword(length=8):
    return ''.join(random.choices(string.ascii_letters+string.digits,k=length)) 



def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)



async   def authenticate_user(username: str, password: str):
    user = await user_collection.find_one({"username": username})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return user

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
async def addprojectmanager(uname:str):
    existing_user=await user_collection.find_one({"username":uname})
    if existing_user:
        return {"Error":"Username Already Exists"}
    
    password=generatepssword()
    hashed_password = pwd_context.hash(password)
   
    user_data=projectmcreate(username=uname, password=hashed_password)
    user_collection.insert_one(user_data.model_dump())

    return {"message": "Project Manager created successfully", "username": uname}


    
