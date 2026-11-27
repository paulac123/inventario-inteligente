from sqlalchemy.orm import Session
from models.customerModels import Customer
from schemas.customer import CustomerCreate


def search_customers(db: Session, q: str):
    """Busca clientes por nombre o teléfono."""
    term = f"%{q}%"
    return db.query(Customer).filter(
        Customer.name.ilike(term) | Customer.phone.ilike(term)
    ).limit(10).all()


def create_customer(db: Session, data: CustomerCreate):
    """Crea un cliente nuevo."""
    customer = Customer(name=data.name, phone=data.phone)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def get_or_create_customer(db: Session, name: str, phone: str = None):
    """Devuelve un cliente existente por teléfono o crea uno nuevo."""
    if phone:
        existing = db.query(Customer).filter(Customer.phone == phone).first()
        if existing:
            return existing
    customer = Customer(name=name, phone=phone)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer
