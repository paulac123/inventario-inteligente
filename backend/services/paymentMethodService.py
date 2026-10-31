from sqlalchemy.orm import Session
from models.payment_method import PaymentMethod
from fastapi import HTTPException

def get_payment_methods(db: Session):
    """Retorna todas las formas de pago disponibles."""
    result = db.query(PaymentMethod).all()
    if not result:
        raise HTTPException(status_code=404, detail="No se encontraron formas de pago")
    return result
