from Controllers.ProjectController import (
    add_project,
    get_projects_by_owner,
    assign_staff_to_project,
    find_project,
    update_project,
    delete_project,
    get_staff_by_project,
    remove_project_from_staff,
)
from Models.ProjectModel import ProjectModel, ProjectUpdateModel, RemoveProjectRequest
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from Controllers import UserController
from fastapi import Body
from typing import List
from fastapi.responses import JSONResponse
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from Models.report_components import (
    generate_vector_store as summarizer_generate_vector_store,
    generate_summary as summarizer_generate_summary,
    SummaryRequest,
)

routerproject = APIRouter(prefix="/projects", tags=["Project"])


@routerproject.post("/{owner_id}/add")
async def create_project(
    owner_id: str,
    project: ProjectModel,
    user=Depends(UserController.get_current_user)
):
    if user["user_role"].lower() != "project owner":
        raise HTTPException(status_code=403, detail="Only Project Owners can add projects")
    return await add_project(project, owner_id)



@routerproject.get("/by-owner/{owner_id}")
async def get_projects_by_owner(
    owner_id: str,
    user=Depends(UserController.get_current_user)
):
    if user["user_role"].lower() != "project owner":
        raise HTTPException(status_code=403, detail="Only Project Owners can view their projects")
    return await get_projects_by_owner(owner_id)

@routerproject.post("/{project_id}/assign")
async def assign_staff_to_project(
    project_id: str,
    staff_ids: List[str] = Body(..., embed=True),
    user=Depends(UserController.get_current_user)
):
    if user["user_role"].lower() != "project owner":
        raise HTTPException(status_code=403, detail="Only Project Owners can assign staff")
    return await assign_staff_to_project(project_id, staff_ids)

@routerproject.get("/{project_id}/members")
async def get_project_members(
    project_id: str,
    user=Depends(UserController.get_current_user)
):
    return await get_staff_by_project(project_id)


@routerproject.get("/findProject/{project_id}")
async def find_project_route(project_id: str):
    return await find_project(ObjectId(project_id))


@routerproject.put("/{project_id}")
async def update_project_route(project_id: str, project: ProjectUpdateModel):
    return await update_project(project_id, project)


@routerproject.delete("/{project_id}")
async def delete_project_route(project_id: str):
    return await delete_project(project_id)


@routerproject.patch("/staff/{staff_id}/remove-project")
async def remove_project_from_staff_route(staff_id: str, request: RemoveProjectRequest):
    return await remove_project_from_staff(staff_id, request)


@routerproject.get("/staff-by-project/{project_id}")
async def get_staff_by_project_route(project_id: str):
    return await get_staff_by_project(project_id)


@routerproject.post("/generate-vector-store")
async def generate_vector_store(
    files: list[UploadFile] = File(...),  # Required file uploads
    project_id: str = Form(None),  # Optional form field
):
    return await summarizer_generate_vector_store(files, project_id)


@routerproject.post("/generate-report")
async def generate_summary_route(request: SummaryRequest):
    """
    Generate summary from project documents
    """
    try:
        return await summarizer_generate_summary(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

