from fastapi import APIRouter
from bson import ObjectId
from Controllers.StaffController import add_staff,get_staff,find_staff,delete_staff,update_staff,assign_project
from Models.StaffModel import StaffModel

router = APIRouter(prefix="/staff",tags=["Staff_Member"])

@router.post("/addStaff")
async def add_staff_route(staff:StaffModel):
    return await add_staff(staff)

@router.get("/getStaff")
async def get_staff_route():
    return await get_staff()

@router.get("/findStaff/{id}")
async def find_staff_route(id:str):
    return await find_staff(ObjectId(id))

@router.delete("/delete/{id}")
async def delete_staff_route(id:str):
    return await delete_staff(ObjectId(id))

@router.put("/update/{id}")
async def update_staff_route(id:str,staff: StaffModel):
    return await update_staff(ObjectId(id),staff.dict())

@router.put("/assignProject/{s_id}/{p_id}")
async def assign_project_route(s_id:str,p_id:str):
    return await assign_project(ObjectId(s_id),ObjectId(p_id))
