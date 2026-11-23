def test_create_expense(client):
    response = client.post("/expenses/", json={
        "amount": 30000,
        "category_id": 1,
        "payment_method_id": 1
    })
    assert response.status_code == 200
    assert response.json()["amount"] == 30000


def test_create_expense_sin_forma_de_pago(client):
    response = client.post("/expenses/", json={
        "amount": 30000
    })
    assert response.status_code == 422
