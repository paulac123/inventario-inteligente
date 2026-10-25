import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")

engine = create_engine(DATABASE_URL)


class Base(DeclarativeBase):
    pass


def create_tables():
    from models.sale import Sale
    from models.expense import Expense
    Base.metadata.create_all(engine)
