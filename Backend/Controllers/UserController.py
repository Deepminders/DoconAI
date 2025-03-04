from Schemas.UserSchema import getIndividualUser, getAllUsers
from Config.db import user_collection
from Models.UserModel import UserModel
from bson import ObjectId

async def add_user(user:UserModel)->dict:
    newuser = dict(user)
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