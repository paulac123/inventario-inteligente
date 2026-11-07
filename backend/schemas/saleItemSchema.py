from pydantic import BaseModel
from typing import Optional

class SaleItemCreate(BaseModel):
    product_variant_id: Optional[int] = None
    quantity: int
    unit_price: float

class SaleItemResponse(BaseModel):
    id: int
    sale_id: int
    product_variant_id: int
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True
