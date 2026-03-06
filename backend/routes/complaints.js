const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { auth, roleAuth } = require('../middleware/auth');

// Complaint routes - specific routes BEFORE dynamic :id routes
router.get('/statistics', auth, roleAuth(['ADMIN']), complaintController.getComplaintStatistics);
router.post('/', auth, roleAuth(['DRIVER']), complaintController.reportComplaint);
router.get('/', auth, roleAuth(['ADMIN']), complaintController.getComplaints);
router.get('/driver/:driverId', auth, complaintController.getDriverComplaints);
router.get('/:id', auth, complaintController.getComplaint);
router.put('/:id/status', auth, roleAuth(['ADMIN']), complaintController.updateComplaintStatus);

module.exports = router;
