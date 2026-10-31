from pydantic import BaseModel


class PaymentMethodResponse(BaseModel):
    """Datos que devuelve el API al consultar una forma de pago."""
    id: int
    name: str

    class Config:
        from_attributes = True
