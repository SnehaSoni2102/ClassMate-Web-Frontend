import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types/auth';

interface PermissionGateProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
  inverse?: boolean;
}

/**
 * PermissionGate component for fine-grained permission-based rendering
 * 
 * @param children - Content to render when permission is granted
 * @param permission - Required permission
 * @param fallback - Content to render when permission is not granted
 * @param inverse - If true, show children when permission is NOT granted
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  fallback = null,
  inverse = false
}) => {
  const { hasPermission } = usePermissions();

  const hasRequiredPermission = hasPermission(permission);
  const shouldRender = inverse ? !hasRequiredPermission : hasRequiredPermission;

  return shouldRender ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;