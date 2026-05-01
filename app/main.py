import os
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pymongo import ASCENDING
from pymongo.errors import DuplicateKeyError

from app.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    require_admin,
    verify_password,
)
from app.db import projects_collection, tasks_collection, users_collection
from app.models import (
    LoginRequest,
    ProjectCreate,
    ProjectResponse,
    TaskCreate,
    TaskResponse,
    TaskStatusUpdate,
    TokenResponse,
    UserCreate,
    UserResponse,
)

app = FastAPI(title="Task Management Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        *[
            origin.strip()
            for origin in os.getenv("CORS_ORIGINS", "").split(",")
            if origin.strip()
        ],
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_indexes() -> None:
    users_collection.create_index([("email", ASCENDING)], unique=True)
    projects_collection.create_index([("created_by", ASCENDING)])
    tasks_collection.create_index([("assigned_to", ASCENDING)])
    tasks_collection.create_index([("project_id", ASCENDING)])


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def parse_object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid id format",
        ) from exc


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }


def serialize_project(project: dict) -> dict:
    return {
        "id": str(project["_id"]),
        "name": project["name"],
        "description": project.get("description"),
        "created_by": project["created_by"],
        "created_at": project["created_at"],
    }


def serialize_task(task: dict) -> dict:
    return {
        "id": str(task["_id"]),
        "title": task["title"],
        "description": task.get("description"),
        "project_id": task["project_id"],
        "assigned_to": task["assigned_to"],
        "status": task["status"],
        "deadline": task.get("deadline"),
        "created_by": task["created_by"],
        "created_at": task["created_at"],
        "updated_at": task["updated_at"],
    }


@app.get("/")
def health_check() -> dict:
    return {"message": "Task Management Backend is running"}


@app.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(user: UserCreate) -> dict:
    user_doc = {
        "name": user.name,
        "email": user.email.lower(),
        "password": hash_password(user.password),
        "role": user.role,
        "created_at": now_utc(),
    }

    try:
        result = users_collection.insert_one(user_doc)
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        ) from exc

    created_user = users_collection.find_one({"_id": result.inserted_id})
    return serialize_user(created_user)


@app.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest) -> dict:
    user = users_collection.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        {
            "sub": user["email"],
            "role": user["role"],
        }
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@app.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)) -> dict:
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
    }


@app.get("/users", response_model=list[UserResponse])
def get_users(current_user: dict = Depends(require_admin)) -> list[dict]:
    users = users_collection.find({}, {"password": 0}).sort("name", ASCENDING)
    return [serialize_user(user) for user in users]


@app.post(
    "/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    project: ProjectCreate,
    current_user: dict = Depends(require_admin),
) -> dict:
    project_doc = {
        "name": project.name,
        "description": project.description,
        "created_by": current_user["email"],
        "created_at": now_utc(),
    }
    result = projects_collection.insert_one(project_doc)
    created_project = projects_collection.find_one({"_id": result.inserted_id})
    return serialize_project(created_project)


@app.get("/projects", response_model=list[ProjectResponse])
def get_projects(current_user: dict = Depends(get_current_user)) -> list[dict]:
    projects = projects_collection.find({}).sort("created_at", ASCENDING)
    return [serialize_project(project) for project in projects]


@app.post(
    "/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    task: TaskCreate,
    current_user: dict = Depends(require_admin),
) -> dict:
    project_id = parse_object_id(task.project_id)
    if not projects_collection.find_one({"_id": project_id}):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    assignee = users_collection.find_one({"email": task.assigned_to.lower()})
    if not assignee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned user not found",
        )

    task_doc = {
        "title": task.title,
        "description": task.description,
        "project_id": task.project_id,
        "assigned_to": task.assigned_to.lower(),
        "status": task.status,
        "deadline": task.deadline,
        "created_by": current_user["email"],
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    result = tasks_collection.insert_one(task_doc)
    created_task = tasks_collection.find_one({"_id": result.inserted_id})
    return serialize_task(created_task)


@app.get("/tasks", response_model=list[TaskResponse])
def get_tasks(current_user: dict = Depends(get_current_user)) -> list[dict]:
    query = {}
    if current_user["role"] == "member":
        query = {"assigned_to": current_user["email"]}

    tasks = tasks_collection.find(query).sort("created_at", ASCENDING)
    return [serialize_task(task) for task in tasks]


@app.patch("/tasks/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: str,
    update: TaskStatusUpdate,
    current_user: dict = Depends(get_current_user),
) -> dict:
    object_id = parse_object_id(task_id)
    task = tasks_collection.find_one({"_id": object_id})
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    if current_user["role"] == "member" and task["assigned_to"] != current_user["email"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Members can only update tasks assigned to them",
        )

    if current_user["role"] not in {"admin", "member"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed",
        )

    tasks_collection.update_one(
        {"_id": object_id},
        {"$set": {"status": update.status, "updated_at": now_utc()}},
    )
    updated_task = tasks_collection.find_one({"_id": object_id})
    return serialize_task(updated_task)
