from pydantic import BaseModel

def getIndividualUser(user)->dict:
    return {
        "id": str(user["_id"]),
        "company_name": user["company_name"],
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "username": user["username"],
        "user_role": user["user_role"],
        "gender": user["gender"],
        "email": user["email"],
        "phone_number": user["phone_number"]
    }

async def getAllUsers(users_cursor)->list:
    users_list = await users_cursor.to_list(length=None)
    return [getIndividualUser(user) for user in users_list]