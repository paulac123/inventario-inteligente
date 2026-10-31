from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.category import CategoryResponse
from services.categoryService import get_categories

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=list[CategoryResponse])
def get_categories_route(type: str, db: Session = Depends(get_db)):
    """Retorna todas las categorías filtradas por tipo: 'sale' o 'expense'."""
    return get_categories(db, type)
