from fastapi.testclient import TestClient
from App.main import app
from App.auth import get_current_user
import pytest

client = TestClient(app)


def fake_current_user():
    return {
        "uid": "test-firebase-uid",
        "email": "test@example.com",
        "email_verified": True
    }


def test_health():
    response = client.get("/api/v1/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert data["churn_model_loaded"] is True
    assert data["spend_model_loaded"] is True


def test_root():
    response = client.get("/api/v1")

    assert response.status_code == 200

    data = response.json()

    assert data == {
        "message": "Retail Customer Churn Prediction API is running!"
    }


@pytest.mark.parametrize(
    "recency, frequency, monetary",
    [
        (10, 5, 1000),
        (30, 10, 5000),
        (100, 20, 10000),
    ],
)
def test_predict_with_diff_inputs(client, recency, frequency, monetary):

    app.dependency_overrides[get_current_user] = fake_current_user

    response = client.post(
        "/api/v1/predict",
        headers={
            "Authorization": "Bearer fake-test-token"
        },
        json={
            "recency": recency,
            "frequency": frequency,
            "monetary": monetary,
            "average_order_value": 500,
            "unique_products": 20,
            "customer_lifetime_days": 365
        }
    )

    assert response.status_code == 200
    assert "churn_probability" in response.json()

    app.dependency_overrides.clear()


def test_invalid_customer_data(client):

    app.dependency_overrides[get_current_user] = fake_current_user

    response = client.post(
        "/api/v1/predict",
        headers={
            "Authorization": "Bearer fake-test-token"
        },
        json={
            "recency": -10,
            "frequency": 45,
            "monetary": 2000,
            "average_order_value": 500,
            "unique_products": 20,
            "customer_lifetime_days": 365
        }
    )

    assert response.status_code == 422

    app.dependency_overrides.clear()