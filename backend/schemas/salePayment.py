from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SalePaymentCreate(BaseModel):
    """Datos para registrar un abono a una venta a crédito."""
    amount: float
    payment_method_id: Optional[int] = None
    notes: Optional[str] = None


class SalePaymentResponse(BaseModel):
    id: int
    sale_id: int
    amount: float
    date: datetime
    payment_method_id: Optional[int] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True
