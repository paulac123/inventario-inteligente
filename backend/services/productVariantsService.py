from sqlalchemy.orm import Session
from models.productVariantsModels import ProductVariant
from schemas.productVariantsSchema import ProductVariantCreate

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
