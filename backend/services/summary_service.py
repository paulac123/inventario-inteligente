from sqlalchemy.orm import Session
from sqlalchemy import func
from models.sale import Sale
from models.expense import Expense
from datetime import datetime


def get_summary(db: Session, date_from: datetime, date_to: datetime):
    total_sales = db.query(func.sum(Sale.amount))\
        .filter(Sale.date >= date_from)\
        .filter(Sale.date <= date_to)\
        .scalar() or 0

    total_expenses = db.query(func.sum(Expense.amount))\
        .filter(Expense.date >= date_from)\
        .filter(Expense.date <= date_to)\
        .scalar() or 0

    return {
        "total_sales": total_sales,
        "total_expenses": total_expenses,
        "balance": total_sales - total_expenses
    }
