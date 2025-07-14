from Controllers.UserController import add_user, get_users,find_user,update_user,delete_user, addprojectmanager, authenticate_user, create_access_token, request_password_reset, reset_password, create_staff_user, list_staff_created_by_user, get_current_user
from Models.UserModel import UserModel,UserUpdate, TokenResponse, PasswordResetRequest, PasswordResetPayload,StaffCreateRequest
from bson import ObjectId

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
router = APIRouter(prefix="/user",tags=["User"])

@router.post("/adduser")
async def add_user_route(request: Request):
    data = await request.json()

    # Manually map frontend fields to backend model fields
    user_data = {
        "company_name": data.get("company", ""),
        "first_name": data.get("firstname", ""),
        "last_name": data.get("lastname", ""),
        "username": data.get("email").split("@")[0],  # auto-generate username
        "user_role": "Project Owner",
        "gender": "Not Specified",  # default or handle differently
        "email": data.get("email"),
        "phone_number": "Not Provided",  # default or extend your form
        "password": data.get("password"),
    }

    return await add_user(user_data)

@router.get("/getUsers")
async def get_users_route():
    return await get_users()

@router.get("/list-users")
async def get_user_list_for_table(user: dict = Depends(get_current_user)):
    return await list_staff_created_by_user(user["_id"])

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
    token= await create_access_token(token_data)
    return {"access_token":token,"token_type":"bearer"}

@router.post("/request-password-reset")
async def request_reset_password_route(data: PasswordResetRequest):
    return await request_password_reset(data)

@router.post("/reset-password")
async def reset_password_route(data: PasswordResetPayload):
    return await reset_password(data)

@router.post("/add-staff")
async def add_staff(req: StaffCreateRequest,request: Request, user: dict = Depends(get_current_user)):
    """Project Owner adds a staff by email; returns temp password"""
    print("Headers received:", request.headers)
    print("Received:", req.model_dump())
    return await create_staff_user(req.email, req.user_role, created_by=user["_id"])