def test_customer_intelligence(client):

    # Register
    client.post(
        "/users/",
        json={
            "email": "intel@example.com",
            "password": "testpassword123"
        }
    )

    # Login
    login = client.post(
        "/users/login",
        data={
            "username": "intel@example.com",
            "password": "testpassword123"
        }
    )

    token = login.json()["access_token"]

    # Customer intelligence
    response = client.post(
        "/api/v1/customer-intelligence",
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

    # Churn
    assert "churn_probability" in data
    assert "prediction" in data
    assert "risk" in data

    # Future spend
    assert "predicted_90_day_spend" in data


def test_prediction_history(client):

    # Register
    client.post(
        "/users/",
        json={
            "email": "intel@example.com",
            "password": "testpassword123"
        }
    )

    # Login
    login = client.post(
        "/users/login",
        data={
            "username": "intel@example.com",
            "password": "testpassword123"
        }
    )

    token = login.json()["access_token"]
    headers = {"Authorization" :f"Bearer {token}"}

    # Create prediction
    prediction = client.post(
        "/api/v1/customer-intelligence",
        headers= headers,
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

    #get history
    response = client.get("/api/v1/predictions", headers = headers)

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data , list)
    assert len(data)==1
    assert data[0]["recency"] == 30
    assert data[0]["frequency"] == 10