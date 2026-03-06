const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true
  },
  // make, model, year removed
  type: {
    type: String,
    enum: ['JCB', 'Hitachi', 'Rocksplitter', 'Tractor', 'Tipper', 'Compressor'],
    required: true
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  // capacity removed
  status: {
    type: String,
    enum: ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'BREAKDOWN', 'EMERGENCY'],
    default: 'AVAILABLE'
  },
  lastOdometer: {
    type: Number,
    default: 0
  },
  lastServiceDate: {
    type: Date
  },
  nextServiceDate: {
    type: Date
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  emergencyContact: {
    name: String,
    phone: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);