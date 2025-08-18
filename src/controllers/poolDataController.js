// src/controllers/poolDataController.js
import { Pool, User, WaterQualityData } from "../database/models";

class PoolDataController {
  // Save test data received from devices
  static async saveTestData(req, res) {
    try {
      const { poolId, poolName, data, testMode, userId, timestamp } = req.body;

      // Validate required fields
      if (!poolId || !poolName || !data || !userId) {
        return res.status(400).json({
          status: "error",
          message: "Missing required fields: poolId, poolName, data, userId"
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

      // Process the incoming sensor data
      // Expected data format: { pH, turbidity, conductivity, temperature, dissolvedOxygen }
      const sensorData = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Validate sensor data
      if (!sensorData.pH || !sensorData.turbidity || !sensorData.conductivity) {
        return res.status(400).json({
          status: "error",
          message: "Invalid sensor data. pH, turbidity, and conductivity are required"
        });
      }

      // Create water quality record
      const waterQualityRecord = await WaterQualityData.create({
        poolId,
        pH: parseFloat(sensorData.pH),
        turbidity: parseFloat(sensorData.turbidity),
        conductivity: parseFloat(sensorData.conductivity),
        temperature: sensorData.temperature ? parseFloat(sensorData.temperature) : null,
        dissolvedOxygen: sensorData.dissolvedOxygen ? parseFloat(sensorData.dissolvedOxygen) : null,
        recordedBy: userId,
        recordedAt: timestamp ? new Date(timestamp) : new Date(),
        notes: testMode ? `Test data - ${poolName}` : null
      });

      console.log(`💾 Test data saved for pool: ${poolName}`);
      console.log(`📊 Data:`, {
        pH: waterQualityRecord.pH,
        turbidity: waterQualityRecord.turbidity,
        conductivity: waterQualityRecord.conductivity,
        temperature: waterQualityRecord.temperature,
        isOptimal: waterQualityRecord.isOptimal
      });

      return res.status(201).json({
        status: "success",
        message: "Test data saved successfully",
        data: {
          recordId: waterQualityRecord.id,
          poolId,
          poolName,
          testMode,
          timestamp: waterQualityRecord.recordedAt,
          isOptimal: waterQualityRecord.isOptimal,
          measurements: {
            pH: waterQualityRecord.pH,
            turbidity: waterQualityRecord.turbidity,
            conductivity: waterQualityRecord.conductivity,
            temperature: waterQualityRecord.temperature,
            dissolvedOxygen: waterQualityRecord.dissolvedOxygen
          }
        }
      });

    } catch (error) {
      console.error("Error saving test data:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // Get recent test data for a pool
  static async getRecentTestData(req, res) {
    try {
      const { poolId } = req.params;
      const { limit = 10 } = req.query;

      // Verify pool exists
      const pool = await Pool.findByPk(poolId);
      if (!pool) {
        return res.status(404).json({
          status: "error",
          message: "Pool not found"
        });
      }

      // Get recent water quality data
      const recentData = await WaterQualityData.findAll({
        where: { poolId },
        include: [
          {
            model: User,
            as: 'recorder',
            attributes: ['id', 'fname', 'lname']
          }
        ],
        order: [['recordedAt', 'DESC']],
        limit: parseInt(limit)
      });

      return res.status(200).json({
        status: "success",
        data: recentData,
        poolInfo: {
          id: pool.id,
          name: pool.name,
          location: pool.location
        }
      });

    } catch (error) {
      console.error("Error getting recent test data:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // Get pool testing statistics
  static async getPoolTestingStats(req, res) {
    try {
      const { poolId } = req.params;
      const { timeRange = 'week' } = req.query;

      // Verify pool exists
      const pool = await Pool.findByPk(poolId);
      if (!pool) {
        return res.status(404).json({
          status: "error",
          message: "Pool not found"
        });
      }

      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Get statistics
      const totalTests = await WaterQualityData.count({
        where: {
          poolId,
          recordedAt: {
            $gte: startDate
          }
        }
      });

      const optimalTests = await WaterQualityData.count({
        where: {
          poolId,
          recordedAt: {
            $gte: startDate
          },
          isOptimal: true
        }
      });

      const optimizationRate = totalTests > 0 ? ((optimalTests / totalTests) * 100).toFixed(1) : 0;

      return res.status(200).json({
        status: "success",
        data: {
          poolId,
          poolName: pool.name,
          timeRange,
          statistics: {
            totalTests,
            optimalTests,
            suboptimalTests: totalTests - optimalTests,
            optimizationRate: parseFloat(optimizationRate)
          }
        }
      });

    } catch (error) {
      console.error("Error getting pool testing stats:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // Simulate device data (for testing purposes)
  static async simulateDeviceData(req, res) {
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

      // Generate simulated sensor data
      const simulatedData = {
        pH: (7.0 + Math.random() * 1.5).toFixed(2), // 7.0 - 8.5
        turbidity: (Math.random() * 60).toFixed(2), // 0 - 60 NTU
        conductivity: (1000 + Math.random() * 1500).toFixed(2), // 1000 - 2500 µS/cm
        temperature: (25 + Math.random() * 10).toFixed(2), // 25 - 35°C
        dissolvedOxygen: (6 + Math.random() * 4).toFixed(2), // 6 - 10 mg/L
        timestamp: new Date().toISOString(),
        deviceId: `device_${pool.name}`,
        status: "simulated"
      };

      console.log(`🧪 Simulated data generated for pool: ${pool.name}`, simulatedData);

      return res.status(200).json({
        status: "success",
        message: "Simulated device data generated",
        data: simulatedData
      });

    } catch (error) {
      console.error("Error simulating device data:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }
}

export default PoolDataController;