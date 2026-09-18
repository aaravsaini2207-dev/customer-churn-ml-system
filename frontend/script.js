const API_BASE =
  "https://customer-churn-api-new.onrender.com";


const LOGIN_API =
  `${API_BASE}/users/login`;

const REGISTER_API =
  `${API_BASE}/users/`;

const INTELLIGENCE_API =
  `${API_BASE}/api/v1/customer-intelligence`;


const TOKEN_KEY =
  "churniq_firebase_token";

const EMAIL_KEY =
  "churniq_user_email";


/* =====================================================
   AUTH ELEMENTS
   ===================================================== */

const authScreen =
  document.getElementById("auth-screen");

const appScreen =
  document.getElementById("app-screen");


const loginForm =
  document.getElementById("login-form");

const registerForm =
  document.getElementById("register-form");


const authTitle =
  document.getElementById("auth-title");

const authSubtitle =
  document.getElementById("auth-subtitle");

const authError =
  document.getElementById("auth-error");


const authSwitchText =
  document.getElementById("auth-switch-text");

const authSwitchBtn =
  document.getElementById("auth-switch-btn");


const loginBtn =
  document.getElementById("login-btn");

const registerBtn =
  document.getElementById("register-btn");


const loginEmail =
  document.getElementById("login-email");

const loginPassword =
  document.getElementById("login-password");


const registerEmail =
  document.getElementById("register-email");

const registerPassword =
  document.getElementById("register-password");


const googleLoginBtn =
  document.getElementById("google-login-btn");


const logoutBtn =
  document.getElementById("logout-btn");

const userEmail =
  document.getElementById("user-email");

const userAvatar =
  document.getElementById("user-avatar");


/* =====================================================
   DASHBOARD ELEMENTS
   ===================================================== */

const form =
  document.getElementById("profile-form");

const analyzeBtn =
  document.getElementById("analyze-btn");

const errorBanner =
  document.getElementById("error-banner");


const probabilityValue =
  document.getElementById("probability-value");

const meterFill =
  document.getElementById("meter-fill");


const probabilityDescription =
  document.getElementById(
    "probability-description"
  );


const riskBadge =
  document.getElementById("risk-badge");

const riskNote =
  document.getElementById("risk-note");


const predictionValue =
  document.getElementById("prediction-value");

const predictionNote =
  document.getElementById("prediction-note");


const recommendationText =
  document.getElementById(
    "recommendation-text"
  );


const spendValue =
  document.getElementById("spend-value");

const spendNote =
  document.getElementById("spend-note");


const shapChart =
  document.getElementById("shap-chart");


/* =====================================================
   AUTH STATE
   ===================================================== */

function getToken() {

  return localStorage.getItem(
    TOKEN_KEY
  );

}


function getStoredEmail() {

  return localStorage.getItem(
    EMAIL_KEY
  );

}


function saveSession(
  token,
  email
) {

  localStorage.setItem(
    TOKEN_KEY,
    token
  );

  localStorage.setItem(
    EMAIL_KEY,
    email
  );

}


function clearSession() {

  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    EMAIL_KEY
  );

}


function showAuth() {

  authScreen.hidden = false;

  appScreen.hidden = true;

}


function showApp() {

  authScreen.hidden = true;

  appScreen.hidden = false;


  const email =
    getStoredEmail() || "User";


  userEmail.textContent =
    email;


  userAvatar.textContent =
    email.charAt(0).toUpperCase();

}


function showAuthError(message) {

  authError.textContent =
    message;

  authError.hidden =
    false;

}


function clearAuthError() {

  authError.textContent =
    "";

  authError.hidden =
    true;


  authError.style.color =
    "";

  authError.style.background =
    "";

  authError.style.borderColor =
    "";

}


/* =====================================================
   AUTH MODE SWITCH
   ===================================================== */

function showLoginMode() {

  clearAuthError();


  authTitle.textContent =
    "Welcome back";


  authSubtitle.textContent =
    "Sign in to access your customer intelligence dashboard.";


  loginForm.hidden =
    false;

  registerForm.hidden =
    true;


  authSwitchText.textContent =
    "Don't have an account?";


  authSwitchBtn.textContent =
    "Create one";

}


function showRegisterMode() {

  clearAuthError();


  authTitle.textContent =
    "Create your account";


  authSubtitle.textContent =
    "Set up your workspace and start analyzing customer churn.";


  loginForm.hidden =
    true;

  registerForm.hidden =
    false;


  authSwitchText.textContent =
    "Already have an account?";


  authSwitchBtn.textContent =
    "Sign in";

}


authSwitchBtn.addEventListener(
  "click",
  function () {

    if (loginForm.hidden) {

      showLoginMode();

    } else {

      showRegisterMode();

    }

  }
);


/* =====================================================
   FIREBASE ERROR MESSAGES
   ===================================================== */

function firebaseErrorMessage(error) {

  const code =
    error?.code || "";


  switch (code) {

    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/invalid-login-credentials":
      return "Incorrect email or password.";

    case "auth/user-not-found":
      return "No account exists with this email.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/email-already-in-use":
      return "An account already exists with this email. Please sign in.";

    case "auth/weak-password":
      return "Password should be at least 6 characters.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";

    case "auth/popup-blocked":
      return "The sign-in popup was blocked by your browser.";

    case "auth/unauthorized-domain":
      return "This website is not authorized for Google sign-in. Add your Render domain to Firebase Authorized domains.";

    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using another sign-in method.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    default:
      return (
        error?.message ||
        "Something went wrong. Please try again."
      );

  }

}


/* =====================================================
   LOGIN
   ===================================================== */

async function loginUser(event) {

  event.preventDefault();

  clearAuthError();


  const auth =
    window.firebaseAuth;


  const {
    signInWithEmailAndPassword,
    reload
  } =
    window.firebaseFunctions;


  if (!auth || !window.firebaseFunctions) {

    showAuthError(
      "Firebase is still loading. Please try again."
    );

    return;

  }


  const email =
    loginEmail.value.trim();

  const password =
    loginPassword.value;


  loginBtn.disabled =
    true;

  loginBtn.innerHTML =
    "Signing in…";


  try {

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      userCredential.user;


    /*
     * Refresh Firebase user information.
     * This makes sure emailVerified is current.
     */

    await reload(user);


    if (!user.emailVerified) {

      showAuthError(
        "Please verify your email before logging in. Check your inbox."
      );

      loginBtn.disabled =
        false;

      loginBtn.innerHTML =
        'Sign in <span>→</span>';

      return;

    }


    /*
     * Get Firebase ID token.
     * This token is sent to FastAPI.
     */

    const token =
      await user.getIdToken(true);


    saveSession(
      token,
      user.email || email
    );


    loginForm.reset();


    showApp();


  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    showAuthError(
      firebaseErrorMessage(error)
    );


  } finally {

    loginBtn.disabled =
      false;

    loginBtn.innerHTML =
      'Sign in <span>→</span>';

  }

}


/* =====================================================
   REGISTER
   ===================================================== */

async function registerUser(event) {

  event.preventDefault();

  clearAuthError();


  const auth =
    window.firebaseAuth;


  const {
    createUserWithEmailAndPassword,
    sendEmailVerification
  } =
    window.firebaseFunctions;


  if (!auth || !window.firebaseFunctions) {

    showAuthError(
      "Firebase is still loading. Please try again."
    );

    return;

  }


  const email =
    registerEmail.value.trim();

  const password =
    registerPassword.value;


  registerBtn.disabled =
    true;

  registerBtn.innerHTML =
    "Creating account…";


  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      userCredential.user;


    /*
     * Send verification email.
     */

    await sendEmailVerification(
      user
    );


    registerForm.reset();


    loginEmail.value =
      email;


    showLoginMode();


    showAuthError(
      "Account created! Please verify your email before logging in."
    );


    authError.style.color =
      "#166534";

    authError.style.background =
      "#f0fdf4";

    authError.style.borderColor =
      "#bbf7d0";


  } catch (error) {

    console.error(
      "Registration error:",
      error
    );


    showAuthError(
      firebaseErrorMessage(error)
    );


  } finally {

    registerBtn.disabled =
      false;

    registerBtn.innerHTML =
      'Create account <span>→</span>';

  }

}


/* =====================================================
   GOOGLE LOGIN
   ===================================================== */

async function loginWithGoogle() {

  clearAuthError();


  const auth =
    window.firebaseAuth;


  const {
    GoogleAuthProvider,
    signInWithPopup
  } =
    window.firebaseFunctions;


  if (!auth || !window.firebaseFunctions) {

    showAuthError(
      "Firebase is still loading. Please try again."
    );

    return;

  }


  googleLoginBtn.disabled =
    true;


  googleLoginBtn.innerHTML = `
    <span>Signing in with Google…</span>
  `;


  try {

    /*
     * Create Google provider.
     */

    const provider =
      new GoogleAuthProvider();


    /*
     * Open Google sign-in popup.
     */

    const result =
      await signInWithPopup(
        auth,
        provider
      );


    const user =
      result.user;


    /*
     * Google accounts are normally already
     * email verified.
     */

    const token =
      await user.getIdToken(true);


    saveSession(
      token,
      user.email || "Google User"
    );


    showApp();


  } catch (error) {

    console.error(
      "Google login error:",
      error
    );


    showAuthError(
      firebaseErrorMessage(error)
    );


  } finally {

    googleLoginBtn.disabled =
      false;


    googleLoginBtn.innerHTML = `

      <svg
        class="google-logo"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
      >

        <path
          fill="#4285F4"
          d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
        />

        <path
          fill="#34A853"
          d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.04H3.28v2.52A9.75 9.75 0 0 0 12 21.5Z"
        />

        <path
          fill="#FBBC05"
          d="M6.53 13.58A5.86 5.86 0 0 1 6.22 12c0-.55.11-1.09.31-1.58V7.9H3.28A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.1l3.25-2.52Z"
        />

        <path
          fill="#EA4335"
          d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.48 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.72 5.4l3.25 2.52C7.3 8.1 9.46 6.38 12 6.38Z"
        />

      </svg>

      <span>Continue with Google</span>
    `;

  }

}


googleLoginBtn.addEventListener(
  "click",
  loginWithGoogle
);


/* =====================================================
   GITHUB LOGIN
   ===================================================== */

const githubLoginBtn =
  document.getElementById("github-login-btn");


async function loginWithGithub() {

  clearAuthError();

  const auth =
    window.firebaseAuth;

  const {
    GithubAuthProvider,
    signInWithPopup
  } =
    window.firebaseFunctions;

  githubLoginBtn.disabled = true;

  githubLoginBtn.innerHTML =
    "<span>Signing in with GitHub…</span>";

  try {

    const provider =
      new GithubAuthProvider();

    const result =
      await signInWithPopup(
        auth,
        provider
      );

    const user =
      result.user;

    const token =
      await user.getIdToken(true);

    saveSession(
      token,
      user.email || "GitHub User"
    );

    showApp();

  } catch (error) {

    console.error(
      "GitHub login error:",
      error
    );

    showAuthError(
      firebaseErrorMessage(error)
    );

  } finally {

    githubLoginBtn.disabled =
      false;

    githubLoginBtn.innerHTML = `

      <svg
        class="github-logo"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M12 2C6.48 2 2 6.58 2 12.26c0 4.54 2.87 8.39 6.84 9.74.5.1.68-.22.68-.49v-1.72c-2.78.62-3.37-1.38-3.37-1.38-.45-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.64-1.38-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.18 9.18 0 0 1 12 6.2c.85 0 1.7.12 2.5.36 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9v2.57c0 .27.18.6.69.49A10.27 10.27 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
        />
      </svg>

      <span>Continue with GitHub</span>

    `;

  }
}


githubLoginBtn.addEventListener(
  "click",
  loginWithGithub
);


/* =====================================================
   LOGOUT
   ===================================================== */

logoutBtn.addEventListener(
  "click",
  function () {

    clearSession();

    form.reset();

    resetDashboard();

    showLoginMode();

    showAuth();

  }
);


/* =====================================================
   PASSWORD VISIBILITY
   ===================================================== */

const passwordToggleButtons =
  document.querySelectorAll(
    ".password-toggle"
  );


passwordToggleButtons.forEach(
  function (button) {

    const target =
      document.getElementById(
        button.dataset.target
      );


    const openIcon =
      button.querySelector(
        ".eye-open"
      );


    const closedIcon =
      button.querySelector(
        ".eye-closed"
      );


    let hideTimer =
      null;


    button.addEventListener(
      "click",
      function () {

        if (!target) {
          return;
        }


        clearTimeout(
          hideTimer
        );


        const shouldShow =
          target.type === "password";


        target.type =
          shouldShow
            ? "text"
            : "password";


        openIcon.hidden =
          !shouldShow;

        closedIcon.hidden =
          shouldShow;


        button.setAttribute(
          "aria-label",
          shouldShow
            ? "Hide password"
            : "Show password"
        );


        button.setAttribute(
          "title",
          shouldShow
            ? "Hide password"
            : "Show password"
        );


        /*
         * Automatically hide password
         * after 3 seconds.
         */

        if (shouldShow) {

          hideTimer =
            setTimeout(
              function () {

                target.type =
                  "password";


                openIcon.hidden =
                  false;


                closedIcon.hidden =
                  true;


                button.setAttribute(
                  "aria-label",
                  "Show password"
                );


                button.setAttribute(
                  "title",
                  "Show password"
                );

              },
              3000
            );

        }

      }
    );

  }
);


/* =====================================================
   DASHBOARD HELPERS
   ===================================================== */

function numberFrom(
  name,
  asInteger
) {

  const input =
    form.elements[name];


  const raw =
    input.value.trim();


  if (raw === "") {

    throw new Error(
      `Please enter ${input.name.replaceAll("_", " ")}.`
    );

  }


  const value =
    asInteger
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

    recency:
      numberFrom(
        "recency",
        true
      ),

    frequency:
      numberFrom(
        "frequency",
        true
      ),

    monetary:
      numberFrom(
        "monetary",
        false
      ),

    average_order_value:
      numberFrom(
        "average_order_value",
        false
      ),

    unique_products:
      numberFrom(
        "unique_products",
        true
      ),

    customer_lifetime_days:
      numberFrom(
        "customer_lifetime_days",
        true
      )

  };

}


function showError(message) {

  errorBanner.textContent =
    message;

  errorBanner.hidden =
    false;

}


function clearError() {

  errorBanner.hidden =
    true;

  errorBanner.textContent =
    "";

}


function setLoading(
  isLoading
) {

  analyzeBtn.disabled =
    isLoading;


  analyzeBtn.innerHTML =
    isLoading

      ? "<span>Analyzing customer…</span><span>◌</span>"

      : '<span>Analyze customer</span><span class="button-arrow">→</span>';

}


function formatPercent(
  probability
) {

  return (
    probability * 100
  ).toFixed(2) + "%";

}


function formatSpend(
  amount
) {

  return (
    "₹" +
    Number(amount).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )
  );

}


/* =====================================================
   RENDER RESULTS
   ===================================================== */

function riskMeta(
  risk
) {

  const value =
    String(
      risk || ""
    ).toLowerCase();


  if (value === "high") {

    return {

      className:
        "badge badge-high",

      note:
        "Immediate retention attention recommended."

    };

  }


  if (value === "low") {

    return {

      className:
        "badge badge-low",

      note:
        "Customer appears relatively stable."

    };

  }


  return {

    className:
      "badge badge-medium",

    note:
      "Customer should be monitored."

  };

}


function renderResults(
  result
) {

  const probability =
    Number(
      result.churn_probability
    );


  const threshold =
    Number(
      result.threshold
    );


  const prediction =
    Number(
      result.prediction
    );


  const risk =
    result.risk || "—";


  const clamped =
    Math.min(
      Math.max(
        probability,
        0
      ),
      1
    );


  const meta =
    riskMeta(risk);


  probabilityValue.textContent =
    formatPercent(
      probability
    );


  meterFill.style.width =
    `${clamped * 100}%`;


  probabilityDescription.textContent =

    probability >= 0.7

      ? "High probability of customer churn."

      : probability >= 0.4

        ? "Moderate probability of customer churn."

        : "Lower probability of customer churn.";


  riskBadge.className =
    meta.className;


  riskBadge.textContent =
    risk;


  riskNote.textContent =
    meta.note;


  predictionValue.textContent =

    prediction === 1

      ? "Churn"

      : "No Churn";


  predictionNote.textContent =

    Number.isNaN(
      threshold
    )

      ? "Decision threshold unavailable"

      : `Decision threshold: ${threshold.toFixed(2)}`;


  recommendationText.textContent =

    result.recommendation ||

    "No recommendation returned.";

}


function renderSpend(
  result
) {

  const amount =
    Number(
      result.predicted_90_day_spend
    );


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


/* =====================================================
   SHAP
   ===================================================== */

function createEl(
  tag,
  className,
  text
) {

  const el =
    document.createElement(
      tag
    );


  if (className) {

    el.className =
      className;

  }


  if (text !== undefined) {

    el.textContent =
      text;

  }


  return el;

}


function renderShap(
  explanation
) {

  shapChart.replaceChildren();


  if (
    !Array.isArray(explanation) ||
    explanation.length === 0
  ) {

    const empty =
      createEl(
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


    shapChart.appendChild(
      empty
    );


    return;

  }


  const rows =
    explanation
      .slice()
      .sort(
        function (a, b) {

          return (

            Math.abs(
              Number(b.impact)
            )

            -

            Math.abs(
              Number(a.impact)
            )

          );

        }
      );


  const maxAbs =
    Math.max.apply(
      null,

      rows.map(
        function (item) {

          return (
            Math.abs(
              Number(item.impact)
            ) || 0
          );

        }
      )
    );


  rows.forEach(
    function (item) {

      const impact =
        Number(
          item.impact
        );


      const increasesRisk =
        impact > 0;


      const widthPct =
        maxAbs > 0

          ? (
              Math.abs(impact) /
              maxAbs
            ) * 78

          : 0;


      const signed =

        (
          increasesRisk
            ? "+"
            : ""
        )

        +

        impact.toFixed(3);


      const row =
        createEl(
          "div",
          "shap-row"
        );


      row.appendChild(
        createEl(
          "span",
          "shap-name",
          item.feature ||
          "Feature"
        )
      );


      const plot =
        createEl(
          "div",
          "shap-plot"
        );


      const left =
        createEl(
          "div",
          "shap-half shap-half-left"
        );


      const right =
        createEl(
          "div",
          "shap-half shap-half-right"
        );


      const bar =
        createEl(
          "span",

          increasesRisk

            ? "shap-bar shap-bar-pos"

            : "shap-bar shap-bar-neg"
        );


      bar.style.width =
        widthPct + "%";


      if (increasesRisk) {

        right.appendChild(
          bar
        );

      } else {

        left.appendChild(
          bar
        );

      }


      plot.appendChild(
        left
      );


      plot.appendChild(
        createEl(
          "div",
          "shap-axis"
        )
      );


      plot.appendChild(
        right
      );


      row.appendChild(
        plot
      );


      row.appendChild(
        createEl(

          "span",

          increasesRisk

            ? "shap-score shap-score-pos"

            : "shap-score shap-score-neg",

          signed

        )
      );


      shapChart.appendChild(
        row
      );

    }
  );


  shapChart.setAttribute(
    "aria-label",
    "SHAP feature impacts for this prediction"
  );

}


/* =====================================================
   API
   ===================================================== */

async function postJson(
  url,
  payload,
  label
) {

  const token =
    getToken();


  if (!token) {

    throw new Error(
      "Your session has expired. Please sign in again."
    );

  }


  const response =
    await fetch(
      url,
      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "Authorization":
            `Bearer ${token}`

        },

        body:
          JSON.stringify(
            payload
          )

      }
    );


  if (
    response.status === 401
  ) {

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

        message =
          errorData.detail;

      }

    } catch (_) {

      // Keep default message.

    }


    throw new Error(
      message
    );

  }


  return response.json();

}


/* =====================================================
   ANALYSIS
   ===================================================== */

async function analyzeCustomer(
  event
) {

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

    payload =
      readPayload();

  } catch (error) {

    showError(
      error.message
    );

    return;

  }


  setLoading(
    true
  );


  try {

    const result =
      await postJson(

        INTELLIGENCE_API,

        payload,

        "customer intelligence"

      );


    renderResults(
      result
    );


    renderShap(
      result.shap_explanation
    );


    renderSpend(
      result
    );


  } catch (error) {

    if (
      error.name === "TypeError"
    ) {

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

    setLoading(
      false
    );

  }

}


/* =====================================================
   RESET DASHBOARD
   ===================================================== */

function resetDashboard() {

  probabilityValue.textContent =
    "—";


  meterFill.style.width =
    "0%";


  probabilityDescription.textContent =
    "Awaiting customer analysis";


  riskBadge.className =
    "badge";


  riskBadge.textContent =
    "—";


  riskNote.textContent =
    "Analyze a customer to determine risk.";


  predictionValue.textContent =
    "—";


  predictionNote.textContent =
    "Decision threshold: —";


  spendValue.textContent =
    "—";


  spendNote.textContent =
    "Estimated future customer spend.";


  recommendationText.textContent =
    "Analyze a customer to receive a personalized retention recommendation.";


  renderShap(
    []
  );

}


/* =====================================================
   STARTUP
   ===================================================== */

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


/*
 * If an old Firebase token is already stored,
 * show the dashboard.
 */

if (
  getToken() &&
  getStoredEmail()
) {

  showApp();

} else {

  showAuth();

}