from Schemas.UserSchema import getIndividualUser, getAllUsers
from Config.db import user_collection
from Models.UserModel import UserModel

async def add_user(user:UserModel)->dict:
    user = user.dict()
    try:
        result = await user_collection.insert_one(user)
        return {
            "Message":"User Created",
            "Insereted_ID":str(result.inserted_id)
        }
    except:
        return {
            "Error":"User not created"
        }

async def get_users():
    try:
        result = await user_collection.find()
        return {
            "Message":"Users found",
            "Users":getAllUsers(result)}
    except:
        return {
            "Error":"Users not found"
        }