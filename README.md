# 🛒 Customer Churn Intelligence

An end-to-end **Machine Learning application** that combines customer churn prediction, 90-day spend forecasting, SHAP explainability, and retention insights into a single customer intelligence system.

The project goes beyond building ML models by integrating them with a **FastAPI backend, JWT authentication, database, interactive web dashboard, Docker, and cloud deployment**.

---

## 🚀 What Does It Do?

Customer churn prediction answers one question:

> **Who is likely to leave?**

But for a business, that is only part of the problem.

This system also answers:

* **Why is the customer at risk?**
* **How much could the customer spend in the next 90 days?**
* **What should the business consider when prioritizing retention?**

The application combines:

**Churn Risk + Future Value + Explainability → Customer Intelligence**

---

## ✨ Key Features

### 🔴 Churn Prediction

Uses an **XGBoost Classifier** to predict customer churn probability.

The system provides:

* Churn probability
* Churn prediction
* Low / Medium / High risk classification
* Retention recommendation

**Model Performance**

* ROC-AUC: **0.7251**
* Model: **XGBoost Classifier**

---

### 💰 90-Day Spend Prediction

A **Random Forest Regressor** estimates the customer's expected spending over the next 90 days.

This adds a customer-value dimension to churn prediction.

For example:

> A customer with high churn probability and high predicted future spend may require more attention than a customer with similar churn risk but lower predicted value.

---

### 🔍 Explainable AI with SHAP

The system uses **SHAP (SHapley Additive exPlanations)** to explain individual churn predictions.

Instead of only showing:

> Churn probability: 82%

the application can show **which customer features contributed to that prediction and in which direction**.

This makes the ML output easier to interpret at the individual customer level.

---

### 🎯 Customer Intelligence

The system combines the outputs from multiple ML components into one customer-level view:

**Churn Probability**
↓
**Risk Level**
↓
**SHAP Drivers**
↓
**90-Day Future Spend**
↓
**Retention Recommendation**

The goal is to move from:

**Prediction → Explanation → Action**

---

### 🔐 Authentication & Authorization

The application includes a protected backend rather than exposing prediction endpoints publicly.

Implemented:

* User registration
* User login
* Password hashing
* JWT access tokens
* Bearer-token authentication
* Protected ML prediction endpoints
* Token validation and user lookup

The authentication layer was implemented using FastAPI security utilities and JWT-based access tokens.

### Authentication Preview

![Customer Churn Intelligence Authentication ](images/Authentication.png)

---

### ⚡ FastAPI Backend

The ML models are served through a REST API built with **FastAPI**.

The backend handles:

* Request validation
* Authentication
* Feature preparation
* Churn inference
* Spend inference
* SHAP explanation generation
* Structured JSON responses
* Database interaction

Core prediction endpoints include:

```text
POST /api/v1/predict
POST /api/v1/predict_spend
POST /api/v1/customer-intelligence
```

Authentication endpoints:

```text
POST /users/
POST /users/login
```

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │    Web Dashboard     │
                    │     HTML/CSS/JS      │
                    └──────────┬───────────┘
                               │
                         HTTPS / JSON
                               │
                               ▼
                    ┌──────────────────────┐
                    │       FastAPI        │
                    │     REST Backend     │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
          ┌────────────┐ ┌────────────┐ ┌────────────┐
          │  XGBoost   │ │  Random    │ │    SHAP    │
          │  Churn     │ │  Forest    │ │ Explainable│
          │ Classifier │ │ Regressor  │ │     AI     │
          └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
                │              │              │
                ▼              ▼              ▼
          Churn Risk      90-Day Spend    Key Drivers
                │              │              │
                └──────────────┼──────────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Customer Intelligence│
                    │                      │
                    │ • Risk               │
                    │ • Future Value       │
                    │ • SHAP Drivers       │
                    │ • Recommendation     │
                    └──────────────────────┘
```

---

## 🧠 Machine Learning Pipeline

```text
Raw Customer Data
        │
        ▼
Data Cleaning & Preprocessing
        │
        ▼
Feature Engineering
        │
        ├───────────────────────┐
        │                       │
        ▼                       ▼
Churn Classification      Spend Regression
        │                       │
        ▼                       ▼
XGBoost Classifier        Random Forest
        │                       │
        ▼                       ▼
Churn Probability        90-Day Spend
        │                       │
        └───────────┬───────────┘
                    ▼
               SHAP Analysis
                    │
                    ▼
          Customer-Level Insights
                    │
                    ▼
          Retention Recommendation
```

---

## 📊 Customer Features

The models use customer purchasing behaviour such as:

| Feature                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| Recency                | Days since the customer's most recent purchase |
| Frequency              | Number of purchases/orders                     |
| Monetary               | Total customer spending                        |
| Average Order Value    | Average value per order                        |
| Unique Products        | Number of distinct products purchased          |
| Customer Lifetime Days | Duration of the customer's relationship        |

These features are used by the prediction pipeline to generate customer-level insights.

---

## 🧩 Model Components

| Component        | Technology                | Purpose                                |
| ---------------- | ------------------------- | -------------------------------------- |
| Churn Prediction | XGBoost                   | Predict churn probability              |
| Spend Prediction | Random Forest             | Forecast 90-day customer spend         |
| Explainability   | SHAP                      | Explain individual churn predictions   |
| API              | FastAPI                   | Serve ML models through REST APIs      |
| Authentication   | JWT                       | Secure protected endpoints             |
| Database         | SQLAlchemy / SQL database | Store application data                 |
| Frontend         | HTML / CSS / JavaScript   | Interactive dashboard                  |
| Containerization | Docker                    | Reproducible application environment   |
| Deployment       | Cloud deployment          | Make the application accessible online |

---

## 🔄 Request Flow

1. User logs into the application.
2. Backend authenticates the user using JWT.
3. User enters customer information through the dashboard.
4. Frontend sends the customer data to the FastAPI backend.
5. FastAPI validates the request.
6. XGBoost generates the churn probability and risk.
7. Random Forest predicts expected 90-day spend.
8. SHAP generates customer-level feature explanations.
9. The backend combines the results.
10. The dashboard presents the predictions and business insights.

---

## 🖥️ Dashboard

The dashboard provides a single customer-level view containing:

* Customer information
* Churn probability
* Risk level
* Prediction
* 90-day predicted spend
* SHAP feature contributions
* Retention recommendation

### Dashboard Preview

![Customer Churn Intelligence Dashboard](images/dashboard-new.png)

---

## 🌙 UI

The dashboard was redesigned as part of the final project iteration with:

* Dark theme
* Responsive layout
* Customer profile input
* Prediction cards
* Risk visualization
* Future-spend output
* SHAP explanation visualization
* Retention recommendation section

---

## 🔌 API

The application exposes the ML functionality through a FastAPI REST backend.

### Main Endpoints

```text
Authentication
POST /users/
POST /users/login

ML Predictions
POST /api/v1/predict
POST /api/v1/predict_spend
POST /api/v1/customer-intelligence
```

Protected prediction endpoints require a valid JWT Bearer token.

### Example Spend Response

```json
{
  "predicted_90_day_spend": 3238.76,
  "currency": "GBP",
  "model": "RandomForestRegressor",
  "prediction_horizon": "90_days",
  "features_used": 6
}
```

---

## 🛠️ Tech Stack

### Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* XGBoost
* SHAP

### Backend

* FastAPI
* Pydantic
* REST APIs
* SQLAlchemy
* JWT Authentication
* OAuth2 Bearer Authentication

### Frontend

* HTML
* CSS
* JavaScript
* Responsive dashboard
* REST API integration

### Deployment & Engineering

* Docker
* Docker Compose
* Git
* GitHub
* Cloud deployment

---

## 📁 Project Structure

```text
customer-churn-ml-system/
│
├── App/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   ├── models.py
│   ├── config.py
│   └── routers/
│       └── users.py
│
├── Model/
│   ├── churn_model/
│   └── spend_model/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── notebooks/
│   └── ...
│
├── images/
│   └── dashboard.png
│
├── Dockerfile
├── Dockerfile.streamlit
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

## 📈 Model Performance

### Churn Classification

| Metric  |      Score |
| ------- | ---------: |
| ROC-AUC | **0.7251** |

The ROC-AUC score measures the model's ability to distinguish between customers who churn and customers who remain.

The project focuses on more than predictive performance by adding **explainability, customer value estimation, API access, and deployment** around the model.

### Spend Regression

The Random Forest model predicts expected customer spending over a **90-day horizon**.

The regression output is exposed through the API and displayed directly in the dashboard.

---

## 🐳 Docker & Deployment

The application is structured into separate application layers:

```text
Web Dashboard
      │
      │ HTTPS / REST
      ▼
FastAPI Backend
      │
      ├── Authentication
      ├── Validation
      ├── ML Inference
      └── Database
             │
             ▼
        ML Models
        ├── XGBoost
        ├── Random Forest
        └── SHAP
```

Docker is used to provide reproducible environments for the application components.

---

## 📚 What I Learned

This project started as an attempt to learn Machine Learning by building something end-to-end.

It eventually became a much broader engineering project.

Through the development process, I worked with:

* Machine Learning model development
* Feature engineering
* Model evaluation
* Explainable AI with SHAP
* REST API development
* FastAPI
* Request validation with Pydantic
* Authentication and authorization
* JWT access tokens
* Password hashing
* Database integration
* Frontend-backend communication
* Docker and containerization
* API testing
* Cloud deployment
* Debugging CORS and deployment issues

One of the biggest lessons was that:

> **A trained ML model is only one part of an ML application.**

The real challenge is building everything around it so that the model can be accessed, explained, secured, deployed, and actually used.

---

## 🎯 Business Questions

The application is designed around four practical questions:

### 1. Who is likely to churn?

→ XGBoost churn probability

### 2. Why are they likely to churn?

→ SHAP feature contributions

### 3. How valuable could they be?

→ 90-day predicted spend

### 4. How should the customer be considered for retention?

→ Combined customer intelligence and recommendation

---

## 🔮 Future Improvements

Possible future extensions include:

* Automated model retraining
* Model monitoring and drift detection
* Customer segmentation
* Batch prediction
* Cost-sensitive retention optimization
* Improved regression evaluation
* Automated retention campaign integration

---

## 👨‍💻 Author

**Aarav Saini**

B.Tech — CSE

Machine Learning • Data Science • Backend Development • Explainable AI

---

## ⭐ Project Summary

**Customer Churn Intelligence** demonstrates how machine learning models can be integrated into a complete application rather than remaining as isolated notebook experiments.

It combines:

**XGBoost + Random Forest + SHAP + FastAPI + JWT Authentication + Database + Web Dashboard + Docker**

to create an end-to-end customer intelligence workflow.

> **Predict. Explain. Estimate. Prioritize.**
