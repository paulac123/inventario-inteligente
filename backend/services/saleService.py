from sqlalchemy.orm import Session
from models.sale import Sale
from schemas.sale import SaleCreate
from datetime import datetime, timezone


def create_sale(db: Session, sale_data: SaleCreate):
    """Crea el objeto Sale, lo guarda en BD y retorna el registro creado."""
    new_sale = Sale(
        amount=sale_data.amount,
        description=sale_data.description,
        date=sale_data.date or datetime.now(timezone.utc),
        category_id=sale_data.category_id,
        payment_method_id=sale_data.payment_method_id
    )
    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)
    return new_sale
