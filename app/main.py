from fastapi import FastAPI
from app.db import db

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}