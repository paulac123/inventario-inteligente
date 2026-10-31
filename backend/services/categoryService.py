from sqlalchemy.orm import Session
from models.category import Category
from fastapi import HTTPException


def get_categories(db: Session, type: str):
    """Retorna todas las categorías filtradas por tipo (sale o expense)."""
    result = db.query(Category).filter(Category.type == type).all()
    if not result:
        raise HTTPException(status_code=404, detail="No se encontraron categorías")
    return result
