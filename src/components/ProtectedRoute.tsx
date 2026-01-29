
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole, Permission } from '@/types/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions/roles, if false, ANY
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

const UnauthorizedPage: React.FC<{ 
  message?: string; 
  fallbackPath?: string; 
}> = ({ 
  message = "You don't have permission to access this page.", 
  fallbackPath = "/dashboard" 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            
            <Button 
              onClick={() => window.location.href = fallbackPath}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [],
  requiredPermissions = [],
  requireAll = false,
  fallbackPath = "/dashboard",
  showUnauthorized = true
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole, hasAnyRole, hasPermission } = usePermissions();
  const location = useLocation();

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requireAll 
      ? requiredRoles.every(role => hasRole(role))
      : requiredRoles.some(role => hasRole(role));

    if (!hasRequiredRole) {
      if (showUnauthorized) {
        return (
          <UnauthorizedPage 
            message={`This page requires ${requireAll ? 'all of these roles' : 'one of these roles'}: ${requiredRoles.join(', ')}`}
            fallbackPath={fallbackPath}
          />
        );
      }
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requireAll
      ? requiredPermissions.every(permission => hasPermission(permission))
      : requiredPermissions.some(permission => hasPermission(permission));

    if (!hasRequiredPermission) {
      if (showUnauthorized) {
        return (
          <UnauthorizedPage 
            message={`You don't have the required permissions to access this page.`}
            fallbackPath={fallbackPath}
          />
        );
      }
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
