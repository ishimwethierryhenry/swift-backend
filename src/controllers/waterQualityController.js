// =================== WATER QUALITY CONTROLLER ===================
// src/controllers/waterQualityController.js
import { WaterQualityData, Pool, User, sequelize } from "../database/models";
import { Op } from "sequelize";
import waterQualitySchema from "../validations/waterQualitySchema";

class WaterQualityController {
  // Create new water quality record
  static async createRecord(req, res) {
    try {
      const { error } = waterQualitySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          validationError: error.details[0].message 
        });
      }

      const { poolId, pH, turbidity, conductivity, temperature, dissolvedOxygen, notes } = req.body;
      
      // Verify pool exists
      const pool = await Pool.findByPk(poolId);
      if (!pool) {
        return res.status(404).json({ message: "Pool not found" });
      }

      const newRecord = await WaterQualityData.create({
        poolId,
        pH,
        turbidity,
        conductivity,
        temperature,
        dissolvedOxygen,
        recordedBy: req.user.user.id,
        notes,
      });

      return res.status(201).json({
        status: "Success",
        message: "Water quality data recorded successfully",
        data: newRecord,
      });
    } catch (error) {
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }

  // Get historical data with filters
  static async getHistoricalData(req, res) {
    try {
      const { 
        poolId, 
        timeRange = 'all', 
        parameter = 'all',
        startDate,
        endDate,
        limit = 1000,
        offset = 0
      } = req.query;

      let whereClause = {};
      let dateFilter = {};

      // Pool filter
      if (poolId) {
        whereClause.poolId = poolId;
      }

      // Time range filter
      const now = new Date();
      switch (timeRange) {
        case 'today':
          dateFilter = {
            recordedAt: {
              [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            }
          };
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = {
            recordedAt: {
              [Op.gte]: weekAgo
            }
          };
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          dateFilter = {
            recordedAt: {
              [Op.gte]: monthAgo
            }
          };
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          dateFilter = {
            recordedAt: {
              [Op.gte]: quarterAgo
            }
          };
          break;
        case '2024':
          dateFilter = {
            recordedAt: {
              [Op.gte]: new Date('2024-01-01'),
              [Op.lt]: new Date('2025-01-01')
            }
          };
          break;
        case 'custom':
          if (startDate && endDate) {
            dateFilter = {
              recordedAt: {
                [Op.gte]: new Date(startDate),
                [Op.lte]: new Date(endDate)
              }
            };
          }
          break;
      }

      whereClause = { ...whereClause, ...dateFilter };

      // Get data with associations
      const data = await WaterQualityData.findAndCountAll({
        where: whereClause,
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
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return res.status(200).json({
        status: "success",
        data: data.rows,
        pagination: {
          total: data.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(data.count / limit)
        }
      });
    } catch (error) {
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }

  // Get aggregated statistics
  static async getStatistics(req, res) {
    try {
      const { poolId, timeRange = 'all' } = req.query;

      let whereClause = {};
      if (poolId) {
        whereClause.poolId = poolId;
      }

      // Apply time filter (same logic as getHistoricalData)
      const now = new Date();
      let dateFilter = {};
      
      switch (timeRange) {
        case 'today':
          dateFilter = {
            recordedAt: {
              [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            }
          };
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = {
            recordedAt: {
              [Op.gte]: weekAgo
            }
          };
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          dateFilter = {
            recordedAt: {
              [Op.gte]: monthAgo
            }
          };
          break;
      }

      whereClause = { ...whereClause, ...dateFilter };

      const stats = await WaterQualityData.findAll({
        where: whereClause,
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalRecords'],
          [sequelize.fn('AVG', sequelize.col('pH')), 'avgpH'],
          [sequelize.fn('AVG', sequelize.col('turbidity')), 'avgTurbidity'],
          [sequelize.fn('AVG', sequelize.col('conductivity')), 'avgConductivity'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "isOptimal" = true THEN 1 END')), 'optimalCount'],
        ],
        raw: true
      });

      const totalRecords = parseInt(stats[0].totalRecords) || 0;
      const optimalCount = parseInt(stats[0].optimalCount) || 0;
      const optimalPercentage = totalRecords > 0 ? ((optimalCount / totalRecords) * 100).toFixed(1) : 0;

      // Get recent trend data (last 30 days grouped by day)
      const trendData = await WaterQualityData.findAll({
        where: {
          ...whereClause,
          recordedAt: {
            [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        attributes: [
          [sequelize.fn('DATE', sequelize.col('recordedAt')), 'date'],
          [sequelize.fn('AVG', sequelize.col('pH')), 'avgpH'],
          [sequelize.fn('AVG', sequelize.col('turbidity')), 'avgTurbidity'],
          [sequelize.fn('AVG', sequelize.col('conductivity')), 'avgConductivity'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "isOptimal" = true THEN 1 END')), 'optimalCount'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
        ],
        group: [sequelize.fn('DATE', sequelize.col('recordedAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('recordedAt')), 'ASC']],
        raw: true
      });

      return res.status(200).json({
        status: "success",
        statistics: {
          totalRecords,
          avgpH: parseFloat(stats[0].avgpH || 0).toFixed(2),
          avgTurbidity: parseFloat(stats[0].avgTurbidity || 0).toFixed(2),
          avgConductivity: parseFloat(stats[0].avgConductivity || 0).toFixed(2),
          optimalPercentage,
          optimalCount,
        },
        trendData: trendData.map(item => ({
          date: item.date,
          avgpH: parseFloat(item.avgpH || 0).toFixed(2),
          avgTurbidity: parseFloat(item.avgTurbidity || 0).toFixed(2),
          avgConductivity: parseFloat(item.avgConductivity || 0).toFixed(2),
          optimalPercentage: item.totalCount > 0 ? ((item.optimalCount / item.totalCount) * 100).toFixed(1) : 0
        }))
      });
    } catch (error) {
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }

  // Get monthly aggregated data for charts
  static async getMonthlyData(req, res) {
    try {
      const { poolId, year = new Date().getFullYear() } = req.query;

      let whereClause = {
        recordedAt: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lt]: new Date(`${parseInt(year) + 1}-01-01`)
        }
      };

      if (poolId) {
        whereClause.poolId = poolId;
      }

      const monthlyData = await WaterQualityData.findAll({
        where: whereClause,
        attributes: [
          [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "recordedAt"')), 'month'],
          [sequelize.fn('AVG', sequelize.col('pH')), 'avgpH'],
          [sequelize.fn('AVG', sequelize.col('turbidity')), 'avgTurbidity'],
          [sequelize.fn('AVG', sequelize.col('conductivity')), 'avgConductivity'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "isOptimal" = true THEN 1 END')), 'optimalCount'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
        ],
        group: [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "recordedAt"'))],
        order: [[sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "recordedAt"')), 'ASC']],
        raw: true
      });

      const processedData = monthlyData.map(item => ({
        month: parseInt(item.month),
        monthName: new Date(year, item.month - 1).toLocaleString('default', { month: 'long' }),
        avgpH: parseFloat(item.avgpH || 0).toFixed(2),
        avgTurbidity: parseFloat(item.avgTurbidity || 0).toFixed(2),
        avgConductivity: parseFloat(item.avgConductivity || 0).toFixed(2),
        optimalCount: parseInt(item.optimalCount),
        totalCount: parseInt(item.totalCount),
        optimalPercentage: item.totalCount > 0 ? ((item.optimalCount / item.totalCount) * 100).toFixed(1) : 0
      }));

      return res.status(200).json({
        status: "success",
        data: processedData
      });
    } catch (error) {
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }

  // Update water quality record
  static async updateRecord(req, res) {
    try {
      const { recordId } = req.params;
      const { pH, turbidity, conductivity, temperature, dissolvedOxygen, notes } = req.body;

      const record = await WaterQualityData.findByPk(recordId);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      // Update fields
      if (pH !== undefined) record.pH = pH;
      if (turbidity !== undefined) record.turbidity = turbidity;
      if (conductivity !== undefined) record.conductivity = conductivity;
      if (temperature !== undefined) record.temperature = temperature;
      if (dissolvedOxygen !== undefined) record.dissolvedOxygen = dissolvedOxygen;
      if (notes !== undefined) record.notes = notes;

      await record.save();

      return res.status(200).json({
        status: "success",
        message: "Record updated successfully",
        data: record
      });
    } catch (error) {
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }

  // Delete water quality record
  static async deleteRecord(req, res) {
    try {
      const { recordId } = req.params;

      const record = await WaterQualityData.findByPk(recordId);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      await record.destroy();

      return res.status(200).json({
        status: "success",
        message: "Record deleted successfully"
      });
    } catch (error) {
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }
}

export default WaterQualityController;