from sqlalchemy.orm import Session
from sqlalchemy import func
from models.productModels import Product
from models.productVariantsModels import ProductVariant
from models.categoryModels import Category
from schemas.productSchema import ProductCreate, ProductUpdate

def create_product(db: Session, product_data: ProductCreate):
    new_product = Product(
        name=product_data.name,
        reference=product_data.reference,
        supplier_id=product_data.supplier_id,
        sale_price=product_data.sale_price,
        cost_price=product_data.cost_price,
        photo=product_data.photo,
        barcode=product_data.barcode,
        qr_code=product_data.qr_code
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

def update_product(db: Session, product_id: int, product_data: ProductUpdate):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return None
    product.name = product_data.name
    product.reference = product_data.reference
    product.supplier_id = product_data.supplier_id
    product.sale_price = product_data.sale_price
    product.cost_price = product_data.cost_price
    product.photo = product_data.photo
    product.barcode = product_data.barcode
    product.qr_code = product_data.qr_code
    db.commit()
    db.refresh(product)
    return product

def get_products(db: Session):
    products = db.query(Product).all()
    result = []
    for product in products:
        total = db.query(func.sum(ProductVariant.quantity))\
            .filter(ProductVariant.product_id == product.id)\
            .scalar() or 0
        category = db.query(Category).filter(Category.id == product.supplier_id).first()
        product_dict = {
            "id": product.id,
            "name": product.name,
            "reference": product.reference,
            "supplier_id": product.supplier_id,
            "supplier_name": category.name if category else None,
            "sale_price": float(product.sale_price),
            "cost_price": float(product.cost_price),
            "photo": product.photo,
            "barcode": product.barcode,
            "qr_code": product.qr_code,
            "total_quantity": total
        }
        result.append(product_dict)
    return result

def delete_product(db: Session, product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return None
    db.delete(product)
    db.commit()
    return True
