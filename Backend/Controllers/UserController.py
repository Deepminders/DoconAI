from Schemas.UserSchema import getIndividualUser, getAllUsers
from Config.db import user_collection, staff_collection
from Models.UserModel import (
    UserModel, UserUpdate, projectmcreate,
    PasswordResetRequest, PasswordResetPayload,TokenData
)
from bson import ObjectId
from fastapi import HTTPException
import random
import string
import os
import smtplib
from email.mime.text import MIMEText
from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from uuid import uuid4

# ===================== CONFIG =====================
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 6000
RESET_TOKEN_EXPIRE_MINUTES = 15

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# ===================== PASSWORD UTILS =====================
def get_password_hash(password): return pwd_context.hash(password)
def hash_password(pwd): return pwd_context.hash(pwd)
def verify_password(plain_password, hashed_password): return pwd_context.verify(plain_password, hashed_password)
def generate_temporary_password(length=4):
    return uuid4().hex[:length]
# ===================== TOKEN UTILS =====================
async def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def create_reset_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def decode_reset_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired reset token")

# ===================== EMAIL =====================
async def send_reset_email(email: str, token: str):
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    body = f"""
Hello,

You requested a password reset for your DoCon.AI account.
Click the link below to reset your password. It will expire in 15 minutes:

{reset_link}

If you did not request this, please ignore this message.

– DoCon.AI Support
    """
    msg = MIMEText(body)
    msg["Subject"] = "DoCon.AI Password Reset"
    msg["From"] = SMTP_USER
    msg["To"] = email

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
            print(f"[EMAIL SENT] Reset email sent to {email}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email send failed: {str(e)}")

# ===================== MAIN USER FUNCTIONS =====================
async def add_user(user: dict) -> dict:
    # Assume user already contains: company_name, first_name, last_name, etc.
    user["password"] = get_password_hash(user["password"])
    user["username"] = f"{user['first_name'].lower()}.{user['last_name'].lower()}.{uuid4().hex[:6]}"

    try:
        
        result = await user_collection.insert_one(user)

        # If NOT a project owner, also add to staff_collection
        if user["user_role"].lower() != "project owner":
            staff_data = {
                "user_id": result.inserted_id,
                "email": user["email"],
                "role": user["user_role"],
                "created_by": user.get("created_by"),
                "created_at": datetime.now(timezone.utc)
            }
            await staff_collection.insert_one(staff_data)
        return {
            "Message": "User Created",
            "Insereted_ID": str(result.inserted_id)
        }
    except Exception as e:
        print("[Signup Error]", str(e))
        return {
            "Error": "User not created"
        }
async def list_staff_created_by_user(user_id: str):
    users = []
    cursor = user_collection.find({"created_by": ObjectId(user_id)}).sort("created_at", -1)
    async for u in cursor:
        users.append({
            "id": str(u["_id"]),
            "name": f"{u.get('first_name', '').strip()} {u.get('last_name', '').strip()}".strip() or u.get("username", ""),
            "email": u.get("email", ""),
            "role": u.get("user_role", "")
        })
    return users
  
async def get_users() -> dict:
    return await getAllUsers(user_collection.find())

async def find_user(id: ObjectId) -> dict:
    user = await user_collection.find_one({"_id": id})
    if user:
        return {
            "Message": "User found",
            "User": getIndividualUser(user)
        }
    else:
        return {
            "Error": "User not found"
        }

async def update_user(user_id: str, user_update: UserUpdate):
    update_data = user_update.model_dump(exclude_unset=True)
    student = await user_collection.find_one({"_id": ObjectId(user_id)})
    if student:
        updated_student = await user_collection.update_one(
            {"_id": ObjectId(user_id)}, {"$set": update_data}
        )
        if updated_student.modified_count > 0:
            return {"success": True, "message": "User updated successfully"}
        return {"success": False, "message": "No changes were made"}
    return {"success": False, "message": "User not found"}

async def delete_user(user_id: str):
    result = await user_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

async def generatepssword(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

async def authenticate_user(username: str, password: str):
    user = await user_collection.find_one({"username": username})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return user

async def addprojectmanager(uname: str):
    existing_user = await user_collection.find_one({"username": uname})
    if existing_user:
        return {"Error": "Username Already Exists"}

    password = generatepssword()
    hashed_password = pwd_context.hash(password)

    user_data = projectmcreate(username=uname, password=hashed_password)
    user_collection.insert_one(user_data.model_dump())

    return {"message": "Project Manager created successfully", "username": uname}

async def create_staff_user(email: str, user_role: str = "Staff", created_by: str = ""):
    # Check if user exists
    if await user_collection.find_one({"email": email}):
        raise HTTPException(400, "User already exists")

    temp_pwd = generate_temporary_password()
    hashed = hash_password(temp_pwd)

    user_doc = {
        "company_name": "",
        "first_name": "",
        "last_name": "",
        "username": email.split("@")[0],
        "email": email,
        "phone_number": "",
        "gender": "",
        "user_role": user_role,
        "password": hashed,
        "created_at": datetime.now(timezone.utc),
        "created_by": created_by,  # 👈 Add this line
    }

    result = await user_collection.insert_one(user_doc)
    staff_doc = {
        "user_id": result.inserted_id,
        "email": email,
        "role": user_role,
        "created_by": created_by,
        "created_at": datetime.now(timezone.utc)
    }
    await staff_collection.insert_one(staff_doc)
    return {"id": str(result.inserted_id), "email": email, "temporary_password": temp_pwd}

# ===================== PASSWORD RESET HANDLERS =====================
async def request_password_reset(data: PasswordResetRequest):
    user = await user_collection.find_one({
        "$or": [
            {"email": data.email_or_username},
            {"username": data.email_or_username}
        ]
    })

    if not user:
        raise HTTPException(status_code=404, detail="No user found with that email or username.")

    token_data = {"sub": str(user["_id"]), "email": user["email"]}
    token = create_reset_token(token_data)
    send_reset_email(user["email"], token)
    return {"message": "Reset link sent to your email."}

async def reset_password(data: PasswordResetPayload):
    try:
        payload = decode_reset_token(data.token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token")

        hashed_pwd = hash_password(data.new_password)
        updated = await user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password": hashed_pwd}}
        )

        if updated.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found or password unchanged")

        return {"message": "Password reset successful"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")

async def get_user_by_id(user_id: str):
    # Example: query MongoDB to get user dict by user_id
    user = await user_collection.find_one({"_id": ObjectId(user_id)})
    if user:
        user["id"] = str(user["_id"])
        return user
    return None
async def get_current_user(token: str = Depends(oauth2_scheme)):
    print("Token received:", token)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("Decoded payload:", payload)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(sub=user_id, username=payload.get("username"))
    except JWTError as e:
        print("JWTError:", e)
        raise credentials_exception

    user = await get_user_by_id(token_data.sub)
    if user is None:
        print("User not found")
        raise credentials_exception
    return user
"/----------------------------This function is created by Sehara to fetch user information by token----------------------------/"


async def get_user_from_token(token: str) -> dict:
    """
    Decode JWT token and return user information (user_id, first_name, user_role)
    """
    try:
        # Decode the token
        payload = await decode_token(token)
        
        # Extract user_id from payload (adjust field name based on your token structure)
        user_id = payload.get("user_id") or payload.get("sub") or payload.get("id")
        username = payload.get("username")
        
        if not user_id and not username:
            raise HTTPException(status_code=401, detail="Invalid token: user identifier not found")
        
        # Query the database to get user information
        if user_id:
            user = await user_collection.find_one({"_id": ObjectId(user_id)})
        else:
            user = await user_collection.find_one({"username": username})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Return user information
        return {
            "user_id": str(user["_id"]),
            "first_name": user.get("first_name", ""),
            "user_role": user.get("user_role", ""),
            "username": user.get("username", ""),
            "email": user.get("email", "")
        }
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

