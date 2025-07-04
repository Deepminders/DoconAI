from Models.ProjectModel import ProjectModel
from typing import Dict, Any, List

async def getAllProject(projects_cursor) -> List[Dict[str, Any]]:
    """Convert a MongoDB cursor to a list of formatted project dictionaries"""
    projects_list = await projects_cursor.to_list(length=None)
    return [getIndividualProject(project) for project in projects_list]

def getIndividualProject(project: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a single MongoDB project document to API response format"""
    try:
        # Convert MongoDB document to ProjectModel
        project_model = ProjectModel.from_mongo_dict(project)
        
        # Return only the fields present in the example structure
        return {
            "projectId": str(project.get("_id", "")),
            "projectName": project_model.projectName,
            "projectLead": project_model.projectLead,
            "projectStatus": project_model.projectStatus.value,
            "startDate": project_model.startDate.isoformat(),
            "endDate": project_model.endDate.isoformat(),
            "updatedAt": project_model.updatedAt.isoformat(),
            "Client":project_model.Client
        }
        
    except Exception as e:
        return {
            "projectId": str(project.get("_id", "")),
            "error": f"Error processing project: {str(e)}"
        }