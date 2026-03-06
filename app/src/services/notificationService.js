import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../dev/installRawTextGuard';

/**
 * Notification Service
 * Handles local notification tracking and status updates for complaint system
 * Note: Full push notifications will be implemented in production with a development build
 */

class NotificationService {
  constructor() {
    this.setupNotifications();
  }

  /**
   * Initialize notification handlers
   */
  setupNotifications() {
    try {
      console.log('Notification service initialized');
    } catch (error) {
      console.warn('Notification setup warning:', error.message);
    }
  }

  /**
   * Handle notification tap/press
   */
  handleNotificationResponse(response) {
    try {
      const data = response.data || {};
      if (data.type === 'COMPLAINT_UPDATE') {
        AsyncStorage.setItem('navigateToComplaint', JSON.stringify({
          complaintId: data.complaintId,
          status: data.status
        }));
      } else if (data.type === 'WORK_ASSIGNMENT') {
        AsyncStorage.setItem('navigateToWork', JSON.stringify({
          workId: data.workId
        }));
      }
    } catch (error) {
      logger.warn('Error handling notification:', error.message);
    }
  }

  /**
   * Send complaint status update notification
   * Logs notification event for production use with development build
   */
  async sendComplaintStatusNotification(
    driverName,
    complaintType,
    newStatus,
    complaintId,
    estimatedTime = null
  ) {
    try {
      const titleMap = {
        REPORTED: `New Complaint Assigned: ${complaintType}`,
        IN_PROGRESS: `Work Started on ${complaintType}`,
        RESOLVED: `Your Complaint is Resolved!`,
        CANCELLED: `Complaint Cancelled: ${complaintType}`
      };

      const messageMap = {
        REPORTED: `Your ${complaintType} complaint has been logged.`,
        IN_PROGRESS: `Our team started working on your ${complaintType} issue.${
          estimatedTime ? ` Estimated time: ${estimatedTime}` : ''
        }`,
        RESOLVED: `Your ${complaintType} complaint has been successfully resolved!`,
        CANCELLED: `Your ${complaintType} complaint has been cancelled.`
      };

      logger.info(`Notification: ${titleMap[newStatus]} - ${messageMap[newStatus]}`);
      
      // Store notification event for backend sync
      AsyncStorage.setItem(`notification_${complaintId}`, JSON.stringify({
        type: 'COMPLAINT_UPDATE',
        complaintId,
        status: newStatus,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      logger.warn('Notification warning:', error.message);
    }
  }

  /**
   * Send work assignment notification
   */
  async sendWorkAssignmentNotification(vehicleNumber, workDescription, workId) {
    try {
      logger.info(`Work Assignment: Vehicle ${vehicleNumber} - ${workDescription}`);
      
      AsyncStorage.setItem(`notification_${workId}`, JSON.stringify({
        type: 'WORK_ASSIGNMENT',
        workId,
        vehicleNumber,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      logger.warn('Notification warning:', error.message);
    }
  }

  /**
   * Send attendance reminder notification
   */
  async sendAttendanceReminderNotification(driverName) {
    try {
      logger.info(`Attendance Reminder: ${driverName}`);
    } catch (error) {
      logger.warn('Notification warning:', error.message);
    }
  }

  /**
   * Send scheduled notification (for scheduled reminders)
   */
  async sendScheduledNotification(title, body, secondsFromNow = 60, data = {}) {
    try {
      const notificationId = Date.now().toString();
      logger.info(`Scheduled: ${title} - ${body}`);
      return notificationId;
    } catch (error) {
      logger.warn('Notification warning:', error.message);
      return null;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId) {
    try {
      if (notificationId) {
        logger.info(`Notification ${notificationId} cancelled`);
      }
    } catch (error) {
      logger.warn('Notification warning:', error.message);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications() {
    try {
      logger.info('All notifications cancelled');
    } catch (error) {
      logger.warn('Notification warning:', error.message);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications() {
    try {
      return [];
    } catch (error) {
      logger.warn('Notification warning:', error.message);
      return [];
    }
  }

  /**
   * Request notification permissions
   */
  async requestNotificationPermissions() {
    try {
      logger.info('Notification permissions handled');
      return true;
    } catch (error) {
      logger.warn('Notification warning:', error.message);
      return false;
    }
  }

  /**
   * Cleanup subscriptions
   */
  cleanup() {
    // Cleanup handled
  }
}

export default new NotificationService();
