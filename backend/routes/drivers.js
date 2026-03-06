const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { auth, roleAuth } = require('../middleware/auth');

// Admin: list drivers for assignment
router.get('/', auth, roleAuth(['ADMIN']), driverController.getDrivers);

router.get('/work-list/:driverId?', auth, driverController.getDriverWorkList);
router.put('/work-assignments/:id/status', auth, driverController.updateWorkStatus);
router.post('/work-assignments/:id/location', auth, driverController.updateLocation);
router.get('/progress/:driverId?', auth, driverController.getDriverProgress);
router.post('/complaints', auth, driverController.reportComplaint);
router.get('/vehicles/:driverId?', auth, driverController.getDriverVehicles);
router.get('/live-location/:driverId?', auth, driverController.getLiveLocation);
router.get('/dashboard/:driverId?', auth, driverController.getDriverDashboard);

// New statistics endpoints for driver dashboard
router.get('/:driverId?/work-assignments-stats', auth, driverController.getWorkAssignmentsStats);
router.get('/:driverId?/daily-stats', auth, driverController.getDailyStats);

module.exports = router;