from sqlalchemy import Column, Integer, String
from config.database import Base


class StockAlertConfig(Base):
    __tablename__ = "stock_alert_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clothing_type = Column(String(50), nullable=False)
    size = Column(String(20), nullable=False)
    min_models = Column(Integer, nullable=True)   # mínimo de referencias distintas
    min_units = Column(Integer, nullable=True)    # mínimo de unidades totales
