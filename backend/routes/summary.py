from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from services.summary_service import get_daily_summary
from datetime import date

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("/")
def get_summary(date: date, db: Session = Depends(get_db)):
    return get_daily_summary(db, date)
