import base64
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

import shutil
import uuid
import os

async def add_staff(staff_data):
    user_id = ObjectId(staff_data["_id"])  # user ID passed in body
    staff_doc = {
      "_id": user_id,
      "assigned_projects": staff_data.get("assigned_projects", []),
    #   "staff_image_url": staff_data.get("staff_image_url")
    }
    await staff_collection.insert_one(staff_doc)
    return { "Message": "Staff created", "UserID": str(user_id) }

async def get_staff() -> dict:
    try:
        users_cursor = user_collection.find()  # find() returns a cursor, no await here

        staff_users = []
        async for user in users_cursor:
            user["_id"] = str(user["_id"])
            staff_users.append(user)

        return {
            "Message": "All staff displayed successfully",
            "Staff": staff_users
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "Error": "All staff not displayed",
                "Details": str(e)
            }
        )

async def find_staff(_id: ObjectId) -> dict:
    try:
        # Get user base info
        user = await user_collection.find_one({"_id": _id})
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get extra staff info
        staff = await staff_collection.find_one({"_id": _id})
        if staff is None:
            raise HTTPException(status_code=404, detail="Staff profile not found")

        # Combine and return
        return {
            "Message": "Staff found",
            "Staff": getIndividualStaff(user, staff)
        }

    except Exception as e:
        return {
            "Error": "Staff not found",
            "Details": str(e)
        }


    
async def delete_staff(_id: ObjectId) -> dict:
    try:
        # Delete from user collection
        user_result = await user_collection.delete_one({"_id": _id})

        # Delete from staff collection
        staff_result = await staff_collection.delete_one({"_id": _id})

        if user_result.deleted_count == 1 and staff_result.deleted_count == 1:
            return {
                "Message": "Staff and user data deleted successfully"
            }
        elif user_result.deleted_count == 1:
            return {
                "Warning": "User deleted but staff profile was not found"
            }
        elif staff_result.deleted_count == 1:
            return {
                "Warning": "Staff profile deleted but user account was not found"
            }
        else:
            return {
                "Warning": "No user or staff data found for the given ID"
            }

    except Exception as e:
        return {
            "Error": "Staff not deleted",
            "Details": str(e)
        }


async def update_staff(_id:ObjectId,staff_data)->dict:
    try:
        result = await user_collection.update_one({"_id":_id},{"$set": staff_data})
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
        staff_member = await staff_collection.find_one({"_id": ObjectId(user_id)})
        
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
            {"_id": 1, "projectName": 1}  # Only fetch needed fields
        )
        
        projects = await cursor.to_list(length=None)
        
        # Format response for frontend
        project_list = []
        for project in projects:
            project_list.append({
                "project_id": str(project["_id"]),
                "project_name": project.get("projectName", "Unnamed Project")
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