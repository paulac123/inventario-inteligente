from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ExpenseCreate(BaseModel):
    amount: float
    description: Optional[str] = None
    date: Optional[datetime] = None


class ExpenseResponse(BaseModel):
    id: int
    amount: float
    description: Optional[str] = None
    date: datetime

    class Config:
        from_attributes = True
