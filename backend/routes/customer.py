from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from config.database import get_db
from schemas.customer import CustomerCreate, CustomerResponse
from services.customerService import search_customers, create_customer
from services.authService import get_current_user

router = APIRouter(
    prefix="/customers",
    tags=["customers"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=list[CustomerResponse])
def search_customers_route(q: Optional[str] = "", db: Session = Depends(get_db)):
    """Busca clientes por nombre o teléfono."""
    return search_customers(db, q)


@router.post("/", response_model=CustomerResponse)
def create_customer_route(data: CustomerCreate, db: Session = Depends(get_db)):
    """Crea un cliente nuevo."""
    return create_customer(db, data)
