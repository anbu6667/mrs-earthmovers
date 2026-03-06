const mongoose = require('mongoose');
require('dotenv').config();

const WorkAssignment = require('./models/WorkAssignment');
const Attendance = require('./models/Attendance');

async function recalculateHours() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mrs-earthmovers');
    console.log('Connected to MongoDB');

    // Get all completed work assignments
    const completedAssignments = await WorkAssignment.find({
      status: 'COMPLETED',
      startTime: { $exists: true },
      endTime: { $exists: true }
    }).sort({ startTime: 1 });

    console.log(`Found ${completedAssignments.length} completed assignments`);

    // Group by driver and date
    const groupedByDriverDate = {};

    for (const assignment of completedAssignments) {
      const driverId = assignment.driver.toString();
      const dayStart = new Date(assignment.startTime);
      dayStart.setHours(0, 0, 0, 0);
      const dateKey = dayStart.toISOString().split('T')[0];
      
      const key = `${driverId}_${dateKey}`;
      
      if (!groupedByDriverDate[key]) {
        groupedByDriverDate[key] = {
          driver: assignment.driver,
          vehicle: assignment.vehicle,
          date: dayStart,
          assignments: []
        };
      }
      
      groupedByDriverDate[key].assignments.push(assignment);
    }

    console.log(`Processing ${Object.keys(groupedByDriverDate).length} driver-date combinations`);

    let attendanceCreated = 0;
    let attendanceUpdated = 0;

    // Process each driver-date combination
    for (const [key, data] of Object.entries(groupedByDriverDate)) {
      let totalHours = 0;
      let earliestStart = null;
      let latestEnd = null;

      // Calculate totals for this day
      for (const assignment of data.assignments) {
        if (assignment.startTime && assignment.endTime) {
          const hours = (assignment.endTime - assignment.startTime) / (1000 * 60 * 60);
          totalHours += hours;
          
          if (!earliestStart || assignment.startTime < earliestStart) {
            earliestStart = assignment.startTime;
          }
          if (!latestEnd || assignment.endTime > latestEnd) {
            latestEnd = assignment.endTime;
          }
        }
      }

      if (totalHours > 0) {
        const dayEnd = new Date(data.date);
        dayEnd.setDate(dayEnd.getDate() + 1);

        // Check if attendance already exists
        const existingAttendance = await Attendance.findOne({
          driver: data.driver,
          date: { $gte: data.date, $lt: dayEnd }
        });

        if (existingAttendance) {
          existingAttendance.checkIn = earliestStart;
          existingAttendance.checkOut = latestEnd;
          existingAttendance.workHours = parseFloat(totalHours.toFixed(2));
          if (!existingAttendance.vehicle) {
            existingAttendance.vehicle = data.vehicle;
          }
          await existingAttendance.save();
          attendanceUpdated++;
          console.log(`Updated attendance for driver ${data.driver} on ${data.date.toISOString().split('T')[0]}: ${totalHours.toFixed(2)} hours`);
        } else {
          await Attendance.create({
            driver: data.driver,
            vehicle: data.vehicle,
            date: data.date,
            checkIn: earliestStart,
            checkOut: latestEnd,
            workHours: parseFloat(totalHours.toFixed(2)),
            status: 'PRESENT'
          });
          attendanceCreated++;
          console.log(`Created attendance for driver ${data.driver} on ${data.date.toISOString().split('T')[0]}: ${totalHours.toFixed(2)} hours`);
        }
      }
    }

    console.log(`\nSummary:`);
    console.log(`- Attendance created: ${attendanceCreated}`);
    console.log(`- Attendance updated: ${attendanceUpdated}`);
    console.log(`- Total processed: ${attendanceCreated + attendanceUpdated}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

recalculateHours();
