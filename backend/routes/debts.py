from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from services.debtService import get_all_debts, create_debt, add_payment, delete_debt
from schemas.debtSchema import DebtCreate, DebtPaymentCreate
from services.authService import require_roles

router = APIRouter(
    prefix="/debts",
    tags=["debts"],
    dependencies=[Depends(require_roles("admin"))],
)


@router.get("/")
def list_debts(db: Session = Depends(get_db)):
    return get_all_debts(db)


@router.post("/")
def create(data: DebtCreate, db: Session = Depends(get_db)):
    return create_debt(db, data)


@router.post("/{debt_id}/payments")
def pay(debt_id: int, data: DebtPaymentCreate, db: Session = Depends(get_db)):
    result = add_payment(db, debt_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    return result


@router.delete("/{debt_id}")
def remove(debt_id: int, db: Session = Depends(get_db)):
    if not delete_debt(db, debt_id):
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    return {"ok": True}
