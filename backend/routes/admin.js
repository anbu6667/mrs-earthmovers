const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, roleAuth } = require('../middleware/auth');

// Admin dashboard endpoints
router.get('/dashboard-summary', auth, roleAuth(['ADMIN']), adminController.getDashboardSummary);
router.get('/daily-metrics', auth, roleAuth(['ADMIN']), adminController.getDailyMetrics);

module.exports = router;
