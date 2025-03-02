from pydantic import BaseModel

def getIndividualUser(user)->dict:
    return {
        "id":str(user["_id"]),
        "firstname":user["firstname"],
        "lastname":user["lastname"],
        "age":user["age"]
    }

async def getAllUsers(users_cursor)->list:
    users_list = await users_cursor.to_list(length=None)
    return [getIndividualUser(user) for user in users_list]