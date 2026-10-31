from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ExpenseCreate(BaseModel):
    """Datos requeridos para registrar un gasto."""
    amount: float
    description: Optional[str] = None
    date: Optional[datetime] = None
    category_id: int
    payment_method_id: int


class ExpenseResponse(BaseModel):
    """Datos que devuelve el API al consultar un gasto."""
    id: int
    amount: float
    description: Optional[str] = None
    date: datetime
    category_id: Optional[int] = None
    payment_method_id: Optional[int] = None

    class Config:
        from_attributes = True
