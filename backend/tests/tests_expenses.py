from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_expense():
    response = client.post("/expenses/", json={
        "amount": 30000,
        "category_id": 1,
        "payment_method_id": 1
    })
    assert response.status_code == 200
    assert response.json()["amount"] == 30000


def test_create_expense_sin_forma_de_pago():
    response = client.post("/expenses/", json={
        "amount": 30000
    })
    assert response.status_code == 422
