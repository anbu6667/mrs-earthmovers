const mongoose = require('mongoose');

const workAssignmentSchema = new mongoose.Schema({
  workRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkRequest',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['ASSIGNED', 'STARTED', 'REACHED_SITE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'ASSIGNED'
  },
  actualDuration: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  locationTrail: [{
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    address: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String,
  emergencyStatus: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
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

module.exports = mongoose.model('WorkAssignment', workAssignmentSchema);