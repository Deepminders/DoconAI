from pydantic import BaseModel

def getIndividualStaff(user: dict, staff: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "company_name": user.get("company_name"),
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "username": user.get("username"),
        "user_role": user.get("user_role"),
        "gender": user.get("gender"),
        "email": user.get("email"),
        "phone_number": user.get("phone_number"),
        "staff_image_url": staff.get("staff_image_url"),
        # Staff-specific fields
        "assigned_projects": [str(p) for p in staff.get("assigned_projects", [])]
        
    }


async def getAllStaff(staff_cursor)->list:
    staff_list = await staff_cursor.to_list(length=None)
    return [getIndividualStaff(staff) for staff in staff_list]