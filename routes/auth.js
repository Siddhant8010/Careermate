const express = require('express');
const router = express.Router();
const authController = require('../controller/authcontroller');

router.post('/signup', authController.Signup);
router.post('/login', authController.Login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email-otp', authController.verifyEmailOtp);

// Debug endpoint to check session data
router.get('/debug-session', (req, res) => {
  res.json({
    sessionExists: !!req.session,
    signupDataExists: !!req.session.signupData,
    signupData: req.session.signupData,
    userExists: !!req.session.user,
    user: req.session.user
  });
});

module.exports = router;