(function () {
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

  const tabForgot = document.getElementById("tabForgot");
  const tabOtp = document.getElementById("tabOtp");
  const lead = document.getElementById("lead");
  const forgotForm = document.getElementById("forgotForm");
  const otpForm = document.getElementById("otpForm");

  // Store email for OTP form
  let forgotEmail = "";

  function setActive(isForgot) {
    tabForgot.setAttribute("aria-selected", String(isForgot));
    tabOtp.setAttribute("aria-selected", String(!isForgot));
    tabForgot.setAttribute("aria-pressed", String(isForgot));
    tabOtp.setAttribute("aria-pressed", String(!isForgot));

    if (isForgot) {
      lead.textContent = "Enter your email address to receive a password reset OTP.";
      forgotForm.classList.remove("hidden");
      otpForm.classList.add("hidden");
    } else {
      lead.textContent = "Enter the OTP sent to your email and your new password.";
      otpForm.classList.remove("hidden");
      forgotForm.classList.add("hidden");
    }
  }

  tabForgot.addEventListener("click", () => setActive(true));
  tabOtp.addEventListener("click", () => setActive(false));

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

  // Add loading state management
  function setLoading(button, isLoading) {
    const originalText = button.textContent;
    if (isLoading) {
      button.disabled = true;
      button.textContent = "Sending...";
      button.style.opacity = "0.7";
    } else {
      button.disabled = false;
      button.textContent = originalText;
      button.style.opacity = "1";
    }
  }

  // ✅ FORGOT PASSWORD FORM HANDLER
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("forgot-email");
    const emailError = document.getElementById("forgot-email-error");
    const submitButton = forgotForm.querySelector('button[type="submit"]');

    // Reset previous errors
    emailError.classList.add("hidden");

    let ok = true;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailValid) {
      emailError.classList.remove("hidden");
      ok = false;
    }

    if (!ok) return;

    // INSTANT visual feedback - no delay
    setLoading(submitButton, true);

    // Show immediate success feedback (optimistic UI)
    showToast("success", "Sending OTP...", "Please wait while we send your OTP...");

    try {
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch("http://localhost:3000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value.trim(),
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      console.log("📩 Forgot password response:", data);

      if (data.success) {
        // Store email and switch to OTP form
        forgotEmail = email.value.trim();
        setActive(false);

        // Pre-fill email in OTP form
        document.getElementById("otp-email").value = forgotEmail;

        // Show success confirmation
        showToast("success", "OTP Sent!", "Check your email for the verification code");
      } else {
        showToast("error", "Failed to Send OTP", data.message || "Please try again.");
      }
    } catch (err) {
      console.error("❌ Forgot password request failed:", err);
      if (err.name === 'AbortError') {
        showToast("error", "Request Timeout", "The request took too long. Please try again.");
      } else {
        showToast("error", "Connection Error", "Could not connect to server. Please try again.");
      }
    } finally {
      // Remove loading state
      setLoading(submitButton, false);
    }
  });

  // ✅ OTP FORM HANDLER
  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("otp-email");
    const otp = document.getElementById("otp-code");
    const newPassword = document.getElementById("new-password");
    const otpError = document.getElementById("otp-error");
    const passwordError = document.getElementById("new-password-error");

    // Reset previous errors
    otpError.classList.add("hidden");
    passwordError.classList.add("hidden");

    let ok = true;

    if (!otp.value.trim() || otp.value.length !== 6) {
      otpError.classList.remove("hidden");
      ok = false;
    }

    if (newPassword.value.length < 6) {
      passwordError.classList.remove("hidden");
      ok = false;
    }

    if (!ok) return;

    try {
      const res = await fetch("http://localhost:3000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value.trim(),
          otp: otp.value.trim(),
          newPassword: newPassword.value.trim(),
        }),
      });

      const data = await res.json();
      console.log("📩 Reset password response:", data);

      if (data.success) {
        showToast("success", "Password Reset!", data.message);
        otpForm.reset();

        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        showToast("error", "Reset Failed", data.message || "Invalid OTP or email.");
      }
    } catch (err) {
      console.error("❌ Reset password request failed:", err);
      showToast("error", "Connection Error", "Could not connect to server. Please try again.");
    }
  });

  // Resend OTP functionality
  document.getElementById("resendOtp").addEventListener("click", async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      showToast("error", "Error", "Please go back and enter your email first.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showToast("success", "OTP Resent!", "A new OTP has been sent to your email.");
      } else {
        showToast("error", "Resend Failed", data.message || "Please try again.");
      }
    } catch (err) {
      console.error("❌ Resend OTP request failed:", err);
      showToast("error", "Connection Error", "Could not connect to server. Please try again.");
    }
  });
})();
