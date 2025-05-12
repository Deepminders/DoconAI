import base64
from fastapi import HTTPException
from Config.db import staff_collection, project_collection
from Models.StaffModel import StaffModel
from Schemas.StaffSchema import getIndividualStaff,getAllStaff
from bson import ObjectId
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import List

import shutil
import uuid
import os

UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def add_staff(
    staff: StaffModel
):
    try:
        staff_fname = staff.staff_fname
        staff_lname = staff.staff_lname
        staff_email = staff.staff_email
        staff_age = staff.staff_age
        staff_gender = staff.staff_gender
        staff_role = staff.staff_role
        staff_image_url = staff.staff_image_url
        assigned_projects = staff.assigned_projects or []  # Ensure empty array default

        # Extract image format and data
        header, base64_data = staff_image_url.split(',', 1)
        mime_type = header.split(':')[1].split(';')[0]
        extension = f".{mime_type.split('/')[1]}"  # e.g. .png, .jpeg
        
        # Decode Base64
        image_data = base64.b64decode(base64_data)
        
        # Generate filename
        filename = f"{uuid.uuid4()}{extension}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        # Save file
        with open(filepath, "wb") as buffer:
            buffer.write(image_data)

        # Create staff document
        staff_data = {
            "staff_fname": staff_fname,
            "staff_lname": staff_lname,
            "staff_email": staff_email,
            "staff_age": staff_age,
            "staff_gender": staff_gender,
            "staff_role": staff_role,
            "assigned_projects": assigned_projects or [],  # Ensure empty array
            "staff_image_url": f"/uploaded_images/{filename}"
        }

        result = await staff_collection.insert_one(staff_data)
        
        return JSONResponse(
            status_code=201,
            content={
                "message": "Staff added successfully",
                "staff_id": str(result.inserted_id),
                "staff_image_url": staff_data["staff_image_url"],
            }
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        print(e)
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)
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
            "projectname": project.get("name")
        })
    return projects
