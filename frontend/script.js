const API_BASE = "https://customer-churn-api-new.onrender.com";

const LOGIN_API = `${API_BASE}/users/login`;
const REGISTER_API = `${API_BASE}/users/`;

const INTELLIGENCE_API = `${API_BASE}/api/v1/customer-intelligence`;

const TOKEN_KEY = "churniq_firebase_token";
const EMAIL_KEY = "churniq_user_email";


/* =========================
   AUTH ELEMENTS
========================= */

const authScreen = document.getElementById("auth-screen");
const appScreen = document.getElementById("app-screen");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const authError = document.getElementById("auth-error");

const authSwitchText = document.getElementById("auth-switch-text");
const authSwitchBtn = document.getElementById("auth-switch-btn");

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");

const logoutBtn = document.getElementById("logout-btn");
const userEmail = document.getElementById("user-email");
const userAvatar = document.getElementById("user-avatar");


/* =========================
   DASHBOARD ELEMENTS
========================= */

const form = document.getElementById("profile-form");
const analyzeBtn = document.getElementById("analyze-btn");
const errorBanner = document.getElementById("error-banner");

const probabilityValue = document.getElementById("probability-value");
const meterFill = document.getElementById("meter-fill");

const probabilityDescription =
  document.getElementById("probability-description");

const riskBadge = document.getElementById("risk-badge");
const riskNote = document.getElementById("risk-note");

const predictionValue = document.getElementById("prediction-value");
const predictionNote = document.getElementById("prediction-note");

const recommendationText =
  document.getElementById("recommendation-text");

const spendValue = document.getElementById("spend-value");
const spendNote = document.getElementById("spend-note");

const shapChart = document.getElementById("shap-chart");


/* =========================
   AUTH STATE
========================= */

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

function saveSession(token, email) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

function showAuth() {
  authScreen.hidden = false;
  appScreen.hidden = true;
}

function showApp() {
  authScreen.hidden = true;
  appScreen.hidden = false;

  const email = getStoredEmail() || "User";

  userEmail.textContent = email;
  userAvatar.textContent = email.charAt(0).toUpperCase();
}

function showAuthError(message) {
  authError.textContent = message;
  authError.hidden = false;
}

function clearAuthError() {
  authError.textContent = "";
  authError.hidden = true;
}


/* =========================
   AUTH MODE SWITCH
========================= */

function showLoginMode() {
  clearAuthError();

  authTitle.textContent = "Welcome back";
  authSubtitle.textContent =
    "Sign in to access your customer intelligence dashboard.";

  loginForm.hidden = false;
  registerForm.hidden = true;

  authSwitchText.textContent = "Don't have an account?";
  authSwitchBtn.textContent = "Create one";
}

function showRegisterMode() {
  clearAuthError();

  authTitle.textContent = "Create your account";
  authSubtitle.textContent =
    "Set up your workspace and start analyzing customer churn.";

  loginForm.hidden = true;
  registerForm.hidden = false;

  authSwitchText.textContent = "Already have an account?";
  authSwitchBtn.textContent = "Sign in";
}

authSwitchBtn.addEventListener("click", function () {
  if (loginForm.hidden) {
    showLoginMode();
  } else {
    showRegisterMode();
  }
});


/* =========================
   LOGIN
========================= */

const auth = window.firebaseAuth;
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} = window.firebaseFunctions;

async function loginUser(event) {
  event.preventDefault();
  clearAuthError();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  loginBtn.disabled = true;
  loginBtn.innerHTML = "Signing in…";

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    if (!user.emailVerified) {
      showAuthError("Please verify your email before logging in.");
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'Sign in <span>→</span>';
      return;
    }

    const token = await user.getIdToken();

    saveSession(token, email);

    loginForm.reset();
    showApp();

  } catch (error) {
    console.error(error);
    showAuthError(error.message || "Unable to sign in.");
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = 'Sign in <span>→</span>';
  }
}


/* =========================
   REGISTER
========================= */

async function registerUser(event) {
  event.preventDefault();
  clearAuthError();

  const email = registerEmail.value.trim();
  const password = registerPassword.value;

  registerBtn.disabled = true;
  registerBtn.innerHTML = "Creating account…";

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await sendEmailVerification(userCredential.user);

    registerForm.reset();

    loginEmail.value = email;

    showLoginMode();

    showAuthError(
      "Account created! Please verify your email before logging in."
    );

    authError.style.color = "#166534";
    authError.style.background = "#f0fdf4";
    authError.style.borderColor = "#bbf7d0";

  } catch (error) {
    console.error(error);
    authError.style.color = "";
    authError.style.background = "";
    authError.style.borderColor = "";

    showAuthError(error.message || "Unable to create account.");
  } finally {
    registerBtn.disabled = false;
    registerBtn.innerHTML = 'Create account <span>→</span>';
  }



/* =========================
   LOGOUT
========================= */

logoutBtn.addEventListener("click", function () {
  clearSession();

  form.reset();

  resetDashboard();

  showLoginMode();
  showAuth();
});


/* =========================
   DASHBOARD HELPERS
========================= */

function numberFrom(name, asInteger) {
  const input = form.elements[name];
  const raw = input.value.trim();

  if (raw === "") {
    throw new Error(
      `Please enter ${input.name.replaceAll("_", " ")}.`
    );
  }

  const value = asInteger
    ? Number.parseInt(raw, 10)
    : Number.parseFloat(raw);

  if (!Number.isFinite(value)) {
    throw new Error(
      "Please enter valid numbers for all customer features."
    );
  }

  if (
    input.min !== "" &&
    value < Number(input.min)
  ) {
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
    average_order_value: numberFrom(
      "average_order_value",
      false
    ),
    unique_products: numberFrom(
      "unique_products",
      true
    ),
    customer_lifetime_days: numberFrom(
      "customer_lifetime_days",
      true
    )
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

  analyzeBtn.innerHTML = isLoading
    ? "<span>Analyzing customer…</span><span>◌</span>"
    : '<span>Analyze customer</span><span class="button-arrow">→</span>';
}

function formatPercent(probability) {
  return (probability * 100).toFixed(2) + "%";
}

function formatSpend(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


/* =========================
   RENDER RESULTS
========================= */

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

  meterFill.style.width =
    `${clamped * 100}%`;

  probabilityDescription.textContent =
    probability >= 0.7
      ? "High probability of customer churn."
      : probability >= 0.4
        ? "Moderate probability of customer churn."
        : "Lower probability of customer churn.";

  riskBadge.className = meta.className;
  riskBadge.textContent = risk;

  riskNote.textContent = meta.note;

  predictionValue.textContent =
    prediction === 1
      ? "Churn"
      : "No Churn";

  predictionNote.textContent =
    Number.isNaN(threshold)
      ? "Decision threshold unavailable"
      : `Decision threshold: ${threshold.toFixed(2)}`;

  recommendationText.textContent =
    result.recommendation ||
    "No recommendation returned.";
}

function renderSpend(result) {
  const amount =
    Number(result.predicted_90_day_spend);

  if (!Number.isFinite(amount)) {
    throw new Error(
      "The spend prediction API did not return a valid amount."
    );
  }

  spendValue.textContent =
    formatSpend(amount);

  spendNote.textContent =
    "Estimated customer spend over the next 90 days.";
}


/* =========================
   SHAP
========================= */

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

  if (
    !Array.isArray(explanation) ||
    explanation.length === 0
  ) {
    const empty = createEl(
      "div",
      "shap-placeholder"
    );

    empty.appendChild(
      createEl(
        "div",
        "placeholder-icon",
        "✦"
      )
    );

    empty.appendChild(
      createEl(
        "strong",
        "",
        "Model explanation unavailable"
      )
    );

    empty.appendChild(
      createEl(
        "span",
        "",
        "No SHAP feature impacts were returned for this prediction."
      )
    );

    shapChart.appendChild(empty);

    return;
  }

  const rows = explanation
    .slice()
    .sort(function (a, b) {
      return (
        Math.abs(Number(b.impact)) -
        Math.abs(Number(a.impact))
      );
    });

  const maxAbs = Math.max.apply(
    null,
    rows.map(function (item) {
      return Math.abs(
        Number(item.impact)
      ) || 0;
    })
  );

  rows.forEach(function (item) {
    const impact = Number(item.impact);
    const increasesRisk = impact > 0;

    const widthPct =
      maxAbs > 0
        ? (Math.abs(impact) / maxAbs) * 78
        : 0;

    const signed =
      (increasesRisk ? "+" : "") +
      impact.toFixed(3);

    const row =
      createEl("div", "shap-row");

    row.appendChild(
      createEl(
        "span",
        "shap-name",
        item.feature || "Feature"
      )
    );

    const plot =
      createEl("div", "shap-plot");

    const left =
      createEl("div", "shap-half shap-half-left");

    const right =
      createEl("div", "shap-half shap-half-right");

    const bar = createEl(
      "span",
      increasesRisk
        ? "shap-bar shap-bar-pos"
        : "shap-bar shap-bar-neg"
    );

    bar.style.width =
      widthPct + "%";

    if (increasesRisk) {
      right.appendChild(bar);
    } else {
      left.appendChild(bar);
    }

    plot.appendChild(left);

    plot.appendChild(
      createEl("div", "shap-axis")
    );

    plot.appendChild(right);

    row.appendChild(plot);

    row.appendChild(
      createEl(
        "span",
        increasesRisk
          ? "shap-score shap-score-pos"
          : "shap-score shap-score-neg",
        signed
      )
    );

    shapChart.appendChild(row);
  });

  shapChart.setAttribute(
    "aria-label",
    "SHAP feature impacts for this prediction"
  );
}


/* =========================
   API
========================= */

async function postJson(
  url,
  payload,
  label
) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },

    body: JSON.stringify(payload)
  });

  if (response.status === 401) {
    clearSession();
    showAuth();

    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  if (!response.ok) {
    let message =
      `The ${label} API returned status ${response.status}.`;

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch (_) {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}


/* =========================
   ANALYSIS
========================= */

async function analyzeCustomer(event) {
  if (event) {
    event.preventDefault();
  }

  clearError();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  let payload;

  try {
    payload = readPayload();
  } catch (error) {
    showError(error.message);
    return;
  }

  setLoading(true);

  try {
    const result = await postJson(
      INTELLIGENCE_API,
      payload,
      "customer intelligence"
    );

    renderResults(result);

    renderShap(
      result.shap_explanation
    );

    renderSpend(result);

  } catch (error) {
    if (error.name === "TypeError") {
      showError(
        "Unable to reach the prediction API. Check your connection or try again."
      );
    } else {
      showError(
        error.message ||
        "Unable to complete this prediction."
      );
    }

  } finally {
    setLoading(false);
  }
}


/* =========================
   RESET
========================= */

function resetDashboard() {
  probabilityValue.textContent = "—";
  meterFill.style.width = "0%";

  probabilityDescription.textContent =
    "Awaiting customer analysis";

  riskBadge.className = "badge";
  riskBadge.textContent = "—";

  riskNote.textContent =
    "Analyze a customer to determine risk.";

  predictionValue.textContent = "—";

  predictionNote.textContent =
    "Decision threshold: —";

  spendValue.textContent = "—";

  spendNote.textContent =
    "Estimated future customer spend.";

  recommendationText.textContent =
    "Analyze a customer to receive a personalized retention recommendation.";

  renderShap([]);
}


/* =========================
   STARTUP
========================= */

loginForm.addEventListener(
  "submit",
  loginUser
);

registerForm.addEventListener(
  "submit",
  registerUser
);

form.addEventListener(
  "submit",
  analyzeCustomer
);

if (getToken() && getStoredEmail()) {
  showApp();
} else {
  showAuth();
}
}
