from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from .database import Base
from datetime import datetime
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    predictions = relationship("Prediction", back_populates = "user", cascade = "all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="predictions")

    recency = Column(Integer)
    frequency = Column(Integer)
    monetary = Column(Float)
    average_order_value = Column(Float)
    unique_products = Column(Integer)
    customer_lifetime_days = Column(Integer)

    churn_probability = Column(Float)
    prediction = Column(Integer)
    prediction_label = Column(String)
    risk = Column(String)

    predicted_90_day_spend = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)
