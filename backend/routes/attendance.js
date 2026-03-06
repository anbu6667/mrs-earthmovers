const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth, roleAuth } = require('../middleware/auth');
const { attendanceValidation } = require('../middleware/validation');

router.post('/', auth, roleAuth(['ADMIN', 'DRIVER']), attendanceController.markAttendance);
router.put('/:id', auth, roleAuth(['ADMIN', 'DRIVER']), attendanceController.updateAttendance);
router.get('/', auth, attendanceController.getAttendance);
router.get('/driver/:driverId', auth, attendanceController.getDriverAttendance);
router.get('/daily', auth, roleAuth(['ADMIN']), attendanceController.getDailyAttendance);
router.post('/calculate-salary', auth, roleAuth(['ADMIN']), attendanceController.calculateSalary);
router.put('/bulk', auth, roleAuth(['ADMIN']), attendanceController.bulkAttendanceUpdate);

module.exports = router;