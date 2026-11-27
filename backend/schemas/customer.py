from pydantic import BaseModel
from typing import Optional


class CustomerCreate(BaseModel):
    """Datos para crear o buscar un cliente."""
    name: str
    phone: Optional[str] = None


class CustomerResponse(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True
