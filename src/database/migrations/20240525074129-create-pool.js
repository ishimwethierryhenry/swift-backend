"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Pools", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,  // Changed from Sequelize.UUID
        // Removed defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING,
      },
      depth: {
        type: Sequelize.STRING,
      },
      l: {
        type: Sequelize.STRING,
      },
      w: {
        type: Sequelize.STRING,
      },
      location: {
        type: Sequelize.STRING,
      },
      assigned_to: {
        type: Sequelize.UUID,
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Pools");
  },
};