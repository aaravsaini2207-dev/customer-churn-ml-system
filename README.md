# 🛒 Customer Churn Intelligence

An end-to-end **Machine Learning application** that combines customer churn prediction, 90-day spend forecasting, SHAP explainability, and retention insights into a single customer intelligence system.

The project goes beyond building ML models by integrating them with a **FastAPI backend, Firebase Authentication, PostgreSQL, interactive web dashboard, Docker, and cloud deployment**.

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

The system combines multiple ML outputs into one customer-level view:

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

## 🔐 Firebase Authentication

The application uses **Firebase Authentication** for user identity and account security.

Implemented:

* Email/password registration
* Email verification
* Firebase login
* Google authentication
* GitHub authentication
* Firebase ID tokens
* Protected FastAPI prediction endpoints
* Firebase UID → application-user mapping

Firebase handles authentication and identity, while the application database stores application-specific user and prediction data.

### Authentication Preview

![Customer Churn Intelligence Authentication](images/Authentication.png)

---

## ⚡ FastAPI Backend

The ML models are served through a REST API built with **FastAPI**.

The backend handles:

* Firebase ID-token verification
* Request validation
* Feature preparation
* Churn inference
* Spend inference
* SHAP explanation generation
* Structured JSON responses
* Database interaction
* Customer prediction history

### Core Prediction Endpoints

```text
POST /api/v1/predict
POST /api/v1/predict_spend
POST /api/v1/customer-intelligence
```

### User Endpoint

```text
GET /users/me
```

The `/users/me` endpoint synchronizes the authenticated Firebase user with the application's database.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────────┐
                    │      Web Dashboard        │
                    │       HTML/CSS/JS         │
                    └────────────┬─────────────┘
                                 │
                                 │ Firebase Auth
                                 ▼
                    ┌──────────────────────────┐
                    │   Firebase Authentication │
                    │                            │
                    │ • Email / Password         │
                    │ • Google                   │
                    │ • GitHub                   │
                    │ • Email Verification      │
                    └────────────┬─────────────┘
                                 │
                          Firebase ID Token
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │         FastAPI           │
                    │       REST Backend        │
                    └────────────┬─────────────┘
                                 │
                     Verify Firebase Token
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │   XGBoost    │ │Random Forest │ │     SHAP     │
        │    Churn     │ │    Spend     │ │Explainability│
        │  Classifier  │ │  Regressor   │ │              │
        └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
               │                │                │
               ▼                ▼                ▼
          Churn Risk       90-Day Spend      Key Drivers
               │                │                │
               └────────────────┼────────────────┘
                                ▼
                    ┌──────────────────────────┐
                    │   PostgreSQL Database    │
                    │                          │
                    │ • Users                  │
                    │ • Prediction History     │
                    └──────────────────────────┘
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

| Component        | Technology              | Purpose                                       |
| ---------------- | ----------------------- | --------------------------------------------- |
| Churn Prediction | XGBoost                 | Predict churn probability                     |
| Spend Prediction | Random Forest           | Forecast 90-day customer spend                |
| Explainability   | SHAP                    | Explain individual churn predictions          |
| API              | FastAPI                 | Serve ML models through REST APIs             |
| Authentication   | Firebase Authentication | Manage user identity and authentication       |
| Database         | PostgreSQL / SQLAlchemy | Store application data and prediction history |
| Frontend         | HTML / CSS / JavaScript | Interactive dashboard                         |
| Containerization | Docker / Docker Compose | Reproducible application environment          |
| Deployment       | Render                  | Cloud deployment                              |

---

## 🔄 Request Flow

1. User authenticates through Firebase.
2. Firebase issues an ID token.
3. The frontend sends the token with requests to FastAPI.
4. FastAPI verifies the Firebase ID token using the Firebase Admin SDK.
5. The backend identifies or creates the corresponding application user using the Firebase UID.
6. The user enters customer information through the dashboard.
7. FastAPI validates the request.
8. XGBoost generates the churn probability and risk.
9. Random Forest predicts expected 90-day spend.
10. SHAP generates customer-level feature explanations.
11. The backend combines the results.
12. Prediction information is stored in the database.
13. The dashboard presents the predictions and customer insights.

---

## 🖥️ Dashboard

The dashboard provides a single customer-level view containing:

* Customer information
* Churn probability
* Risk level
* Churn prediction
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

The application exposes its ML functionality through a FastAPI REST backend.

### Authentication

Firebase handles authentication on the frontend.

The frontend obtains a Firebase ID token and sends it to FastAPI using:

```http
Authorization: Bearer <firebase-id-token>
```

FastAPI verifies the token through the **Firebase Admin SDK** before allowing access to protected ML endpoints.

### Main Endpoints

```text
User
GET /users/me

ML Predictions
POST /api/v1/predict
POST /api/v1/predict_spend
POST /api/v1/customer-intelligence
```

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
* Firebase Admin SDK
* PostgreSQL

### Authentication

* Firebase Authentication
* Firebase ID Tokens
* Email Verification
* Google OAuth
* GitHub OAuth

### Frontend

* HTML
* CSS
* JavaScript
* Firebase Web SDK
* Responsive dashboard
* REST API integration

### Deployment & Engineering

* Docker
* Docker Compose
* Git
* GitHub
* Render

---

## 📁 Project Structure

```text
customer-churn-ml-system/
│
├── App/
│   ├── main.py
│   ├── auth.py
│   ├── firebase.py
│   ├── database.py
│   ├── models.py
│   ├── config.py
│   └── routers/
│       ├── users.py
│       └── predictions.py
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
├── alembic/
│   └── versions/
│
├── notebooks/
│   └── ...
│
├── images/
│   └── ...
│
├── Dockerfile
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

The project focuses on more than predictive performance by adding **explainability, customer value estimation, API access, authentication, database integration, and deployment** around the model.

### Spend Regression

The Random Forest model predicts expected customer spending over a **90-day horizon**.

The regression output is exposed through the API and displayed directly in the dashboard.

---

## 🐳 Docker & Deployment

Docker is used to provide reproducible environments for the application.

The deployed system follows this architecture:

```text
Web Dashboard
      │
      │ Firebase Authentication
      ▼
Firebase
      │
      │ Firebase ID Token
      ▼
FastAPI Backend
      │
      ├── Token Verification
      ├── Request Validation
      ├── ML Inference
      └── Database
             │
             ▼
        ML Models
        ├── XGBoost
        ├── Random Forest
        └── SHAP
```

The application is deployed as a cloud-based ML system with the frontend, backend, authentication, database, and model-serving layers working together.

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
* Firebase Authentication
* Email verification
* OAuth authentication
* Firebase Admin SDK
* Database integration
* Frontend-backend communication
* Docker and containerization
* API testing
* Cloud deployment
* Debugging authentication, CORS, database, and deployment issues

One of the biggest lessons was:

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

**XGBoost + Random Forest + SHAP + FastAPI + Firebase Authentication + PostgreSQL + Web Dashboard + Docker**

to create an end-to-end customer intelligence workflow.

> **Predict. Explain. Estimate. Prioritize.**
