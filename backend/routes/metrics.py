from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from config.database import get_db
from services.metricsService import (
    get_sales_by_type_and_size,
    get_manual_sales_by_type,
    get_sales_by_type_combined,
    get_sales_by_supplier
)

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/sales-by-type-size")
def get_sales_by_type_size_route(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Retorna unidades vendidas por tipo de prenda y talla (solo inventario)."""
    return get_sales_by_type_and_size(db, date_from, date_to)


@router.get("/manual-sales-by-type")
def get_manual_sales_by_type_route(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Retorna ventas manuales (sin variante) clasificadas por tipo usando la descripción."""
    return get_manual_sales_by_type(db, date_from, date_to)


@router.get("/sales-by-type")
def get_sales_by_type_route(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Retorna ventas totales por tipo de prenda sumando inventario y ventas manuales."""
    return get_sales_by_type_combined(db, date_from, date_to)


@router.get("/sales-by-supplier")
def get_sales_by_supplier_route(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Retorna ventas agrupadas por marca combinando inventario y ventas manuales."""
    return get_sales_by_supplier(db, date_from, date_to)
