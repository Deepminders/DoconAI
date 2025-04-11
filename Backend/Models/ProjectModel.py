from pydantic import BaseModel,Field
from datetime import date
from typing import Optional

class ProjectModel(BaseModel):
    """
    Represents a project model with required fields.
    """
    project_name: str = Field(
        ...,
        min_length=3,
        max_length=20,
        pattern="^[a-zA-Z0-9_ ]+$",
        description="Name of the project (alphanumeric, underscores, and spaces only)"
    )
    started_date: date
    end_date: date
    progress: str = Field(
        ...,
        min_length=1,
        max_length=4,
        pattern="^(100%|[1-9]?[0-9]%)$",
        description="Name of the project (numbers and percentage only)"
    )

    def to_mongo_dict(self):
        """
        Converts the project model to a dictionary suitable for MongoDB storage.
        Converts date fields to ISO format strings.
        """
        return {
            "project_name": self.project_name,
            "started_date": self.started_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "progress": self.progress,
        }


class ProjectUpdateModel(BaseModel):
    """
    Represents a project model with optional fields.
    """
    project_name: Optional[str]= Field(
        None,
        min_length=3,
        max_length=20,
        pattern="^[a-zA-Z0-9_ ]+$",
        description="Name of the project (alphanumeric, underscores, and spaces only)"
    )
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    progress: Optional[str] = Field(
        None,
        min_length=1,
        max_length=4,
        pattern="^(100%|[1-9]?[0-9]%)$",
        description="Name of the project (numbers and percentage only)"
    )

    def to_mongo_dict(self):
        """
        Converts the project model to a dictionary suitable for MongoDB storage.
        Handles optional date fields by converting them to ISO format strings or None.
        """
        return {
            "project_name": self.project_name,
            "started_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "progress": self.progress,
        }