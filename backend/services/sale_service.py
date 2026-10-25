from sqlalchemy.orm import Session
from models.sale import Sale
from schemas.sale import SaleCreate
from datetime import datetime, timezone


def create_sale(db: Session, sale_data: SaleCreate):
    new_sale = Sale(
        amount=sale_data.amount,
        description=sale_data.description,
        date=sale_data.date or datetime.now(timezone.utc)
    )
    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)
    return new_sale
