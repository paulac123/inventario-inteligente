from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.expense import ExpenseCreate, ExpenseResponse
from services.expenseService import create_expense

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/", response_model=ExpenseResponse)
def create_expense_route(expense_data: ExpenseCreate, db: Session = Depends(get_db)):
    """Registra un nuevo gasto en la base de datos."""
    return create_expense(db, expense_data)
