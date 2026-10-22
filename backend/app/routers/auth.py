from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from ..db import get_db, hash_password
from ..config import settings
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class SignUpRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "Disaster Officer"
    department: str = "TNDMA Emergency Cell"

class AuthResponse(BaseModel):
    token: str
    user: dict

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, password_hash, full_name, role, department FROM users WHERE email = ?", (req.email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or user["password_hash"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    token = f"fic-jwt-{uuid.uuid4().hex}"
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "department": user["department"]
        }
    }

@router.post("/signup", response_model=AuthResponse)
def signup(req: SignUpRequest):
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email is already registered")
        
    cursor.execute("""
    INSERT INTO users (email, password_hash, full_name, role, department)
    VALUES (?, ?, ?, ?, ?)
    """, (req.email, hash_password(req.password), req.full_name, req.role, req.department))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    
    token = f"fic-jwt-{uuid.uuid4().hex}"
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": req.email,
            "full_name": req.full_name,
            "role": req.role,
            "department": req.department
        }
    }

@router.get("/me")
def get_current_user():
    return {
        "id": 1,
        "email": "demo@hydron.app",
        "full_name": "Dr. M. Krishnan",
        "role": "Chief Hydrology Officer",
        "department": "State Disaster Management Authority"
    }
