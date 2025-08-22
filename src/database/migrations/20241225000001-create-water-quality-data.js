// src/database/migrations/20241225000001-create-water-quality-data.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("WaterQualityData", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      poolId: {
        type: Sequelize.STRING,  // Changed from Sequelize.UUID
        allowNull: false,
        references: {
          model: 'Pools',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pH: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
        validate: {
          min: 0,
          max: 14
        }
      },
      turbidity: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      conductivity: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      temperature: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: -10,
          max: 100
        }
      },
      dissolvedOxygen: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        validate: {
          min: 0
        }
      },
      recordedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      recordedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      isOptimal: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('WaterQualityData', ['poolId']);
    await queryInterface.addIndex('WaterQualityData', ['recordedAt']);
    await queryInterface.addIndex('WaterQualityData', ['isOptimal']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("WaterQualityData");
  },
};