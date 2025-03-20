from Controllers.ProjectController import add_project, get_projects, find_project, update_project, delete_project
from Models.ProjectModel import ProjectModel,ProjectUpdateModel
from bson import ObjectId
from fastapi import APIRouter

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