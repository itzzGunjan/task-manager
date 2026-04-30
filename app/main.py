from fastapi import FastAPI, HTTPException
from app.db import db
from app.models import UserCreate
from app.auth import hash_password, verify_password, create_token

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend running 🚀"}

# SIGNUP
@app.post("/signup")
def signup(user: UserCreate):
    existing = db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user_data = user.dict()
    user_data["password"] = hash_password(user.password)

    db.users.insert_one(user_data)

    return {"message": "User created successfully"}

# LOGIN
@app.post("/login")
def login(email: str, password: str):
    user = db.users.find_one({"email": email})

    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"email": user["email"], "role": user["role"]})

    return {"access_token": token}