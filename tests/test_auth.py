from fastapi.testclient import TestClient
from App.main import app
from App.auth import get_current_user


def fake_current_user():
    return {
        "uid": "test-firebase-uid",
        "email": "test@example.com",
        "email_verified": True
    }


def test_protected_predict(client):
    app.dependency_overrides[get_current_user] = fake_current_user

    response = client.post(
        "/api/v1/predict",
        headers={
            "Authorization": "Bearer fake-test-token"
        },
        json={
            "recency": 30,
            "frequency": 10,
            "monetary": 5000,
            "average_order_value": 500,
            "unique_products": 20,
            "customer_lifetime_days": 365
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "churn_probability" in data
    assert "prediction" in data
    assert "risk" in data

    app.dependency_overrides.clear()


def test_wrong_password(client):
    # Password authentication is handled by Firebase now.
    # Backend should not expose the old /users/login endpoint.

    response = client.post(
        "/users/login",
        data={
            "username": "wrongpass@example.com",
            "password": "wrongpassword123"
        }
    )

    assert response.status_code == 404


def test_invalid_token(client):
    response = client.post(
        "/api/v1/predict",
        headers={
            "Authorization": "Bearer Invalid-token"
        },
        json={
            "recency": 30,
            "frequency": 10,
            "monetary": 5000,
            "average_order_value": 500,
            "unique_products": 20,
            "customer_lifetime_days": 365
        }
    )

    assert response.status_code == 401


def test_predict_rejects_negative_recency(client):
    app.dependency_overrides[get_current_user] = fake_current_user

    response = client.post(
        "/api/v1/predict",
        headers={
            "Authorization": "Bearer fake-test-token"
        },
        json={
            "recency": -10,
            "frequency": 10,
            "monetary": 5000,
            "average_order_value": 500,
            "unique_products": 20,
            "customer_lifetime_days": 365
        }
    )

    assert response.status_code == 422

    app.dependency_overrides.clear()