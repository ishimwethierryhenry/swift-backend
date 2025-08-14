"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Pools", [
      {
        id: "32109d12-ddad-4938-a37a-c17bc33aa4ba",
        name: "pool01",
        depth: "1.2m",
        l: "9m",
        w: "4.5m",
        location: "serena",
        assigned_to: "57409d12-ddad-4938-a37a-c17bc22aa4bc", //john@gmail.com
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "32109d12-ddad-4938-a37a-c17bc22aa4bc",
        name: "pool02",
        depth: "1.2m",
        l: "12m",
        w: "6m",
        location: "serena",
        assigned_to: "57409d12-ddad-4938-a37a-c17bc22aa4bc", //john@gmail.com
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Pools", null, {});
  },
};
