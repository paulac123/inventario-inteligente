from pydantic import BaseModel
from typing import Optional

class ProductVariantCreate(BaseModel):
    product_id: int
    size: str
    color: str
    quantity: int = 0
    min_stock: Optional[int] = None
    max_stock: Optional[int] = None

class ProductVariantResponse(BaseModel):
    id: int
    product_id: int
    size: str
    color: str
    quantity: int
    min_stock: Optional[int] = None
    max_stock: Optional[int] = None

    class Config:
        from_attributes = True
