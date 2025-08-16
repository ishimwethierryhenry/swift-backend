// src/database/seeders/20240525074653-Guest.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Users", [
      {
        id: "57409d12-ddad-4938-a37a-c17bc33aa4bd",
        fname: "Eric",
        lname: "Rugwizangoga",
        phone: "0789482950",
        email: "guest@gmail.com",
        pwd: "$2a$10$rBFBTSLIrH2jTMrBPe9QEO3hSVS6UvuYvkPkA1wYzba6B0FIhI1XW", //12345678
        role: "guest",
        gender: "male",
        location: "Gasabo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "57409d12-ddad-4938-a37a-c17bc33aa4be",
        fname: "jane",
        lname: "smith",
        phone: "078979906",
        email: "jane.guest@gmail.com",
        pwd: "$2a$10$rBFBTSLIrH2jTMrBPe9QEO3hSVS6UvuYvkPkA1wYzba6B0FIhI1XW", //12345678
        role: "guest",
        gender: "female",
        location: "Gikondo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", {
      role: "guest"
    }, {});
  },
};