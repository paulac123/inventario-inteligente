from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from config.database import get_db
from services.metricsService import (
    get_sales_by_type_and_size,
    get_manual_sales_by_type,
    get_sales_by_type_combined,
    get_sales_by_supplier,
    get_sales_over_time
)
from services.authService import require_roles

router = APIRouter(
    prefix="/metrics",
    tags=["metrics"],
    dependencies=[Depends(require_roles("admin"))],
)


@router.get("/sales-by-type-size")
def get_sales_by_type_size_route(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    """Retorna unidades vendidas por tipo de prenda y talla (solo inventario)."""
    return get_sales_by_type_and_size(db, date_from, date_to)


@router.get("/manual-sales-by-type")
def get_manual_sales_by_type_route(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    """Retorna ventas manuales (sin variante) clasificadas por tipo usando la descripción."""
    return get_manual_sales_by_type(db, date_from, date_to)


@router.get("/sales-by-type")
def get_sales_by_type_route(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    """Retorna ventas totales por tipo de prenda sumando inventario y ventas manuales."""
    return get_sales_by_type_combined(db, date_from, date_to)


@router.get("/sales-by-supplier")
def get_sales_by_supplier_route(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    clothing_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Retorna ventas agrupadas por marca combinando inventario y ventas manuales."""
    return get_sales_by_supplier(db, date_from, date_to, clothing_type)


@router.get("/sales-over-time")
def get_sales_over_time_route(
    group_by: str = "day",
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    clothing_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Retorna monto total de ventas agrupado por día o mes."""
    return get_sales_over_time(db, group_by, date_from, date_to, clothing_type)
