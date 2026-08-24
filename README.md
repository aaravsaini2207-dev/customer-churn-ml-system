\# 🛒 Customer Churn Prediction System



An end-to-end machine learning system that predicts customer churn from transactional purchasing behavior and provides explainable predictions using SHAP.



The project takes a customer from raw transactional behavior to a deployed prediction through SQL-based feature engineering, machine learning, explainability, REST API serving, Streamlit visualization, and Docker containerization.



\---







\## 🎯 Problem Statement



Customer churn is a major business problem in e-commerce.



The goal of this project is to identify customers who are at higher risk of churning so that businesses can prioritize retention and re-engagement efforts.



Instead of producing only a binary prediction, the system provides:



\- Churn probability

\- Risk classification

\- Recommended business action

\- Customer-specific SHAP explanation



\---







\## 🏗️ System Architecture



```text

&#x20;                Transactional Data

&#x20;                       │

&#x20;                       ▼

&#x20;             SQL Data Preparation

&#x20;                       │

&#x20;                       ▼

&#x20;            Customer Feature Engineering

&#x20;                       │

&#x20;                       ▼

&#x20;             Feature Selection

&#x20;                       │

&#x20;                       ▼

&#x20;                XGBoost Model

&#x20;                       │

&#x20;             ┌─────────┴─────────┐

&#x20;             ▼                   ▼

&#x20;       Churn Probability       SHAP

&#x20;             │                   │

&#x20;             └─────────┬─────────┘

&#x20;                       ▼

&#x20;                   FastAPI

&#x20;                       │

&#x20;                       ▼

&#x20;                  Streamlit

&#x20;                       │

&#x20;                       ▼

&#x20;                Docker Compose







🧠 Features



The final model uses six customer-level behavioral features:



Feature	Description

Recency	Days since the customer's last purchase

Frequency	Number of distinct orders

Monetary	Total customer revenue

AverageOrderValue	Average monetary value per order

UniqueProducts	Number of distinct products purchased

CustomerLifetimeDays	Duration between first and last purchase





🤖 Machine Learning



The final model uses XGBoost for binary churn classification.



Model development included:



Customer-level feature engineering

Feature importance analysis

Feature selection experiments

Logistic Regression comparison

XGBoost hyperparameter tuning

Cross-validation

Probability threshold analysis

SHAP explainability





📊 Model Performance

Cross-validation



Best cross-validation ROC-AUC:



0.75228



Test performance

Metric	Score

Accuracy	0.6558

Precision	0.5980

Recall	0.6103

F1 Score	0.6041

ROC-AUC	0.7251



Model performance is evaluated using multiple classification metrics rather than accuracy alone because churn detection involves a trade-off between precision and recall.







🎚️ Threshold Analysis



The model probability threshold was evaluated instead of automatically assuming 0.50.



Example results:



Threshold	Precision	Recall	F1

0.30	0.536	0.866	0.662

0.40	0.551	0.797	0.652

0.45	0.580	0.734	0.648

0.50	0.598	0.610	0.604

0.55	0.628	0.524	0.571

0.60	0.665	0.431	0.523

0.65	0.739	0.283	0.409



The application uses a configurable decision threshold so that the prediction behavior can be aligned with the business objective.







🔍 Explainable AI with SHAP



The application uses SHAP to explain individual predictions.



For each customer, the system identifies how each feature influenced the model's prediction.



Example:



Frequency           → reduces predicted churn

UniqueProducts      → increases predicted churn

Recency             → reduces predicted churn



The Streamlit dashboard displays these contributions as a SHAP impact chart.



SHAP values explain model contribution and should not be interpreted as causal effects.







🚀 FastAPI



The trained model is exposed through a REST API.



Prediction endpoint

POST /predict



Example request:



{

&#x20; "recency": 9,

&#x20; "frequency": 16,

&#x20; "monetary": 2000,

&#x20; "average\_order\_value": 125,

&#x20; "unique\_products": 29,

&#x20; "customer\_lifetime\_days": 67

}



Example response:



{

&#x20; "churn\_probability": 0.1529,

&#x20; "prediction": 0,

&#x20; "risk": "Low",

&#x20; "threshold": 0.4,

&#x20; "recommendation": "...",

&#x20; "model": "XGBoost",

&#x20; "features\_used": 6,

&#x20; "shap\_explanation": \[...]

}

The API also returns SHAP explanations and a business recommendation.



Health endpoint

GET /health





🎨 Streamlit Dashboard



The frontend provides:



Customer feature input

Churn probability

Risk classification

Prediction result

Risk meter

Business recommendation

SHAP explainability visualization





🐳 Docker



The application is containerized using Docker.



The system contains two services:



Streamlit

&#x20;  │

&#x20;  │ HTTP

&#x20;  ▼

FastAPI

&#x20;  │

&#x20;  ▼

XGBoost + SHAP



Docker Compose manages both services.



Run locally

docker compose build

docker compose up -d





Streamlit:



http://localhost:8501



FastAPI documentation:



http://localhost:8000/docs



FastAPI health check:



http://localhost:8000/health



Stop the application:



docker compose down





📁 Project Structure

customer-churn-ml-system/

│

├── App/

│   └── main.py

│

├── Model/

│   ├── churn\_threshold.pkl

│   └── churn\_xgboost\_model.pkl

│

├── Dockerfile

├── Dockerfile.streamlit

├── docker-compose.yml

│

├── requirements.txt

├── requirements-streamlit.txt

├── streamlit\_app.py

│

├── Retail\_Classification.ipynb

├── Retail\_Regression.ipynb

├── Retail\_Store.ipynb

├── Retail\_mind.ipynb

│

└── .gitignore





🛠️ Tech Stack

Python

Pandas

NumPy

Scikit-learn

XGBoost

SHAP

SQL / MySQL

FastAPI

Streamlit

Docker

Docker Compose

Git / GitHub





🔄 End-to-End Workflow

Raw Transactions

&#x20;      ↓

SQL Cleaning

&#x20;      ↓

Customer-Level Aggregation

&#x20;      ↓

RFM + Behavioral Features

&#x20;      ↓

Feature Selection

&#x20;      ↓

Model Training

&#x20;      ↓

XGBoost

&#x20;      ↓

Threshold Optimization

&#x20;      ↓

SHAP Explainability

&#x20;      ↓

FastAPI

&#x20;      ↓

Streamlit

&#x20;      ↓

Docker Compose





🔮 Future Improvements

Cloud deployment

Automated model retraining

Model monitoring

Data drift detection

Authentication for the API

CI/CD pipeline

Database-backed prediction history

Automated retention campaign integration





👨‍💻 Author



Aarav Saini



B.Tech Computer Science Engineering 





⭐ Project Goal



The objective was not only to train a churn classification model, but to build a complete machine learning application around it — from data preparation and modeling to explainability, API serving, frontend visualization, and containerized deployment.





