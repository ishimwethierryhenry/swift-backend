"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  class Pool extends Model {
    static associate(models) {
      Pool.belongsTo(models.User, { foreignKey: "assigned_to" });
    }
  }
  Pool.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      depth: DataTypes.STRING,
      l: DataTypes.STRING,
      w: DataTypes.STRING,
      location: DataTypes.STRING,
      assigned_to: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "Pool",
    }
  );

  Pool.beforeCreate((pool) => {
    pool.id = uuidv4();
  });
  return Pool;
};
