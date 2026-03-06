const mongoose = require('mongoose');
const WorkRequest = require('./models/WorkRequest');
const Attendance = require('./models/Attendance');
const Vehicle = require('./models/Vehicle');
require('./config/database');

async function debug() {
  try {
    // Check WorkRequest records
    const workRequests = await WorkRequest.find();
    console.log('\\n=== ALL WORK REQUESTS ===');
    console.log(`Total: ${workRequests.length}`);
    workRequests.forEach(wr => {
      console.log({
        id: wr._id,
        status: wr.status,
        actualCost: wr.actualCost,
        completedAt: wr.completedAt
      });
    });

    // Check completed work requests
    const completed = await WorkRequest.find({ status: 'COMPLETED' });
    console.log('\\n=== COMPLETED WORK REQUESTS ===');
    console.log(`Total completed: ${completed.length}`);
    const completedWithCost = completed.filter(wr => wr.actualCost);
    console.log(`Completed with actualCost: ${completedWithCost.length}`);
    completedWithCost.forEach(wr => {
      console.log({ actualCost: wr.actualCost });
    });
    const totalFromWorkRequest = completed.reduce((sum, wr) => sum + (wr.actualCost || 0), 0);
    console.log(`Total revenue from WorkRequest.actualCost: ${totalFromWorkRequest}`);

    // Check Attendance records
    const attendance = await Attendance.find().populate('vehicle', 'hourlyRate');
    console.log('\\n=== ALL ATTENDANCE RECORDS ===');
    console.log(`Total: ${attendance.length}`);
    attendance.forEach(att => {
      const hours = att.workHours || 0;
      const rate = att.vehicle?.hourlyRate || 0;
      console.log({
        id: att._id,
        workHours: hours,
        vehicleHourlyRate: rate,
        calculated: hours * rate
      });
    });
    const totalFromAttendance = attendance.reduce((sum, att) => {
      return sum + ((att.workHours || 0) * (att.vehicle?.hourlyRate || 0));
    }, 0);
    console.log(`Total revenue from Attendance (workHours × hourlyRate): ${totalFromAttendance}`);

    // Check Vehicle hourlyRate
    const vehicles = await Vehicle.find();
    console.log('\\n=== VEHICLES ===');
    console.log(`Total: ${vehicles.length}`);
    vehicles.forEach(v => {
      console.log({ vehicleNumber: v.vehicleNumber, hourlyRate: v.hourlyRate });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debug();
