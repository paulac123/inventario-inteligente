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

KNOWN_TYPES = {
    'Blusa', 'Pantalón', 'Jeans', 'Capri', 'Short',
    'Falda', 'Vestido', 'Conjunto', 'Torero', 'Chaqueta', 'Cinturón',
}

KEYWORD_LABELS = {
    'blusa': 'Blusa',
    'pantalon': 'Pantalón',
    'short': 'Short',
    'vestido': 'Vestido',
    'conjunto': 'Conjunto',
    'jeans': 'Jeans',
    'capri': 'Capri',
    'torero': 'Torero',
    'chaqueta': 'Chaqueta',
    'cinturon': 'Cinturón',
    'falda': 'Falda',
}

def _normalize(text: str) -> str:
    return unicodedata.normalize('NFD', text.lower()).encode('ascii', 'ignore').decode('ascii')

def _classify_by_amount(amount: float) -> str:
    return 'Blusa' if amount < 80000 else 'Pantalón'

def _classify_description(description: Optional[str]) -> Optional[str]:
    if not description:
        return None
    # Coincidencia exacta primero (ventas nuevas almacenan el tipo directamente)
    if description.strip() in KNOWN_TYPES:
        return description.strip()
    # Búsqueda por keyword para ventas viejas con texto libre
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
        Product.clothing_type,
        ProductVariant.size,
        func.sum(SaleItem.quantity).label("total")
    ).join(ProductVariant, SaleItem.product_variant_id == ProductVariant.id)\
     .join(Product, ProductVariant.product_id == Product.id)\
     .join(Sale, SaleItem.sale_id == Sale.id)

    if date_from:
        query = query.filter(Sale.date >= date_from)
    if date_to:
        query = query.filter(Sale.date <= date_to)

    result = query.group_by(Product.clothing_type, ProductVariant.size).all()

    return [
        {"type": row.clothing_type, "size": row.size, "total": int(row.total)}
        for row in sorted(result, key=lambda r: (r.clothing_type or '', r.size or ''))
        if row.clothing_type
    ]


def get_manual_sales_by_type(
    db: Session,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    """Ventas manuales (sin variante) clasificadas por tipo usando la descripción."""
    query = db.query(
        Sale.description,
        Sale.amount,
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
            label = _classify_by_amount(float(row.amount or 0))
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


def get_sales_over_time(
    db: Session,
    group_by: str = "day",
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    clothing_type: Optional[str] = None
):
    """Ventas agrupadas por día o mes con monto total y número de transacciones."""
    trunc = func.date_trunc('month', Sale.date) if group_by == "month" else func.date_trunc('day', Sale.date)

    query = db.query(
        trunc.label("period"),
        func.sum(Sale.amount).label("total"),
        func.count(Sale.id).label("count")
    )

    if clothing_type:
        # Incluir solo ventas con variante del tipo indicado
        query = query.join(SaleItem, SaleItem.sale_id == Sale.id)\
                     .join(ProductVariant, SaleItem.product_variant_id == ProductVariant.id)\
                     .join(Product, ProductVariant.product_id == Product.id)\
                     .filter(Product.clothing_type == clothing_type)

    if date_from:
        query = query.filter(Sale.date >= date_from)
    if date_to:
        query = query.filter(Sale.date <= date_to)

    result = query.group_by("period").order_by("period").all()

    fmt = "%d/%m" if group_by == "day" else "%b %Y"
    return [
        {"period": row.period.strftime(fmt), "total": float(row.total), "count": int(row.count)}
        for row in result
    ]


def get_sales_by_supplier(
    db: Session,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    clothing_type: Optional[str] = None
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

    if clothing_type:
        inv_query = inv_query.filter(Product.clothing_type == clothing_type)
    if date_from:
        inv_query = inv_query.filter(Sale.date >= date_from)
    if date_to:
        inv_query = inv_query.filter(Sale.date <= date_to)

    inv_result = inv_query.group_by(Category.name).all()

    # Manuales: solo incluir si no hay filtro de tipo (no tenemos tipo por marca en manuales)
    manual_result = []
    if not clothing_type:
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
