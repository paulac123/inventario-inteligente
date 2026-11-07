from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from schemas.saleItemSchema import SaleItemCreate, SaleItemResponse


class SaleCreate(BaseModel):
    """Datos requeridos para registrar una venta."""
    items: list[SaleItemCreate]
    description: Optional[str] = None
    date: Optional[datetime] = None
    category_id: Optional[int] = None
    payment_method_id: int


class SaleResponse(BaseModel):
    """Datos que devuelve el API al consultar una venta."""
    id: int
    amount: float
    description: Optional[str] = None
    date: datetime
    category_id: Optional[int] = None
    payment_method_id: Optional[int] = None
    items: list[SaleItemResponse] = []

    class Config:
        from_attributes = True
