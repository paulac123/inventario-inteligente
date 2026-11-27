from sqlalchemy import Column, Integer, String
from config.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=True)
