from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from models.productVariantsModels import ProductVariant
from models.productModels import Product
from schemas.productVariantsSchema import ProductVariantCreate

PREFIX_LABELS = {
    'bl': 'Blusas',
    'pl': 'Pantalones',
    'sh': 'Shorts',
    'vs': 'Vestidos',
    'cj': 'Conjuntos'
}

def get_variants_summary_by_type(db: Session, supplier_id: Optional[int] = None):
    query = db.query(Product.reference, ProductVariant.size, func.sum(ProductVariant.quantity).label("total"))\
              .join(ProductVariant, ProductVariant.product_id == Product.id)
    if supplier_id:
        query = query.filter(Product.supplier_id == supplier_id)
    result = query.group_by(Product.reference, ProductVariant.size).all()

    aggregated = {}
    for row in result:
        prefix = (row.reference or '')[:2].lower()
        label = PREFIX_LABELS.get(prefix)
        if not label:
            continue
        key = (label, row.size)
        aggregated[key] = aggregated.get(key, 0) + int(row.total)

    return [{"type": label, "size": size, "total": total}
            for (label, size), total in sorted(aggregated.items())]


def get_variants_summary(db: Session, supplier_id: Optional[int] = None):
    query = db.query(ProductVariant.size, func.sum(ProductVariant.quantity).label("total"))\
              .join(Product, ProductVariant.product_id == Product.id)
    if supplier_id:
        query = query.filter(Product.supplier_id == supplier_id)
    result = query.group_by(ProductVariant.size).order_by(ProductVariant.size).all()
    return [{"size": row.size, "total": int(row.total)} for row in result]


def create_variant(db: Session, variant_data: ProductVariantCreate):
    new_variant = ProductVariant(
        product_id=variant_data.product_id,
        size=variant_data.size,
        color=variant_data.color,
        quantity=variant_data.quantity,
        min_stock=variant_data.min_stock,
        max_stock=variant_data.max_stock
    )
    db.add(new_variant)
    db.commit()
    db.refresh(new_variant)
    return new_variant

def get_variants_by_product(db: Session, product_id: int):
    return db.query(ProductVariant).filter(ProductVariant.product_id == product_id).all()

def update_variant(db: Session, variant_id: int, data: ProductVariantCreate):
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    variant.size = data.size
    variant.color = data.color
    variant.quantity = data.quantity
    variant.min_stock = data.min_stock
    variant.max_stock = data.max_stock
    db.commit()
    db.refresh(variant)
    return variant

def delete_variant(db: Session, variant_id: int):
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    db.delete(variant)
    db.commit()
