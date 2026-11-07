from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from config.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    reference = Column(String(50), nullable=False)
    supplier_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    sale_price = Column(Numeric(10, 2), nullable=False)
    cost_price = Column(Numeric(10, 2), nullable=False)
    photo = Column(String(255), nullable=True)
    barcode = Column(String(100), nullable=True)
    qr_code = Column(String(100), nullable=True)
