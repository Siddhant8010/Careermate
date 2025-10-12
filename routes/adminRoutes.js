const express = require('express');
const router = express.Router();
const adminAuthController = require('../controller/adminAuthController');
const adminDashboardController = require('../controller/adminDashboardController');
const { requireAdmin, requireAdminPage } = require('../middleware/adminAuth');

// Admin Authentication Routes
router.post('/admin/login', adminAuthController.AdminLogin);
router.post('/admin/logout', adminAuthController.AdminLogout);
router.get('/admin/profile', requireAdmin, adminAuthController.getAdminProfile);

// Admin Dashboard Page
router.get('/admindash', requireAdminPage, (req, res) => {
  res.render('admindash', { admin: req.session.admin });
});

// Admin Dashboard API Routes
router.get('/api/admin/stats', requireAdmin, adminDashboardController.getDashboardStats);

// User Management
router.get('/api/admin/users', requireAdmin, adminDashboardController.getAllUsers);
router.delete('/api/admin/users/:userId', requireAdmin, adminDashboardController.deleteUser);

// Question Management
router.get('/api/admin/questions', requireAdmin, adminDashboardController.getAllQuestions);
router.post('/api/admin/questions', requireAdmin, adminDashboardController.addQuestion);
router.put('/api/admin/questions/:questionId', requireAdmin, adminDashboardController.updateQuestion);
router.delete('/api/admin/questions/:questionId', requireAdmin, adminDashboardController.deleteQuestion);

// Results Management
router.get('/api/admin/results', requireAdmin, adminDashboardController.getAllResults);
router.delete('/api/admin/results/:resultId', requireAdmin, adminDashboardController.deleteResult);

module.exports = router;
