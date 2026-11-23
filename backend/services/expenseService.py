from sqlalchemy.orm import Session
from models.expenseModels import Expense
from schemas.expense import ExpenseCreate
from datetime import datetime, timezone


def get_expenses_by_date(db: Session, date_from: datetime, date_to: datetime):
    return db.query(Expense).filter(
        Expense.date >= date_from,
        Expense.date <= date_to
    ).order_by(Expense.date.desc()).all()


def create_expense(db: Session, expense_data: ExpenseCreate):
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


def delete_expense(db: Session, expense_id: int):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        return None
    db.delete(expense)
    db.commit()
    return True
