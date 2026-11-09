from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_product():
    response = client.post("/products/", json={
        "name": "Blusa test",
        "reference": "BL001",
        "supplier_id": 1,
        "sale_price": 50000,
        "cost_price": 30000
    })
    assert response.status_code == 200
    assert response.json()["name"] == "Blusa test"


def test_create_product_sin_nombre():
    response = client.post("/products/", json={
        "reference": "BL001",
        "supplier_id": 1,
        "sale_price": 50000,
        "cost_price": 30000
    })
    assert response.status_code == 422


def test_delete_product():
    response = client.post("/products/", json={
        "name": "Producto a eliminar",
        "reference": "DEL001",
        "supplier_id": 1,
        "sale_price": 50000,
        "cost_price": 30000
    })
    assert response.status_code == 200
    product_id = response.json()["id"]

    response = client.delete(f"/products/{product_id}")
    assert response.status_code == 200


def test_delete_product_inexistente():
    response = client.delete("/products/999999")
    assert response.status_code == 404
