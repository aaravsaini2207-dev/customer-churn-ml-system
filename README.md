# Customer Churn Intelligence

An end-to-end customer intelligence system that combines **churn prediction, 90-day spend forecasting, SHAP explainability, authentication, persistence, and a web dashboard**.

The project turns customer transaction features into an actionable workflow:

**Predict → Explain → Estimate → Prioritize**

![Dashboard](images/dashboard-new.png)

## What it does

| Capability | Implementation |
|---|---|
| Churn prediction | XGBoost classifier |
| Churn explainability | SHAP TreeExplainer |
| 90-day spend forecast | Random Forest regressor |
| Risk classification | Probability-based Low / Medium / High tiers |
| Retention guidance | Rule-based recommendations |
| Authentication | Firebase Authentication + verified Firebase ID tokens |
| API | FastAPI + Pydantic |
| Persistence | PostgreSQL + SQLAlchemy |
| Migrations | Alembic |
| Frontend | HTML, CSS, JavaScript |
| Deployment | Docker / Docker Compose / Render |
| Testing | pytest + GitHub Actions |

## Product flow

1. A user signs in through Firebase Authentication.
2. Firebase issues an ID token.
3. The frontend sends the token to the FastAPI backend.
4. FastAPI verifies the token with the Firebase Admin SDK.
5. Customer behaviour is validated and passed to the ML models.
6. XGBoost produces churn probability and a churn decision.
7. SHAP generates customer-level feature contributions.
8. Random Forest estimates 90-day spend.
9. The backend combines the outputs into a customer intelligence response.
10. The prediction is stored in PostgreSQL.
11. The dashboard presents the result and retention guidance.

## Screenshots

### Authentication

![Authentication](images/Authentication.png)

### Customer intelligence dashboard

![Dashboard](images/dashboard-new.png)

## Architecture

```text
                         ┌──────────────────────┐
                         │   Web Dashboard      │
                         │   HTML/CSS/JS        │
                         └──────────┬───────────┘
                                    │
                             Firebase Auth
                                    │
                              ID Token
                                    ▼
                         ┌──────────────────────┐
                         │       FastAPI        │
                         │    REST Backend      │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
        ┌────────────┐       ┌────────────┐       ┌────────────┐
        │  XGBoost   │       │  Random    │       │    SHAP    │
        │   Churn    │       │   Forest   │       │ Explain-   │
        │ Prediction │       │ 90-Day     │       │ ability    │
        │            │       │ Spend      │       │            │
        └─────┬──────┘       └─────┬──────┘       └─────┬──────┘
              └─────────────────────┼─────────────────────┘
                                    ▼
                         ┌──────────────────────┐
                         │     PostgreSQL       │
                         │ Users + Predictions  │
                         └──────────────────────┘
```

## Machine learning

### Churn model

The churn pipeline uses six customer-level behavioural features:

- Recency
- Frequency
- Monetary value
- Average order value
- Unique products
- Customer lifetime days

The current XGBoost classifier uses a tuned decision threshold rather than assuming the default 0.50 cutoff.

Reported evaluation:

| Metric | Result |
|---|---:|
| Cross-validation ROC-AUC | **0.7523** |
| Test ROC-AUC | **0.7251** |
| Test accuracy | **65.58%** |
| Test precision | **59.80%** |

These are offline evaluation results; they should not be interpreted as production performance.

### 90-day spend model

A Random Forest regressor estimates expected customer spend over the next 90 days.

The API exposes the forecast together with the model name, prediction horizon, currency, and number of features used.

> Regression evaluation metrics are intentionally not listed here until the training/evaluation notebook is treated as the single source of truth.

### Explainability

SHAP is used to generate local feature contributions for individual churn predictions. The dashboard surfaces the strongest contributing features so the prediction is not treated as a black box.

## Authentication and security

The application uses Firebase Authentication for identity and Firebase Admin SDK for backend token verification.

Implemented flow:

- Email/password registration
- Email verification
- Google sign-in
- Firebase ID tokens
- Protected FastAPI prediction endpoints
- Firebase UID to application-user mapping
- PostgreSQL-backed user and prediction records

The Firebase service-account credential is supplied through an environment variable and is not committed to the repository.

## API

FastAPI exposes the core ML workflow under `/api/v1`.

### Main endpoints

```text
GET  /api/v1/health
POST /api/v1/predict
POST /api/v1/predict_spend
POST /api/v1/customer-intelligence
GET  /users/me
POST /users/
POST /users/login
```

Interactive API documentation is available from FastAPI at:

```text
http://localhost:8000/docs
```

The main customer intelligence endpoint combines churn prediction, spend forecasting, SHAP explanations, and database persistence in one request.

## Repository structure

```text
customer-churn-ml-system/
├── App/
│   ├── main.py
│   ├── auth.py
│   ├── firebase.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── exceptions.py
│   ├── logging_config.py
│   └── routers/
├── Model/
│   ├── churn_xgboost_model.pkl
│   ├── churn_threshold.pkl
│   ├── future_spend_model.pkl
│   └── future_spend_features.pkl
├── frontend/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── Dockerfile
├── alembic/
│   └── versions/
├── images/
├── tests/
├── notebooks/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md
```

## Run with Docker

### 1. Clone the repository

```bash
git clone https://github.com/aaravsaini2207-dev/customer-churn-ml-system.git
cd customer-churn-ml-system
```

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

Then provide your PostgreSQL credentials and Firebase service-account JSON.

### 3. Start the stack

```bash
docker compose up --build
```

Services:

| Service | Local address |
|---|---|
| Frontend | http://localhost:8501 |
| FastAPI | http://localhost:8000 |
| Swagger docs | http://localhost:8000/docs |
| PostgreSQL | localhost:2207 |

The browser frontend automatically uses the local API when opened on localhost.

## Run tests

The repository uses pytest for backend tests:

```bash
python -m pytest -v
```

GitHub Actions runs the test suite on pushes and pull requests to `main`.

## Model artifacts

The trained model files are tracked with **Git LFS** because the spend model is substantially larger than a normal source file.

After cloning, make sure Git LFS is installed and pull the tracked artifacts:

```bash
git lfs install
git lfs pull
```

## Engineering highlights

- Designed an authenticated ML inference API instead of exposing model code directly to the frontend.
- Added Firebase ID-token verification at the backend boundary.
- Persisted user-linked prediction history in PostgreSQL.
- Added Alembic database migrations.
- Combined two predictive models and local SHAP explanations into one customer intelligence endpoint.
- Added Dockerized API, database, and static frontend services.
- Added automated backend tests through GitHub Actions.
- Added input validation and structured API responses with Pydantic.
- Added inference logging and model-version identifiers.

## Limitations

- The churn model is evaluated offline and may not generalize to a different customer population.
- The 90-day spend forecast depends on the behavioural features available at prediction time.
- Production model monitoring and drift detection are not yet implemented.
- Retention recommendations are rule-based; they are not learned from observed campaign-treatment outcomes.
- The system is a decision-support application, not an automated retention decision engine.

## Future work

- Production model monitoring and drift detection
- Automated retraining pipeline
- Batch prediction
- Customer segmentation
- Cost-sensitive retention optimization
- Better regression evaluation and calibration
- Experiment-driven retention recommendations

## Author

**Aarav Saini**  
B.Tech — Information Technology / CSE

Machine Learning • Data Science • Backend Engineering • Explainable AI
