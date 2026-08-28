# 🛒 Retail Customer Churn Prediction System

An end-to-end machine learning system for predicting customer churn from transactional purchasing behavior, with explainable predictions using SHAP.

The project covers the complete ML lifecycle:

**Data Preparation → Feature Engineering → Model Training → Evaluation → Explainability → REST API → Web Frontend → Docker → Cloud Deployment**

---

## 🌐 Live Application

### 🎨 Live Customer Churn Dashboard

👉 **Live Application:**  
https://retail-churn-frontend.onrender.com/

### ⚡ FastAPI Backend

👉 **API:**  
https://customer-churn-api-new.onrender.com/

### 📚 Interactive API Documentation

👉 **Swagger UI:**  
https://customer-churn-api-new.onrender.com/docs

---

# 🎯 Problem Statement

Customer churn is a major business problem in e-commerce.

The goal of this project is to identify customers who are at higher risk of churning so businesses can prioritize retention and re-engagement efforts.

Instead of producing only a binary prediction, the system provides:

- Churn probability
- Binary churn prediction
- Low / Medium / High risk classification
- Business recommendation
- Customer-specific SHAP explanation

---

# 🏗️ Production Architecture

```text
                    User
                     │
                     ▼
          ┌─────────────────────┐
          │   Web Frontend      │
          │      Render         │
          └──────────┬──────────┘
                     │
                     │ POST /predict
                     ▼
          ┌─────────────────────┐
          │      FastAPI        │
          │      Render         │
          └──────────┬──────────┘
                     │
              ┌──────┴──────┐
              ▼             ▼
        ┌──────────┐   ┌──────────┐
        │ XGBoost  │   │   SHAP   │
        │  Model   │   │Explainer │
        └────┬─────┘   └────┬─────┘
             │              │
             └──────┬───────┘
                    ▼
          Prediction + Explanation
                    │
                    ▼
                Web UI

🧠 Features
The final model uses six customer-level behavioral features:

Feature	Description
Recency	Days since the customer's last purchase
Frequency	Number of distinct orders
Monetary	Total customer revenue
AverageOrderValue	Average monetary value per order
UniqueProducts	Number of distinct products purchased
CustomerLifetimeDays	Duration between first and last purchase

These features capture customer purchasing behavior and provide meaningful signals for identifying potential churn.

🤖 Machine Learning
The final model uses XGBoost for binary churn classification.

Model development included:

Customer-level feature engineering
Feature selection
Feature importance analysis
Logistic Regression comparison
XGBoost hyperparameter tuning
Cross-validation
Probability threshold analysis
SHAP explainability
📊 Model Performance
Cross-Validation
Best Cross-Validation ROC-AUC:

0.75228

Test Performance
Metric	Score
Accuracy	0.6558
Precision	0.5980
Recall	0.6103
F1 Score	0.6041
ROC-AUC	0.7251

Multiple evaluation metrics are reported because churn prediction involves a trade-off between precision and recall.

🎚️ Threshold Analysis
The classification threshold was evaluated instead of automatically assuming 0.50.

Threshold	Precision	Recall	F1
0.30	0.536	0.866	0.662
0.40	0.551	0.797	0.652
0.45	0.580	0.734	0.648
0.50	0.598	0.610	0.604
0.55	0.628	0.524	0.571
0.60	0.665	0.431	0.523
0.65	0.739	0.283	0.409

The deployed API uses a configurable decision threshold loaded from the trained model artifacts.

🔍 Explainable AI with SHAP
The application uses SHAP (SHapley Additive exPlanations) to explain individual predictions.

For each customer, the system calculates the contribution of each feature to the model's prediction.

Example:

Frequency       → contributes toward lower churn
Recency         → contributes toward higher/lower churn
UniqueProducts  → contributes toward higher/lower churn

The dashboard visualizes the most influential features for each prediction.

Important: SHAP values explain model behavior. They should not be interpreted as causal effects.

🚀 FastAPI
The trained model is exposed through a REST API built using FastAPI.

Prediction Endpoint
POST /predict

Example Request
{
  "recency": 9,
  "frequency": 16,
  "monetary": 2000,
  "average_order_value": 125,
  "unique_products": 29,
  "customer_lifetime_days": 67
}

Response
The API returns:

Churn probability
Binary prediction
Risk classification
Decision threshold
Business recommendation
Model information
Number of features used
SHAP feature contributions
Health Endpoint
GET /health

🎨 Web Dashboard
The frontend provides an interactive interface for customer churn prediction.

Features
Customer feature input
Churn probability
Risk classification
Prediction result
Risk indicator
Business recommendation
SHAP explainability visualization
Live Application
👉 https://retail-churn-frontend.onrender.com/

🐳 Docker
The FastAPI backend is containerized using Docker.

Docker Image
docker.io/aaravsaini2207/retail-churn-api:latest

Run Locally
Build the containers:

docker compose build

Start the application:

docker compose up -d

FastAPI:

http://localhost:8000

Swagger:

http://localhost:8000/docs

Health Check:

http://localhost:8000/health

Stop:

docker compose down

☁️ Cloud Deployment
The production system is deployed using Render.

Frontend
Web Frontend
      ↓
Render

Backend
FastAPI
   ↓
Render
   ↓
XGBoost + SHAP

The frontend communicates with the backend through:

POST /predict

📁 Project Structure
customer-churn-ml-system/
│
├── App/
│   └── main.py
│
├── Model/
│   ├── churn_threshold.pkl
│   └── churn_xgboost_model.pkl
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── images/
│   ├── dashboard.png
│   ├── Low_risk.png
│   └── High_risk.png
|
│
├── Dockerfile
├── Dockerfile.streamlit
├── docker-compose.yml
│
├── requirements.txt
├── requirements-streamlit.txt
│
├── streamlit_app.py
│
├── Retail_Classification.ipynb
├── Retail_Regression.ipynb
├── Retail_Store.ipynb
├── Retail_mind.ipynb
│
└── .gitignore

🛠️ Tech Stack
Technology	Purpose
Python	Programming language
Pandas	Data processing
NumPy	Numerical computation
Scikit-learn	ML utilities
XGBoost	Churn classification
SHAP	Model explainability
SQL / MySQL	Data preparation & feature engineering
FastAPI	REST API
HTML / CSS / JavaScript	Web frontend
Streamlit	Local/experimental dashboard
Docker	Containerization
Docker Compose	Local orchestration
Render	Cloud deployment
Git / GitHub	Version control

🔄 End-to-End Workflow
Raw Transactions
       ↓
SQL Cleaning
       ↓
Customer-Level Aggregation
       ↓
RFM + Behavioral Features
       ↓
Feature Selection
       ↓
XGBoost Training
       ↓
Model Evaluation
       ↓
Threshold Optimization
       ↓
SHAP Explainability
       ↓
FastAPI
       ↓
Docker
       ↓
Render
       ↓
Web Frontend
       ↓
End User

🔮 Future Improvements
Potential improvements include:

Automated model retraining
Model monitoring
Data drift detection
API authentication and authorization
CI/CD pipeline
Database-backed prediction history
Automated retention campaign integration
Improved probability calibration
Experiment tracking
Production monitoring and logging
👨‍💻 Author
Aarav Saini

B.Tech — Computer Science Engineering

GitHub: aaravsaini2207-dev

⭐ Project Goal
The objective of this project was not only to train a churn classification model, but to build a complete machine learning application around it.

The project demonstrates the journey from:

Data Preparation
      ↓
Feature Engineering
      ↓
Machine Learning
      ↓
Model Evaluation
      ↓
Threshold Optimization
      ↓
SHAP Explainability
      ↓
REST API
      ↓
Docker
      ↓
Cloud Deployment
      ↓
Interactive Web Application

This project demonstrates how a machine learning model can be taken from experimentation to a deployed, explainable, end-to-end ML application.

⭐ If you found this project useful, consider giving the repository a star!
