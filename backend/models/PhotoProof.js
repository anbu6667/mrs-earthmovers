const mongoose = require('mongoose');

const photoProofSchema = new mongoose.Schema({
  workAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkAssignment',
    required: true
  },
  workRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkRequest',
    required: true
  },
  type: {
    type: String,
    enum: ['BEFORE', 'AFTER', 'DURING'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  imageUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  geolocation: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    accuracy: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileSize: Number,
  dimensions: {
    width: Number,
    height: Number
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
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

module.exports = mongoose.model('PhotoProof', photoProofSchema);