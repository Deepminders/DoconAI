from fastapi import HTTPException
from Config.db import staff_collection
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
    

