const express = require('express');
const router = express.Router();
const workRequestController = require('../controllers/workRequestController');
const { auth, roleAuth } = require('../middleware/auth');
const { workRequestValidation } = require('../middleware/validation');

router.post('/', auth, roleAuth(['USER', 'ADMIN']), workRequestValidation, workRequestController.createWorkRequest);
router.get('/', auth, workRequestController.getWorkRequests);
router.get('/customer', auth, workRequestController.getWorkRequestsByCustomer);
router.get('/daily-report', auth, roleAuth(['ADMIN']), workRequestController.getDailyReport);
router.get('/monthly-report', auth, roleAuth(['ADMIN']), workRequestController.getMonthlyReport);
router.get('/:id', auth, workRequestController.getWorkRequest);
router.put('/:id/assign', auth, roleAuth(['ADMIN']), workRequestController.assignWork);
router.put('/:id/status', auth, roleAuth(['ADMIN', 'DRIVER']), workRequestController.updateWorkStatus);
router.put('/:id/payment', auth, roleAuth(['ADMIN']), workRequestController.updatePaymentStatus);

module.exports = router;