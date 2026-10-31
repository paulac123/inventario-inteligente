from sqlalchemy import Column, Integer, String
from config.database import Base


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)  # efectivo, nequi, addi, tarjeta, separado
