const Payment = require('../models/Payment');

// Get all payments for the logged-in customer
exports.getPaymentsByCustomer = async (req, res) => {
  try {
    const customerId = req.user.id;
    const payments = await Payment.find({ customer: customerId })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments', error: error.message });
  }
};
