from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.payment_method import PaymentMethodResponse
from services.paymentMethodService import get_payment_methods
from services.authService import get_current_user

router = APIRouter(
    prefix="/payment-methods",
    tags=["payment-methods"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=list[PaymentMethodResponse])
def get_payment_methods_route(db: Session = Depends(get_db)):
    """Retorna todas las formas de pago disponibles."""
    return get_payment_methods(db)
