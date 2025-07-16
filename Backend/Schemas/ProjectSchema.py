from Models.ProjectModel import ProjectModel
from typing import Dict, Any, List
from bson import ObjectId


async def getAllProject(projects_cursor) -> List[Dict[str, Any]]:
    """Convert a MongoDB cursor to a list of formatted project dictionaries"""
    projects_list = await projects_cursor.to_list(length=None)
    return [getIndividualProject(project) for project in projects_list]


def getIndividualProject(project: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a single MongoDB project document to API response format"""
    try:
        if "client_id" in project:
            cid = project["client_id"]
            if isinstance(cid, dict) and "$oid" in cid:
                project["client_id"] = str(cid["$oid"])
            else:
                project["client_id"] = str(cid)
        project_model = ProjectModel.from_mongo_dict(project)
        return {
            "projectId": str(project.get("_id", "")),
            "projectName": project_model.projectName,
            "projectLead": project_model.projectLead,
            "projectStatus": project_model.projectStatus.value,
            "startDate": project_model.startDate.isoformat(),
            "endDate": project_model.endDate.isoformat(),
            "updatedAt": project_model.updatedAt.isoformat(),
            "Client": project_model.Client,
            "client_id": project_model.client_id,  # single string
        }
    except Exception as e:
        return {
            "projectId": str(project.get("_id", "")),
            "error": f"Error processing project: {str(e)}",
        }
