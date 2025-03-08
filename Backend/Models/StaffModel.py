from pydantic import BaseModel

class StaffModel(BaseModel):
    staff_fname:str
    staff_lname:str
    staff_email:str
    staff_age:int
    staff_gender:str
    staff_role:str