from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from services.summaryService import get_summary
from datetime import datetime

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("/")
def get_summary_route(date_from: datetime, date_to: datetime, db: Session = Depends(get_db)):
    """Retorna el total de ventas, gastos y balance en un rango de fechas."""
    return get_summary(db, date_from, date_to)
