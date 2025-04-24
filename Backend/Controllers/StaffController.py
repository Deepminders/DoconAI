from fastapi import HTTPException
from Config.db import staff_collection, project_collection
from Models.StaffModel import StaffModel
from Schemas.StaffSchema import getIndividualStaff,getAllStaff
from bson import ObjectId

async def add_staff(staff: StaffModel) -> dict:
    newstaff = staff.dict()
    try:
        result = await staff_collection.insert_one(newstaff)
        return {
            "Message": "Staff Created",
            "Inserted_ID": str(result.inserted_id)
        }
    except Exception as e:
        return {
            "Error": "Staff not created",
            "Details": str(e)  
        }

async def get_staff()->dict: 
    try:
        result = await getAllStaff(staff_collection.find())
        print(result)
        return result
    
    except Exception as e:
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
            {"_id": s_id},
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