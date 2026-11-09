from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_variant():
    response = client.post("/product-variants/", json={
        "product_id": 1,
        "size": "M",
        "color": "Negro"
    })
    assert response.status_code == 200
    assert response.json()["size"] == "M"


def test_create_variant_sin_producto():
    response = client.post("/product-variants/", json={
        "size": "M",
        "color": "Negro"
    })
    assert response.status_code == 422


def test_delete_variant():
    response = client.post("/product-variants/", json={
        "product_id": 1,
        "size": "L",
        "color": "Blanco"
    })
    assert response.status_code == 200
    variant_id = response.json()["id"]

    response = client.delete(f"/product-variants/{variant_id}")
    assert response.status_code == 200
