from pydantic import BaseModel

def getIndividualStaff(staff)->dict:
    return {
        "id": str(staff["_id"]),
        "staff_fname": staff["staff_fname"],
        "staff_lname": staff["staff_lname"],
        "staff_email": staff["staff_email"],
        "staff_age": staff["staff_age"],
        "staff_gender": staff["staff_gender"],
        "staff_role": staff["staff_role"],
        "assigned_projects": [str(p) for p in staff.get("assigned_projects", [])],  
        "staff_image_url": staff["staff_image_url"]
    }

async def getAllStaff(staff_cursor)->list:
    staff_list = await staff_cursor.to_list(length=None)
    return [getIndividualStaff(staff) for staff in staff_list]