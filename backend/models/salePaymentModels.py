from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey
from datetime import datetime, timezone
from config.database import Base


class SalePayment(Base):
    __tablename__ = "sale_payments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=True)
    notes = Column(String(255), nullable=True)
