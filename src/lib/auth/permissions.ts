import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements } from 'better-auth/plugins/organization/access';

// Define your custom permissions (using default ones + any custom)
const statement = {
  ...defaultStatements, // This includes organization, member, invitation permissions
  // Add any custom resources if needed:
  // project: ["create", "update", "delete"],
} as const;

// Create access controller
export const ac = createAccessControl(statement);

// Create roles with permissions (optional - only if you want custom permissions)
export const member = ac.newRole({
  // organization: ["create", "share"],
  organization: ['delete'],
});

export const admin = ac.newRole({
  // Admin permissions (default ones are usually fine)
  organization: ['update', 'delete'],
  member: ['create', 'update'],
});

export const owner = ac.newRole({
  // Owner permissions (default ones are usually fine)
  organization: ['update', 'delete'],
  member: ['create', 'update', 'delete'],
});
