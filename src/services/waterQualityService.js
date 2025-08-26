// BACKEND: src/services/waterQualityService.js 
// This file goes in your BACKEND project, not frontend

import { WaterQualityData, Pool, User } from '../database/models/index.js';
// If the above import doesn't work, try:
// const { WaterQualityData, Pool, User } = require('../database/models');

class WaterQualityService {
  // Start recording session
  static async startRecording({ poolId, poolName, userId, userRole, testInitiated, timestamp }) {
    try {
      console.log(`🔴 Starting recording for pool: ${poolName} (${poolId})`);
      
      // Store session information (you could create a Sessions table for this)
      const sessionData = {
        poolId,
        poolName,
        userId,
        userRole,
        testInitiated,
        timestamp: timestamp || new Date().toISOString(),
        status: 'recording_started'
      };

      // You could save session to database here if you have a Sessions model
      // await Sessions.create(sessionData);
      
      return {
        ...sessionData,
        message: `Recording started for ${poolName}`,
        sessionId: `session_${poolId}_${Date.now()}`
      };
    } catch (error) {
      console.error('Error in startRecording service:', error);
      throw new Error(`Failed to start recording: ${error.message}`);
    }
  }

  // Stop recording session
  static async stopRecording({ poolId, poolName, userId }) {
    try {
      console.log(`⏹️ Stopping recording for pool: ${poolName} (${poolId})`);
      
      return {
        poolId,
        poolName,
        userId,
        status: 'recording_stopped',
        timestamp: new Date().toISOString(),
        message: `Recording stopped for ${poolName}`
      };
    } catch (error) {
      console.error('Error in stopRecording service:', error);
      throw new Error(`Failed to stop recording: ${error.message}`);
    }
  }

  // Save test data to database
  static async saveTestData({ poolId, poolName, data, testMode, userId, timestamp }) {
    try {
      console.log(`💾 Saving test data for pool: ${poolName}`);
      console.log('Data received:', data);

      // Find pool by poolId or name
      let pool;
      
      // Try to find pool by ID first, then by name
      if (poolId && poolId.startsWith('pool_')) {
        pool = await Pool.findOne({ 
          where: { 
            name: poolName 
          } 
        });
      } else {
        pool = await Pool.findByPk(poolId);
      }

      // If pool not found, try to find by name
      if (!pool) {
        pool = await Pool.findOne({ where: { name: poolName } });
      }

      // If still not found, create a new pool
      if (!pool) {
        console.log(`Creating new pool: ${poolName}`);
        pool = await Pool.create({
          name: poolName,
          location: 'Test Location',
          capacity: 1000,
          assigned_to: userId
        });
      }

      // Prepare water quality data entry
      const waterQualityEntry = {
        poolId: pool.id,
        pH: parseFloat(data.ph) || null,
        turbidity: parseFloat(data.tbdt) || parseFloat(data.turbidity) || null,
        conductivity: parseFloat(data.tds) || parseFloat(data.conductivity) || null,
        temperature: parseFloat(data.temperature) || null,
        dissolvedOxygen: parseFloat(data.dissolvedOxygen) || null,
        recordedBy: userId,
        notes: testMode ? `Test session data - ${poolName}` : data.notes || null,
        recordedAt: timestamp ? new Date(timestamp) : new Date()
      };

      console.log('Saving water quality entry:', waterQualityEntry);

      // Save to water quality table
      const savedData = await WaterQualityData.create(waterQualityEntry);
      
      console.log(`✅ Test data saved successfully with ID: ${savedData.id}`);
      
      return {
        success: true,
        dataId: savedData.id,
        poolId: pool.id,
        poolName: poolName,
        timestamp: savedData.recordedAt,
        data: savedData,
        message: `Test data saved for ${poolName}`
      };

    } catch (error) {
      console.error('Error in saveTestData service:', error);
      console.error('Error details:', error.stack);
      throw new Error(`Failed to save test data: ${error.message}`);
    }
  }

  // Get recent test data
  static async getRecentTestData(poolId, limit = 10) {
    try {
      const data = await WaterQualityData.findAll({
        where: { poolId },
        include: [
          {
            model: Pool,
            as: 'pool',
            attributes: ['id', 'name', 'location']
          },
          {
            model: User,
            as: 'recorder',
            attributes: ['id', 'fname', 'lname']
          }
        ],
        order: [['recordedAt', 'DESC']],
        limit: parseInt(limit)
      });

      return {
        success: true,
        data: data,
        count: data.length
      };
    } catch (error) {
      console.error('Error getting recent test data:', error);
      throw new Error(`Failed to get recent test data: ${error.message}`);
    }
  }
}

export default WaterQualityService;