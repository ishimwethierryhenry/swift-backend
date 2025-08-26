// src/controllers/deviceController.js - UPDATED FOR UUID COMPATIBILITY
import { Pool, User } from "../database/models/index.js";

class DeviceController {
  // Start device recording for pool testing
  static async startRecording(req, res) {
    try {
      const { poolId, poolName, userId, userRole, testInitiated, timestamp } = req.body;

      // Validate required fields
      if (!poolId || !poolName || !userId) {
        return res.status(400).json({
          status: "error",
          message: "Missing required fields: poolId, poolName, userId"
        });
      }

      // Find pool by ID or name (handle both UUID and string IDs)
      let pool;
      
      // If poolId looks like a UUID, search by ID
      if (poolId.includes('-') || poolId.length === 36) {
        pool = await Pool.findByPk(poolId);
      } else {
        // Otherwise search by name or custom ID
        pool = await Pool.findOne({ 
          where: { 
            $or: [
              { id: poolId },
              { name: poolName }
            ]
          }
        });
      }

      // If pool not found by ID, try by name
      if (!pool) {
        pool = await Pool.findOne({ where: { name: poolName } });
      }

      // If still not found, return appropriate error
      if (!pool) {
        return res.status(404).json({
          status: "error",
          message: `Pool not found: ${poolName} (${poolId})`
        });
      }

      // Find user by ID (handle UUID)
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found"
        });
      }

      // Check if user has permission to test this pool
      if (userRole === "operator" && pool.assigned_to !== userId) {
        return res.status(403).json({
          status: "error",
          message: "You are not assigned to this pool"
        });
      }

      // Log the recording start
      console.log(`🔴 Recording started for pool: ${poolName} by user: ${user.fname} ${user.lname}`);
      console.log(`📊 Test initiated: ${testInitiated} at ${timestamp}`);

      return res.status(200).json({
        status: "success",
        message: "Device recording started successfully",
        data: {
          poolId: pool.id, // Return actual database pool ID
          poolName: pool.name,
          recordingStarted: true,
          timestamp: timestamp || new Date().toISOString(),
          userId,
          sessionId: `session_${pool.id}_${Date.now()}`
        }
      });

    } catch (error) {
      console.error("Error starting device recording:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // Stop device recording
  static async stopRecording(req, res) {
    try {
      const { poolId, poolName, userId } = req.body;

      // Validate required fields
      if (!poolId || !poolName || !userId) {
        return res.status(400).json({
          status: "error",
          message: "Missing required fields: poolId, poolName, userId"
        });
      }

      // Find pool (similar logic as startRecording)
      let pool;
      
      if (poolId.includes('-') || poolId.length === 36) {
        pool = await Pool.findByPk(poolId);
      } else {
        pool = await Pool.findOne({ 
          where: { 
            $or: [
              { id: poolId },
              { name: poolName }
            ]
          }
        });
      }

      if (!pool) {
        pool = await Pool.findOne({ where: { name: poolName } });
      }

      if (!pool) {
        return res.status(404).json({
          status: "error",
          message: `Pool not found: ${poolName}`
        });
      }

      // Verify user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found"
        });
      }

      console.log(`⏹️ Recording stopped for pool: ${poolName} by user: ${user.fname} ${user.lname}`);

      return res.status(200).json({
        status: "success",
        message: "Device recording stopped successfully",
        data: {
          poolId: pool.id,
          poolName: pool.name,
          recordingStopped: true,
          timestamp: new Date().toISOString(),
          userId
        }
      });

    } catch (error) {
      console.error("Error stopping device recording:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // Get device status for a pool
  static async getDeviceStatus(req, res) {
    try {
      const { poolId } = req.params;

      // Find pool with flexible ID matching
      let pool;
      
      if (poolId.includes('-') || poolId.length === 36) {
        pool = await Pool.findByPk(poolId);
      } else {
        pool = await Pool.findOne({ 
          where: { 
            $or: [
              { id: poolId },
              { name: poolId }
            ]
          }
        });
      }

      if (!pool) {
        return res.status(404).json({
          status: "error",
          message: "Pool not found"
        });
      }

      // Mock device status
      const deviceStatus = {
        poolId: pool.id,
        poolName: pool.name,
        isOnline: true,
        isRecording: false,
        lastPing: new Date().toISOString(),
        sensorStatus: {
          pH: "online",
          turbidity: "online",
          conductivity: "online",
          temperature: "online"
        },
        batteryLevel: 85,
        signalStrength: -45
      };

      return res.status(200).json({
        status: "success",
        data: deviceStatus
      });

    } catch (error) {
      console.error("Error getting device status:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }
}

export default DeviceController;