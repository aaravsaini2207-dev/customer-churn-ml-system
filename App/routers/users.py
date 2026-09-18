from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
def get_me(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    firebase_uid = current_user["uid"]
    email = current_user.get("email")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()

    if not user:
        user = User(firebase_uid = firebase_uid, email = email)

        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "id": firebase_uid,
        "firebase_uid": user.firebase_uid,
        "email": user.email
    }