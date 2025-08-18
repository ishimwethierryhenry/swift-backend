// src/controllers/deviceController.js
import { Pool, User } from "../database/models";

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

      // Verify pool exists
      const pool = await Pool.findByPk(poolId);
      if (!pool) {
        return res.status(404).json({
          status: "error",
          message: "Pool not found"
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

      // Check if user has permission to test this pool
      if (userRole === "operator" && pool.assigned_to !== userId) {
        return res.status(403).json({
          status: "error",
          message: "You are not assigned to this pool"
        });
      }

      // Log the recording start (you can expand this to actually control devices)
      console.log(`🔴 Recording started for pool: ${poolName} by user: ${user.fname} ${user.lname}`);
      console.log(`📊 Test initiated: ${testInitiated} at ${timestamp}`);

      // Here you would typically:
      // 1. Send commands to your IoT devices to start recording
      // 2. Initialize data collection processes
      // 3. Set up MQTT subscriptions
      // 4. Store recording session info in database

      return res.status(200).json({
        status: "success",
        message: "Device recording started successfully",
        data: {
          poolId,
          poolName,
          recordingStarted: true,
          timestamp: timestamp || new Date().toISOString(),
          userId,
          sessionId: `session_${poolId}_${Date.now()}` // Generate unique session ID
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

      // Verify pool exists
      const pool = await Pool.findByPk(poolId);
      if (!pool) {
        return res.status(404).json({
          status: "error",
          message: "Pool not found"
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

      // Log the recording stop
      console.log(`⏹️ Recording stopped for pool: ${poolName} by user: ${user.fname} ${user.lname}`);

      // Here you would typically:
      // 1. Send commands to your IoT devices to stop recording
      // 2. Finalize data collection processes
      // 3. Close MQTT connections
      // 4. Clean up recording session

      return res.status(200).json({
        status: "success",
        message: "Device recording stopped successfully",
        data: {
          poolId,
          poolName,
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

      // Verify pool exists
      const pool = await Pool.findByPk(poolId);
      if (!pool) {
        return res.status(404).json({
          status: "error",
          message: "Pool not found"
        });
      }

      // Here you would typically check actual device status
      // For now, return mock status
      const deviceStatus = {
        poolId,
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