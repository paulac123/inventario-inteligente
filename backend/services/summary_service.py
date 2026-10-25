from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from models.sale import Sale
from models.expense import Expense
from datetime import date


def get_daily_summary(db: Session, target_date: date):
    total_sales = db.query(func.sum(Sale.amount))\
        .filter(cast(Sale.date, Date) == target_date)\
        .scalar() or 0

    total_expenses = db.query(func.sum(Expense.amount))\
        .filter(cast(Expense.date, Date) == target_date)\
        .scalar() or 0

    return {
        "date": target_date,
        "total_sales": total_sales,
        "total_expenses": total_expenses,
        "balance": total_sales - total_expenses
    }
