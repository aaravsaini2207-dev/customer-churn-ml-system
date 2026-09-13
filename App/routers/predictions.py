from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Prediction
from ..auth import get_current_user


router = APIRouter(prefix="/api/v1", tags=["ML Predictions"])

@router.get("/router-test")
def router_test():
    return {"message": "Prediction router is working!"}

@router.get("/predictions", summary="Get Saved Predictions", tags=["Predictions"])
def get_predictions(db: Session = Depends(get_db) , 
                    current_user = Depends(get_current_user)):
    return current_user.predictions
