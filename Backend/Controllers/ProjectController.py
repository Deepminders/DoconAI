from Models.ProjectModel import ProjectModel, ProjectUpdateModel, RemoveProjectRequest
from Schemas.ProjectSchema import getAllProject, getIndividualProject
from Config.db import project_collection, staff_collection
from bson import ObjectId
import traceback
from fastapi import HTTPException, status
from datetime import datetime
import json


async def add_project(project: ProjectModel) -> dict:
    try:
        # Convert client_id string to ObjectId
        if hasattr(project, "client_id") and isinstance(project.client_id, str):
            project.client_id = ObjectId(project.client_id)

        new_project = project.to_mongo_dict()
        result = await project_collection.insert_one(new_project)
        return {
            "message": "Project created successfully",
            "project_id": str(result.inserted_id),
            "project_name": project.projectName,
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error creating project: {str(e)}")


async def get_projects() -> dict:

    project_cursor = project_collection.find()
    return await getAllProject(project_cursor)


async def find_project(id: ObjectId) -> dict:

    project = await project_collection.find_one({"_id": id})
    if project:
        return {
            "Message": "Project found",
            "User": getIndividualProject(project),
        }
    else:
        return {
            "Message": "Project not found",
        }


async def update_project(project_id: str, project_update: ProjectUpdateModel) -> dict:
    try:
        object_id = ObjectId(project_id)
        update_data = project_update.to_mongo_dict()
        # Convert client_id string to ObjectId if present
        if "client_id" in update_data and isinstance(update_data["client_id"], str):
            update_data["client_id"] = ObjectId(update_data["client_id"])
        update_data["lastUpdated"] = datetime.utcnow()
        result = await project_collection.update_one(
            {"_id": object_id}, {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        return {
            "message": "Project updated successfully",
            "updated_fields": list(update_data.keys()),
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error updating project: {str(e)}")


async def delete_project(project_id: str) -> dict:
    try:
        # Validate and convert ID
        object_id = ObjectId(project_id)

        # Delete the project
        result = await project_collection.delete_one({"_id": object_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")

        return {"message": "Project deleted successfully", "project_id": project_id}
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error deleting project: {str(e)}")


async def get_staff_by_project(project_id: str):
    try:
        # Validate project_id format and prepare both string and ObjectId versions
        try:
            project_oid = ObjectId(project_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid project ID format")

        # Query staff assigned to this project (handling both string and ObjectId formats)
        cursor = staff_collection.find(
            {
                "$or": [
                    {"assigned_projects": {"$in": [project_id]}},  # String version
                    {"assigned_projects": {"$in": [project_oid]}},  # ObjectId version
                ]
            }
        )

        staff_data = await cursor.to_list(length=None)

        result = []
        for doc in staff_data:
            try:
                # Convert age field if it's in MongoDB extended JSON format
                age = doc.get("staff_age", 0)
                if isinstance(age, dict) and "$numberInt" in age:
                    age = int(age["$numberInt"])

                result.append(
                    {
                        "staff_id": str(doc["_id"]),
                        "staff_fname": doc.get("staff_fname", ""),
                        "staff_lname": doc.get("staff_lname", ""),
                        "staff_email": doc.get("staff_email", ""),
                        "staff_age": int(age),
                        "staff_gender": doc.get("staff_gender", ""),
                        "staff_role": doc.get("staff_role", ""),
                        "staff_image_url": doc.get("staff_image_url", ""),
                    }
                )

            except Exception as doc_error:
                print(
                    f"Error processing document {doc.get('_id', 'unknown')}: {doc_error}"
                )
                continue

        return {"staff": result}

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


# Ensure this is your MongoDB collection object


async def remove_project_from_staff(staff_id: str, request: RemoveProjectRequest):
    """
    Remove a project from staff member's assigned_projects array.
    """
    try:
        # Validate ObjectIds
        if not ObjectId.is_valid(staff_id) or not ObjectId.is_valid(request.project_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid ID format"
            )

        # Convert to ObjectId
        staff_oid = ObjectId(staff_id)
        project_oid = ObjectId(request.project_id)

        # Check staff exists
        staff = await staff_collection.find_one({"_id": staff_oid})
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Staff member not found"
            )

        # Verify project is actually assigned
        if project_oid not in staff.get("assigned_projects", []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project not assigned to this staff member",
            )

        # Perform the update
        result = await staff_collection.update_one(
            {"_id": staff_oid}, {"$pull": {"assigned_projects": project_oid}}
        )

        # Return updated document
        updated_staff = await staff_collection.find_one({"_id": staff_oid})
        if updated_staff:
            updated_staff["_id"] = str(updated_staff["_id"])
            updated_staff["assigned_projects"] = [
                str(pid) for pid in updated_staff.get("assigned_projects", [])
            ]
        return updated_staff

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}",
        )
