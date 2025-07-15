from Controllers.UserController import add_user, get_users,find_user,update_user,delete_user, addprojectmanager, authenticate_user, create_access_token, request_password_reset, reset_password, create_staff_user, list_staff_created_by_user, get_current_user,get_user_from_token,save_profile_picture, force_reset_password
from Models.UserModel import UserModel,UserUpdate, TokenResponse, PasswordResetRequest, PasswordResetPayload,StaffCreateRequest
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request,Query, UploadFile, File,Body
from typing import Dict
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
    must_change = user.get("must_change_password", False)

    return {
        "access_token": token,
        "token_type": "bearer",
        "must_change_password": must_change  # ✅ Include in response
    }

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
    return await create_staff_user(
        email=req.email,
        user_role=req.user_role,
        first_name=req.first_name,
        last_name=req.last_name,
        created_by=user["_id"]
    )


"/-------------------------This Route is Added By Sehara-----------------------/"
@router.get("/decode-token")
async def decode_user_token(token: str = Query(..., description="JWT token to decode")):
    """
    Decode JWT token and return user information
    
    Example: GET /user/decode-token?token=your_jwt_token_here
    """
    return await get_user_from_token(token)

@router.get("/profile")
async def get_user_profile(user: dict = Depends(get_current_user)):
    """
    Returns authenticated user's profile (company, firstname, lastname, etc.)
    """
    print("User passed to profile route:", user)
    return {
       "company": user.get("company_name", ""),
        "firstname": user.get("first_name", ""),
        "lastname": user.get("last_name", ""),
        "email": user.get("email", ""),
        "username": user.get("username", ""),
        "phone": user.get("phone_number", ""),
        "gender": user.get("gender", ""),
        "user_role": user.get("user_role", ""),
        "profile_image_url": user.get("profile_image_url", "") 
    }

@router.put("/profile")
async def update_user_profile(user_update: UserUpdate, user: dict = Depends(get_current_user)):
    return await update_user(user["_id"], user_update)

@router.post("/upload-profile-picture")
async def upload_profile_picture(user: dict = Depends(get_current_user), file: UploadFile = File(...)):
    try:
        image_url = await save_profile_picture(user["_id"], file)
        return {"profile_image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/force-reset-password")
async def force_reset_password_route(
    data: Dict = Body(...),
    user: dict = Depends(get_current_user)
):
    new_password = data.get("new_password")
    return await force_reset_password(user, new_password)