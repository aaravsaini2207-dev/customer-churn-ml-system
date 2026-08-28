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

MODEL_PATH = BASE_DIR / "model" / "churn_xgboost_model.pkl"
THRESHOLD_PATH = BASE_DIR / "model" / "churn_threshold.pkl"

model = joblib.load(MODEL_PATH)
threshold = joblib.load(THRESHOLD_PATH)

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
    return {"status": "healthy", "model": "XGBoost", "features": 6}

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
