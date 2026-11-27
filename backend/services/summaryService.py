from sqlalchemy.orm import Session
from sqlalchemy import func
from models.saleModels import Sale
from models.salePaymentModels import SalePayment
from models.expenseModels import Expense
from models.paymentMethodModels import PaymentMethod
from datetime import datetime


def get_summary(db: Session, date_from: datetime, date_to: datetime):
    # Ventas regulares: suma Sale.amount donde is_credit = False
    regular_sales = db.query(func.sum(Sale.amount))\
        .filter(Sale.date >= date_from, Sale.date <= date_to, Sale.is_credit == False)\
        .scalar() or 0

    # Separados: suma solo los abonos (SalePayment) recibidos en el rango
    credit_payments = db.query(func.sum(SalePayment.amount))\
        .filter(SalePayment.date >= date_from, SalePayment.date <= date_to)\
        .scalar() or 0

    total_sales = float(regular_sales) + float(credit_payments)

    total_expenses = db.query(func.sum(Expense.amount))\
        .filter(Expense.date >= date_from, Expense.date <= date_to)\
        .scalar() or 0
    total_expenses = float(total_expenses)

    # Desglose por forma de pago
    regular_by_pm = db.query(
        Sale.payment_method_id,
        func.sum(Sale.amount).label("total")
    ).filter(
        Sale.date >= date_from, Sale.date <= date_to, Sale.is_credit == False
    ).group_by(Sale.payment_method_id).all()

    credit_by_pm = db.query(
        SalePayment.payment_method_id,
        func.sum(SalePayment.amount).label("total")
    ).filter(
        SalePayment.date >= date_from, SalePayment.date <= date_to
    ).group_by(SalePayment.payment_method_id).all()

    pm_totals = {}
    for row in regular_by_pm:
        pm_totals[row.payment_method_id] = pm_totals.get(row.payment_method_id, 0) + float(row.total)
    for row in credit_by_pm:
        pm_totals[row.payment_method_id] = pm_totals.get(row.payment_method_id, 0) + float(row.total)

    by_payment_method = []
    for pm_id, amount in pm_totals.items():
        if pm_id is None:
            name = "Sin especificar"
        else:
            pm = db.query(PaymentMethod).filter(PaymentMethod.id == pm_id).first()
            name = pm.name if pm else "Desconocido"
        by_payment_method.append({"name": name, "amount": amount})

    by_payment_method.sort(key=lambda x: x["amount"], reverse=True)

    return {
        "total_sales": total_sales,
        "total_expenses": total_expenses,
        "balance": total_sales - total_expenses,
        "by_payment_method": by_payment_method
    }
