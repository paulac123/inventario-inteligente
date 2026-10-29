from sqlalchemy.orm import Session
from models.expense import Expense
from schemas.expense import ExpenseCreate
from datetime import datetime, timezone


def create_expense(db: Session, expense_data: ExpenseCreate):
    new_expense = Expense(
        amount=expense_data.amount,
        description=expense_data.description,
        date=expense_data.date or datetime.now(timezone.utc)
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense
