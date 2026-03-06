const Attendance = require('../models/Attendance');
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

class AttendanceController {
  static DAILY_DRIVER_SALARY = 1000;
  async markAttendance(req, res) {
    try {
      const { driverId, vehicleId, siteName, checkInTime, status } = req.body;
      const checkIn = new Date(checkInTime);
      if (Number.isNaN(checkIn.valueOf())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid check-in time'
        });
      }

      const dayStart = new Date(checkIn);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkIn);
      dayEnd.setHours(23, 59, 59, 999);

      const existingAttendance = await Attendance.findOne({
        driver: driverId,
        date: { $gte: dayStart, $lt: dayEnd }
      });

      if (existingAttendance) {
        return res.status(400).json({
          success: false,
          message: 'Attendance already marked for today'
        });
      }

      const attendance = new Attendance({
        driver: driverId,
        vehicle: vehicleId,
        date: dayStart,
        checkIn: checkIn,
        siteName,
        status: status || 'PRESENT'
      });

      await attendance.save();
      await attendance.populate('driver', 'name phone');
      await attendance.populate('vehicle', 'vehicleNumber make model');

      res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        data: attendance
      });
    } catch (error) {
      logger.error('Attendance marking error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateAttendance(req, res) {
    try {
      const { checkOutTime, notes, status } = req.body;
      const attendance = await Attendance.findById(req.params.id);

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      if (checkOutTime) {
        const checkOut = new Date(checkOutTime);
        const workHours = ((checkOut - attendance.checkIn) / (1000 * 60 * 60)).toFixed(2);
        attendance.checkOut = checkOut;
        attendance.workHours = parseFloat(workHours);
      }
      if (notes !== undefined) attendance.notes = notes;
      if (status) attendance.status = status;

      await attendance.save();

      res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: attendance
      });
    } catch (error) {
      logger.error('Attendance update error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAttendance(req, res) {
    try {
      const { driverId, date, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      
      const filter = {};
      if (driverId) filter.driver = driverId;
      if (date) {
        const targetDate = new Date(date);
        filter.date = {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lt: new Date(targetDate.setHours(23, 59, 59, 999))
        };
      }

      const attendance = await Attendance.find(filter)
        .populate('driver', 'name phone')
        .populate('vehicle', 'vehicleNumber make model')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ date: -1 });

      const total = await Attendance.countDocuments(filter);

      res.json({
        success: true,
        data: attendance,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Attendance fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance'
      });
    }
  }

  async getDriverAttendance(req, res) {
    try {
      const driverId = req.params.driverId || req.user.id;
      const { startDate, endDate } = req.query;

      const filter = { driver: driverId };
      if (startDate && endDate) {
        filter.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const attendance = await Attendance.find(filter)
        .populate('vehicle', 'vehicleNumber make model')
        .sort({ date: -1 });

      const totalHours = attendance.reduce((sum, att) => sum + att.workHours, 0);
      const totalDays = attendance.length;
      const averageHours = totalDays > 0 ? totalHours / totalDays : 0;
      const totalEarnings = totalDays * AttendanceController.DAILY_DRIVER_SALARY;

      res.json({
        success: true,
        data: {
          driverId,
          totalHours,
          totalDays,
          averageHours,
          totalEarnings,
          attendance
        }
      });
    } catch (error) {
      logger.error('Driver attendance fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch driver attendance'
      });
    }
  }

  async getDailyAttendance(req, res) {
    try {
      const { date } = req.query;
      const targetDate = date ? new Date(date) : new Date();
      const startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);

      const attendance = await Attendance.find({
        date: { $gte: startDate, $lte: endDate }
      }).populate('driver', 'name phone').populate('vehicle', 'vehicleNumber make model');

      const presentCount = attendance.filter(att => att.status === 'PRESENT').length;
      const absentCount = attendance.filter(att => att.status === 'ABSENT').length;
      const totalHours = attendance.reduce((sum, att) => sum + att.workHours, 0);

      res.json({
        success: true,
        data: {
          date: targetDate.toISOString().split('T')[0],
          totalDrivers: attendance.length,
          present: presentCount,
          absent: absentCount,
          totalHours,
          attendance
        }
      });
    } catch (error) {
      logger.error('Daily attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch daily attendance'
      });
    }
  }

  async calculateSalary(req, res) {
    try {
      const { driverId, startDate, endDate } = req.body;
      
      const filter = { driver: driverId };
      if (startDate && endDate) {
        filter.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const attendance = await Attendance.find(filter)
        .populate('vehicle', 'vehicleNumber make model hourlyRate')
        .sort({ date: -1 });

      let totalSalary = 0;
      let details = [];

      for (const att of attendance) {
        const dailySalary = AttendanceController.DAILY_DRIVER_SALARY;
        totalSalary += dailySalary;

        details.push({
          date: att.date,
          hours: att.workHours,
          rate: AttendanceController.DAILY_DRIVER_SALARY,
          salary: dailySalary,
          site: att.siteName
        });
      }

      res.json({
        success: true,
        data: {
          driverId,
          totalSalary,
          period: { startDate, endDate },
          details
        }
      });
    } catch (error) {
      logger.error('Salary calculation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate salary'
      });
    }
  }

  async bulkAttendanceUpdate(req, res) {
    try {
      const updates = req.body;
      const results = [];

      for (const update of updates) {
        try {
          const attendance = await Attendance.findByIdAndUpdate(
            update.id,
            { ...update.data, updatedAt: new Date() },
            { new: true }
          );
          results.push({ success: true, id: update.id, data: attendance });
        } catch (error) {
          results.push({ success: false, id: update.id, error: error.message });
        }
      }

      res.json({
        success: true,
        message: 'Bulk attendance update completed',
        results
      });
    } catch (error) {
      logger.error('Bulk attendance update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update bulk attendance'
      });
    }
  }
}

module.exports = new AttendanceController();