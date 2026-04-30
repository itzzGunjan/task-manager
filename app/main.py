from bson import ObjectId
from fastapi import Body
from fastapi import FastAPI, HTTPException, Depends, Header
from app.db import db
from app.models import UserCreate, ProjectCreate, TaskCreate
from app.auth import hash_password, verify_password, create_token
from jose import jwt
import os

app = FastAPI()

SECRET_KEY = os.getenv("JWT_SECRET", "secret123")
ALGORITHM = "HS256"

# =======================
# 🔐 AUTH HELPERS
# =======================

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.split(" ")[1]
        payload = decode_token(token)
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# =======================
# 🏠 HOME
# =======================

@app.get("/")
def home():
    return {"message": "Backend running 🚀"}

# =======================
# 🔐 AUTH APIs
# =======================

@app.post("/signup")
def signup(user: UserCreate):
    existing = db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user_data = user.dict()
    user_data["password"] = hash_password(user.password)

    db.users.insert_one(user_data)

    return {"message": "User created successfully"}

@app.post("/login")
def login(email: str = Body(...), password: str = Body(...)):
    user = db.users.find_one({"email": email})

    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({
        "email": user["email"],
        "role": user["role"]
    })

    return {"access_token": token}

# =======================
# 📁 PROJECT APIs
# =======================

@app.post("/projects")
def create_project(project: ProjectCreate, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")

    project_data = project.dict()
    project_data["created_by"] = user["email"]

    db.projects.insert_one(project_data)

    return {"message": "Project created"}

# =======================
# ✅ TASK APIs
# =======================

@app.post("/tasks")
def create_task(task: TaskCreate, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")

    task_data = task.dict()
    db.tasks.insert_one(task_data)

    return {"message": "Task created"}

@app.get("/tasks")
def get_tasks(user=Depends(get_current_user)):
    if user["role"] == "admin":
        return list(db.tasks.find({}, {"_id": 0}))
    
    return list(db.tasks.find(
        {"assigned_to": user["email"]},
        {"_id": 0}
    ))

# =======================
# 🔄 UPDATE TASK STATUS
# =======================

@app.put("/tasks/{task_id}")
def update_task_status(task_id: str, status: str, user=Depends(get_current_user)):
    task = db.tasks.find_one({"_id": ObjectId(task_id)})

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Member can only update their own tasks
    if user["role"] == "member" and task["assigned_to"] != user["email"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    db.tasks.update_one(
        {"_id": task_id},
        {"$set": {"status": status}}
    )

    return {"message": "Task updated"}