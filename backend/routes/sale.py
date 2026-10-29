from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schemas.sale import SaleCreate, SaleResponse
from services.sale_service import create_sale

router = APIRouter(prefix="/sales", tags=["sales"])


@router.post("/", response_model=SaleResponse)
def create_sale_route(sale_data: SaleCreate, db: Session = Depends(get_db)):
    return create_sale(db, sale_data)
