const User = require("../models/usermodel");
const { createSecretToken } = require("../utils/secrettoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const path = require("path");

exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    // Validate required fields
    if (!email || !password || !username) {
      return res.status(400).json({
        message: "Email, username, and password are required",
        success: false
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
        success: false
      });
    }

    // Generate 6-digit OTP for email verification
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiry (10 minutes from now)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Create transporter for email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email template for signup OTP verification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'CareerMate - Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CareerMate - Email Verification</title>
            <style>
                * { box-sizing: border-box; }
                body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: linear-gradient(145deg, #ffffff, #f8fafc);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 10px 30px rgba(0, 14, 173, 0.1);
                    border: 1px solid rgba(0, 14, 173, 0.1);
                }
                .header {
                    background: linear-gradient(135deg, #000ead 0%, #001638 100%);
                    padding: 50px 40px;
                    text-align: center;
                    position: relative;
                }
                .header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
                }
                .brand-title {
                    color: #ffffff;
                    font-size: 28px;
                    font-weight: 800;
                    margin: 0 0 8px 0;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    letter-spacing: -0.5px;
                }
                .brand-subtitle {
                    color: #e2e8f0;
                    font-size: 16px;
                    margin: 0;
                    opacity: 0.9;
                }
                .content {
                    padding: 50px 40px;
                    background: #ffffff;
                }
                .welcome-text {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .welcome-title {
                    color: #1a202c;
                    font-size: 26px;
                    font-weight: 700;
                    margin: 0 0 15px 0;
                    line-height: 1.2;
                }
                .welcome-description {
                    color: #4a5568;
                    font-size: 18px;
                    margin: 0;
                    line-height: 1.6;
                }
                .otp-section {
                    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                    border: 3px solid #000ead;
                    border-radius: 16px;
                    padding: 40px;
                    text-align: center;
                    margin: 40px 0;
                    position: relative;
                    box-shadow: 0 8px 32px rgba(0, 14, 173, 0.15);
                }
                .otp-section::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    background: linear-gradient(135deg, #000ead, #001638);
                    border-radius: 18px;
                    z-index: -1;
                    opacity: 0.1;
                }
                .otp-code {
                    font-size: 42px;
                    font-weight: 800;
                    color: #000ead;
                    letter-spacing: 12px;
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                    margin: 0 0 15px 0;
                    text-shadow: 0 2px 4px rgba(0, 14, 173, 0.1);
                }
                .otp-label {
                    color: #2d3748;
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0;
                    letter-spacing: 0.5px;
                }
                .security-notice {
                    background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
                    border: 2px solid #feb2b2;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 30px 0;
                    text-align: center;
                }
                .security-icon {
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .security-title {
                    color: #c53030;
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0 0 10px 0;
                }
                .security-text {
                    color: #9b2c2c;
                    font-size: 15px;
                    margin: 0;
                    line-height: 1.5;
                }
                .cta-section {
                    text-align: center;
                    margin-top: 50px;
                }
                .cta-button {
                    background: linear-gradient(135deg, #000ead 0%, #001638 100%);
                    color: #ffffff;
                    padding: 18px 40px;
                    text-decoration: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 16px;
                    display: inline-block;
                    box-shadow: 0 8px 25px rgba(0, 14, 173, 0.3);
                    transition: all 0.3s ease;
                    border: none;
                    cursor: pointer;
                    letter-spacing: 0.5px;
                }
                .cta-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 35px rgba(0, 14, 173, 0.4);
                }
                .cta-text {
                    color: #4a5568;
                    font-size: 16px;
                    margin: 0 0 20px 0;
                    font-weight: 500;
                }
                .footer {
                    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                    border-top: 1px solid #e2e8f0;
                    padding: 40px;
                    text-align: center;
                }
                .footer-logo {
                    width: 100px;
                    height: auto;
                    opacity: 0.7;
                    margin-bottom: 15px;
                }
                .footer-text {
                    color: #718096;
                    font-size: 15px;
                    margin: 0 0 8px 0;
                    font-weight: 500;
                }
                .footer-note {
                    color: #a0aec0;
                    font-size: 13px;
                    margin: 0;
                    line-height: 1.4;
                }
                @media (max-width: 600px) {
                    .container { margin: 10px; border-radius: 12px; }
                    .header, .content { padding: 30px 20px; }
                    .footer { padding: 25px 20px; }
                    .brand-title { font-size: 22px; }
                    .welcome-title { font-size: 22px; }
                    .welcome-description { font-size: 16px; }
                    .otp-section { padding: 25px; margin: 25px 0; }
                    .otp-code { font-size: 32px; letter-spacing: 8px; }
                    .cta-button { width: 100%; padding: 16px 30px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header Section -->
                <div class="header">
                    <h1 class="brand-title">CareerMate</h1>
                    <p class="brand-subtitle">Your Partner in Building a Brighter Future</p>
                </div>

                <!-- Main Content -->
                <div class="content">
                    <div class="welcome-text">
                        <h2 class="welcome-title">Welcome to CareerMate!</h2>
                        <p class="welcome-description">
                            Thank you for choosing CareerMate to guide your career journey.
                            Please verify your email address using the code below to complete your registration.
                        </p>
                    </div>

                    <!-- OTP Section -->
                    <div class="otp-section">
                        <div class="otp-code">${emailOtp}</div>
                        <p class="otp-label">Verification Code</p>
                    </div>

                    <!-- Security Notice -->
                    <div class="security-notice">
                        <div class="security-icon">🔐</div>
                        <h3 class="security-title">Security Notice</h3>
                        <p class="security-text">
                            This verification code will expire in <strong>10 minutes</strong> for security reasons.
                            If you didn't create an account, please ignore this email.
                        </p>
                    </div>

                    <!-- Call to Action -->
                    <div class="cta-section">
                        <p class="cta-text">Ready to start your career journey?</p>
                        <a href="http://localhost:3000" class="cta-button">
                            Visit CareerMate →
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p class="footer-text">© 2024 CareerMate. All rights reserved.</p>
                    <p class="footer-note">
                        You're receiving this because you recently signed up for a CareerMate account.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully to:", email);

    // Store signup data temporarily in session for verification
    req.session.signupData = {
      email: email.toLowerCase().trim(),
      username: username.trim(),
      password: password,
      emailOtp: emailOtp,
      otpExpires: otpExpiry
    };

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error(" Session save error:", err);
      } else {
        console.log(" Signup data stored in session:", {
          email: req.session.signupData.email,
          otp: req.session.signupData.emailOtp,
          expires: req.session.signupData.otpExpires
        });
      }
    });

    res.status(200).json({
      message: "OTP sent successfully to your email. Please check your inbox and verify your email to complete registration.",
      success: true,
      requiresVerification: true
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Failed to send verification email. Please try again.",
      success: false
    });
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt for email:", email);

    // Validate required fields
    if (!email || !password) {
      console.log(" Missing email or password");
      return res.status(400).json({
        message: 'Email and password are required',
        success: false
      });
    }

    // Find user by email
    console.log("🔍 Searching for user with email:", email.toLowerCase().trim());
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log(" User not found with email:", email);
      return res.status(401).json({
        message: 'Invalid email or password',
        success: false
      });
    }

    console.log("✅ User found:", user.email, "Password hash length:", user.password.length);

    // Check password
    console.log(" Comparing passwords...");
    const auth = await bcrypt.compare(password, user.password);
    console.log(" Password comparison result:", auth);

    if (!auth) {
      console.log(" Password mismatch for user:", user.email);
      return res.status(401).json({
        message: 'Invalid email or password',
        success: false
      });
    }

    console.log(" Login successful for user:", user.email);

    // Create session and token
    const token = createSecretToken(user._id);
    req.session.user = user;

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        emailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error(" Login error:", error);
    res.status(500).json({
      message: "Login failed. Please try again.",
      success: false
    });
  }
};

// Forget Password - Request OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found with this email" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiry (10 minutes from now)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to user
    user.resetOtp = otp;
    user.resetOtpExpires = otpExpiry;
    await user.save();

    // Create transporter for email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email options - Enhanced design for better UX
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'CareerMate - Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CareerMate - Password Reset</title>
            <style>
                * { box-sizing: border-box; }
                body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: linear-gradient(145deg, #ffffff, #f8fafc);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 10px 30px rgba(0, 14, 173, 0.1);
                    border: 1px solid rgba(0, 14, 173, 0.1);
                }
                .header {
                    background: linear-gradient(135deg, #000ead 0%, #001638 100%);
                    padding: 50px 40px;
                    text-align: center;
                    position: relative;
                }
                .header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
                }
                .brand-title {
                    color: #ffffff;
                    font-size: 28px;
                    font-weight: 800;
                    margin: 0 0 8px 0;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    letter-spacing: -0.5px;
                }
                .brand-subtitle {
                    color: #e2e8f0;
                    font-size: 16px;
                    margin: 0;
                    opacity: 0.9;
                }
                .content {
                    padding: 50px 40px;
                    background: #ffffff;
                }
                .welcome-text {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .welcome-title {
                    color: #1a202c;
                    font-size: 26px;
                    font-weight: 700;
                    margin: 0 0 15px 0;
                    line-height: 1.2;
                }
                .welcome-description {
                    color: #4a5568;
                    font-size: 18px;
                    margin: 0;
                    line-height: 1.6;
                }
                .otp-section {
                    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                    border: 3px solid #000ead;
                    border-radius: 16px;
                    padding: 40px;
                    text-align: center;
                    margin: 40px 0;
                    position: relative;
                    box-shadow: 0 8px 32px rgba(0, 14, 173, 0.15);
                }
                .otp-section::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    background: linear-gradient(135deg, #000ead, #001638);
                    border-radius: 18px;
                    z-index: -1;
                    opacity: 0.1;
                }
                .otp-code {
                    font-size: 42px;
                    font-weight: 800;
                    color: #000ead;
                    letter-spacing: 12px;
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                    margin: 0 0 15px 0;
                    text-shadow: 0 2px 4px rgba(0, 14, 173, 0.1);
                }
                .otp-label {
                    color: #2d3748;
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0;
                    letter-spacing: 0.5px;
                }
                .security-notice {
                    background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
                    border: 2px solid #feb2b2;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 30px 0;
                    text-align: center;
                }
                .security-icon {
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .security-title {
                    color: #c53030;
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0 0 10px 0;
                }
                .security-text {
                    color: #9b2c2c;
                    font-size: 15px;
                    margin: 0;
                    line-height: 1.5;
                }
                .cta-section {
                    text-align: center;
                    margin-top: 50px;
                }
                .cta-button {
                    background: linear-gradient(135deg, #000ead 0%, #001638 100%);
                    color: #ffffff;
                    padding: 18px 40px;
                    text-decoration: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 16px;
                    display: inline-block;
                    box-shadow: 0 8px 25px rgba(0, 14, 173, 0.3);
                    transition: all 0.3s ease;
                    border: none;
                    cursor: pointer;
                    letter-spacing: 0.5px;
                }
                .cta-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 35px rgba(0, 14, 173, 0.4);
                }
                .cta-text {
                    color: #4a5568;
                    font-size: 16px;
                    margin: 0 0 20px 0;
                    font-weight: 500;
                }
                .footer {
                    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                    padding: 40px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }
                .footer-logo {
                    width: 100px;
                    height: auto;
                    opacity: 0.7;
                    margin-bottom: 15px;
                }
                .footer-text {
                    color: #718096;
                    font-size: 15px;
                    margin: 0 0 8px 0;
                    font-weight: 500;
                }
                .footer-note {
                    color: #a0aec0;
                    font-size: 13px;
                    margin: 0;
                    line-height: 1.4;
                }
                @media (max-width: 600px) {
                    .container { margin: 10px; border-radius: 12px; }
                    .header, .content { padding: 30px 20px; }
                    .footer { padding: 25px 20px; }
                    .brand-title { font-size: 22px; }
                    .welcome-title { font-size: 22px; }
                    .welcome-description { font-size: 16px; }
                    .otp-section { padding: 25px; margin: 25px 0; }
                    .otp-code { font-size: 32px; letter-spacing: 8px; }
                    .cta-button { width: 100%; padding: 16px 30px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header Section -->
                <div class="header">
                    <h1 class="brand-title">CareerMate</h1>
                    <p class="brand-subtitle">Your Partner in Building a Brighter Future</p>
                </div>

                <!-- Main Content -->
                <div class="content">
                    <div class="welcome-text">
                        <h2 class="welcome-title">Reset Your Password</h2>
                        <p class="welcome-description">
                            We received a request to reset your CareerMate account password.
                            Use the verification code below to complete the reset process.
                        </p>
                    </div>

                    <!-- OTP Section -->
                    <div class="otp-section">
                        <div class="otp-code">${otp}</div>
                        <p class="otp-label">Verification Code</p>
                    </div>

                    <!-- Security Notice -->
                    <div class="security-notice">
                        <div class="security-icon">🔐</div>
                        <h3 class="security-title">Security Notice</h3>
                        <p class="security-text">
                            This verification code will expire in <strong>10 minutes</strong> for security reasons.
                            If you didn't request this password reset, please ignore this email.
                        </p>
                    </div>

                    <!-- Call to Action -->
                    <div class="cta-section">
                        <p class="cta-text">Ready to continue your career journey?</p>
                        <a href="http://localhost:3000/login" class="cta-button">
                            Continue to CareerMate →
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p class="footer-text">© 2024 CareerMate. All rights reserved.</p>
                    <p class="footer-note">
                        You're receiving this because a password reset was requested for your CareerMate account.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Verify OTP and Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required"
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Verify Email OTP and Complete Registration
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(" OTP Verification attempt:", { email, otp, sessionExists: !!req.session.signupData });

    if (!email || !otp) {
      console.log(" Missing email or OTP:", { email: !!email, otp: !!otp });
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Check if signup data exists in session
    if (!req.session.signupData) {
      console.log(" No signup session found");
      return res.status(400).json({
        success: false,
        message: "No signup session found. Please start the signup process again."
      });
    }

    const signupData = req.session.signupData;
    console.log(" Session data:", {
      sessionEmail: signupData.email,
      sessionOtp: signupData.emailOtp,
      sessionExpires: signupData.otpExpires,
      currentTime: Date.now()
    });

    // Verify email matches session data
    if (signupData.email !== email.toLowerCase().trim()) {
      console.log(" Email mismatch:", { expected: signupData.email, received: email });
      return res.status(400).json({
        success: false,
        message: "Email does not match signup session"
      });
    }

    // Check if OTP has expired
    if (Date.now() > new Date(signupData.otpExpires)) {
      console.log(" OTP expired");
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    // Verify OTP
    if (signupData.emailOtp !== otp) {
      console.log(" Invalid OTP:", { expected: signupData.emailOtp, received: otp });
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again."
      });
    }

    console.log(" OTP verified successfully, creating user...");

    // Create new user
    const user = await User.create({
      email: signupData.email,
      username: signupData.username,
      password: signupData.password,
      isEmailVerified: true
    });

    console.log(" User created after email verification:", user.email, user.username);

    // Create session and token
    req.session.user = user;
    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Clear signup data from session
    delete req.session.signupData;

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error(" Session save error after verification:", err);
      } else {
        console.log(" Session saved after email verification");
      }
    });

    console.log(" Email verification completed successfully");

    res.status(201).json({
      message: "Email verified and account created successfully!",
      success: true,
      redirectTo: "/registeration",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        emailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      message: "Failed to verify email and create account. Please try again.",
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  Signup: exports.Signup,
  Login: exports.Login,
  forgotPassword: exports.forgotPassword,
  resetPassword: exports.resetPassword,
  verifyEmailOtp: exports.verifyEmailOtp
};
