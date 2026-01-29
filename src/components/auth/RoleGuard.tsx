import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole, Permission } from '@/types/auth';
import { Group } from '@/types/group';

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: Permission[];
  requireAll?: boolean;
  group?: Group;
  userRoleInGroup?: UserRole;
  fallback?: React.ReactNode;
  inverse?: boolean; // If true, show children when conditions are NOT met
}

/**
 * RoleGuard component for conditional rendering based on user roles and permissions
 * 
 * @param children - Content to render when conditions are met
 * @param roles - Required roles (user must have at least one, or all if requireAll is true)
 * @param permissions - Required permissions (user must have at least one, or all if requireAll is true)
 * @param requireAll - If true, user must have ALL specified roles/permissions
 * @param group - Group context for permission checking
 * @param userRoleInGroup - User's role in the specific group
 * @param fallback - Content to render when conditions are not met
 * @param inverse - If true, show children when conditions are NOT met
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles = [],
  permissions = [],
  requireAll = false,
  group,
  userRoleInGroup,
  fallback = null,
  inverse = false
}) => {
  const { hasRole, hasAnyRole, hasPermission, canPerformGroupAction } = usePermissions();

  // Check role requirements
  let hasRequiredRole = true;
  if (roles.length > 0) {
    hasRequiredRole = requireAll 
      ? roles.every(role => hasRole(role))
      : roles.some(role => hasRole(role));
  }

  // Check permission requirements
  let hasRequiredPermission = true;
  if (permissions.length > 0) {
    if (group) {
      // Group-specific permission checking
      hasRequiredPermission = requireAll
        ? permissions.every(permission => canPerformGroupAction(group, permission, userRoleInGroup))
        : permissions.some(permission => canPerformGroupAction(group, permission, userRoleInGroup));
    } else {
      // Global permission checking
      hasRequiredPermission = requireAll
        ? permissions.every(permission => hasPermission(permission))
        : permissions.some(permission => hasPermission(permission));
    }
  }

  const conditionsMet = hasRequiredRole && hasRequiredPermission;
  const shouldRender = inverse ? !conditionsMet : conditionsMet;

  return shouldRender ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;