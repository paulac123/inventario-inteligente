from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey, Boolean
from datetime import datetime, timezone
from config.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, autoincrement=True)
    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(String(255), nullable=True)
    date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=True)
    discount = Column(Numeric(5, 2), nullable=False, default=0)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    is_credit = Column(Boolean, default=False, nullable=False)
