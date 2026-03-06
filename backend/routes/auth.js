const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, roleAuth } = require('../middleware/auth');
const { userValidation } = require('../middleware/validation');

router.post('/register', userValidation, authController.register);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);

module.exports = router;