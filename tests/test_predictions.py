from App.auth import get_current_user
from App.main import app

from fastapi.testclient import TestClient

client = TestClient(app)
app = client.app

def fake_current_user():
    return {
        "uid": "test-firebase-uid",
        "email": "intel@example.com",
        "email_verified": True
    }


def test_customer_intelligence(client):

    app = client.app
    app.dependency_overrides[get_current_user] = fake_current_user

    response = client.post(
        "/api/v1/customer-intelligence",
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
    assert "predicted_90_day_spend" in data

    app.dependency_overrides.clear()


def test_prediction_history(client):

    app = client.app
    app.dependency_overrides[get_current_user] = fake_current_user

    headers = {
        "Authorization": "Bearer fake-test-token"
    }

    # Create prediction
    prediction = client.post(
        "/api/v1/customer-intelligence",
        headers=headers,
        json={
            "recency": 30,
            "frequency": 10,
            "monetary": 5000,
            "average_order_value": 500,
            "unique_products": 20,
            "customer_lifetime_days": 365
        }
    )

    assert prediction.status_code == 200

    # Get history
    response = client.get(
        "/api/v1/predictions",
        headers=headers
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["recency"] == 30
    assert data[0]["frequency"] == 10

    app.dependency_overrides.clear()