const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const passport = require('passport'); // ✅ ADD THIS LINE

// ============================================
// PUBLIC ROUTES
// ============================================

// Authentication
router.post('/register', authController.register);
router.post('/login', authController.login);

// Email Verification
router.post('/verify', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Forgot Password
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-reset-code', authController.resendResetCode);

// ============================================
// ✅ GOOGLE OAUTH ROUTES
// ============================================

// Initiate Google Login
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// Google Callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failed',
    session: true
  }),
  authController.googleSuccess
);

// Google Failed
router.get('/google/failed', authController.googleFailed);

// ============================================
// PRIVATE ROUTES (Require Authentication)
// ============================================
router.get('/me', auth, authController.getMe);
router.post('/logout', auth, authController.logout);

module.exports = router;