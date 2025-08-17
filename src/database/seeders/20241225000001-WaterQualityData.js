// =================== SAMPLE DATA SEEDER ===================
// src/database/seeders/20241225000001-WaterQualityData.js
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Generate sample data from January 2023 to August 2025
    const data = [];
    const pools = [
      "32109d12-ddad-4938-a37a-c17bc33aa4ba", // pool01
      "32209d12-ddad-4633-a37a-d11bc22ba4fc", // pool702897
      "32109d12-ddad-4938-a37a-c17bc22aa4bc", // pool02
    ];
    const recordedBy = "57409d12-ddad-4938-a37a-c17bc22aa4bc"; // john@gmail.com
    
    // Start from January 1, 2023
    const startDate = new Date('2023-01-01');
    // End at current date (August 17, 2025)
    const endDate = new Date();
    
    // Calculate total days between start and end date
    const timeDiff = endDate.getTime() - startDate.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    console.log(`Generating ${totalDays} days of data from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Skip future dates beyond today
      if (currentDate > endDate) break;
      
      pools.forEach(poolId => {
        // Generate realistic water quality data with seasonal variations
        const dayOfYear = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        
        // Add seasonal temperature variation
        const seasonalTemp = 27.5 + 7.5 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365); // Varies from 20-35°C
        const temperature = seasonalTemp + (Math.random() - 0.5) * 4; // Add some randomness
        
        // Generate other parameters with realistic ranges
        const pH = 7.0 + Math.random() * 1.5; // 7.0 - 8.5
        const turbidity = Math.random() * 60; // 0 - 60 NTU
        const conductivity = 1000 + Math.random() * 1500; // 1000 - 2500 µS/cm
        const dissolvedOxygen = 6 + Math.random() * 4; // 6 - 10 mg/L
        
        // Determine if water quality is optimal
        const isOptimal = pH >= 7.2 && pH <= 7.8 && turbidity <= 50 && conductivity <= 2000 && dissolvedOxygen >= 7;
        
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
    
    console.log(`Inserting ${data.length} water quality records`);
    await queryInterface.bulkInsert("WaterQualityData", data);
  },
  
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("WaterQualityData", null, {});
  },
};