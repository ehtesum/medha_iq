from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/users")
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/results")
def get_all_results(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    results = db.query(models.Result).offset(skip).limit(limit).all()
    return results

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_completed = db.query(models.Result).count()
    return {
        "total_users": total_users,
        "total_completed": total_completed
    }
