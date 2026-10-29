from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from services.summary_service import get_summary
from datetime import datetime

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("/")
def get_summary_route(date_from: datetime, date_to: datetime, db: Session = Depends(get_db)):
    return get_summary(db, date_from, date_to)
