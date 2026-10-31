from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SaleCreate(BaseModel):
    """Datos requeridos para registrar una venta."""
    amount: float
    description: Optional[str] = None
    date: Optional[datetime] = None
    category_id: int
    payment_method_id: int


class SaleResponse(BaseModel):
    """Datos que devuelve el API al consultar una venta."""
    id: int
    amount: float
    description: Optional[str] = None
    date: datetime
    category_id: Optional[int] = None
    payment_method_id: Optional[int] = None

    class Config:
        from_attributes = True
