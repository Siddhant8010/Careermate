(function () {
  const signinImg = "https://i.pinimg.com/736x/90/30/b2/9030b2c9a9068af4d6f76ef2e304bc83.jpg";
  const registerImg = "https://i.pinimg.com/1200x/16/b0/80/16b080bb8978c6e6860a5c3450046253.jpg";
  const heroImage = document.getElementById("heroImage");

  // Toast notification function
  function showToast(type, title, message) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    const icon = type === "success" ? "✓" : "✕";
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">×</button>
    `;
    
    container.appendChild(toast);
    
    // Close button handler
    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.classList.add("removing");
      setTimeout(() => toast.remove(), 300);
    });
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add("removing");
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const lead = document.getElementById("lead");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const otpVerificationForm = document.getElementById("otpVerificationForm");

  // OTP form elements
  const otpForm = document.getElementById("otpVerificationForm");
  const otpEmail = document.getElementById("otp-email");
  const otpCode = document.getElementById("otp-code");
  const otpError = document.getElementById("otp-error");
  const resendOtp = document.getElementById("resendOtp");
  const resendTimer = document.getElementById("resendTimer");
  const timerCount = document.getElementById("timerCount");
  const backToSignup = document.getElementById("backToSignup");

  // Ensure DOM elements are properly loaded
  function ensureDOMElements() {
    if (!otpEmail || !otpCode || !otpVerificationForm) {
      console.log(" DOM elements not ready, retrying...");
      setTimeout(() => {
        // Update global variables
        otpEmail = document.getElementById("otp-email") || otpEmail;
        otpCode = document.getElementById("otp-code") || otpCode;
        otpVerificationForm = document.getElementById("otpVerificationForm") || otpVerificationForm;
        otpError = document.getElementById("otp-error") || otpError;
        resendOtp = document.getElementById("resendOtp") || resendOtp;
        resendTimer = document.getElementById("resendTimer") || resendTimer;
        timerCount = document.getElementById("timerCount") || timerCount;
        backToSignup = document.getElementById("backToSignup") || backToSignup;

        console.log(" DOM elements loaded");
      }, 50);
    }
  }

  // Store signup data for OTP verification
  let signupData = null;
  let resendTimerInterval = null;

  // Check if admin login
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminLogin = urlParams.get('admin') === 'true';
  
  if (isAdminLogin) {
    const adminIndicator = document.getElementById("admin-indicator");
    const authTabs = document.getElementById("auth-tabs");
    
    if (adminIndicator) {
      adminIndicator.style.display = "block";
    }
    
    // Hide Login/Sign Up tabs completely for admin
    if (authTabs) {
      authTabs.style.display = "none";
    }
    
    // Update lead text for admin
    if (lead) {
      lead.textContent = "Access the admin dashboard to manage users, questions, and test results.";
      lead.style.textAlign = "center";
    }
  }

  // Restore remembered email
  const savedUser = localStorage.getItem("growhub_email");
  const loginEmail = document.getElementById("login-email");
  const remember = document.getElementById("remember");
  if (savedUser) loginEmail.value = savedUser;

  function setActive(isLogin) {

    tabLogin.setAttribute("aria-selected", String(isLogin));
    tabRegister.setAttribute("aria-selected", String(!isLogin));
    tabLogin.setAttribute("aria-pressed", String(isLogin));
    tabRegister.setAttribute("aria-pressed", String(!isLogin));

    if (isLogin) {
      heroImage.src = signinImg;
      heroImage.alt = "Child learning numbers in classroom";
      lead.textContent = "Log in to continue your Career Finding journey with CareerMate — your personal online Path Finder.";
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
    } else {
      heroImage.src = registerImg;
      heroImage.alt = "Child raising hand in classroom";
      lead.textContent = "Sign Up to continue your Career Finding journey with CareerMate — your personal online Path Finder.";
      registerForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
    }
  }

  tabLogin.addEventListener("click", () => setActive(true));
  tabRegister.addEventListener("click", () => setActive(false));

  // Function to show OTP verification form
  function showOtpVerification(email, username) {
    console.log(" Showing OTP verification form for:", email);

    // Ensure DOM elements are available
    ensureDOMElements();

    console.log(" Current email field value before setting:", otpEmail ? otpEmail.value : 'otpEmail not found');

    // Hide other forms
    loginForm.classList.add("hidden");
    registerForm.classList.add("hidden");
    otpVerificationForm.classList.remove("hidden");

    // Update lead text
    lead.textContent = "Enter the 6-digit verification code sent to your email to complete your registration.";

    // Set email in OTP form with a small delay to ensure DOM is ready
    setTimeout(() => {
      if (otpEmail) {
        otpEmail.value = email;
        console.log(" Email set in OTP form after delay:", otpEmail.value);
      } else {
        console.error(" otpEmail element not found after delay!");
      }

      // Focus on OTP input after setting email
      if (otpCode) {
        otpCode.focus();
      }
    }, 100);

    // Start resend timer
    startResendTimer();
  }

  // Function to show signup form
  function showSignupForm() {
    // Hide other forms
    loginForm.classList.add("hidden");
    otpVerificationForm.classList.add("hidden");
    registerForm.classList.remove("hidden");

    // Update lead text
    lead.textContent = "Sign Up to continue your Career Finding journey with CareerMate — your personal online Path Finder.";

    // Clear OTP form but keep email field for reference
    otpCode.value = '';
    otpError.classList.add("hidden");

    // Clear timer
    clearResendTimer();
  }

  // Function to start resend timer
  function startResendTimer() {
    let timeLeft = 60;

    resendOtp.classList.add("hidden");
    resendTimer.classList.remove("hidden");
    timerCount.textContent = timeLeft;

    resendTimerInterval = setInterval(() => {
      timeLeft--;
      timerCount.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearResendTimer();
      }
    }, 1000);
  }

  // Function to clear resend timer
  function clearResendTimer() {
    if (resendTimerInterval) {
      clearInterval(resendTimerInterval);
      resendTimerInterval = null;
    }

    resendOtp.classList.remove("hidden");
    resendTimer.classList.add("hidden");
  }

  // Password visibility toggle
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".toggle-password");
    if (!btn) return;
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (!input) return;
    const isNowText = input.type === "password";
    input.type = isNowText ? "text" : "password";
    btn.setAttribute("aria-pressed", String(isNowText));
  });

  // LOGIN FORM HANDLER
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = document.getElementById("login-email");
    const pass = document.getElementById("login-password");
    const uErr = document.getElementById("login-email-error");
    const pErr = document.getElementById("login-password-error");

    let ok = true;
    if (!user.value.trim()) {
      uErr.classList.remove("hidden");
      ok = false;
    } else {
      uErr.classList.add("hidden");
    }

    if (!pass.value.trim()) {
      pErr.classList.remove("hidden");
      ok = false;
    } else {
      pErr.classList.add("hidden");
    }

    if (!ok) return;

    // Remember email if checked
    if (remember.checked) {
      localStorage.setItem("growhub_email", user.value.trim());
    } else {
      localStorage.removeItem("growhub_email");
    }

    //  Call backend for login
    try {
      // Check if admin login
      const urlParams = new URLSearchParams(window.location.search);
      const isAdminLogin = urlParams.get('admin') === 'true';
      const loginEndpoint = isAdminLogin ? "/admin/login" : "/login";
      
      const res = await fetch(`http://localhost:3000${loginEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: user.value.trim(),
          password: pass.value.trim(),
        }),
      });

      const data = await res.json();
      console.log(" Login response:", data);

      if (data.success) {
        showToast("success", "Login Successful!", "Redirecting to your dashboard...");
        setTimeout(() => {
          window.location.href = isAdminLogin ? "/admindash" : "/dashboard";
        }, 1500);
      } else {
        if (data.requiresVerification) {
          showToast("warning", "Email Verification Required", data.message);
        } else {
          showToast("error", "Login Failed", data.message || "Invalid email or password.");
        }
      }
    } catch (err) {
      console.error(" Login request failed:", err);
      showToast("error", "Connection Error", "Could not connect to server. Please try again.");
    }
  });



  //  SIGNUP FORM HANDLER
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("reg-email");
    const user = document.getElementById("reg-username");
    const pass = document.getElementById("reg-password");
    const eErr = document.getElementById("reg-email-error");
    const uErr = document.getElementById("reg-username-error");
    const pErr = document.getElementById("reg-password-error");

    let ok = true;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailValid) { eErr.classList.remove("hidden"); ok = false; } else { eErr.classList.add("hidden"); }
    if (!user.value.trim()) { uErr.classList.remove("hidden"); ok = false; } else { uErr.classList.add("hidden"); }
    if (pass.value.length < 6) { pErr.classList.remove("hidden"); ok = false; } else { pErr.classList.add("hidden"); }

    if (!ok) return;

    try {
      const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value.trim(),
          username: user.value.trim(),
          password: pass.value.trim(),
        }),
      });

      const data = await res.json();
      console.log(" Server response:", data);

      if (data.success) {
        showToast("success", "Signup Successful!", data.message);

        // Store signup data BEFORE resetting form
        const signupEmail = email.value.trim();
        const signupUsername = user.value.trim();
        const signupPassword = pass.value.trim();

        // Check if email verification is required
        if (data.requiresVerification) {
          // Store signup data for OTP verification
          signupData = {
            email: signupEmail,
            username: signupUsername,
            password: signupPassword
          };

          console.log(" Storing signup data and showing OTP form:", signupData.email);

          // Show OTP verification form
          showOtpVerification(signupData.email, signupData.username);
        } else {
          // Old behavior - redirect to registration
          setTimeout(() => {
            window.location.href = "/registeration";
          }, 1500);
        }

        // Reset form AFTER storing data and showing OTP form
        registerForm.reset();
      } else {
        showToast("error", "Signup Failed", data.message || "Email already exists.");
      }
    } catch (err) {
      console.error(" Request failed:", err);
      showToast("error", "Connection Error", "Could not connect to server. Please try again.");
    }
  });

  //  OTP VERIFICATION FORM HANDLER
  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let email = otpEmail.value.trim();
    const otp = otpCode.value.trim();

    console.log(" OTP Form submitted:", {
      email,
      otp,
      otpLength: otp.length,
      emailFieldValue: otpEmail.value,
      otpFieldValue: otpCode.value,
      signupDataExists: !!signupData,
      signupDataEmail: signupData ? signupData.email : 'N/A'
    });

    // If email field is empty but we have signupData, use that
    if (!email && signupData && signupData.email) {
      email = signupData.email;
      console.log(" Using email from signupData:", email);

      // Also update the email field so user can see it
      otpEmail.value = email;
    }

    // Validate email and OTP
    if (!email) {
      console.log(" Email validation failed - email is empty");
      console.log("Email field element:", otpEmail);
      console.log("Email field value:", otpEmail.value);
      showToast("error", "Email Required", "Email address is missing. Please start the signup process again.");
      return;
    }

    if (!otp || otp.length !== 6) {
      console.log(" OTP validation failed");
      otpError.classList.remove("hidden");
      otpCode.focus();
      return;
    } else {
      otpError.classList.add("hidden");
    }

    try {
      console.log(" Sending OTP verification request...");
      const res = await fetch("http://localhost:3000/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          otp: otp
        }),
      });

      const data = await res.json();
      console.log(" OTP verification response:", data);

      if (data.success) {
        showToast("success", "Email Verified!", data.message);

        // Clear signup data
        signupData = null;

        // Redirect to registration page
        setTimeout(() => {
          window.location.href = "/registeration";
        }, 1500);
      } else {
        showToast("error", "Verification Failed", data.message || "Invalid or expired verification code.");
        otpCode.focus();
      }
    } catch (err) {
      console.error(" OTP verification request failed:", err);
      showToast("error", "Connection Error", "Could not connect to server. Please try again.");
    }
  });

  // Back to signup button
  if (backToSignup) {
    backToSignup.addEventListener("click", () => {
      console.log(" Back to signup clicked, preserving signup data");
      showSignupForm();
      // Don't clear signupData - user might want to go back to OTP
    });
  }

  // Resend OTP button
  if (resendOtp) {
    resendOtp.addEventListener("click", async () => {
      if (!signupData) {
        showToast("error", "Error", "No signup session found. Please start signup again.");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: signupData.email,
            username: signupData.username,
            password: signupData.password,
          }),
        });

        const data = await res.json();

        if (data.success && data.requiresVerification) {
          showToast("success", "Code Resent", "A new verification code has been sent to your email.");
          startResendTimer();
        } else {
          showToast("error", "Resend Failed", data.message || "Could not resend verification code.");
        }
      } catch (err) {
        console.error(" Resend OTP request failed:", err);
        showToast("error", "Connection Error", "Could not connect to server. Please try again.");
      }
    });
  }
  document.addEventListener("DOMContentLoaded", function () {
    const initialTab = document.body.getAttribute("data-initial-tab") || "login";
    if (initialTab === "register") {
      setActive(false);
    } else {
      setActive(true);
    }

    // Ensure DOM elements are loaded
    ensureDOMElements();
  });
})();
