from Controllers.ProjectController import (
    add_project,
    get_projects,
    find_project,
    update_project,
    delete_project,
    get_staff_by_project,
    remove_project_from_staff,
)
from Models.ProjectModel import ProjectModel, ProjectUpdateModel, RemoveProjectRequest
from bson import ObjectId
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from Models.report_components import (
    generate_vector_store as summarizer_generate_vector_store,
    generate_summary as summarizer_generate_summary,
    SummaryRequest,
)

routerproject = APIRouter(prefix="/project", tags=["Project"])


@routerproject.post("/addproject")
async def add_project_route(project: ProjectModel):
    return await add_project(project)


@routerproject.get("/getproject")
async def get_project_route():
    return await get_projects()


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
    

