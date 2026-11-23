from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from config.database import get_db
from schemas.expense import ExpenseCreate, ExpenseResponse
from services.expenseService import create_expense, get_expenses_by_date, delete_expense

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("/", response_model=list[ExpenseResponse])
def get_expenses_route(date_from: datetime, date_to: datetime, db: Session = Depends(get_db)):
    return get_expenses_by_date(db, date_from, date_to)


@router.post("/", response_model=ExpenseResponse)
def create_expense_route(expense_data: ExpenseCreate, db: Session = Depends(get_db)):
    return create_expense(db, expense_data)


@router.delete("/{expense_id}")
def delete_expense_route(expense_id: int, db: Session = Depends(get_db)):
    result = delete_expense(db, expense_id)
    if not result:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    return {"message": "Gasto eliminado"}
