const WorkflowsModel = require('../../models/Workflows');
const WorkflowNodesModel = require('../../models/WorkflowNodes');
const WorkflowNodeUsersModel = require('../../models/WorkflowNodeUsers');

/**
 * Migration: Create workflow tables
 * Run with: npm run migrate
 */
const up = async () => {
  try {
    const { query } = require('../../config/database');

    // 1. Create workflows table
    console.log('Creating workflows table...');
    await WorkflowsModel.createTable();

    // 2. Create workflow_nodes table
    console.log('Creating workflow_nodes table...');
    await WorkflowNodesModel.createTable();

    // 3. Create workflow_node_users table
    console.log('Creating workflow_node_users table...');
    await WorkflowNodeUsersModel.createTable();

    // 4. Create indexes for better performance
    console.log('Creating indexes...');
    await query('CREATE INDEX IF NOT EXISTS idx_workflows_is_active ON workflows(is_active);');
    await query('CREATE INDEX IF NOT EXISTS idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_workflow_nodes_order ON workflow_nodes(workflow_id, node_order);');
    await query('CREATE INDEX IF NOT EXISTS idx_workflow_node_users_node_id ON workflow_node_users(node_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_workflow_node_users_user_id ON workflow_node_users(user_id);');

    console.log('✅ Workflow tables created with indexes');
  } catch (error) {
    console.error('❌ Error creating workflow tables:', error.message);
    throw error;
  }
};

/**
 * Rollback: Drop workflow tables
 * Run with: npm run migrate:rollback
 */
const down = async () => {
  try {
    const { query } = require('../../config/database');

    console.log('Dropping workflow tables...');
    
    // Drop in reverse order due to foreign key constraints
    await query('DROP TABLE IF EXISTS workflow_node_users CASCADE;');
    await query('DROP TABLE IF EXISTS workflow_nodes CASCADE;');
    await query('DROP TABLE IF EXISTS workflows CASCADE;');

    console.log('✅ Workflow tables dropped');
  } catch (error) {
    console.error('❌ Error dropping workflow tables:', error.message);
    throw error;
  }
};

module.exports = { up, down };
