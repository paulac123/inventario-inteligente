from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from config.database import get_db
from schemas.sale import SaleCreate, SaleResponse
from services.saleService import create_sale, get_sales_by_date, delete_sale

router = APIRouter(prefix="/sales", tags=["sales"])


@router.post("/", response_model=SaleResponse)
def create_sale_route(sale_data: SaleCreate, db: Session = Depends(get_db)):
    """Registra una nueva venta en la base de datos."""
    return create_sale(db, sale_data)


@router.get("/")
def get_sales_route(date_from: datetime, date_to: datetime, db: Session = Depends(get_db)):
    """Retorna ventas en un rango de fechas."""
    return get_sales_by_date(db, date_from, date_to)


@router.delete("/{sale_id}")
def delete_sale_route(sale_id: int, db: Session = Depends(get_db)):
    """Elimina una venta y devuelve las unidades al inventario."""
    result = delete_sale(db, sale_id)
    if not result:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return {"message": "Venta eliminada"}
