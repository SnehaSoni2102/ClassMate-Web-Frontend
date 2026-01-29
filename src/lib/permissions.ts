import { UserRole, Permission, User } from '@/types/auth';
import { Group, GroupType } from '@/types/group';

// Role-based permission mappings
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  student: [
    'view_dashboard',
    'join_groups'
  ],
  teacher: [
    'view_dashboard',
    'join_groups',
    'create_tests',
    'manage_group_members',
    'invite_members',
    'view_analytics'
  ],
  'group-manager': [
    'view_dashboard',
    'join_groups',
    'create_tests',
    'manage_group_members',
    'view_all_test_results',
    'invite_members',
    'remove_members',
    'view_analytics'
  ],
  manager: [
    'view_dashboard',
    'join_groups',
    'create_tests',
    'manage_group_members',
    'view_all_test_results',
    'invite_members',
    'remove_members',
    'view_analytics'
  ],
  admin: [
    'view_dashboard',
    'join_groups',
    'create_tests',
    'manage_group_members',
    'view_all_test_results',
    'manage_group_settings',
    'manage_billing',
    'invite_members',
    'remove_members',
    'promote_members',
    'view_analytics'
  ]
};

// Group type specific permissions
export const GROUP_TYPE_PERMISSIONS: Record<GroupType, Record<UserRole, Permission[]>> = {
  teacher: {
    student: ['view_dashboard', 'join_groups'],
    teacher: ['view_dashboard', 'join_groups', 'create_tests', 'manage_group_members', 'invite_members'],
    'group-manager': ['view_dashboard', 'join_groups', 'create_tests', 'manage_group_members', 'view_all_test_results', 'invite_members', 'remove_members'],
    manager: ['view_dashboard', 'join_groups', 'create_tests', 'manage_group_members', 'view_all_test_results', 'invite_members', 'remove_members'],
    admin: ['view_dashboard', 'join_groups', 'create_tests', 'manage_group_members', 'view_all_test_results', 'manage_group_settings', 'manage_billing', 'invite_members', 'remove_members', 'promote_members']
  },
  student: {
    student: ['view_dashboard', 'join_groups'],
    teacher: ['view_dashboard', 'join_groups', 'create_tests', 'manage_group_members'],
    'group-manager': ['view_dashboard', 'join_groups', 'create_tests', 'manage_group_members', 'view_all_test_results', 'invite_members', 'remove_members'],
    manager: ['view_dashboard', 'join_groups', 'create_tests', 'manage_group_members', 'view_all_test_results', 'invite_members', 'remove_members'],
    admin: ['view_dashboard', 'join_groups', 'create_tests', 'manage_group_members', 'view_all_test_results', 'manage_group_settings', 'invite_members', 'remove_members', 'promote_members']
  }
};

/**
 * Check if a user has a specific permission based on their role
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
};

/**
 * Check if a user has a specific role
 */
export const hasRole = (user: User | null, role: UserRole): boolean => {
  if (!user) return false;
  return user.role === role;
};

/**
 * Check if a user has any of the specified roles
 */
export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

/**
 * Check if a user can access a specific group
 */
export const canAccessGroup = (user: User | null, group: Group): boolean => {
  if (!user) return false;

  // Public groups can be accessed by anyone
  if (group.isPublic && !group.inviteOnly) return true;

  // Check if user is a member of the group
  // This would typically come from the group membership data
  // For now, we'll assume this check is done elsewhere
  return true;
};

/**
 * Check if a user can perform an action in a specific group context
 */
export const canPerformGroupAction = (
  user: User | null, 
  group: Group, 
  permission: Permission,
  userRoleInGroup?: UserRole
): boolean => {
  if (!user) return false;

  const roleToCheck = userRoleInGroup || user.role;
  const groupTypePermissions = GROUP_TYPE_PERMISSIONS[group.type];
  
  if (groupTypePermissions && groupTypePermissions[roleToCheck]) {
    return groupTypePermissions[roleToCheck].includes(permission);
  }

  return hasPermission(user, permission);
};

/**
 * Check if a user has a specific permission in a group context
 * This is the main function to use when checking permissions within a group
 */
export const hasGroupPermission = (
  userRoleInGroup: UserRole,
  groupType: GroupType,
  permission: Permission
): boolean => {
  const groupTypePermissions = GROUP_TYPE_PERMISSIONS[groupType];
  
  if (groupTypePermissions && groupTypePermissions[userRoleInGroup]) {
    return groupTypePermissions[userRoleInGroup].includes(permission);
  }

  // Fallback to global role permissions
  return ROLE_PERMISSIONS[userRoleInGroup]?.includes(permission) || false;
};

/**
 * Get all permissions for a user role
 */
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Get permissions for a user in a specific group context
 */
export const getGroupPermissions = (
  role: UserRole, 
  groupType: GroupType
): Permission[] => {
  return GROUP_TYPE_PERMISSIONS[groupType]?.[role] || ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if a role can be promoted to another role
 */
export const canPromoteRole = (currentRole: UserRole, targetRole: UserRole, promoterRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    student: 0,
    teacher: 1,
    'group-manager': 2,
    manager: 2,
    admin: 3
  };

  const currentLevel = roleHierarchy[currentRole];
  const targetLevel = roleHierarchy[targetRole];
  const promoterLevel = roleHierarchy[promoterRole];

  // Can only promote to a role lower than or equal to promoter's role
  // And target role must be higher than current role
  return promoterLevel > currentLevel && targetLevel <= promoterLevel && targetLevel > currentLevel;
};

/**
 * Check if a user can manage another user
 */
export const canManageUser = (manager: User | null, targetRole: UserRole): boolean => {
  if (!manager) return false;

  const roleHierarchy: Record<UserRole, number> = {
    student: 0,
    teacher: 1,
    'group-manager': 2,
    manager: 2,
    admin: 3
  };

  return roleHierarchy[manager.role] > roleHierarchy[targetRole];
};

/**
 * Filter permissions based on subscription status
 */
export const filterPermissionsBySubscription = (
  permissions: Permission[], 
  user: User
): Permission[] => {
  if (!user.subscription || user.subscription.status !== 'active') {
    // Remove premium permissions for non-subscribed users
    const premiumPermissions: Permission[] = [
      'manage_billing',
      'view_analytics',
      'manage_group_settings'
    ];
    
    return permissions.filter(permission => !premiumPermissions.includes(permission));
  }

  return permissions;
};

/**
 * Get user's role in a specific group
 * This function should be implemented based on your API structure
 * You might need to fetch this from group.members or a separate API call
 */
export const getUserRoleInGroup = (
  user: User | null,
  group: Group
): UserRole | null => {
  if (!user) return null;
  
  // This is a placeholder - you need to implement this based on your API
  // The group object should contain member information with roles
  // Example: group.members.find(member => member.userId === user._id)?.role
  
  // For now, return the user's global role as fallback
  return user.role;
};

/*
 * USAGE EXAMPLES:
 * 
 * 1. Check global permissions (outside any group):
 *    const canCreateTests = hasPermission(user, 'create_tests');
 * 
 * 2. Check permissions in a group context:
 *    const userRoleInGroup = getUserRoleInGroup(user, group);
 *    const canManageMembers = hasGroupPermission(userRoleInGroup, group.type, 'manage_group_members');
 * 
 * 3. Check if user can perform action in group:
 *    const canCreateTest = canPerformGroupAction(user, group, 'create_tests', userRoleInGroup);
 * 
 * 4. Check role-based access:
 *    const isAdmin = hasRole(user, 'admin');
 *    const isTeacherOrAdmin = hasAnyRole(user, ['teacher', 'admin']);
 * 
 * NOTE: The user.permissions field does not exist in the API response.
 * All permissions are derived from the user's role in the current context.
 */