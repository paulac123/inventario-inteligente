from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from services.productVariantsService import create_variant, get_variants_by_product, update_variant, delete_variant
from schemas.productVariantsSchema import ProductVariantCreate, ProductVariantResponse

router = APIRouter(prefix="/product-variants", tags=["product-variants"])

@router.get("/{product_id}", response_model=list[ProductVariantResponse])
def get_variants(product_id: int, db: Session = Depends(get_db)):
    return get_variants_by_product(db, product_id)

@router.post("/", response_model=ProductVariantResponse)
def create_new_variant(variant: ProductVariantCreate, db: Session = Depends(get_db)):
    return create_variant(db, variant)

@router.put("/{variant_id}", response_model=ProductVariantResponse)
def update_existing_variant(variant_id: int, variant: ProductVariantCreate, db: Session = Depends(get_db)):
    return update_variant(db, variant_id, variant)

@router.delete("/{variant_id}")
def delete_existing_variant(variant_id: int, db: Session = Depends(get_db)):
    delete_variant(db, variant_id)
    return {"message": "Variante eliminada"}
