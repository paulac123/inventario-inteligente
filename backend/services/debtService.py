from sqlalchemy.orm import Session
from sqlalchemy import func
from models.debtModels import Debt, DebtPayment
from schemas.debtSchema import DebtCreate, DebtPaymentCreate
from datetime import datetime, timezone


def _build_response(db: Session, debt: Debt) -> dict:
    payments = db.query(DebtPayment).filter(DebtPayment.debt_id == debt.id).order_by(DebtPayment.date.desc()).all()
    paid = float(db.query(func.sum(DebtPayment.amount)).filter(DebtPayment.debt_id == debt.id).scalar() or 0)
    return {
        "id": debt.id,
        "name": debt.name,
        "description": debt.description,
        "category": debt.category,
        "total_amount": float(debt.total_amount),
        "created_at": debt.created_at,
        "is_active": debt.is_active,
        "paid_amount": paid,
        "remaining": max(0.0, float(debt.total_amount) - paid),
        "payments": [
            {"id": p.id, "debt_id": p.debt_id, "expense_id": p.expense_id,
             "amount": float(p.amount), "date": p.date, "notes": p.notes}
            for p in payments
        ]
    }


def get_all_debts(db: Session):
    debts = db.query(Debt).order_by(Debt.created_at.desc()).all()
    return [_build_response(db, d) for d in debts]


def create_debt(db: Session, data: DebtCreate):
    debt = Debt(name=data.name, description=data.description, category=data.category, total_amount=data.total_amount)
    db.add(debt)
    db.commit()
    db.refresh(debt)
    return _build_response(db, debt)


def add_payment(db: Session, debt_id: int, data: DebtPaymentCreate, expense_id: int = None):
    debt = db.query(Debt).filter(Debt.id == debt_id).first()
    if not debt:
        return None
    payment = DebtPayment(
        debt_id=debt_id,
        amount=data.amount,
        notes=data.notes,
        expense_id=expense_id,
        date=datetime.now(timezone.utc)
    )
    db.add(payment)
    db.flush()
    paid = float(db.query(func.sum(DebtPayment.amount)).filter(DebtPayment.debt_id == debt_id).scalar() or 0)
    if paid >= float(debt.total_amount):
        debt.is_active = False
    db.commit()
    return _build_response(db, debt)


def delete_debt(db: Session, debt_id: int) -> bool:
    db.query(DebtPayment).filter(DebtPayment.debt_id == debt_id).delete()
    debt = db.query(Debt).filter(Debt.id == debt_id).first()
    if not debt:
        return False
    db.delete(debt)
    db.commit()
    return True
