from sqlalchemy.orm import Session
from sqlalchemy import func
from models.alertModels import StockAlertConfig
from models.productVariantsModels import ProductVariant
from models.productModels import Product
from schemas.alertSchema import AlertConfigCreate


def get_configs(db: Session):
    return db.query(StockAlertConfig).order_by(StockAlertConfig.id).all()


def create_config(db: Session, data: AlertConfigCreate):
    config = StockAlertConfig(**data.model_dump())
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


def delete_config(db: Session, config_id: int):
    config = db.query(StockAlertConfig).filter(StockAlertConfig.id == config_id).first()
    if not config:
        return False
    db.delete(config)
    db.commit()
    return True


def _eval_config(db: Session, config):
    current_models = int(
        db.query(func.count(func.distinct(ProductVariant.product_id)))
        .join(Product, Product.id == ProductVariant.product_id)
        .filter(
            Product.clothing_type == config.clothing_type,
            ProductVariant.size == config.size,
            ProductVariant.quantity > 0,
        ).scalar() or 0
    )
    current_units = int(
        db.query(func.sum(ProductVariant.quantity))
        .join(Product, Product.id == ProductVariant.product_id)
        .filter(
            Product.clothing_type == config.clothing_type,
            ProductVariant.size == config.size,
            ProductVariant.quantity > 0,
        ).scalar() or 0
    )
    models_ok = config.min_models is None or current_models >= config.min_models
    units_ok = config.min_units is None or current_units >= config.min_units
    return {
        "id": config.id,
        "clothing_type": config.clothing_type,
        "size": config.size,
        "min_models": config.min_models,
        "min_units": config.min_units,
        "current_models": current_models,
        "current_units": current_units,
        "models_ok": models_ok,
        "units_ok": units_ok,
        "is_alert": not models_ok or not units_ok,
        "is_critical": current_models == 0 or current_units == 0,
    }


def get_all_status(db: Session):
    """Devuelve todas las reglas con su estado actual."""
    return [_eval_config(db, cfg) for cfg in db.query(StockAlertConfig).order_by(StockAlertConfig.id).all()]


def get_active_alerts(db: Session):
    """Devuelve solo las reglas que están por debajo del umbral."""
    return [r for r in get_all_status(db) if r["is_alert"]]
