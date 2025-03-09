from Models.ProjectModel import ProjectModel, ProjectUpdateModel
from Schemas.ProjectSchema import getAllProject,getIndividualProject
from Config.db import project_collection
from bson import ObjectId
import traceback
from fastapi import HTTPException


async def add_project(project: ProjectModel) -> dict:
    """
    Adds a new project to the database.

    Args:
        project: ProjectModel object containing project data.

    Returns:
        A dictionary indicating the success or failure of the operation.
    """
    new_project = project.to_mongo_dict()  # Convert date fields
    try:
        result = await project_collection.insert_one(new_project)
        return {
            "Message": "Project Created",
            "Inserted_ID": str(result.inserted_id),
        }
    except Exception as e:
        print("Error inserting project:", e)
        traceback.print_exc()  # Prints the full error traceback
        return {
            "Error": f"Project not created: {str(e)}",
        }

async def get_projects() -> dict:
    """
    Retrieves all projects from the database.

    Returns:
        A dictionary containing the list of projects.
    """
    project_cursor = project_collection.find()
    return await getAllProject(project_cursor)

async def find_project(id: ObjectId) -> dict:
    """
    Finds a project by its ID.

    Args:
        id: The ObjectId of the project to find.

    Returns:
        A dictionary containing the project details or an error message.
    """
    project = await project_collection.find_one({"_id": id})
    if project:
        return {
            "Message": "Project found",
            "User": getIndividualProject(project),
        }
    else:
        return {
            "Error": "Project not found",
        }

async def update_project(project_id: str, project: ProjectUpdateModel):
    """
    Updates a project by its ID.

    Args:
        project_id: The ID of the project to update.
        project: The Project object containing the updated data.

    Returns:
        A dictionary containing the update message and updated fields.

    Raises:
        HTTPException: If the project_id is invalid, no valid fields are provided, or the project is not found.
    """
    try:
        object_id = ObjectId(project_id)  # Convert project_id to ObjectId
    except:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    new_project = project.to_mongo_dict()  # Convert datetime fields to string

    # Remove None values from the update dictionary
    update_data = {k: v for k, v in new_project.items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = await project_collection.update_one(
        {"_id": object_id},  # Find the project by ID
        {"$set": update_data}  # Update provided fields
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"message": "Project updated successfully", "updated_fields": update_data}

async def delete_project(project_id: str):
    """
    Deletes a project by its ID.

    Args:
        project_id: The ID of the project to delete.

    Returns:
        A dictionary containing the deletion message.

    Raises:
        HTTPException: If the project_id is invalid or the project is not found.
    """
    try:
        # Convert project_id from string to ObjectId
        object_id = ObjectId(project_id)

        # Delete the project from MongoDB
        result = await project_collection.delete_one({"_id": object_id})

        # Check if the project was deleted
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")

        return {"message": "Project deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))