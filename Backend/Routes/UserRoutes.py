from Controllers.UserController import add_user, get_users
from fastapi import APIRouter

router = APIRouter(prefix="/user",tags=["User"])

@router.post("/adduser")
async def add_user_route(user):
    return await add_user(user)

@router.get("/getUsers")
async def get_users_route():
    return await get_users()