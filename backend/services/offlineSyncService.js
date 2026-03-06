const axios = require('axios');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

class OfflineSyncService {
  constructor() {
    this.queue = [];
    this.isSyncing = false;
  }

  async addToQueue(data, operation) {
    try {
      this.queue.push({
        ...data,
        operation,
        timestamp: Date.now(),
        synced: false
      });
      
      await this.saveQueue();
      logger.info(`Added to offline queue: ${operation}`);
    } catch (error) {
      logger.error('Error adding to offline queue:', error);
      throw error;
    }
  }

  async syncAll(userId) {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    try {
      this.isSyncing = true;
      const savedQueue = await this.loadQueue();
      
      if (!savedQueue || savedQueue.length === 0) {
        return { message: 'No data to sync' };
      }

      const results = [];
      
      for (const item of savedQueue) {
        try {
          const result = await this.syncItem(item);
          results.push(result);
        } catch (error) {
          logger.error(`Failed to sync item: ${item.operation}`, error);
          results.push({ success: false, item, error: error.message });
        }
      }

      await this.clearQueue();
      this.isSyncing = false;
      
      return {
        message: 'Sync completed',
        results,
        total: savedQueue.length,
        success: results.filter(r => r.success).length
      };
    } catch (error) {
      this.isSyncing = false;
      logger.error('Sync error:', error);
      throw error;
    }
  }

  async syncItem(item) {
    try {
      const baseURL = process.env.API_BASE_URL || 'http://localhost:3000/api';
      
      switch (item.operation) {
        case 'attendance':
          return await this.syncAttendance(item, baseURL);
        case 'workAssignment':
          return await this.syncWorkAssignment(item, baseURL);
        case 'fuelLog':
          return await this.syncFuelLog(item, baseURL);
        case 'complaint':
          return await this.syncComplaint(item, baseURL);
        case 'photoProof':
          return await this.syncPhotoProof(item, baseURL);
        default:
          throw new Error(`Unknown operation: ${item.operation}`);
      }
    } catch (error) {
      throw new Error(`Sync failed for ${item.operation}: ${error.message}`);
    }
  }

  async syncAttendance(item, baseURL) {
    const response = await axios.post(`${baseURL}/attendance`, item.data, {
      headers: { 'Authorization': `Bearer ${item.token}` }
    });
    return { success: true, item, response: response.data };
  }

  async syncWorkAssignment(item, baseURL) {
    const response = await axios.post(`${baseURL}/work-assignments`, item.data, {
      headers: { 'Authorization': `Bearer ${item.token}` }
    });
    return { success: true, item, response: response.data };
  }

  async syncFuelLog(item, baseURL) {
    const response = await axios.post(`${baseURL}/fuel-logs`, item.data, {
      headers: { 'Authorization': `Bearer ${item.token}` }
    });
    return { success: true, item, response: response.data };
  }

  async syncComplaint(item, baseURL) {
    const response = await axios.post(`${baseURL}/complaints`, item.data, {
      headers: { 'Authorization': `Bearer ${item.token}` }
    });
    return { success: true, item, response: response.data };
  }

  async syncPhotoProof(item, baseURL) {
    const formData = new FormData();
    formData.append('file', item.data.file);
    Object.keys(item.data).forEach(key => {
      if (key !== 'file') {
        formData.append(key, item.data[key]);
      }
    });

    const response = await axios.post(`${baseURL}/photo-proofs`, formData, {
      headers: {
        'Authorization': `Bearer ${item.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return { success: true, item, response: response.data };
  }

  async saveQueue() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const queuePath = path.join(__dirname, '../data/offline-queue.json');
      await fs.writeFile(queuePath, JSON.stringify(this.queue, null, 2));
    } catch (error) {
      logger.error('Error saving offline queue:', error);
    }
  }

  async loadQueue() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const queuePath = path.join(__dirname, '../data/offline-queue.json');
      const data = await fs.readFile(queuePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Error loading offline queue:', error);
      return null;
    }
  }

  async clearQueue() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const queuePath = path.join(__dirname, '../data/offline-queue.json');
      await fs.writeFile(queuePath, JSON.stringify([], null, 2));
    } catch (error) {
      logger.error('Error clearing offline queue:', error);
    }
  }
}

module.exports = new OfflineSyncService();