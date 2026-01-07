const { query } = require('../../config/database');

/**
 * Migration: Add address field and modify email/phone constraints
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Adding address field and updating constraints...');

    // Add address column
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}';
    `);

    // Make phone required (NOT NULL)
    await query(`
      ALTER TABLE users
      ALTER COLUMN phone SET NOT NULL;
    `);

    // Make email optional (remove NOT NULL constraint)
    await query(`
      ALTER TABLE users
      ALTER COLUMN email DROP NOT NULL;
    `);

    // Update existing records to have empty address if null
    await query(`
      UPDATE users
      SET address = '{}'
      WHERE address IS NULL;
    `);

    console.log('✅ Address field added and constraints updated');
  } catch (error) {
    console.error('❌ Error updating users table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Remove address field and revert constraints
 */
const down = async () => {
  try {
    console.log('Reverting address field and constraints...');

    // Remove address column
    await query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS address;
    `);

    // Make phone optional again
    await query(`
      ALTER TABLE users
      ALTER COLUMN phone DROP NOT NULL;
    `);

    // Make email required again
    await query(`
      ALTER TABLE users
      ALTER COLUMN email SET NOT NULL;
    `);

    console.log('✅ Address field removed and constraints reverted');
  } catch (error) {
    console.error('❌ Error reverting users table:', error.message);
    throw error;
  }
};

module.exports = { up, down };