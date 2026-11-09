from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_sale():
    response = client.post("/sales/", json={
        "items": [{"product_variant_id": None, "quantity": 1, "unit_price": 50000}],
        "payment_method_id": 1
    })
    assert response.status_code == 200
    assert response.json()["amount"] == 50000


def test_create_sale_con_descuento():
    response = client.post("/sales/", json={
        "items": [{"product_variant_id": None, "quantity": 1, "unit_price": 100000}],
        "payment_method_id": 1,
        "discount": 10
    })
    assert response.status_code == 200
    assert response.json()["amount"] == 90000


def test_create_sale_sin_forma_de_pago():
    response = client.post("/sales/", json={
        "items": [{"product_variant_id": None, "quantity": 1, "unit_price": 50000}]
    })
    assert response.status_code == 422


def test_create_sale_sin_items():
    response = client.post("/sales/", json={
        "items": [],
        "payment_method_id": 1
    })
    assert response.status_code == 200


def test_delete_sale_rollback():
    response = client.post("/sales/", json={
        "items": [{"product_variant_id": 1, "quantity": 2, "unit_price": 50000}],
        "payment_method_id": 1
    })
    assert response.status_code == 200
    sale_id = response.json()["id"]

    response = client.get("/product-variants/1")
    stock_despues_venta = response.json()[0]["quantity"]

    response = client.delete(f"/sales/{sale_id}")
    assert response.status_code == 200

    response = client.get("/product-variants/1")
    assert response.json()[0]["quantity"] == stock_despues_venta + 2
