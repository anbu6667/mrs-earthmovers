const WorkRequest = require('../models/WorkRequest');
const WorkAssignment = require('../models/WorkAssignment');
const Vehicle = require('../models/Vehicle');
require('../models/PhotoProof');
const winston = require('winston');
const mongoose = require('mongoose');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

class WorkRequestController {
  async createWorkRequest(req, res) {
    try {
      const workRequest = new WorkRequest(req.body);
      await workRequest.save();

      await workRequest.populate('customer', 'name phone email');

      const estimatedCost = workRequest.expectedDuration * 1000;
      workRequest.estimatedCost = estimatedCost;
      await workRequest.save();

      res.status(201).json({
        success: true,
        message: 'Work request created successfully',
        data: workRequest
      });
    } catch (error) {
      logger.error('Work request creation error:', {
        error: error,
        body: req.body
      });
      res.status(400).json({
        success: false,
        message: error.message,
        details: error.errors || null,
        body: req.body
      });
    }
  }

  async getWorkRequests(req, res) {
    try {
      const { page = 1, limit = 10, status, customer, workType, startDate, endDate } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (customer) filter.customer = customer;
      if (workType) filter.workType = workType;
      if (startDate && endDate) {
        filter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const workRequests = await WorkRequest.find(filter)
        .populate('customer', 'name phone email')
        .populate('assignedVehicle', 'vehicleNumber type hourlyRate')
        .populate('assignedDriver', 'name phone')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await WorkRequest.countDocuments(filter);

      res.json({
        success: true,
        data: workRequests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Work requests fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch work requests'
      });
    }
  }

  async getWorkRequest(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid work request id'
        });
      }

      const workRequest = await WorkRequest.findById(req.params.id)
        .populate('customer', 'name phone email')
        .populate('assignedVehicle', 'vehicleNumber type hourlyRate')
        .populate('assignedDriver', 'name phone')
        .populate('photos');

      if (!workRequest) {
        return res.status(404).json({
          success: false,
          message: 'Work request not found'
        });
      }

      const assignment = await WorkAssignment.findOne({ workRequest: workRequest._id })
        .select('status startTime endTime locationTrail updatedAt');

      const latestLocation = assignment?.locationTrail?.length
        ? assignment.locationTrail[assignment.locationTrail.length - 1]
        : (assignment?.location
          ? { ...assignment.location, timestamp: assignment.updatedAt }
          : null);

      const payload = workRequest.toObject();
      payload.assignmentStatus = assignment?.status || null;
      payload.liveLocation = latestLocation;

      res.json({
        success: true,
        data: payload
      });
    } catch (error) {
      logger.error('Work request fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch work request'
      });
    }
  }

  async assignWork(req, res) {
    try {
      const { vehicleId, driverId } = req.body;
      const workRequest = await WorkRequest.findById(req.params.id);

      if (!workRequest) {
        return res.status(404).json({
          success: false,
          message: 'Work request not found'
        });
      }

      if (workRequest.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Work request is not in pending status'
        });
      }

      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle || vehicle.status !== 'AVAILABLE') {
        return res.status(400).json({
          success: false,
          message: 'Vehicle not available'
        });
      }

      // CHECK FOR DATE CONFLICTS - Driver availability
      const driverConflict = await WorkRequest.findOne({
        assignedDriver: driverId,
        status: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
        $or: [
          // Overlap condition: existing work overlaps with new work
          {
            startDate: { $lt: workRequest.endDate },
            endDate: { $gt: workRequest.startDate }
          }
        ]
      });

      if (driverConflict) {
        return res.status(400).json({
          success: false,
          message: `Driver has conflicting assignment from ${driverConflict.startDate.toISOString()} to ${driverConflict.endDate.toISOString()}`
        });
      }

      // CHECK FOR DATE CONFLICTS - Vehicle availability
      const vehicleConflict = await WorkRequest.findOne({
        assignedVehicle: vehicleId,
        status: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
        $or: [
          // Overlap condition: existing work overlaps with new work
          {
            startDate: { $lt: workRequest.endDate },
            endDate: { $gt: workRequest.startDate }
          }
        ]
      });

      if (vehicleConflict) {
        return res.status(400).json({
          success: false,
          message: `Vehicle has conflicting assignment from ${vehicleConflict.startDate.toISOString()} to ${vehicleConflict.endDate.toISOString()}`
        });
      }

      workRequest.assignedVehicle = vehicleId;
      workRequest.assignedDriver = driverId;
      workRequest.status = 'ASSIGNED';
      await workRequest.save();

         await workRequest.populate('assignedVehicle', 'vehicleNumber type hourlyRate');
      vehicle.driver = driverId;
      vehicle.status = 'ASSIGNED';
      await vehicle.save();

      const workAssignment = new WorkAssignment({
        workRequest: workRequest._id,
        vehicle: vehicleId,
        driver: driverId,
        startTime: new Date(workRequest.startDate),
        status: 'ASSIGNED',
        location: workRequest.location
      });
      await workAssignment.save();

      await workRequest.populate('customer', 'name phone email');
      await workRequest.populate('assignedVehicle', 'vehicleNumber make model type hourlyRate');
      await workRequest.populate('assignedDriver', 'name phone');

      logger.info(`Work assigned successfully: ${workRequest._id} to driver ${driverId}`);

      res.json({
        success: true,
        message: 'Work assigned successfully',
        data: { workRequest, workAssignment }
      });
    } catch (error) {
      logger.error('Work assignment error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateWorkStatus(req, res) {
    try {
      const { status, notes } = req.body;
      const workRequest = await WorkRequest.findById(req.params.id);

      if (!workRequest) {
        return res.status(404).json({
          success: false,
          message: 'Work request not found'
        });
      }

      workRequest.status = status;
      if (status === 'COMPLETED') {
        workRequest.completedAt = new Date();
        workRequest.actualCost = workRequest.estimatedCost;
      }
      if (notes) workRequest.notes = notes;
      
      await workRequest.save();

      if (status === 'COMPLETED' && workRequest.assignedVehicle) {
        const vehicle = await Vehicle.findById(workRequest.assignedVehicle);
        if (vehicle) {
          vehicle.status = 'AVAILABLE';
          await vehicle.save();
        }
      }

      await workRequest.populate('customer', 'name phone email');
      await workRequest.populate('assignedVehicle', 'vehicleNumber make model type hourlyRate');
      await workRequest.populate('assignedDriver', 'name phone');

      res.json({
        success: true,
        message: 'Work status updated successfully',
        data: workRequest
      });
    } catch (error) {
      logger.error('Work status update error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updatePaymentStatus(req, res) {
    try {
      const { paymentStatus } = req.body;
      const workRequest = await WorkRequest.findById(req.params.id);

      if (!workRequest) {
        return res.status(404).json({
          success: false,
          message: 'Work request not found'
        });
      }

      workRequest.paymentStatus = paymentStatus;
      await workRequest.save();

      await workRequest.populate('customer', 'name phone email');
      await workRequest.populate('assignedVehicle', 'vehicleNumber make model type hourlyRate');
      await workRequest.populate('assignedDriver', 'name phone');

      res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: workRequest
      });
    } catch (error) {
      logger.error('Payment status update error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getWorkRequestsByCustomer(req, res) {
    try {
      const customerId = req.user.role === 'USER'
        ? req.user.id
        : (req.query.customerId || req.params.customerId);

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'customerId is required'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid customerId'
        });
      }

      const workRequests = await WorkRequest.find({ customer: customerId })
        .populate('assignedVehicle', 'vehicleNumber make model type hourlyRate')
        .populate('assignedDriver', 'name phone')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: workRequests
      });
    } catch (error) {
      logger.error('Customer work requests fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch work requests'
      });
    }
  }

  async getDailyReport(req, res) {
    try {
      const { date } = req.query;
      const targetDate = date ? new Date(date) : new Date();
      const startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);

      const workRequests = await WorkRequest.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate('customer', 'name phone');

      const completedWork = await WorkRequest.find({
        status: 'COMPLETED',
        completedAt: { $gte: startDate, $lte: endDate }
      }).populate('assignedVehicle', 'vehicleNumber make model');

      const totalRevenue = completedWork.reduce((sum, wr) => sum + wr.actualCost, 0);
      const totalVehicles = new Set(completedWork.map(wr => wr.assignedVehicle._id)).size;

      res.json({
        success: true,
        data: {
          date: targetDate.toISOString().split('T')[0],
          totalWorkRequests: workRequests.length,
          completedWork: completedWork.length,
          totalRevenue,
          totalVehicles,
          workRequests,
          completedWork
        }
      });
    } catch (error) {
      logger.error('Daily report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate daily report'
      });
    }
  }

  async getMonthlyReport(req, res) {
    try {
      const { year, month } = req.query;
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const workRequests = await WorkRequest.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate('customer', 'name phone');

      const completedWork = await WorkRequest.find({
        status: 'COMPLETED',
        completedAt: { $gte: startDate, $lte: endDate }
      }).populate('assignedVehicle', 'vehicleNumber make model');

      const totalRevenue = completedWork.reduce((sum, wr) => sum + wr.actualCost, 0);
      const totalVehicles = new Set(completedWork.map(wr => wr.assignedVehicle._id)).size;
      
      const revenueByDay = {};
      completedWork.forEach(wr => {
        const day = wr.completedAt.toISOString().split('T')[0];
        revenueByDay[day] = (revenueByDay[day] || 0) + wr.actualCost;
      });

      res.json({
        success: true,
        data: {
          year,
          month,
          totalWorkRequests: workRequests.length,
          completedWork: completedWork.length,
          totalRevenue,
          totalVehicles,
          revenueByDay,
          workRequests,
          completedWork
        }
      });
    } catch (error) {
      logger.error('Monthly report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate monthly report'
      });
    }
  }
}

module.exports = new WorkRequestController();