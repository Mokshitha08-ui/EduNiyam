import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission, ROLE_DETAILS } from '../utils/permissions';

export const ProtectedRoute = ({ children, moduleKey }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific module key is required for this route, verify permissions
  if (moduleKey && !hasPermission(currentUser.role, moduleKey)) {
    // Redirect to their default permitted dashboard
    const defaultRoute = ROLE_DETAILS[currentUser.role]?.defaultRoute || '/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};
