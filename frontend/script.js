// Production API URL
const API_URL = "https://customer-churn-api-new.onrender.com/predict";
const SPEND_API_URL = "https://customer-churn-api-new.onrender.com/predict_spend";

const form = document.getElementById("profile-form");
const analyzeBtn = document.getElementById("analyze-btn");
const errorBanner = document.getElementById("error-banner");

const probabilityValue = document.getElementById("probability-value");
const meterFill = document.getElementById("meter-fill");
const meter = document.getElementById("probability-meter");
const riskBadge = document.getElementById("risk-badge");
const riskNote = document.getElementById("risk-note");
const predictionValue = document.getElementById("prediction-value");
const predictionNote = document.getElementById("prediction-note");
const recommendationText = document.getElementById("recommendation-text");
const spendValue = document.getElementById("spend-value");
const spendNote = document.getElementById("spend-note");
const shapChart = document.getElementById("shap-chart");
const resultsCaption = document.getElementById("results-caption");
const shapCaption = document.getElementById("shap-caption");

function numberFrom(name, asInteger) {
  const input = form.elements[name];
  const raw = input.value.trim();

  if (raw === "") {
    throw new Error(`Please enter ${input.name.replaceAll("_", " ")}.`);
  }

  const value = asInteger
    ? Number.parseInt(raw, 10)
    : Number.parseFloat(raw);

  if (!Number.isFinite(value)) {
    throw new Error("Please enter valid numbers for all customer features.");
  }

  if (input.min !== "" && value < Number(input.min)) {
    throw new Error(
      `${input.name.replaceAll("_", " ")} must be at least ${input.min}.`
    );
  }

  return value;
}

function readPayload() {
  return {
    recency: numberFrom("recency", true),
    frequency: numberFrom("frequency", true),
    monetary: numberFrom("monetary", false),
    average_order_value: numberFrom("average_order_value", false),
    unique_products: numberFrom("unique_products", true),
    customer_lifetime_days: numberFrom("customer_lifetime_days", true)
  };
}

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.hidden = false;
}

function clearError() {
  errorBanner.hidden = true;
  errorBanner.textContent = "";
}

function setLoading(isLoading) {
  analyzeBtn.disabled = isLoading;
  analyzeBtn.textContent = isLoading ? "Analyzing customer…" : "Analyze Customer";
}

function formatPercent(probability) {
  return (probability * 100).toFixed(2) + "%";
}

function formatSpend(amount, currency) {
  const formatted = Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (!currency) {
    return formatted;
  }

  return currency + " " + formatted;
}

function riskMeta(risk) {
  const value = String(risk || "").toLowerCase();
  if (value === "high") {
    return {
      className: "badge badge-high",
      note: "Immediate retention attention recommended."
    };
  }
  if (value === "low") {
    return {
      className: "badge badge-low",
      note: "Customer appears relatively stable."
    };
  }
  return {
    className: "badge badge-medium",
    note: "Customer should be monitored."
  };
}

function renderResults(result) {
  const probability = Number(result.churn_probability);
  const threshold = Number(result.threshold);
  const prediction = Number(result.prediction);
  const risk = result.risk || "—";
  const clamped = Math.min(Math.max(probability, 0), 1);
  const meta = riskMeta(risk);

  probabilityValue.textContent = formatPercent(probability);
  meterFill.style.width = (clamped * 100) + "%";
  meter.setAttribute("aria-label", "Churn probability " + formatPercent(probability));

  riskBadge.className = meta.className;
  riskBadge.textContent = risk;
  riskNote.textContent = meta.note;

  predictionValue.textContent = prediction === 1 ? "Churn" : "No Churn";
  predictionNote.textContent = Number.isNaN(threshold)
    ? "Decision threshold unavailable"
    : "Decision threshold " + threshold.toFixed(2);

  recommendationText.textContent = result.recommendation || "No recommendation returned.";
  resultsCaption.textContent = "Live prediction from the deployed XGBoost API.";
  shapCaption.textContent =
    "SHAP values from this prediction. Bars to the right increase predicted churn risk; bars to the left reduce it.";
}

function renderSpend(result) {
  const amount = Number(result.predicted_90_day_spend);

  if (!Number.isFinite(amount)) {
    throw new Error("The spend prediction API did not return a valid amount.");
  }

  spendValue.textContent = formatSpend(amount, result.currency);
  spendNote.textContent = "Estimated customer spend over the next 90 days.";
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (text !== undefined) {
    el.textContent = text;
  }
  return el;
}

function renderShap(explanation) {
  shapChart.replaceChildren();

  if (!Array.isArray(explanation) || explanation.length === 0) {
    shapChart.appendChild(
      createEl("p", "shap-empty", "SHAP explanation not available for this prediction.")
    );
    return;
  }

  const rows = explanation.slice().sort(function (a, b) {
    return Math.abs(Number(b.impact)) - Math.abs(Number(a.impact));
  });

  const maxAbs = Math.max.apply(
    null,
    rows.map(function (item) {
      return Math.abs(Number(item.impact)) || 0;
    })
  );

  rows.forEach(function (item) {
    const impact = Number(item.impact);
    const increasesRisk = impact > 0;
    const widthPct = maxAbs > 0 ? (Math.abs(impact) / maxAbs) * 78 : 0;
    const signed = (increasesRisk ? "+" : "") + impact.toFixed(3);

    const row = createEl("div", "shap-row");
    row.appendChild(createEl("span", "shap-name", item.feature || "Feature"));

    const plot = createEl("div", "shap-plot");
    const left = createEl("div", "shap-half shap-half-left");
    const right = createEl("div", "shap-half shap-half-right");
    const bar = createEl(
      "span",
      increasesRisk ? "shap-bar shap-bar-pos" : "shap-bar shap-bar-neg"
    );
    bar.style.width = widthPct + "%";

    if (increasesRisk) {
      right.appendChild(bar);
    } else {
      left.appendChild(bar);
    }

    plot.appendChild(left);
    plot.appendChild(createEl("div", "shap-axis"));
    plot.appendChild(right);
    row.appendChild(plot);
    row.appendChild(
      createEl(
        "span",
        increasesRisk ? "shap-score shap-score-pos" : "shap-score shap-score-neg",
        signed
      )
    );
    shapChart.appendChild(row);
  });

  shapChart.setAttribute("aria-label", "SHAP feature impacts for this prediction");
}

async function postJson(url, payload, label) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let message = `The ${label} API returned status ${response.status}.`;

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch (_) {
      // Keep the default error message if the response isn't JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

async function analyzeCustomer() {
  clearError();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  var payload;
  try {
    payload = readPayload();
  } catch (err) {
    showError(err.message);
    return;
  }

  setLoading(true);

  try {
    const [churnResult, spendResult] = await Promise.all([
      postJson(API_URL, payload, "churn prediction"),
      postJson(SPEND_API_URL, payload, "spend prediction")
    ]);

    renderResults(churnResult);
    renderShap(churnResult.shap_explanation);
    renderSpend(spendResult);
  } catch (err) {
    if (err.name === "TypeError") {
      showError("Unable to reach the prediction API. Check your connection or try again in a moment.");
    } else {
      showError(err.message || "Unable to complete this prediction.");
    }
  } finally {
    setLoading(false);
  }
}

analyzeBtn.addEventListener("click", analyzeCustomer);
form.addEventListener("submit", function (event) {
  event.preventDefault();
  analyzeCustomer();
});
