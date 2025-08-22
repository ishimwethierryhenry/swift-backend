"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Pool extends Model {
    static associate(models) {
      Pool.belongsTo(models.User, { foreignKey: "assigned_to" });
    }
  }
  Pool.init(
    {
      id: {
        type: DataTypes.STRING,  // ✅ CHANGED from DataTypes.UUID
        primaryKey: true,
      },
      name: DataTypes.STRING,
      depth: DataTypes.STRING,
      l: DataTypes.STRING,
      w: DataTypes.STRING,
      location: DataTypes.STRING,
      assigned_to: DataTypes.UUID,  // Keep UUID for user reference
    },
    {
      sequelize,
      modelName: "Pool",
    }
  );

  // Remove the beforeCreate hook since frontend generates the ID
  return Pool;
};