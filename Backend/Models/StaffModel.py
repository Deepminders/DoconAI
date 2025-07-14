from typing import Optional
from pydantic import BaseModel

class StaffModel(BaseModel):
    company_name: str
    first_name: str
    last_name: str
    username: str
    user_role: str
    gender: str
    email: str
    phone_number: str
    password: str
    staff_image_url: Optional[str] = None
    assigned_projects: Optional[list] = None