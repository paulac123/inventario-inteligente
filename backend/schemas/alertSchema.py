from pydantic import BaseModel
from typing import Optional


class AlertConfigCreate(BaseModel):
    clothing_type: str
    size: str
    min_models: Optional[int] = None
    min_units: Optional[int] = None


class AlertConfigResponse(BaseModel):
    id: int
    clothing_type: str
    size: str
    min_models: Optional[int] = None
    min_units: Optional[int] = None

    model_config = {"from_attributes": True}


class AlertStatus(BaseModel):
    id: int
    clothing_type: str
    size: str
    min_models: Optional[int] = None
    min_units: Optional[int] = None
    current_models: int
    current_units: int
    models_ok: bool
    units_ok: bool
    is_alert: bool
    is_critical: bool
