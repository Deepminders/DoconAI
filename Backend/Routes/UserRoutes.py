from Controllers.UserController import add_user, get_users,find_user,update_user,delete_user, addprojectmanager, authenticate_user, create_access_token, get_user_from_token
from Models.UserModel import UserModel,UserUpdate, TokenResponse
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
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

@router.put("/updateuser/{id}")
async def update_user_route(id:str,user_update:UserUpdate):
    return await update_user(id,user_update)

@router.delete("/deleteuser/{id}")
async def delete_user_route(id:str):
    return await delete_user(ObjectId(id))

@router.post("/addprojectManager")
async def add_project_manager_route(username:str):
    return await addprojectmanager(username)


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm=Depends()):
    user=await authenticate_user(form_data.username, form_data.password)
    token_data={"sub":str(user["_id"]), "username": user["username"]}
    token=create_access_token(token_data)
    return {"access_token":token,"token_type":"bearer"}


"/-------------------------This Route is Added By Sehara-----------------------/"
@router.get("/decode-token")
async def decode_user_token(token: str = Query(..., description="JWT token to decode")):
    """
    Decode JWT token and return user information
    
    Example: GET /user/decode-token?token=your_jwt_token_here
    """
    return await get_user_from_token(token)