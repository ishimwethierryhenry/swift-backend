// src/database/models/waterqualitydata.js
"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  class WaterQualityData extends Model {
    static associate(models) {
      WaterQualityData.belongsTo(models.Pool, { 
        foreignKey: "poolId", 
        as: "pool" 
      });
      WaterQualityData.belongsTo(models.User, { 
        foreignKey: "recordedBy", 
        as: "recorder" 
      });
    }

    // Method to determine if water quality is optimal
    static isOptimalQuality(pH, turbidity, conductivity) {
      return (
        pH >= 7.2 && pH <= 7.8 &&
        turbidity <= 50 &&
        conductivity <= 2000
      );
    }
  }

  WaterQualityData.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      poolId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pH: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        validate: {
          min: 0,
          max: 14
        }
      },
      turbidity: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      conductivity: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      temperature: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      dissolvedOxygen: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
      },
      recordedBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      recordedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      isOptimal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "WaterQualityData",
      hooks: {
        beforeCreate: (record) => {
          record.id = uuidv4();
          record.isOptimal = WaterQualityData.isOptimalQuality(
            record.pH,
            record.turbidity,
            record.conductivity
          );
        },
        beforeUpdate: (record) => {
          record.isOptimal = WaterQualityData.isOptimalQuality(
            record.pH,
            record.turbidity,
            record.conductivity
          );
        },
      },
    }
  );

  return WaterQualityData;
};