from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.salePayment import SalePaymentCreate, SalePaymentResponse
from services.salePaymentService import add_payment, get_payments_by_sale, get_credit_sales
from services.authService import get_current_user

router = APIRouter(
    prefix="/sales",
    tags=["credits"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/credit")
def get_credit_sales_route(db: Session = Depends(get_db)):
    """Lista todas las ventas a crédito con saldo pendiente."""
    return get_credit_sales(db)


@router.get("/{sale_id}/payments", response_model=list[SalePaymentResponse])
def get_payments_route(sale_id: int, db: Session = Depends(get_db)):
    """Lista los abonos registrados para una venta."""
    return get_payments_by_sale(db, sale_id)


@router.post("/{sale_id}/payments", response_model=SalePaymentResponse)
def add_payment_route(sale_id: int, data: SalePaymentCreate, db: Session = Depends(get_db)):
    """Registra un abono a una venta a crédito."""
    result = add_payment(db, sale_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Venta no encontrada o no es a crédito")
    return result
