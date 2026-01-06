const { query } = require('../../config/database');

/**
 * Permissions Seeder with Hierarchical Structure
 * Seeds default permissions with parent-child relationships
 * Parent IDs: 0 = root level (main categories)
 */

const permissions = [





  // Workflow - Parent
  {
    name: 'workflow',
    description: 'Workflow management',
    parent_id: null,
  },
  {
    name: 'view workflow',
    description: 'View workflow',
    parent_id: null, // Will be set after 'workflow' is created
  },
  {
    name: 'create workflow',
    description: 'Create workflow',
    parent_id: null, // Will be set after 'workflow' is created
  },
  {
    name: 'edit workflow',
    description: 'Edit workflow',
    parent_id: null, // Will be set after 'workflow' is created
  },
  {
    name: 'delete workflow',
    description: 'Delete workflow',
    parent_id: null, // Will be set after 'workflow' is created
  },
  {
    name: 'assign user to workflow',
    description: 'Assign user to workflow',
    parent_id: null, // Will be set after 'workflow' is created
  },

  // User - Parent
  {
    name: 'user',
    description: 'User management',
    parent_id: null,
  },
  {
    name: 'view users',
    description: 'View users',
    parent_id: null, // Will be set after 'user' is created
  },
  {
    name: 'add user',
    description: 'Add user',
    parent_id: null, // Will be set after 'user' is created
  },
  {
    name: 'edit user',
    description: 'Edit user',
    parent_id: null, // Will be set after 'user' is created
  },
  {
    name: 'delete user',
    description: 'Delete user',
    parent_id: null, // Will be set after 'user' is created
  },
  {
    name: 'change user status',
    description: 'Change user status',
    parent_id: null, // Will be set after 'user' is created
  },

  // Role - Parent
  {
    name: 'role',
    description: 'Role management',
    parent_id: null,
  },
  {
    name: 'view roles',
    description: 'View roles',
    parent_id: null, // Will be set after 'role' is created
  },
  {
    name: 'create role',
    description: 'Create role',
    parent_id: null, // Will be set after 'role' is created
  },
  {
    name: 'edit role',
    description: 'Edit role',
    parent_id: null, // Will be set after 'role' is created
  },
  {
    name: 'delete role',
    description: 'Delete role',
    parent_id: null, // Will be set after 'role' is created
  },


];

// Parent permission names that should have parent_id = null (root level)
const parentPermissions = [
  'workflow',
  'user',
  'role',
];

// Child permission mappings
const childPermissionMap = {
  'workflow': ['view workflow', 'create workflow', 'edit workflow', 'delete workflow', 'assign user to workflow'],
  'user': ['view users', 'add user', 'edit user', 'delete user', 'change user status'],
  'role': ['view roles', 'create role', 'edit role', 'delete role'],
};

const seed = async () => {
  try {
    console.log('🌱 Seeding permissions with hierarchical structure...');

    // Store parent IDs for reference
    const parentIds = {};

    // First pass: Insert all parent permissions (parent_id = null)
    for (const parentName of parentPermissions) {
      const insertQuery = `
        INSERT INTO permissions (name, description, parent_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO UPDATE SET description = $2, parent_id = $3
        RETURNING id, name;
      `;

      const result = await query(insertQuery, [parentName, 
        permissions.find(p => p.name === parentName)?.description || '', 
        null
      ]);

      if (result.rows.length > 0) {
        parentIds[parentName] = result.rows[0].id;
        console.log(`  ✓ Parent permission '${parentName}' (ID: ${result.rows[0].id})`);
      }
    }

    // Second pass: Insert all child permissions with correct parent_id
    for (const [parentName, childNames] of Object.entries(childPermissionMap)) {
      const parentId = parentIds[parentName];

      for (const childName of childNames) {
        const childPerm = permissions.find(p => p.name === childName);
        const insertQuery = `
          INSERT INTO permissions (name, description, parent_id)
          VALUES ($1, $2, $3)
          ON CONFLICT (name) DO UPDATE SET description = $2, parent_id = $3
          RETURNING id, name;
        `;

        const result = await query(insertQuery, [
          childName,
          childPerm?.description || '',
          parentId,
        ]);

        if (result.rows.length > 0) {
          console.log(`  ✓ Child permission '${childName}' (ID: ${result.rows[0].id}, Parent ID: ${parentId})`);
        }
      }
    }

    console.log(`✅ ${permissions.length} permissions seeded successfully with hierarchy`);
  } catch (error) {
    console.error('❌ Error seeding permissions:', error.message);
    throw error;
  }
};

module.exports = { seed, permissions };
