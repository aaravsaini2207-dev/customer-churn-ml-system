import streamlit as st
import requests
import pandas as pd
import os

st.set_page_config(page_title = 'Customer Churn AI' , layout = 'wide')


API_URL = "https://customer-churn-api-xhre.onrender.com/predict"


st.title("Customer Churn Prediction")
st.caption("Predict customer churn risk using transactional behavior and an XGBoost machine-learning model.")

st.divider()

st.subheader("Customer Profile")

col1 , col2 , col3 = st.columns(3)

with col1:
    recency = st.number_input("Recency(days): " , min_value = 0, value = 30, step = 1)
    frequency = st.number_input("Frequency(Total Orders): " , min_value = 1, value = 10, step = 1)


with col2:
    monetary = st.number_input("Monetary(Total Revenue): " , min_value = 0.0, value = 1000.0, step = 100.0)
    average_order_value = st.number_input("Average Order Value: " , min_value = 0.0, value = 100.0, step = 10.0)


with col3:
    unique_products = st.number_input("Unique Products: " , min_value = 1, value = 5, step = 1)
    customer_lifetime_days = st.number_input("Customer Lifetime Days: " , min_value = 0, value = 100, step = 1)

st.divider()

if st.button("Analyze Customer", use_container_width = True):
    st.write("Prediction Processing...")

    payload = {
        "recency": recency,
        "frequency": frequency,
        "monetary": monetary,
        "average_order_value": average_order_value,
        "unique_products": unique_products,
        "customer_lifetime_days": customer_lifetime_days
    }

    with st.spinner("Analyzing Customer Behaviour..."):
        try:
            response = requests.post(API_URL , json = payload, timeout = 10)
            response.raise_for_status()
            result = response.json()

        except requests.exceptions.RequestException as e:
            st.error("Unable to connect to the prediction API at the moment.")
            st.code(str(e))
            st.stop()


        probability = result['churn_probability']
        prediction = result['prediction']
        risk = result['risk']
        threshold = result["threshold"]
        recommendation = result["recommendation"]
        shap_explanation = result.get("shap_explanation", [])


        st.divider()

    st.subheader("Prediction Results")

    col1 , col2 , col3 = st.columns(3)

    with col1:
        st.metric("Churn Probability",f"{probability * 100:.2f}%")


    with col2:
        st.metric("Risk Level", risk)


    with col3:
        prediction_text = "Churn" if prediction == 1 else "No Churn"
        st.metric("Prediction" , prediction_text)

    st.write("### Churn Risk Meter")
    st.progress(min(max(probability, 0.0), 1.0))
    st.caption(f"Decision Threshold: {threshold:.2f} ({threshold*100:.0f}%)")

        

    if risk == "High":
        st.error("HIGH churn risk -- immediate retention attention recommended.")
    elif risk == "Medium":
        st.warning("MEDIUM Churn Risk -- customer should be monitored")
    elif risk == "Low":
        st.success("LOW Churn Risk -- customer appears relatively stable")

    st.divider()

    st.subheader("Recommendation System")
    st.info(recommendation)

    st.divider()

    st.subheader("Why did the model make this prediction?")
    st.caption("SHAP values show how each feature influenced this customer's prediction.")

    if shap_explanation:
            # Convert API response to DataFrame
            shap_df = pd.DataFrame(shap_explanation)

            # Sort by absolute impact
            shap_df["abs_impact"] = shap_df["impact"].abs()

            shap_df = shap_df.sort_values(
                "abs_impact",
                ascending=False
            )

            # Display chart
            chart_df = shap_df[
                ["feature", "impact"]
            ].set_index("feature")

            st.bar_chart(
                chart_df,
                horizontal=True,
                x_label="Feature",
                y_label="SHAP impact"
            )
            # feature = item["feature"]
            # value = item["value"]
            # impact = item["impact"]

            # if impact > 0:
            #     direction = "🔴 Increased churn risk"
            # else:
            #     direction = "🟢 Reduced churn risk"

            # col1, col2, col3 = st.columns([2, 1, 3])

            # with col1:
            #     st.write(f"**{feature}**")
            # with col2:
            #     st.write(f"{value:g}")
            # with col3:
            #     st.write(f"{direction} ({impact:+.3f})")
    else:
        st.info("SHAP explanation not available")

    with st.expander("Model Information"):
        st.write("Model: XGBoost")
        st.write("Features used: 6")
        st.write(f"Classification threshold: {threshold:.2f}")
