from sqlalchemy.orm import Session
from models.expense import Expense
from schemas.expense import ExpenseCreate
from datetime import datetime, timezone


def create_expense(db: Session, expense_data: ExpenseCreate):
    """Crea el objeto Expense, lo guarda en BD y retorna el registro creado."""
    new_expense = Expense(
        amount=expense_data.amount,
        description=expense_data.description,
        date=expense_data.date or datetime.now(timezone.utc),
        category_id=expense_data.category_id,
        payment_method_id=expense_data.payment_method_id
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense
