from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from services.alertService import get_configs, create_config, delete_config, get_active_alerts, get_all_status
from schemas.alertSchema import AlertConfigCreate, AlertConfigResponse, AlertStatus
from services.authService import get_current_user
from typing import List

router = APIRouter(
    prefix="/alerts",
    tags=["alerts"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/configs", response_model=List[AlertConfigResponse])
def list_configs(db: Session = Depends(get_db)):
    return get_configs(db)


@router.post("/configs", response_model=AlertConfigResponse)
def add_config(data: AlertConfigCreate, db: Session = Depends(get_db)):
    if not data.clothing_type or not data.size:
        raise HTTPException(status_code=400, detail="clothing_type y size son requeridos")
    if data.min_models is None and data.min_units is None:
        raise HTTPException(status_code=400, detail="Debes definir al menos un umbral (modelos o unidades)")
    return create_config(db, data)


@router.delete("/configs/{config_id}")
def remove_config(config_id: int, db: Session = Depends(get_db)):
    if not delete_config(db, config_id):
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    return {"ok": True}


@router.get("/status", response_model=List[AlertStatus])
def all_status(db: Session = Depends(get_db)):
    """Todas las reglas con su estado actual (para mostrar en la lista)."""
    return get_all_status(db)


@router.get("/active", response_model=List[AlertStatus])
def active_alerts(db: Session = Depends(get_db)):
    """Solo las reglas que están por debajo del umbral (para el panel de alertas)."""
    return get_active_alerts(db)
