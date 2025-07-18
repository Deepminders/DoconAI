import base64
import datetime
from fastapi import HTTPException
from Config.db import staff_collection, project_collection,user_collection
from Models.StaffModel import StaffModel
from Schemas.StaffSchema import getIndividualStaff,getAllStaff
from bson import ObjectId
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import List
from bson import ObjectId
from fastapi import APIRouter

async def add_staff(
    staff: StaffModel
):
    try:
        assigned_projects = staff.assigned_projects or []  # Ensure empty array default

        # Create staff document
        staff_data = {
            "assigned_projects": assigned_projects or [],  # Ensure empty array   
        }

        result = await staff_collection.insert_one(staff_data)
        
        return JSONResponse(
            status_code=201,
            content={
                "message": "Staff added successfully",
                "staff_id": str(result.inserted_id) 
            }
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

async def get_staff()->dict: 
    try:
        result = await getAllStaff(staff_collection.find())
        print(result)
        return result
    
    except Exception as e:
        print(e)
        return {
            "Error": "All Staff not display",
            "Details": str(e)  
        }

async def find_staff(staff_id:ObjectId)->dict:
    try:
        result = await staff_collection.find_one({"_id": staff_id})
        if result is None:
            raise HTTPException(status_code=404, detail="Staff not found")
        
        return {
            "Message": "Staff found",
            "Staff": getIndividualStaff(result)  
        }
        
    except Exception as e:
        return {
            "Error": "Staff not founded",
            "Details": str(e)  
        }

    
async def delete_staff(staff_id:ObjectId)->dict:
    try:
        result = await staff_collection.delete_one({"_id":staff_id})
        if result.deleted_count == 1:
            return{
                "Message": "Staff deleted successfully"
            }

    except Exception as e:
        return {
            "Error": "Staff not deleted",
            "Details": str(e)  
        }


async def update_staff(staff_id:ObjectId,staff_data)->dict:
    try:
        result = await staff_collection.update_one({"_id":staff_id},{"$set": staff_data})
        return{
            "Message":"Updated Successfully"
        }

    except Exception as e:
        return {
            "Error": "Staff not Updated",
            "Details": str(e)  
        }

async def assign_project(s_id:str, p_id:str) -> dict:
    try:
    
        staff = await staff_collection.find_one({"_id": ObjectId(s_id)})
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")

        project = await project_collection.find_one({"_id": ObjectId(p_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        result = await staff_collection.update_one(
            {"_id": ObjectId(s_id)},
            {"$addToSet": {"assigned_projects": p_id}}  # Using $addToSet to avoid duplicates
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Staff already assigned to this project")

        return {
            "Message": "Staff assigned to project successfully",
            "Staff ID": str(s_id),
            "Project ID": str(p_id)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error assigning staff to project: {str(e)}")
    

async def get_project():
    projects = []
    async for project in project_collection.find():
        projects.append({
            "projectid": str(project["_id"]),
            "projectName": project.get("projectName")
        })
    return projects

async def fetchUserProjects(user_id: str):
    """
    Fetches all projects assigned to a specific user from staff collection.
    Returns project IDs and names for project selection in upload.
    """
    try:
        # Find the user in staff collection
        staff_member = await staff_collection.find_one({"user_id": ObjectId(user_id)})
        
        if not staff_member:
            raise HTTPException(status_code=404, detail="Staff member not found")
        
        assigned_projects = staff_member.get("assigned_projects", [])
        
        if not assigned_projects:
            return JSONResponse({
                "status": "success",
                "projects": [],
                "user_id": user_id,
                "count": 0,
                "message": "No projects assigned to this user"
            })
        
        # Fetch project details from project collection
        # Convert ObjectIds to strings for query
        project_ids = [ObjectId(project_id) if isinstance(project_id, str) else project_id 
                      for project_id in assigned_projects]
        
        # Query project collection to get project names and details
        cursor = project_collection.find(
            {"_id": {"$in": project_ids}}, 
            {"_id": 1, "projectName": 1, "projectStatus":1,"startDate":1, "endDate":1, "Client":1,"projectLead":1}  # Only fetch needed fields
        )
        
        projects = await cursor.to_list(length=None)
        
        # Format response for frontend
        project_list = []
        for project in projects:
            project_list.append({
                "project_id": str(project["_id"]),
                "project_name": project.get("projectName", "Unnamed Project"),
                "project_status": project.get("projectStatus", "Unknown Status"),
                "start_date": project.get("startDate", "N/A"),
                "end_date": project.get("endDate", "N/A"),
                "client": project.get("Client", "N/A"),
                "projectLead": project.get("projectLead", "Unknown Lead")
            })
        
        
        return JSONResponse({
            "status": "success",
            "projects": project_list,
            "user_id": user_id,
            "count": len(project_list)
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user projects: {str(e)}")
    
    
async def fetchOwnerProjects(user_id: str):
    """
    Fetches all projects assigned to a specific user from staff collection.
    Returns project IDs and names for project selection in upload.
    """
    try:
        # Find the user in staff collection
        projects = await project_collection.find({"client_id": ObjectId(user_id)},{"_id": 1, "projectName": 1, "projectStatus":1,"startDate":1, "endDate":1, "Client":1}).to_list(length=None)
        
        if not projects:
            return JSONResponse({
                "status": "success",
                "projects": [],
                "user_id": user_id,
                "count": 0,
                "message": "No projects assigned to this user"
            })
        
        
        # Format response for frontend
        project_list = []
        for project in projects:
            start_date = project.get("startDate", "N/A")
            end_date = project.get("endDate", "N/A")

            # Convert datetime objects to ISO 8601 strings if they exist
            if isinstance(start_date, datetime.datetime):
                start_date = start_date.isoformat()
            if isinstance(end_date, datetime.datetime):
                end_date = end_date.isoformat()
            project_list.append({
                "project_id": str(project["_id"]),
                "project_name": project.get("projectName", "Unnamed Project"),
                "project_status": project.get("projectStatus", "Unknown Status"),
                "start_date": start_date,
                "end_date": end_date,
                "client": project.get("Client", "N/A")
            })
        
        
        return JSONResponse({
            "status": "success",
            "projects": project_list,
            "user_id": user_id,
            "count": len(project_list)
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user projects: {str(e)}")
    
    
async def get_assigned_staff_project(project_id: str):
    """
    Fetches staff members who have the given project_id in their 'assigned_projects' array.
    """
    try:
        # Validate and convert project_id to ObjectId
        try:
            project_obj_id = ObjectId(project_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid project ID format.")

        # Query staff_collection:
        # Find staff documents where:
        # 1. 'assigned_projects' field exists (implicitly handled by $in)
        # 2. 'assigned_projects' array contains the specific project_obj_id
        cursor = staff_collection.find(
            {"assigned_projects": {"$in": [project_obj_id]}}
        )

        # Convert cursor to a list of staff documents
        assigned_staff_documents = await cursor.to_list(length=None)

        # Format staff details for response
        formatted_staff_list = []
        for staff_member in assigned_staff_documents:
            staff_id_str = str(staff_member["_id"]) # Convert ObjectId to string

            # Handle datetime objects if they exist in staff_collection documents
            # (e.g., 'createdAt', 'updatedAt' if your staff docs have them)
            created_at = staff_member.get("createdAt")
            if isinstance(created_at, datetime.datetime):
                created_at = created_at.isoformat()

            updated_at = staff_member.get("updatedAt")
            if isinstance(updated_at, datetime.datetime):
                updated_at = updated_at.isoformat()

            formatted_staff_list.append({
                "id": staff_id_str, # Use 'id' for frontend consistency
                "first_name": staff_member.get("first_name", ""),
                "last_name": staff_member.get("last_name", ""),
                "email": staff_member.get("email", ""),
                "user_role": staff_member.get("user_role", ""), # Assuming staff docs have this
                # Add any other relevant fields from staff_collection that the frontend needs
                "createdAt": created_at,
                "updatedAt": updated_at,
            })

        return JSONResponse({
            "status": "success",
            "staff_members": formatted_staff_list,
            "count": len(formatted_staff_list)
        })

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching assigned staff for project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch assigned staff: {str(e)}")
