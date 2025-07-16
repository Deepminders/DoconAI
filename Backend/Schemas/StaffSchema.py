from pydantic import BaseModel

def getIndividualStaff(staff: dict) -> dict:
    return {
        "id": str(staff["_id"]),
        "company_name": staff.get("company_name"),
        "first_name": staff.get("first_name"),
        "last_name": staff.get("last_name"),
        "username": staff.get("username"),
        "user_role": staff.get("user_role"),
        "gender": staff.get("gender"),
        "email": staff.get("email"),
        "phone_number": staff.get("phone_number"),
        "profile_image_url": staff.get("profile_image_url"),
        # Staff-specific fields
        "assigned_projects": [str(p) for p in staff.get("assigned_projects", [])]
        
    }


async def getAllStaff(staff_cursor)->list:
    staff_list = await staff_cursor.to_list(length=None)
    return [getIndividualStaff(staff) for staff in staff_list]