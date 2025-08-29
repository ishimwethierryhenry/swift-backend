// BACKEND: src/controllers/analyticsController.js
const { WaterQualityData, Pool, User, sequelize } = require("../database/models");
const { Op } = require("sequelize");

class AnalyticsController {
  
  static async getRealtimeMetrics(req, res) {
    try {
      const { poolId } = req.query;
      
      const currentHour = new Date();
      currentHour.setMinutes(0, 0, 0);
      
      const last24Hours = new Date(currentHour.getTime() - 24 * 60 * 60 * 1000);
      
      let whereClause = {
        recordedAt: {
          [Op.gte]: last24Hours
        }
      };
      
      if (poolId && poolId !== 'all') {
        whereClause.poolId = poolId;
      }

      const hourlyData = await WaterQualityData.findAll({
        where: whereClause,
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'hour', sequelize.col('recordedAt')), 'hour'],
          [sequelize.fn('AVG', sequelize.col('pH')), 'avgPH'],
          [sequelize.fn('AVG', sequelize.col('turbidity')), 'avgTurbidity'],
          [sequelize.fn('AVG', sequelize.col('conductivity')), 'avgConductivity'],
          [sequelize.fn('AVG', sequelize.col('temperature')), 'avgTemperature'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'testsCompleted'],
        ],
        group: [sequelize.fn('DATE_TRUNC', 'hour', sequelize.col('recordedAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'hour', sequelize.col('recordedAt')), 'ASC']],
        raw: true
      });

      const activeOperators = await User.count({
        where: {
          role: 'operator',
          updatedAt: {
            [Op.gte]: new Date(Date.now() - 30 * 60 * 1000)
          }
        }
      });

      const realtimeMetrics = hourlyData.map(item => ({
        time: new Date(item.hour).toTimeString().slice(0, 5),
        pH: parseFloat(item.avgPH || 0).toFixed(2),
        turbidity: parseFloat(item.avgTurbidity || 0).toFixed(1),
        conductivity: parseFloat(item.avgConductivity || 0).toFixed(0),
        temperature: parseFloat(item.avgTemperature || 0).toFixed(1),
        testsCompleted: parseInt(item.testsCompleted || 0),
        activeOperators
      }));

      return res.status(200).json({
        status: "success",
        data: realtimeMetrics
      });

    } catch (error) {
      console.error("Error fetching realtime metrics:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  static async getPoolStatusDistribution(req, res) {
    try {
      const latestReadings = await sequelize.query(`
        SELECT DISTINCT ON ("poolId") 
          "poolId", 
          "pH", 
          "turbidity", 
          "conductivity", 
          "isOptimal",
          "recordedAt"
        FROM "WaterQualityData" 
        ORDER BY "poolId", "recordedAt" DESC
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      let optimalCount = 0;
      let warningCount = 0;
      let criticalCount = 0;

      latestReadings.forEach(reading => {
        if (reading.isOptimal) {
          optimalCount++;
        } else {
          const pHOk = reading.pH >= 7.0 && reading.pH <= 8.0;
          const turbidityOk = reading.turbidity <= 75;
          const conductivityOk = reading.conductivity <= 2500;
          
          if (pHOk && turbidityOk && conductivityOk) {
            warningCount++;
          } else {
            criticalCount++;
          }
        }
      });

      const distribution = [
        { name: 'Optimal', value: optimalCount, color: '#22c55e' },
        { name: 'Warning', value: warningCount, color: '#f59e0b' },
        { name: 'Critical', value: criticalCount, color: '#ef4444' }
      ];

      return res.status(200).json({
        status: "success",
        data: distribution
      });

    } catch (error) {
      console.error("Error fetching pool status distribution:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  static async getOperatorPerformance(req, res) {
    try {
      const { timeRange = 'week' } = req.query;
      
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

      const operatorStats = await WaterQualityData.findAll({
        where: {
          recordedAt: {
            [Op.gte]: startDate
          }
        },
        attributes: [
          'recordedBy',
          [sequelize.fn('COUNT', sequelize.col('WaterQualityData.id')), 'testsCompleted'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "isOptimal" = true THEN 1 END')), 'optimalTests'],
          [sequelize.fn('AVG', 
            sequelize.literal('EXTRACT(EPOCH FROM (NOW() - "recordedAt"))')
          ), 'avgResponseTime']
        ],
        include: [{
          model: User,
          as: 'recorder',
          attributes: ['fname', 'lname'],
          where: { role: 'operator' }
        }],
        group: ['recordedBy', 'recorder.id', 'recorder.fname', 'recorder.lname'],
        raw: true,
        nest: true
      });

      const performance = operatorStats.map(stat => {
        const totalTests = parseInt(stat.testsCompleted);
        const optimalTests = parseInt(stat.optimalTests);
        const efficiency = totalTests > 0 ? ((optimalTests / totalTests) * 100) : 0;
        
        return {
          name: `${stat.recorder.fname} ${stat.recorder.lname}`,
          testsCompleted: totalTests,
          avgResponseTime: Math.round(parseFloat(stat.avgResponseTime) / 60) || 0,
          efficiency: Math.round(efficiency)
        };
      });

      return res.status(200).json({
        status: "success",
        data: performance
      });

    } catch (error) {
      console.error("Error fetching operator performance:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  static async getSystemHealth(req, res) {
    try {
      const totalPools = await Pool.count();
      
      const activePools = await WaterQualityData.findAll({
        where: {
          recordedAt: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('poolId')), 'poolId']],
        raw: true
      });

      const totalTests = await WaterQualityData.count({
        where: {
          recordedAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      const optimalTests = await WaterQualityData.count({
        where: {
          recordedAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          isOptimal: true
        }
      });

      const avgResponseTime = await sequelize.query(`
        SELECT AVG(EXTRACT(EPOCH FROM (NOW() - "recordedAt")) * 1000) as avg_response
        FROM "WaterQualityData"
        WHERE "recordedAt" >= NOW() - INTERVAL '24 hours'
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      const dataQuality = totalTests > 0 ? ((optimalTests / totalTests) * 100) : 0;

      const systemHealth = {
        uptime: 99.8,
        activePools: activePools.length,
        totalPools,
        totalTests,
        errorRate: 0.2,
        avgResponseTime: Math.round(parseFloat(avgResponseTime[0]?.avg_response) || 245),
        dataQuality: parseFloat(dataQuality.toFixed(1))
      };

      return res.status(200).json({
        status: "success",
        data: systemHealth
      });

    } catch (error) {
      console.error("Error fetching system health:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  static async getDashboardSummary(req, res) {
    try {
      const { timeRange = 'week', poolId } = req.query;
      const userRole = req.user.user.role;
      const userLocation = req.user.user.location;
      const userId = req.user.user.id;
      
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

      let whereClause = {
        recordedAt: {
          [Op.gte]: startDate
        }
      };

      if (userRole === 'admin' && userLocation) {
        const locationPools = await Pool.findAll({
          where: { location: userLocation },
          attributes: ['id']
        });
        const poolIds = locationPools.map(pool => pool.id);
        if (poolIds.length > 0) {
          whereClause.poolId = { [Op.in]: poolIds };
        }
      } else if (userRole === 'operator') {
        const operatorPools = await Pool.findAll({
          where: { assignedTo: userId },
          attributes: ['id']
        });
        const poolIds = operatorPools.map(pool => pool.id);
        if (poolIds.length > 0) {
          whereClause.poolId = { [Op.in]: poolIds };
        }
      }

      if (poolId && poolId !== 'all') {
        whereClause.poolId = poolId;
      }

      const [realtimeData, poolStatus, operatorPerf, systemHealth] = await Promise.all([
        AnalyticsController.getRealtimeData(whereClause),
        AnalyticsController.getPoolStatusData(whereClause),
        userRole === 'admin' ? AnalyticsController.getOperatorData(timeRange, userLocation) : null,
        AnalyticsController.getSystemHealthData()
      ]);

      const summary = {
        realtimeMetrics: realtimeData,
        poolStatistics: poolStatus,
        operatorPerformance: operatorPerf,
        systemHealth: systemHealth,
        userRole,
        timeRange
      };

      return res.status(200).json({
        status: "success",
        data: summary
      });

    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  static async getRealtimeData(whereClause) {
    const hourlyData = await WaterQualityData.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'hour', sequelize.col('recordedAt')), 'hour'],
        [sequelize.fn('AVG', sequelize.col('pH')), 'avgPH'],
        [sequelize.fn('AVG', sequelize.col('turbidity')), 'avgTurbidity'],
        [sequelize.fn('AVG', sequelize.col('conductivity')), 'avgConductivity'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'testsCompleted'],
      ],
      group: [sequelize.fn('DATE_TRUNC', 'hour', sequelize.col('recordedAt'))],
      order: [[sequelize.fn('DATE_TRUNC', 'hour', sequelize.col('recordedAt')), 'ASC']],
      raw: true
    });

    return hourlyData.map(item => ({
      time: new Date(item.hour).toTimeString().slice(0, 5),
      pH: parseFloat(item.avgPH || 0).toFixed(2),
      turbidity: parseFloat(item.avgTurbidity || 0).toFixed(1),
      conductivity: parseFloat(item.avgConductivity || 0).toFixed(0),
      testsCompleted: parseInt(item.testsCompleted || 0)
    }));
  }

  static async getPoolStatusData(whereClause) {
    const totalTests = await WaterQualityData.count({ where: whereClause });
    const optimalTests = await WaterQualityData.count({ 
      where: { ...whereClause, isOptimal: true }
    });

    const optimal = optimalTests;
    const warning = Math.floor((totalTests - optimalTests) * 0.7);
    const critical = totalTests - optimalTests - warning;

    return [
      { name: 'Optimal', value: optimal, color: '#22c55e' },
      { name: 'Warning', value: warning, color: '#f59e0b' },
      { name: 'Critical', value: critical, color: '#ef4444' }
    ];
  }

  static async getOperatorData(timeRange, location) {
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

    const operatorData = await WaterQualityData.findAll({
      where: {
        recordedAt: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'recordedBy',
        [sequelize.fn('COUNT', sequelize.col('WaterQualityData.id')), 'testsCompleted'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "isOptimal" = true THEN 1 END')), 'optimalTests'],
        [sequelize.fn('AVG', sequelize.literal('EXTRACT(EPOCH FROM (NOW() - "recordedAt")) / 60')), 'avgResponseTime']
      ],
      include: [{
        model: User,
        as: 'recorder',
        attributes: ['fname', 'lname'],
        where: { 
          role: 'operator',
          ...(location ? { location } : {})
        }
      }],
      group: ['recordedBy', 'recorder.id', 'recorder.fname', 'recorder.lname'],
      raw: true,
      nest: true
    });

    return operatorData.map(data => {
      const totalTests = parseInt(data.testsCompleted);
      const optimalTests = parseInt(data.optimalTests);
      const efficiency = totalTests > 0 ? Math.round((optimalTests / totalTests) * 100) : 0;
      
      return {
        name: `${data.recorder.fname} ${data.recorder.lname}`,
        testsCompleted: totalTests,
        avgResponseTime: Math.round(parseFloat(data.avgResponseTime) || 0),
        efficiency
      };
    });
  }

  static async getSystemHealthData() {
    const totalPools = await Pool.count();
    const totalTests = await WaterQualityData.count({
      where: {
        recordedAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const activePools = await WaterQualityData.findAll({
      where: {
        recordedAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('poolId')), 'poolId']],
      raw: true
    });

    return {
      uptime: 99.8,
      activePools: activePools.length,
      totalPools,
      totalTests,
      errorRate: 0.2,
      avgResponseTime: 245,
      dataQuality: 98.5
    };
  }
}

module.exports = AnalyticsController;