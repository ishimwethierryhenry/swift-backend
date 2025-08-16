// src/database/migrations/20241225000000-add-guest-role.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // If you have existing data, first modify the column to allow the new enum value
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'operator', 'overseer', 'guest'),
      defaultValue: 'operator',
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove guest role and revert to original enum
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'operator', 'overseer'),
      defaultValue: 'operator',
      allowNull: true
    });
  },
};