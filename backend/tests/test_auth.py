import pytest
from models.userModels import User
from services.authService import hash_password
from tests.conftest import TestingSessionLocal


def _create_user_and_login(anon_client, username: str, password: str, role: str) -> str:
    db = TestingSessionLocal()
    try:
        db.add(User(username=username, password_hash=hash_password(password), role=role))
        db.commit()
    finally:
        db.close()

    res = anon_client.post("/auth/login", json={"username": username, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.mark.parametrize(
    "method,url",
    [
        ("GET", "/sales/?date_from=2026-01-01T00:00:00Z&date_to=2026-01-02T00:00:00Z"),
        ("GET", "/sales/credit"),
        ("GET", "/expenses/?date_from=2026-01-01T00:00:00Z&date_to=2026-01-02T00:00:00Z"),
        ("GET", "/summary/?date_from=2026-01-01T00:00:00Z&date_to=2026-01-02T00:00:00Z"),
        ("GET", "/products/"),
        ("GET", "/product-variants/summary"),
        ("GET", "/customers/"),
        ("GET", "/categories/?type=sale"),
        ("GET", "/payment-methods/"),
        ("GET", "/alerts/configs"),
        ("GET", "/debts/"),
        ("GET", "/metrics/sales-by-type"),
        ("GET", "/test-db-connection"),
    ],
)
def test_rutas_protegidas_requieren_token(anon_client, method, url):
    response = anon_client.request(method, url)
    assert response.status_code == 401


def test_login_password_invalida_y_larga_no_da_500(anon_client):
    _create_user_and_login(anon_client, "admin1", "clave123", "admin")

    res_wrong = anon_client.post("/auth/login", json={"username": "admin1", "password": "incorrecta"})
    assert res_wrong.status_code == 401

    res_long = anon_client.post("/auth/login", json={"username": "admin1", "password": "a" * 100})
    assert res_long.status_code == 401


def test_vendedor_accede_operacion_pero_no_admin(anon_client):
    token = _create_user_and_login(anon_client, "vend1", "clave123", "vendedor")
    headers = {"Authorization": f"Bearer {token}"}

    # Rutas operativas permitidas para vendedor
    assert anon_client.get("/products/", headers=headers).status_code == 200
    assert anon_client.get("/alerts/configs", headers=headers).status_code == 200
    assert anon_client.get("/sales/credit", headers=headers).status_code == 200

    # Rutas exclusivas de admin bloqueadas con 403
    assert anon_client.get("/debts/", headers=headers).status_code == 403
    assert anon_client.post("/debts/", json={"name": "Test", "total_amount": 1000}, headers=headers).status_code == 403
    assert anon_client.get("/metrics/sales-by-type", headers=headers).status_code == 403
    assert anon_client.get("/test-db-connection", headers=headers).status_code == 403


def test_admin_accede_rutas_admin(anon_client):
    token = _create_user_and_login(anon_client, "admin2", "clave123", "admin")
    headers = {"Authorization": f"Bearer {token}"}

    assert anon_client.get("/debts/", headers=headers).status_code == 200
    assert anon_client.get("/metrics/sales-by-type", headers=headers).status_code == 200
