from sqlalchemy.orm import Session
from models.saleModels import Sale
from models.saleItemModels import SaleItem
from models.productVariantsModels import ProductVariant
from schemas.sale import SaleCreate
from datetime import datetime, timezone


def create_sale(db: Session, sale_data: SaleCreate):
    # 1. Calcular total
    amount = sum(item.quantity * item.unit_price for item in sale_data.items)

    # 2. Crear la venta
    new_sale = Sale(
        amount=amount,
        description=sale_data.description,
        date=sale_data.date or datetime.now(timezone.utc),
        category_id=sale_data.category_id,
        payment_method_id=sale_data.payment_method_id
    )
    db.add(new_sale)
    db.flush()

    # 3. Crear ítems y descontar inventario
    for item in sale_data.items:
        db.add(SaleItem(
            sale_id=new_sale.id,
            product_variant_id=item.product_variant_id,
            quantity=item.quantity,
            unit_price=item.unit_price
        ))
        if item.product_variant_id:
            variant = db.query(ProductVariant).filter(ProductVariant.id == item.product_variant_id).first()
            if variant:
                variant.quantity -= item.quantity

    db.commit()
    db.refresh(new_sale)
    return new_sale


def get_sales_by_date(db: Session, date_from: datetime, date_to: datetime):
    sales = db.query(Sale).filter(Sale.date >= date_from, Sale.date <= date_to).order_by(Sale.date.desc()).all()
    result = []
    for sale in sales:
        items = db.query(SaleItem).filter(SaleItem.sale_id == sale.id).all()
        result.append({
            "id": sale.id,
            "amount": float(sale.amount),
            "description": sale.description,
            "date": sale.date,
            "category_id": sale.category_id,
            "payment_method_id": sale.payment_method_id,
            "items": [{"id": i.id, "sale_id": i.sale_id, "product_variant_id": i.product_variant_id, "quantity": i.quantity, "unit_price": float(i.unit_price)} for i in items]
        })
    return result


def delete_sale(db: Session, sale_id: int):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        return None
    items = db.query(SaleItem).filter(SaleItem.sale_id == sale_id).all()
    for item in items:
        if item.product_variant_id:
            variant = db.query(ProductVariant).filter(ProductVariant.id == item.product_variant_id).first()
            if variant:
                variant.quantity += item.quantity
        db.delete(item)
    db.delete(sale)
    db.commit()
    return True
