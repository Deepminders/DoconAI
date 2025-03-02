from pydantic import BaseModel

def getIndividualUser(user)->dict:
    return {
        "id":str(user["_id"]),
        "firstname":user["firstname"],
        "lastname":user["lastname"],
        "age":user["age"],
        "username":user["username"],
        "email":user["email"],
        "phone":user["phone"]
    }

def getAllUsers(users)->list:
    return [getIndividualUser(user) for user in users]