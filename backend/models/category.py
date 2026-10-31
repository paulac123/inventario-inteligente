from sqlalchemy import Column, Integer, String
from config.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    type = Column(String(10), nullable=False)  # define si es "sale" o "expense"
