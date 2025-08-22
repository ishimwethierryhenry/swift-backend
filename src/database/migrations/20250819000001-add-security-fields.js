// src/database/migrations/20250819000001-add-security-fields.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add security-related fields to Users table
    await queryInterface.addColumn('Users', 'isFirstLogin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('Users', 'passwordChangedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'lastLoginAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'loginAttempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Users', 'lockedUntil', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'twoFactorEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('Users', 'twoFactorSecret', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'backupCodes', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'trustedDevices', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'securityNotifications', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    // Add indexes for performance
    await queryInterface.addIndex('Users', ['isFirstLogin']);
    await queryInterface.addIndex('Users', ['twoFactorEnabled']);
    await queryInterface.addIndex('Users', ['lastLoginAt']);
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('Users', ['isFirstLogin']);
    await queryInterface.removeIndex('Users', ['twoFactorEnabled']);
    await queryInterface.removeIndex('Users', ['lastLoginAt']);

    // Remove columns
    await queryInterface.removeColumn('Users', 'isFirstLogin');
    await queryInterface.removeColumn('Users', 'passwordChangedAt');
    await queryInterface.removeColumn('Users', 'lastLoginAt');
    await queryInterface.removeColumn('Users', 'loginAttempts');
    await queryInterface.removeColumn('Users', 'lockedUntil');
    await queryInterface.removeColumn('Users', 'twoFactorEnabled');
    await queryInterface.removeColumn('Users', 'twoFactorSecret');
    await queryInterface.removeColumn('Users', 'backupCodes');
    await queryInterface.removeColumn('Users', 'trustedDevices');
    await queryInterface.removeColumn('Users', 'securityNotifications');
  },
};