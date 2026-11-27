from sqlalchemy.orm import Session
from sqlalchemy import func
from models.saleModels import Sale
from models.saleItemModels import SaleItem
from models.salePaymentModels import SalePayment
from models.productVariantsModels import ProductVariant
from schemas.sale import SaleCreate
from datetime import datetime, timezone


def create_sale(db: Session, sale_data: SaleCreate):
    # 1. Calcular total con descuento
    subtotal = sum(item.quantity * item.unit_price for item in sale_data.items)
    discount = sale_data.discount or 0
    amount = subtotal * (1 - discount / 100)

    # 2. Crear la venta
    new_sale = Sale(
        amount=amount,
        discount=discount,
        description=sale_data.description,
        date=sale_data.date or datetime.now(timezone.utc),
        category_id=sale_data.category_id,
        payment_method_id=sale_data.payment_method_id,
        customer_id=sale_data.customer_id,
        is_credit=sale_data.is_credit or False
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

    # 4. Si es crédito y hay abono inicial, registrarlo
    if sale_data.is_credit and sale_data.initial_payment and sale_data.initial_payment > 0:
        db.add(SalePayment(
            sale_id=new_sale.id,
            amount=sale_data.initial_payment,
            payment_method_id=sale_data.payment_method_id,
            date=datetime.now(timezone.utc)
        ))

    db.commit()
    db.refresh(new_sale)
    return new_sale


def get_sales_by_date(db: Session, date_from: datetime, date_to: datetime):
    sales = db.query(Sale).filter(Sale.date >= date_from, Sale.date <= date_to).order_by(Sale.date.desc()).all()
    result = []
    for sale in sales:
        items = db.query(SaleItem).filter(SaleItem.sale_id == sale.id).all()
        paid_amount = None
        if sale.is_credit:
            paid_amount = float(
                db.query(func.sum(SalePayment.amount)).filter(SalePayment.sale_id == sale.id).scalar() or 0
            )
        result.append({
            "id": sale.id,
            "amount": float(sale.amount),
            "paid_amount": paid_amount,
            "discount": float(sale.discount or 0),
            "description": sale.description,
            "date": sale.date,
            "category_id": sale.category_id,
            "payment_method_id": sale.payment_method_id,
            "is_credit": sale.is_credit,
            "items": [{"id": i.id, "sale_id": i.sale_id, "product_variant_id": i.product_variant_id, "quantity": i.quantity, "unit_price": float(i.unit_price)} for i in items]
        })
    return result


def delete_sale(db: Session, sale_id: int):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        return None
    db.query(SalePayment).filter(SalePayment.sale_id == sale_id).delete()
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
