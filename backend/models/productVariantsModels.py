from sqlalchemy import Column, Integer, String, ForeignKey
from config.database import Base

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    size = Column(String(20), nullable=False)
    color = Column(String(50), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    min_stock = Column(Integer, nullable=True)
    max_stock = Column(Integer, nullable=True)
