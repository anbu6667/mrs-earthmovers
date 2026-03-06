const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  workRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkRequest',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  transactionId: String,
  dueDate: Date,
  paidAt: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);