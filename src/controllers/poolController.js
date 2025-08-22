import { Pool, User, sequelize } from "../database/models";
import poolSchema from "../validations/poolSchema";

class PoolController {
  //create pool
  static async createPool(req, res) {
    try {
      // Add detailed logging for debugging
      console.log("📝 Pool creation request body:", req.body);
      
      const { error } = poolSchema.validate(req.body);
      if (error) {
        console.log("❌ Validation error:", error.details[0].message);
        return res
          .status(400)
          .json({ validationError: error.details[0].message });
      }

      const existingPool = await Pool.findOne({
        where: { name: req.body.name },
      });
      if (existingPool) {
        console.log("❌ Pool already exists:", req.body.name);
        return res.status(409).json({
          message: "Pool already exists !!!",
        });
      }

      // Generate a unique ID for the pool
      const poolId = `pool_${req.body.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
      
      console.log("🏊 Creating pool with ID:", poolId);

      const newPool = await Pool.create({
        id: poolId, // ✅ Add the generated ID
        name: req.body.name,
        depth: req.body.depth,
        l: req.body.l,
        w: req.body.w,
        location: req.body.location,
        // ❌ Removed duplicate depth field
        assigned_to: req.body.assigned_to,
      });

      console.log("✅ Pool created successfully:", newPool.id);

      return res.status(201).json({
        status: "Success",
        message: "Pool created successfully !!!",
        pool: newPool, // ✅ Changed from 'user' to 'pool'
      });
    } catch (error) {
      console.error("💥 Pool creation error:", error);
      return res
        .status(500)
        .json({ 
          message: "Internal server error", 
          error: error.message,
          details: error.stack // Add stack trace for debugging
        });
    }
  }

  //single Pool
  static async getSinglePool(req, res) {
    try {
      const singlePool = await Pool.findByPk(req.params.id); // ✅ Fixed: use findByPk instead of findOne
      if (!singlePool) {
        res.status(404).json({
          status: "fail",
          message: "Pool not found!!!",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: singlePool,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  static async groupAllPoolsByLocation(req, res) {
    try {
      const pools = await Pool.findAll({
        attributes: [
          "location",
          [sequelize.fn("COUNT", sequelize.col("location")), "pools"],
        ],
        group: "location",
      });
      res.status(200).json({
        status: "success",
        allPools: pools,
      });
    } catch (error) {
      res.status(404).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  //get all Pool
  static async getAllPools(req, res) {
    try {
      const { location } = req.params;
      const locationStr = location.replace("&", " ");
      const pools = await Pool.findAll({ where: { location: locationStr } });
      res.status(200).json({
        status: "success",
        allPools: pools,
      });
    } catch (error) {
      res.status(404).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  //get all Pool by operator
  static async getPoolsByOperator(req, res) {
    try {
      const { userId } = req.params;
      const pools = await Pool.findAll({ where: { assigned_to: userId } });
      res.status(200).json({
        status: "success",
        allPools: pools,
      });
    } catch (error) {
      res.status(404).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  // Update pool
  static async updatePool(req, res) {
    try {
      const { poolId } = req.params;
      const {
        newName,
        newDepth,
        newLength,
        newWidth,
        newLocation,
        newAssign,
      } = req.body;
      console.log(req.body);
      const pool = await Pool.findByPk(poolId);
      if (!pool) {
        return res.status(404).json({
          status: "fail",
          message: "Pool not found",
        });
      }

      pool.name = newName || pool.name;
      pool.depth = newDepth || pool.depth;
      pool.l = newLength || pool.l;
      pool.w = newWidth || pool.w;
      pool.location = newLocation || pool.location;
      pool.assigned_to = newAssign || pool.assigned_to;
      await pool.save();

      res.status(200).json({
        status: "success",
        message: "Pool updated successfully",
        pool: pool,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  // Assign user to pool (pool operator)
  static async assignUserToPool(req, res) {
    try {
      const userId = req.query.userId;
      const poolId = req.params.poolId;
      const user = await User.findByPk(userId);
      const pool = await Pool.findByPk(poolId);
      if (!user || !pool) {
        return res.status(404).json({
          status: "fail",
          message: "User or Pool not found",
        });
      }

      pool.assigned_to = userId;
      await pool.save();

      res.status(200).json({
        status: "success",
        message: "User assigned as pool operator",
        pool: pool,
        user: user,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }
  // Delete pool
  static async deletePool(req, res) {
    try {
      const poolId = req.params.id;
      const pool = await Pool.findByPk(poolId);
      if (!pool) {
        return res.status(404).json({
          status: "fail",
          message: "Pool not found",
        });
      }

      await pool.destroy();

      res.status(200).json({
        status: "success",
        message: "Pool deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }
}

export default PoolController;