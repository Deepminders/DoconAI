from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from bson import ObjectId
from typing import Optional,List


class ProjectStatus(str, Enum):
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    DELAYED = "Delayed"

class ProjectModel(BaseModel):
    projectName: str
    projectLead: str
    projectStatus: ProjectStatus
    startDate: datetime
    endDate: datetime
    updatedAt: datetime
    Client: str

    @classmethod
    def from_mongo_dict(cls, data: dict):
        processed = data.copy()
        
        # Handle _id field
        if '_id' in processed:
            processed['id'] = str(processed['_id'])
            del processed['_id']
        
        # Convert MongoDB timestamp format to datetime
        date_fields = ['startDate', 'endDate', 'createdAt']
        for date_field in date_fields:
            if date_field in processed and isinstance(processed[date_field], dict):
                date_obj = processed[date_field].get('$date', {})
                if isinstance(date_obj, dict) and '$numberLong' in date_obj:
                    timestamp = int(date_obj['$numberLong']) / 1000
                    processed[date_field] = datetime.fromtimestamp(timestamp)
        
        return cls(**processed)

    def to_mongo_dict(self):
        mongo_dict = self.dict(exclude_none=True, by_alias=True)
        
        # Convert datetime fields back to MongoDB format
        date_fields = ['startDate', 'endDate', 'createdAt']
        for field in date_fields:
            if field in mongo_dict and isinstance(mongo_dict[field], datetime):
                mongo_dict[field] = {
                    '$date': {
                        '$numberLong': str(int(mongo_dict[field].timestamp() * 1000))
                    }
                }
        
        # Convert id back to _id ObjectId if present
        if 'id' in mongo_dict:
            mongo_dict['_id'] = ObjectId(mongo_dict.pop('id'))
        
        return mongo_dict
    
class ProjectUpdateModel(BaseModel):
    """
    Minimal update model matching our streamlined ProjectModel
    All fields are optional for partial updates
    """
    projectName: Optional[str] = None
    projectLead: Optional[str] = None
    projectStatus: Optional[ProjectStatus] = None
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None
    updatedAt: Optional[datetime]=None
    Client: Optional[str] = None

    def to_mongo_dict(self):
        update_data = self.dict(exclude_none=True)
        
        # Convert datetime fields to MongoDB format
        date_fields = ['startDate', 'endDate']
        for field in date_fields:
            if field in update_data and isinstance(update_data[field], datetime):
                update_data[field] = {
                    '$date': {
                        '$numberLong': str(int(update_data[field].timestamp() * 1000))
                    }
                }
        
        return update_data  

class StaffResponseModel(BaseModel):
    staff_id: str
    staff_fname: str
    staff_lname: str
    staff_email: str
    staff_age: int
    staff_gender: str
    staff_role: str
    assigned_projects: List[str]
    staff_image_url: str

class RemoveProjectRequest(BaseModel):
    project_id: str  