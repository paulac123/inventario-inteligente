def test_create_variant(client):
    response = client.post("/product-variants/", json={
        "product_id": 1,
        "size": "M",
        "color": "Negro"
    })
    assert response.status_code == 200
    assert response.json()["size"] == "M"


def test_create_variant_sin_producto(client):
    response = client.post("/product-variants/", json={
        "size": "M",
        "color": "Negro"
    })
    assert response.status_code == 422


def test_delete_variant(client):
    response = client.post("/product-variants/", json={
        "product_id": 1,
        "size": "L",
        "color": "Blanco"
    })
    assert response.status_code == 200
    variant_id = response.json()["id"]

    response = client.delete(f"/product-variants/{variant_id}")
    assert response.status_code == 200
