const { query } = require('../../config/database');

/**
 * Migration: Create provinces and districts tables for Sri Lanka
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Creating provinces and districts tables...');

    // Create provinces table
    await query(`
      CREATE TABLE IF NOT EXISTS provinces (
        id SERIAL PRIMARY KEY,
        province_name VARCHAR(100) NOT NULL,
        province_code VARCHAR(10) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create districts table
    await query(`
      CREATE TABLE IF NOT EXISTS districts (
        id SERIAL PRIMARY KEY,
        district_name VARCHAR(100) NOT NULL,
        district_code VARCHAR(10) NOT NULL UNIQUE,
        province_id INTEGER NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_provinces_code ON provinces(province_code);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_districts_code ON districts(district_code);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_districts_province_id ON districts(province_id);`);

    console.log('✅ Provinces and districts tables created with indexes');
  } catch (error) {
    console.error('❌ Error creating provinces and districts tables:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop provinces and districts tables
 */
const down = async () => {
  try {
    console.log('Dropping provinces and districts tables...');

    await query('DROP TABLE IF EXISTS districts CASCADE;');
    await query('DROP TABLE IF EXISTS provinces CASCADE;');

    console.log('✅ Provinces and districts tables dropped');
  } catch (error) {
    console.error('❌ Error dropping provinces and districts tables:', error.message);
    throw error;
  }
};

module.exports = { up, down };