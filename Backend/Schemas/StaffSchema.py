from pydantic import BaseModel

def getIndividualStaff(staff)->dict:
    return {
        "staff_id":str(staff["_id"]),
        "staff_fname":staff["staff_fname"],
        "staff_lname":staff["staff_lname"],
        "staff_email":staff["staff_email"],
        "staff_age":staff["staff_age"],
        "staff_gender":staff["staff_gender"],
        "staff_role":staff["staff_role"],
    }

async def getAllStaff(staff_cursor)->list:
    staff_list = await staff_cursor.to_list(length=None)
    return [getIndividualStaff(staff) for staff in staff_list]