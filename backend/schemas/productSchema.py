from pydantic import BaseModel
from typing import Optional

class ProductUpdate(BaseModel):
    name: str
    reference: str
    supplier_id: int
    sale_price: float
    cost_price: float
    photo: Optional[str] = None
    barcode: Optional[str] = None
    qr_code: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    reference: str
    supplier_id: int
    sale_price: float
    cost_price: float
    photo: Optional[str] = None
    barcode: Optional[str] = None
    qr_code: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    reference: str
    supplier_id: int
    sale_price: float
    cost_price: float
    photo: Optional[str] = None
    barcode: Optional[str] = None
    qr_code: Optional[str] = None
    total_quantity: int = 0
    supplier_name: Optional[str] = None

    class Config:
        from_attributes = True
