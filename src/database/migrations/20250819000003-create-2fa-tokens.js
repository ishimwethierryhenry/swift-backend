// src/database/migrations/20250819000003-create-2fa-tokens.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TwoFactorTokens", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tokenType: {
        type: Sequelize.ENUM('setup', 'verification', 'backup'),
        allowNull: false,
        defaultValue: 'verification'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      isUsed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      deviceFingerprint: {
        type: Sequelize.STRING,
        allowNull: true,
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

    // Add indexes for performance
    await queryInterface.addIndex('TwoFactorTokens', ['userId']);
    await queryInterface.addIndex('TwoFactorTokens', ['token']);
    await queryInterface.addIndex('TwoFactorTokens', ['tokenType']);
    await queryInterface.addIndex('TwoFactorTokens', ['expiresAt']);
    await queryInterface.addIndex('TwoFactorTokens', ['isUsed']);
    await queryInterface.addIndex('TwoFactorTokens', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("TwoFactorTokens");
  },
};