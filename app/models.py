from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


Role = Literal["admin", "member"]
TaskStatus = Literal["todo", "in_progress", "done"]


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)
    role: Role


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Role


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, max_length=1000)


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_by: str
    created_at: datetime


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=160)
    description: Optional[str] = Field(default=None, max_length=2000)
    project_id: str
    assigned_to: EmailStr
    status: TaskStatus = "todo"
    deadline: Optional[datetime] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: Optional[str] = None
    project_id: str
    assigned_to: EmailStr
    status: TaskStatus
    deadline: Optional[datetime] = None
    created_by: str
    created_at: datetime
    updated_at: datetime
