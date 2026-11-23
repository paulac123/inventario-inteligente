def test_create_sale(client):
    response = client.post("/sales/", json={
        "items": [{"product_variant_id": None, "quantity": 1, "unit_price": 50000}],
        "payment_method_id": 1
    })
    assert response.status_code == 200
    assert response.json()["amount"] == 50000


def test_create_sale_con_descuento(client):
    response = client.post("/sales/", json={
        "items": [{"product_variant_id": None, "quantity": 1, "unit_price": 100000}],
        "payment_method_id": 1,
        "discount": 10
    })
    assert response.status_code == 200
    assert response.json()["amount"] == 90000


def test_create_sale_sin_forma_de_pago(client):
    response = client.post("/sales/", json={
        "items": [{"product_variant_id": None, "quantity": 1, "unit_price": 50000}]
    })
    assert response.status_code == 422


def test_create_sale_sin_items(client):
    response = client.post("/sales/", json={
        "items": [],
        "payment_method_id": 1
    })
    assert response.status_code == 200


def test_delete_sale_rollback(client):
    product = client.post("/products/", json={
        "name": "Producto rollback",
        "reference": "RB001",
        "supplier_id": 1,
        "sale_price": 50000,
        "cost_price": 30000
    }).json()

    variant = client.post("/product-variants/", json={
        "product_id": product["id"],
        "size": "M",
        "color": "Negro",
        "quantity": 5
    }).json()

    response = client.post("/sales/", json={
        "items": [{"product_variant_id": variant["id"], "quantity": 2, "unit_price": 50000}],
        "payment_method_id": 1
    })
    assert response.status_code == 200
    sale_id = response.json()["id"]

    response = client.get(f"/product-variants/{product['id']}")
    stock_despues_venta = response.json()[0]["quantity"]

    response = client.delete(f"/sales/{sale_id}")
    assert response.status_code == 200

    response = client.get(f"/product-variants/{product['id']}")
    assert response.json()[0]["quantity"] == stock_despues_venta + 2
