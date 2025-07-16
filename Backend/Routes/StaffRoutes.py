from fastapi import APIRouter, HTTPException, Depends, Body
from bson import ObjectId
from Controllers.StaffController import add_staff,get_staff,find_staff,delete_staff,update_staff,assign_project,get_project,fetchUserProjects,fetchOwnerProjects
from Models.StaffModel import StaffModel
from Controllers import UserController




router = APIRouter(prefix="/staff",tags=["Staff_Member"])

@router.post("/addStaff")
async def add_staff_route(staff:StaffModel):
     return await add_staff(staff.dict)

@router.get("/getstaff")
async def get_staff_route():
    return await get_staff()

@router.get("/findStaff/{id}")
async def find_staff_route(id:str):
    return await find_staff(ObjectId(id))

@router.delete("/delete/{id}")
async def delete_staff_route(id:str):
    return await delete_staff(ObjectId(id))



@router.put("/assignProject/{s_id}/{p_id}")
async def assign_project_route(s_id:str,p_id:str):
    return await assign_project(ObjectId(s_id),ObjectId(p_id))

@router.get("/projects/")
async def get_project_route():
    return await get_project()





@router.get("/user/{user_id}/projects")
async def get_user_projects(user_id: str):
    """
    Fetch all projects assigned to a specific user.
    
    Returns project IDs and names for project selection during document upload.
    
    Parameters:
    - user_id: The MongoDB ObjectId of the user (from staff collection)
    
    Returns:
    - projects: List of assigned projects with id, name, and description
    - user_id: The user ID that was queried
    - count: Total number of assigned projects
    
    Example: GET /api/doc/user/681c944f8dfa6f904a04ffec/projects
    """
    return await fetchUserProjects(user_id)

@router.get("/staff/by-owner/{owner_id}")
async def list_staff_by_owner(
    owner_id: str,
    user=Depends(UserController.get_current_user)
):
    if user["user_role"].lower() != "project owner":
        raise HTTPException(status_code=403, detail="Only Project Owners can view their staff")
    return await UserController.get_staff_by_owner(owner_id)


@router.get("/owner/{user_id}/projects")
async def get_owner_projects(user_id: str): 
    """
    Fetch all projects owned by a specific user.
    
    Returns project IDs and names for project selection during document upload.
    
    Parameters:
    - user_id: The MongoDB ObjectId of the user (from staff collection)
    
    Returns:
    - projects: List of owned projects with id, name, and description
    - user_id: The user ID that was queried
    - count: Total number of owned projects
    
    Example: GET /api/doc/owner/681c944f8dfa6f904a04ffec/projects
    """
    return await fetchOwnerProjects(user_id)