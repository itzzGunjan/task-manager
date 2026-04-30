from pydantic import BaseModel, EmailStr
from typing import Literal
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["admin", "member"]

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: str   # user email
    project_id: str
    status: Literal["todo", "in_progress", "done"] = "todo"