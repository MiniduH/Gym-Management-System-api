const { query } = require('../../config/database');

/**
 * Migration: Update users table role constraint to include trainer
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    console.log('Updating users table role constraint...');

    // First update any existing 'moderator' roles to 'trainer'
    await query(`
      UPDATE users
      SET role = 'trainer'
      WHERE role = 'moderator';
    `);

    // Drop existing constraint and add new one
    await query(`
      ALTER TABLE users
      DROP CONSTRAINT IF EXISTS users_role_check;
    `);

    await query(`
      ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('user', 'trainer', 'admin'));
    `);

    console.log('✅ Users table role constraint updated');
  } catch (error) {
    console.error('❌ Error updating users table:', error.message);
    throw error;
  }
};

/**
 * Rollback: Revert role constraint and change trainer back to moderator
 */
const down = async () => {
  try {
    console.log('Reverting users table role constraint...');

    // Drop existing constraint and add old one
    await query(`
      ALTER TABLE users
      DROP CONSTRAINT IF EXISTS users_role_check;
    `);

    await query(`
      ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('user', 'moderator', 'admin'));
    `);

    // Change 'trainer' roles back to 'moderator'
    await query(`
      UPDATE users
      SET role = 'moderator'
      WHERE role = 'trainer';
    `);

    console.log('✅ Users table role constraint reverted');
  } catch (error) {
    console.error('❌ Error reverting users table:', error.message);
    throw error;
  }
};

module.exports = { up, down };