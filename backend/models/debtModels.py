from sqlalchemy import Column, Integer, Numeric, String, DateTime, Boolean, ForeignKey
from datetime import datetime, timezone
from config.database import Base


class Debt(Base):
    __tablename__ = "debts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    category = Column(String(50), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)


class DebtPayment(Base):
    __tablename__ = "debt_payments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    debt_id = Column(Integer, ForeignKey("debts.id"), nullable=False)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    notes = Column(String(255), nullable=True)
