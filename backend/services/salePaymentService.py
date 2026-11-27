from sqlalchemy.orm import Session
from sqlalchemy import func
from models.salePaymentModels import SalePayment
from models.saleModels import Sale
from models.saleItemModels import SaleItem
from models.customerModels import Customer
from models.categoryModels import Category
from schemas.salePayment import SalePaymentCreate
from datetime import datetime, timezone


def add_payment(db: Session, sale_id: int, data: SalePaymentCreate):
    """Registra un abono a una venta a crédito."""
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale or not sale.is_credit:
        return None
    payment = SalePayment(
        sale_id=sale_id,
        amount=data.amount,
        payment_method_id=data.payment_method_id,
        notes=data.notes,
        date=datetime.now(timezone.utc)
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def get_payments_by_sale(db: Session, sale_id: int):
    """Lista los abonos de una venta."""
    return db.query(SalePayment).filter(SalePayment.sale_id == sale_id).order_by(SalePayment.date).all()


def get_credit_sales(db: Session):
    """Lista todas las ventas a crédito con saldo pendiente calculado."""
    sales = db.query(Sale).filter(Sale.is_credit == True).order_by(Sale.date.desc()).all()
    result = []
    for sale in sales:
        paid = db.query(func.sum(SalePayment.amount)).filter(SalePayment.sale_id == sale.id).scalar() or 0
        balance = float(sale.amount) - float(paid)

        customer = db.query(Customer).filter(Customer.id == sale.customer_id).first() if sale.customer_id else None

        items = db.query(SaleItem).filter(SaleItem.sale_id == sale.id).all()
        item_descriptions = []
        for item in items:
            if item.product_variant_id:
                item_descriptions.append(f"{item.quantity} uds (inventario)")
            else:
                item_descriptions.append(f"{item.quantity} uds (manual)")

        category = db.query(Category).filter(Category.id == sale.category_id).first() if sale.category_id else None

        result.append({
            "id": sale.id,
            "date": sale.date,
            "amount": float(sale.amount),
            "paid": float(paid),
            "balance": balance,
            "is_paid": balance <= 0,
            "description": sale.description,
            "customer_id": sale.customer_id,
            "customer_name": customer.name if customer else None,
            "customer_phone": customer.phone if customer else None,
            "category": category.name if category else None,
            "items_summary": ", ".join(item_descriptions),
        })
    return result
