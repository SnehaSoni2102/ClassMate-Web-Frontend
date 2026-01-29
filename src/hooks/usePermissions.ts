import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  hasPermission, 
  hasRole, 
  hasAnyRole, 
  canAccessGroup, 
  canPerformGroupAction,
  getPermissionsForRole,
  getGroupPermissions,
  canPromoteRole,
  canManageUser,
  filterPermissionsBySubscription
} from '@/lib/permissions';
import { Permission, UserRole, User } from '@/types/auth';
import { Group, GroupType } from '@/types/group';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    
    const rolePermissions = getPermissionsForRole(user.role);
    const userPermissions = user.permissions || [];
    
    // Combine role-based and user-specific permissions
    const allPermissions = [...new Set([...rolePermissions, ...userPermissions])];
    
    // Filter by subscription status
    return filterPermissionsBySubscription(allPermissions, user);
  }, [user]);

  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(user, permission);
  };

  const checkRole = (role: UserRole): boolean => {
    return hasRole(user, role);
  };

  const checkAnyRole = (roles: UserRole[]): boolean => {
    return hasAnyRole(user, roles);
  };

  const checkGroupAccess = (group: Group): boolean => {
    return canAccessGroup(user, group);
  };

  const checkGroupAction = (
    group: Group, 
    permission: Permission, 
    userRoleInGroup?: UserRole
  ): boolean => {
    return canPerformGroupAction(user, group, permission, userRoleInGroup);
  };

  const getGroupPermissionsList = (groupType: GroupType, role?: UserRole): Permission[] => {
    const roleToCheck = role || user?.role;
    if (!roleToCheck) return [];
    
    return getGroupPermissions(roleToCheck, groupType);
  };

  const checkRolePromotion = (currentRole: UserRole, targetRole: UserRole): boolean => {
    if (!user) return false;
    return canPromoteRole(currentRole, targetRole, user.role);
  };

  const checkUserManagement = (targetRole: UserRole): boolean => {
    return canManageUser(user, targetRole);
  };

  const isAdmin = (): boolean => {
    return checkRole('admin');
  };

  const isManager = (): boolean => {
    return checkRole('manager');
  };

  const isTeacher = (): boolean => {
    return checkRole('teacher');
  };

  const isStudent = (): boolean => {
    return checkRole('student');
  };

  const canCreateTests = (): boolean => {
    return checkPermission('create_tests');
  };

  const canManageMembers = (): boolean => {
    return checkPermission('manage_group_members');
  };

  const canViewAnalytics = (): boolean => {
    return checkPermission('view_analytics');
  };

  const canManageSettings = (): boolean => {
    return checkPermission('manage_group_settings');
  };

  const canManageBilling = (): boolean => {
    return checkPermission('manage_billing');
  };

  const hasSubscription = (): boolean => {
    return user?.subscription?.status === 'active' || false;
  };

  const isTrialUser = (): boolean => {
    return user?.subscription?.type === 'trial' || false;
  };

  const isPremiumUser = (): boolean => {
    return user?.subscription?.type === 'premium' || false;
  };

  return {
    user,
    permissions,
    
    // Permission checking functions
    hasPermission: checkPermission,
    hasRole: checkRole,
    hasAnyRole: checkAnyRole,
    canAccessGroup: checkGroupAccess,
    canPerformGroupAction: checkGroupAction,
    getGroupPermissions: getGroupPermissionsList,
    canPromoteRole: checkRolePromotion,
    canManageUser: checkUserManagement,
    
    // Role checking shortcuts
    isAdmin,
    isManager,
    isTeacher,
    isStudent,
    
    // Permission shortcuts
    canCreateTests,
    canManageMembers,
    canViewAnalytics,
    canManageSettings,
    canManageBilling,
    
    // Subscription checks
    hasSubscription,
    isTrialUser,
    isPremiumUser
  };
};