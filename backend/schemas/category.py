from pydantic import BaseModel


class CategoryResponse(BaseModel):
    """Datos que devuelve el API al consultar una categoría."""
    id: int
    name: str
    type: str  # "sale" o "expense"

    class Config:
        from_attributes = True
