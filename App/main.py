from fastapi import FastAPI , APIRouter , Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel , Field , ConfigDict
from pathlib import Path
import joblib
import shap
import pandas as pd

from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import User, Prediction

from datetime import datetime

from .routers.predictions import router as prediction_router
from .routers.users import router as user_router

from .auth import get_current_user


# Create FastAPI application
app = FastAPI(
    title= "Retail Customer Churn Prediction API",
    description = "API for predicting customer churn using XGBoost",
    version = "1.0.0"
)  
api_router = APIRouter(prefix="/api/v1")



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
    recency: int = Field(ge=0 , le = 3650 ,  description="Number of days since the customer's last purchase.")
    frequency: int = Field(ge=0 , le=10000 , description="Number of purchases made by the customer.")
    monetary: float = Field(ge=0 , le= 1000000 , description="Total monetary value of customer purchases.")
    average_order_value: float = Field(ge=0 , le=100000 , description="Average value of a customer order.")
    unique_products: int = Field(ge=0 , le=1000 , description="Number of unique products purchased.")
    customer_lifetime_days: int = Field(ge=0 , le=10000 , description="Number of days the customer has been active.")
    model_config = {
        "json_schema_extra": {
            "example": {
                "recency": 30,
                "frequency": 12,
                "monetary": 1500.0,
                "average_order_value": 125.0,
                "unique_products": 8,
                "customer_lifetime_days": 365
            }
        }
    }

class SHAPExplanation(BaseModel):
    feature: str
    value: float
    impact: float

class HealthResponse(BaseModel):
    status: str
    churn_model_loaded: bool
    spend_model_loaded: bool

class PredictionResponse(BaseModel):
    churn_probability: float
    prediction: int
    prediction_label: str
    risk: str
    threshold: float
    recommendation: str
    model: str
    features_used: int
    shap_explanation: list[SHAPExplanation]

    model_config = {
        "json_schema_extra": {
            "example": {
                "churn_probability": 0.5608,
                "prediction": 1,
                "prediction_label": "Churn",
                "risk": "Medium",
                "threshold": 0.4,
                "recommendation": "Increase customer engagement with personalized recommendations or a targeted incentive, and monitor purchase activity closely.",
                "model": "XGBoost",
                "features_used": 6,
                "shap_explanation": [
                    {
                        "feature": "UniqueProducts",
                        "value": 8.0,
                        "impact": 0.47
                    },
                    {
                        "feature": "Recency",
                        "value": 30.0,
                        "impact": -0.29
                    }
                ]
            }
        }
    }

class SpendPredictionResponse(BaseModel):
    predicted_90_day_spend: float
    currency: str
    model: str
    prediction_horizon: str
    features_used: int
    model_config = {
        "json_schema_extra": {
            "example": {
                "predicted_90_day_spend": 372.49,
                "currency": "GBP",
                "model": "RandomForestRegressor",
                "prediction_horizon": "90_days",
                "features_used": 6
            }
        }
    }

class CustomerIntelligenceResponse(BaseModel):
    churn_probability: float
    prediction: int
    prediction_label: str
    risk: str
    threshold: float
    recommendation: str
    predicted_90_day_spend: float
    currency: str
    model_churn: str
    model_spend: str
    features_used: int
    shap_explanation: list[SHAPExplanation]
    model_config = {
        "json_schema_extra": {
            "example": {
                "churn_probability": 0.5608,
                "prediction": 1,
                "prediction_label": "Churn",
                "risk": "Medium",
                "threshold": 0.4,
                "recommendation": "Increase customer engagement with personalized recommendations or a targeted incentive, and monitor purchase activity closely.",
                "predicted_90_day_spend": 372.49,
                "currency": "GBP",
                "model_churn": "XGBoost",
                "model_spend": "RandomForestRegressor",
                "features_used": 6,
                "shap_explanation": [
                    {
                        "feature": "UniqueProducts",
                        "value": 8.0,
                        "impact": 0.47
                    },
                    {
                        "feature": "Recency",
                        "value": 30.0,
                        "impact": -0.29
                    }
                ]
            }
        }
    }

class PredictionHistoryResponse(BaseModel):
    id: int
    recency: int
    frequency: int
    monetary: float
    average_order_value: float
    unique_products: int
    customer_lifetime_days: int

    churn_probability: float
    prediction: int
    prediction_label: str
    risk: str

    predicted_90_day_spend: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Test endpoint
@api_router.get("/")
def home():
    return {'message': "Retail Customer Churn Prediction API is running!"}

@api_router.get("/health" , response_model = HealthResponse , description="Check API Health" , tags=["Health"])
def health():
    return {"status": "healthy", "churn_model_loaded": model is not None, "spend_model_loaded": spend_model is not None}

def run_churn_prediction(customer: CustomerData):
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
    X_customer = pd.DataFrame(features, columns=feature_names)
    shap_values = explainer.shap_values(X_customer)

    if isinstance(shap_values, list):
        customer_shap = shap_values[1][0]
    else:
        customer_shap = shap_values[0]

    shap_explanation = [{
        "feature": feature_names[i],
        "value": float(features[0][i]),
        "impact": float(customer_shap[i])
    } for i in range(len(feature_names))]

    shap_explanation.sort(key=lambda x: abs(x["impact"]), reverse=True)

    prediction = int(probability >= threshold)
    prediction_label = "Churn" if prediction == 1 else "No Churn"

    # Risk classification
    if probability >= 0.65:
        risk = 'High'
        recommendation = "Prioritize immediate retention outreach with a personalized offer.The customer shows elevated churn risk and should be contacted before further purchasing inactivity occurs."
    elif probability >= 0.40:
        risk = 'Medium'
        recommendation = "Increase customer engagement with personalized recommendations or a targeted incentive, and monitor purchase activity closely."
    else:
        risk = 'Low'
        recommendation = "Maintain regular engagement and focus on personalized recommendations and cross-sell opportunities rather than aggressive retention discounts."

    return {
        "churn_probability": round(float(probability), 4),
        "prediction": prediction,
        "prediction_label": prediction_label,
        "risk": risk,
        "threshold": float(threshold),
        "recommendation": recommendation,
        "model": "XGBoost",
        "features_used": 6,
        "shap_explanation": shap_explanation
    }

def run_spend_prediction(customer: CustomerData):
    features = [[
        customer.recency,
        customer.frequency,
        customer.monetary,
        customer.average_order_value,
        customer.unique_products,
        customer.customer_lifetime_days
    ]]

    X_customer = pd.DataFrame(features, columns=spend_features)

    predicted_spend = float(spend_model.predict(X_customer)[0])
    predicted_spend = max(predicted_spend, 0)

    return {
        "predicted_90_day_spend": round(predicted_spend, 2),
        "currency": "GBP",
        "model": "RandomForestRegressor",
        "prediction_horizon": "90_days",
        "features_used": len(spend_features),
    }

@api_router.post(
    "/customer-intelligence",
    response_model=CustomerIntelligenceResponse,
    summary="Get Complete Customer Intelligence",
    tags=["ML Predictions"]
)
def customer_intelligence(
    customer: CustomerData,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    churn_result = run_churn_prediction(customer)
    spend_result = run_spend_prediction(customer)

    prediction = Prediction(
        user_id=current_user.id,
        recency=customer.recency,
        frequency=customer.frequency,
        monetary=customer.monetary,
        average_order_value=customer.average_order_value,
        unique_products=customer.unique_products,
        customer_lifetime_days=customer.customer_lifetime_days,
        churn_probability=churn_result["churn_probability"],
        prediction=churn_result["prediction"],
        prediction_label=churn_result["prediction_label"],
        risk=churn_result["risk"],
        predicted_90_day_spend=spend_result["predicted_90_day_spend"]
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return {
        "churn_probability": churn_result["churn_probability"],
        "prediction": churn_result["prediction"],
        "prediction_label": churn_result["prediction_label"],
        "risk": churn_result["risk"],
        "threshold": churn_result["threshold"],
        "recommendation": churn_result["recommendation"],
        "predicted_90_day_spend": spend_result["predicted_90_day_spend"],
        "currency": spend_result["currency"],
        "model_churn": churn_result["model"],
        "model_spend": spend_result["model"],
        "features_used": churn_result["features_used"],
        "shap_explanation": churn_result["shap_explanation"]
    }





@api_router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predict Customer Churn",
    tags=["ML Predictions"]
)
def predict_churn(customer: CustomerData, current_user=Depends(get_current_user)):
    return run_churn_prediction(customer)


@api_router.post(
    "/predict_spend",
    response_model=SpendPredictionResponse,
    summary="Predict 90-Day Customer Spend",
    tags=["ML Predictions"]
)
def predict_future_spend(customer: CustomerData, current_user=Depends(get_current_user)):
    return run_spend_prediction(customer)



app.include_router(api_router)
app.include_router(prediction_router)
app.include_router(user_router)



