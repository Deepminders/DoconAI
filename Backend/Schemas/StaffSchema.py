from pydantic import BaseModel

def getIndividualStaff(staff: dict) -> dict:
    return {
        "id": str(staff["_id"]),
        "user_id": str(staff.get("user_id")),
        "first_name": staff.get("first_name"),
        "last_name": staff.get("last_name"),
        "username": staff.get("username"),
        "role": staff.get("role"),
        "email": staff.get("email"),
        # Staff-specific fields
        "assigned_projects": [str(p) for p in staff.get("assigned_projects", [])]
        
    }


async def getAllStaff(staff_cursor)->list:
    staff_list = await staff_cursor.to_list(length=None)
    return [getIndividualStaff(staff) for staff in staff_list]