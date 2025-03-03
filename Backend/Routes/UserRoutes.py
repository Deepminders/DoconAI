from Controllers.UserController import add_user, get_users,find_user
from Models.UserModel import UserModel
from bson import ObjectId
from fastapi import APIRouter

router = APIRouter(prefix="/user",tags=["User"])

@router.post("/adduser")
async def add_user_route(user:UserModel):
    return await add_user(user)

@router.get("/getUsers")
async def get_users_route():
    return await get_users()

@router.get("/findUser/{id}")
async def find_user_route(id:str):
    return await find_user(ObjectId(id))