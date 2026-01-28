import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectIsAuthenticated, selectAuthLoading } from '../../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'gestionnaire' | 'caissier';
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredPermissions 
}) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const user = useSelector((state: any) => state.auth.user);
  const permissions = useSelector((state: any) => state.auth.permissions);

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    // Rediriger vers login avec retour prévu
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier le rôle si requis
  if (requiredRole && user?.role !== requiredRole) {
    // Vérifier si l'utilisateur a un rôle supérieur
    const roleHierarchy = {
      'caissier': 1,
      'gestionnaire': 2,
      'admin': 3
    };

    if (roleHierarchy[user?.role as keyof typeof roleHierarchy] < roleHierarchy[requiredRole]) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Vérifier les permissions si requises
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      permissions.includes(permission) || permissions.includes('all')
    );

    if (!hasAllPermissions) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

function useMutation(arg0: { mutationFn: () => Promise<void>; onSuccess: () => void; }) {
  throw new Error('Function not implemented.');
}
