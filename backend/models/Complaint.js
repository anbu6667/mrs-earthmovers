const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
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
  type: {
      type: String,
      enum: [
        'MECHANICAL',
        'ELECTRICAL',
        'BODY_DAMAGE',
        'TIRE_ISSUE',
        'FUEL_SYSTEM',
        'BRAKE_SYSTEM',
        'OTHER',
    
      ],
      required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
    default: 'REPORTED'
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  estimatedResolutionTime: Number,
  actualResolutionTime: Number,
  cost: Number,
  assignedMechanic: String,
  notes: String,
  photos: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);