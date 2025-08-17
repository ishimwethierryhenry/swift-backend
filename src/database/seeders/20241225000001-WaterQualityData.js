// =================== SAMPLE DATA SEEDER ===================
// src/database/seeders/20241225000001-WaterQualityData.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Generate sample data for the last 6 months
    const data = [];
    const pools = [
      "32109d12-ddad-4938-a37a-c17bc33aa4ba", // pool01
      "32209d12-ddad-4633-a37a-d11bc22ba4fc", // pool702897
      "32109d12-ddad-4938-a37a-c17bc22aa4bc", // pool02
    ];
    const recordedBy = "57409d12-ddad-4938-a37a-c17bc22aa4bc"; // john@gmail.com

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    for (let i = 0; i < 180; i++) { // 6 months of daily data
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      pools.forEach(poolId => {
        // Generate realistic water quality data
        const pH = 7.0 + Math.random() * 1.5; // 7.0 - 8.5
        const turbidity = Math.random() * 60; // 0 - 60 NTU
        const conductivity = 1000 + Math.random() * 1500; // 1000 - 2500 µS/cm
        const temperature = 20 + Math.random() * 15; // 20 - 35°C
        const dissolvedOxygen = 6 + Math.random() * 4; // 6 - 10 mg/L

        const isOptimal = pH >= 7.2 && pH <= 7.8 && turbidity <= 50 && conductivity <= 2000;

        data.push({
          id: require('uuid').v4(),
          poolId,
          pH: parseFloat(pH.toFixed(2)),
          turbidity: parseFloat(turbidity.toFixed(2)),
          conductivity: parseFloat(conductivity.toFixed(2)),
          temperature: parseFloat(temperature.toFixed(2)),
          dissolvedOxygen: parseFloat(dissolvedOxygen.toFixed(2)),
          recordedBy,
          recordedAt: currentDate,
          isOptimal,
          notes: isOptimal ? null : 'Requires attention',
          createdAt: currentDate,
          updatedAt: currentDate,
        });
      });
    }

    await queryInterface.bulkInsert("WaterQualityData", data);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("WaterQualityData", null, {});
  },
};
