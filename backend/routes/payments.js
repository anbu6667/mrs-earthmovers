const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

// GET /payments/customer - get all payments for logged-in customer
router.get('/customer', auth, paymentController.getPaymentsByCustomer);

module.exports = router;
