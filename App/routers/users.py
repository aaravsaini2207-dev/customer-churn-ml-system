from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from database import get_db
from App.models import User

from App.auth import (verify_password , hash_password , create_access_token)

router = APIRouter(prefix="/users", tags=["Users"])

class UserCreate(BaseModel):
    email: str
    password: str

@router.post("/")
def create_user(user: UserCreate , db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code = 400, detail = "User Already Exists")
    
    new_user = User(email = user.email , password = hash_password(user.password))

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id, "email": new_user.email
    }

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()          #username = user's email

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
