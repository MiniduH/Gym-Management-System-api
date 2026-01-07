const { connectDB } = require('../../config/database');

require('dotenv').config();

/**
 * Seeder Runner
 * Runs all seeders in sequence
 * Usage: npm run seed
 */

const runSeeders = async () => {
  try {
    // Connect to database
    console.log('🔗 Connecting to PostgreSQL database...');
    await connectDB();

    console.log('🌱 Starting seeders...\n');

    // Import seeder files
    const permissionsSeeder = require('./permissionsSeeder');
    const sriLankaLocationsSeeder = require('./sriLankaLocationsSeeder');

    // Run seeders in sequence
    console.log('🌱 Seeder 1: Seeding permissions...');
    await permissionsSeeder.seed();
    console.log('✅ Seeder 1 completed\n');

    console.log('🌱 Seeder 2: Seeding Sri Lanka locations...');
    await sriLankaLocationsSeeder.seed();
    console.log('✅ Seeder 2 completed\n');

    console.log('✨ All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

runSeeders();