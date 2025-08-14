"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Users", [
      {
        id: "57409d12-ddad-4938-a37a-c17bc33aa4ba",
        fname: "kalinda",
        lname: "vital",
        phone: "078979909",
        email: "admin@gmail.com",
        pwd: "$2a$10$rBFBTSLIrH2jTMrBPe9QEO3hSVS6UvuYvkPkA1wYzba6B0FIhI1XW", //12345678
        role: "admin",
        gender: "male",
        location: "serena",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "57409d12-ddad-4938-a37a-c17bc22aa4bc",
        fname: "john",
        lname: "doe",
        phone: "078979908",
        email: "john@gmail.com",
        pwd: "$2a$10$rBFBTSLIrH2jTMrBPe9QEO3hSVS6UvuYvkPkA1wYzba6B0FIhI1XW", //12345678
        role: "operator",
        gender: "male",
        location: "serena",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
