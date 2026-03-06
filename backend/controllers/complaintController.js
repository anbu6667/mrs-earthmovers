const Complaint = require('../models/Complaint');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

class ComplaintController {
  async reportComplaint(req, res) {
    try {
      const { vehicleId, type, description, severity, location } = req.body;
      const driverId = req.user?.id;

      // Validation
      if (!vehicleId) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle ID is required'
        });
      }

      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Complaint type is required'
        });
      }

      if (!description || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Description is required'
        });
      }

      // Verify vehicle exists
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Create complaint
      const complaint = new Complaint({
        vehicle: vehicleId,
        driver: driverId,
        type,
        description: description.trim(),
        severity: severity || 'MEDIUM',
        location: location || {},
        status: 'REPORTED',
        reportedAt: new Date()
      });

      await complaint.save();

      // Populate references
      await complaint.populate('vehicle', 'vehicleNumber make model');
      await complaint.populate('driver', 'name phone email');

      // If severity is HIGH or CRITICAL, update vehicle status
      if (severity === 'HIGH' || severity === 'CRITICAL') {
        vehicle.status = 'MAINTENANCE';
        await vehicle.save();
      }

      logger.info(`Complaint reported: ${complaint._id} by driver ${driverId}`);

      res.status(201).json({
        success: true,
        message: 'Complaint reported successfully',
        data: complaint
      });
    } catch (error) {
      logger.error('Complaint report error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to report complaint'
      });
    }
  }

  async getComplaints(req, res) {
    try {
      const { status, severity, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const filter = {};
      if (status) filter.status = status;
      if (severity) filter.severity = severity;

      const complaints = await Complaint.find(filter)
        .populate('vehicle', 'vehicleNumber make model type')
        .populate('driver', 'name phone email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ reportedAt: -1 });

      const total = await Complaint.countDocuments(filter);

      res.json({
        success: true,
        data: complaints,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Fetch complaints error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complaints'
      });
    }
  }

  async getComplaint(req, res) {
    try {
      const complaint = await Complaint.findById(req.params.id)
        .populate('vehicle', 'vehicleNumber make model type')
        .populate('driver', 'name phone email');

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      res.json({
        success: true,
        data: complaint
      });
    } catch (error) {
      logger.error('Fetch complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complaint'
      });
    }
  }

  async getDriverComplaints(req, res) {
    try {
      const driverId = req.params.driverId || req.user?.id;
      const { status, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const filter = { driver: driverId };
      if (status) filter.status = status;

      const complaints = await Complaint.find(filter)
        .populate('vehicle', 'vehicleNumber make model')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ reportedAt: -1 });

      const total = await Complaint.countDocuments(filter);

      res.json({
        success: true,
        data: complaints,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Fetch driver complaints error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complaints'
      });
    }
  }

  async updateComplaintStatus(req, res) {
    try {
      const { status, notes, assignedMechanic, estimatedResolutionTime } = req.body;
      const complaint = await Complaint.findById(req.params.id);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      complaint.status = status;
      if (notes) complaint.notes = notes;
      if (assignedMechanic) complaint.assignedMechanic = assignedMechanic;
      if (estimatedResolutionTime) complaint.estimatedResolutionTime = estimatedResolutionTime;

      if (status === 'RESOLVED') {
        complaint.resolvedAt = new Date();
        complaint.actualResolutionTime = Math.floor(
          (new Date() - complaint.reportedAt) / (1000 * 60) // in minutes
        );

        // Update vehicle status back to AVAILABLE if it was in MAINTENANCE
        const vehicle = await Vehicle.findById(complaint.vehicle);
        if (vehicle && vehicle.status === 'MAINTENANCE') {
          vehicle.status = 'AVAILABLE';
          await vehicle.save();
        }
      }

      await complaint.save();
      await complaint.populate('vehicle', 'vehicleNumber make model');
      await complaint.populate('driver', 'name phone email');

      logger.info(`Complaint ${req.params.id} status updated to ${status}`);

      res.json({
        success: true,
        message: 'Complaint status updated successfully',
        data: complaint
      });
    } catch (error) {
      logger.error('Update complaint status error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update complaint'
      });
    }
  }

  async getComplaintStatistics(req, res) {
    try {
      const totalComplaints = await Complaint.countDocuments();
      const reportedComplaints = await Complaint.countDocuments({ status: 'REPORTED' });
      const inProgressComplaints = await Complaint.countDocuments({ status: 'IN_PROGRESS' });
      const resolvedComplaints = await Complaint.countDocuments({ status: 'RESOLVED' });

      const criticalComplaints = await Complaint.countDocuments({ severity: 'CRITICAL' });
      const highComplaints = await Complaint.countDocuments({ severity: 'HIGH' });

      const complaintsByType = await Complaint.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          total: totalComplaints,
          byStatus: {
            reported: reportedComplaints,
            inProgress: inProgressComplaints,
            resolved: resolvedComplaints
          },
          bySeverity: {
            critical: criticalComplaints,
            high: highComplaints
          },
          byType: complaintsByType
        }
      });
    } catch (error) {
      logger.error('Complaint statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complaint statistics'
      });
    }
  }
}

module.exports = new ComplaintController();
