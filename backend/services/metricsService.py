import unicodedata
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime
from models.saleItemModels import SaleItem
from models.saleModels import Sale
from models.productVariantsModels import ProductVariant
from models.productModels import Product
from models.categoryModels import Category

PREFIX_LABELS = {
    'bl': 'Blusas',
    'pl': 'Pantalones',
    'sh': 'Shorts',
    'vs': 'Vestidos',
    'cj': 'Conjuntos'
}

KEYWORD_LABELS = {
    'blusa': 'Blusas',
    'pantalon': 'Pantalones',
    'short': 'Shorts',
    'vestido': 'Vestidos',
    'conjunto': 'Conjuntos',
}

def _normalize(text: str) -> str:
    return unicodedata.normalize('NFD', text.lower()).encode('ascii', 'ignore').decode('ascii')

def _classify_description(description: Optional[str]) -> Optional[str]:
    if not description:
        return None
    normalized = _normalize(description)
    for keyword, label in KEYWORD_LABELS.items():
        if keyword in normalized:
            return label
    return None


def get_sales_by_type_and_size(
    db: Session,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    """Ventas con variante agrupadas por tipo de prenda y talla."""
    query = db.query(
        Product.reference,
        ProductVariant.size,
        func.sum(SaleItem.quantity).label("total")
    ).join(ProductVariant, SaleItem.product_variant_id == ProductVariant.id)\
     .join(Product, ProductVariant.product_id == Product.id)\
     .join(Sale, SaleItem.sale_id == Sale.id)

    if date_from:
        query = query.filter(Sale.date >= date_from)
    if date_to:
        query = query.filter(Sale.date <= date_to)

    result = query.group_by(Product.reference, ProductVariant.size).all()

    aggregated = {}
    for row in result:
        prefix = (row.reference or '')[:2].lower()
        label = PREFIX_LABELS.get(prefix)
        if not label:
            continue
        key = (label, row.size)
        aggregated[key] = aggregated.get(key, 0) + int(row.total)

    return [
        {"type": label, "size": size, "total": total}
        for (label, size), total in sorted(aggregated.items())
    ]


def get_manual_sales_by_type(
    db: Session,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    """Ventas manuales (sin variante) clasificadas por tipo usando la descripción."""
    query = db.query(
        Sale.description,
        SaleItem.quantity
    ).join(Sale, SaleItem.sale_id == Sale.id)\
     .filter(SaleItem.product_variant_id == None)

    if date_from:
        query = query.filter(Sale.date >= date_from)
    if date_to:
        query = query.filter(Sale.date <= date_to)

    rows = query.all()

    aggregated = {}
    for row in rows:
        label = _classify_description(row.description)
        if not label:
            continue
        aggregated[label] = aggregated.get(label, 0) + int(row.quantity)

    return [{"type": t, "total": total} for t, total in sorted(aggregated.items())]


def get_sales_by_type_combined(
    db: Session,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    """Suma ventas de inventario + ventas manuales agrupadas por tipo de prenda."""
    inventory = get_sales_by_type_and_size(db, date_from, date_to)
    inv_by_type = {}
    for row in inventory:
        inv_by_type[row["type"]] = inv_by_type.get(row["type"], 0) + row["total"]

    manual = get_manual_sales_by_type(db, date_from, date_to)
    manual_by_type = {row["type"]: row["total"] for row in manual}

    all_types = set(list(inv_by_type.keys()) + list(manual_by_type.keys()))
    return sorted([
        {
            "type": t,
            "total": inv_by_type.get(t, 0) + manual_by_type.get(t, 0),
            "inventario": inv_by_type.get(t, 0),
            "manual": manual_by_type.get(t, 0)
        }
        for t in all_types
    ], key=lambda x: x["total"], reverse=True)


def get_sales_by_supplier(
    db: Session,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    """Ventas agrupadas por marca: inventario por supplier + manuales por category_id."""
    inv_query = db.query(
        Category.name,
        func.sum(SaleItem.quantity).label("total")
    ).join(Sale, SaleItem.sale_id == Sale.id)\
     .join(ProductVariant, SaleItem.product_variant_id == ProductVariant.id)\
     .join(Product, ProductVariant.product_id == Product.id)\
     .join(Category, Product.supplier_id == Category.id)\
     .filter(SaleItem.product_variant_id != None)

    if date_from:
        inv_query = inv_query.filter(Sale.date >= date_from)
    if date_to:
        inv_query = inv_query.filter(Sale.date <= date_to)

    inv_result = inv_query.group_by(Category.name).all()

    manual_query = db.query(
        Category.name,
        func.sum(SaleItem.quantity).label("total")
    ).join(Sale, SaleItem.sale_id == Sale.id)\
     .join(Category, Sale.category_id == Category.id)\
     .filter(SaleItem.product_variant_id == None)

    if date_from:
        manual_query = manual_query.filter(Sale.date >= date_from)
    if date_to:
        manual_query = manual_query.filter(Sale.date <= date_to)

    manual_result = manual_query.group_by(Category.name).all()

    combined = {}
    for row in inv_result:
        combined.setdefault(row.name, {"inventario": 0, "manual": 0})
        combined[row.name]["inventario"] += int(row.total)
    for row in manual_result:
        combined.setdefault(row.name, {"inventario": 0, "manual": 0})
        combined[row.name]["manual"] += int(row.total)

    return sorted([
        {
            "supplier": name,
            "total": vals["inventario"] + vals["manual"],
            "inventario": vals["inventario"],
            "manual": vals["manual"]
        }
        for name, vals in combined.items()
    ], key=lambda x: x["total"], reverse=True)
