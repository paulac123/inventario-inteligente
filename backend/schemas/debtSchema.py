from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class DebtCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    total_amount: float


class DebtPaymentCreate(BaseModel):
    debt_id: Optional[int] = None
    amount: float
    notes: Optional[str] = None


class DebtPaymentResponse(BaseModel):
    id: int
    debt_id: int
    expense_id: Optional[int] = None
    amount: float
    date: datetime
    notes: Optional[str] = None

    model_config = {"from_attributes": True}


class DebtResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    total_amount: float
    created_at: datetime
    is_active: bool
    paid_amount: float
    remaining: float
    payments: List[DebtPaymentResponse]

    model_config = {"from_attributes": True}
