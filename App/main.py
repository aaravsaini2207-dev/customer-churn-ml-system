from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import joblib
import shap
import pandas as pd

# Create FastAPI application
app = FastAPI(
    title= "Retail Customer Churn Prediction API",
    description = "API for predicting customer churn using XGBoost",
    version = "1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://retail-churn-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Load trained model

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "Model" / "churn_xgboost_model.pkl"
THRESHOLD_PATH = BASE_DIR / "Model" / "churn_threshold.pkl"

try:
    model = joblib.load(MODEL_PATH)
    threshold = joblib.load(THRESHOLD_PATH)
except FileNotFoundError as e:
    raise RuntimeError(f"Model files not found at {BASE_DIR / 'Model'}: {e}")

SPEND_MODEL_PATH = BASE_DIR / "Model" / "future_spend_model.pkl"
SPEND_FEATURE_PATH = BASE_DIR / "Model" / "future_spend_features.pkl"

try:
    spend_model = joblib.load(SPEND_MODEL_PATH)
    spend_features = joblib.load(SPEND_FEATURE_PATH)
except FileNotFoundError as e:
    raise RuntimeError(f"Spend model files not found at {BASE_DIR / 'Model'}: {e}")

explainer = shap.TreeExplainer(model)

# Input data structure
class CustomerData(BaseModel):
    recency: int
    frequency: int
    monetary: float
    average_order_value: float
    unique_products: int
    customer_lifetime_days: int

# Test endpoint
@app.get("/")
def home():
    return {'message': "Retail Churn Prediction API is running!"}

@app.get("/health")
def health():
    return {"status": "healthy", "model": {"churn":"XGBoost" , "future_spend":"Random Forest"}, "features": 6}

# Prediction endpoint
@app.post("/predict")
def predict_churn(customer: CustomerData):
    features = [[
        customer.recency,
        customer.frequency,
        customer.monetary,
        customer.average_order_value,
        customer.unique_products,
        customer.customer_lifetime_days
    ]]

    # Get churn probability & Apply our chosen threshold
    probability = float(model.predict_proba(features)[0][1])

    feature_names = ["Recency", "Frequency", "Monetary", "AverageOrderValue", "UniqueProducts", "CustomerLifetimeDays"]
    X_customer = pd.DataFrame(features , columns = feature_names)
    shap_values = explainer.shap_values(X_customer)

    if isinstance(shap_values , list):
        customer_shap =  shap_values[1][0]
    else:
        customer_shap = shap_values[0]

    shap_explanation = [{"feature": feature_names[i],
                        "value": float(features[0][i]),
                        "impact": float(customer_shap[i])}
                        for i in range(len(feature_names))]
    shap_explanation.sort(
    key=lambda x: abs(x["impact"]),
    reverse=True)


    prediction = int(probability >= threshold)

    # Risk classification
    if probability >= 0.65:
        risk = 'High'
        recommendation = "Prioritize this customer for a retention campaign and personalized re-engagement"
    elif probability >= 0.40:
        risk = 'Medium'
        recommendation = "Monitor purchasing activity and consider a personalized offer."
    else:
        risk = 'Low'
        recommendation = "Customer appears relatively stable. Continue normal engagement."

    return {
        "churn_probability": round(float(probability), 4),
        "prediction": prediction,
        "risk": risk,
        "threshold": float(threshold),
        "recommendation": recommendation,
        "model": "XGBoost",
        "features_used": 6,
        "shap_explanation": shap_explanation
    }

@app.post("/predict_spend")
def predict_future_spend(customer : CustomerData):
    features = [[
        customer.recency,
        customer.frequency,
        customer.monetary,
        customer.average_order_value,
        customer.unique_products,
        customer.customer_lifetime_days]]

    X_customer = pd.DataFrame(features , columns = spend_features)

    predicted_spend = float(spend_model.predict(X_customer)[0])     #spend_model.predict(X_customer) does prediction ,[0] picks first value
    predicted_spend = max(predicted_spend , 0)                  #insures data is always greater than 0 if negative then 0 replaces it

    return{
        "predicted_90_day_spend": round(predicted_spend , 2),
        "currency" : "GBP" , 
        "model": "RandomForestRegressor",
        "prediction_horizon" : "90_days",
        "features_used" : len(spend_features)
    }