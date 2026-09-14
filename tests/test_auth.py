from fastapi.testclient import TestClient
from App.main import app

def test_protected_predict(client):
    # register
    register_response = client.post("/users/",
                           json={"email": "test@example.com",
                                 "password": "testpassword123"})

    # login
    login_response = client.post("/users/login",
                           data={"username": "test@example.com",
                                 "password": "testpassword123"})

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    # without token
    response = client.post("/api/v1/predict")
    json={
            "recency": 30,
            "frequency": 10,
            "monetary": 5000,
            "average_order_value": 500,
            "unique_products": 20,
            "customer_lifetime_days": 365
        }

    assert response.status_code == 401

    # 4. Try with token
    response = client.post(
        "/api/v1/predict",
        headers={
            "Authorization": f"Bearer {token}"
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


def test_wrong_password(client):
    client.post(
        "/users/",
        json={
            "email": "wrongpass@example.com",
            "password": "correctpassword123"
        }
    )

    response = client.post(
        "/users/login",
        data={
            "username": "wrongpass@example.com",
            "password": "wrongpassword123"
        }
    )

    assert response.status_code == 401


def test_invalid_token(client):
    response = client.post("/api/v1/predict", headers={"Authorization": "Bearer Invalid-token"},
                            json={
                                    "recency": 30,
                                    "frequency": 10,
                                    "monetary": 5000,
                                    "average_order_value": 500,
                                    "unique_products": 20,
                                    "customer_lifetime_days": 365
                                })
    assert response.status_code == 401

def test_predict_rejects_negative_recency(client):

    response = client.post(
        "/api/v1/predict",
        json={
            "recency": -10,
            "frequency": 10,
            "monetary": 5000,
            "average_order_value": 500,
            "unique_products": 20,
            "customer_lifetime_days": 365
        }
    )

    assert response.status_code == 401