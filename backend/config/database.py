# Configuración de la conexión a PostgreSQL y base de la ORM
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Genera una sesión de BD por request y la cierra al terminar."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Crea todas las tablas definidas en los modelos si no existen."""
    from models.saleModels import Sale
    from models.expenseModels import Expense
    from models.categoryModels import Category
    from models.paymentMethodModels import PaymentMethod
    from models.productModels import Product
    from models.productVariantsModels import ProductVariant
    from models.saleItemModels import SaleItem
    Base.metadata.create_all(engine)
