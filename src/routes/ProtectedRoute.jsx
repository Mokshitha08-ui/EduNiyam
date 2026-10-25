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

  // Pending institutions must not access full approval dashboard features
  if (currentUser.status === 'PENDING_VERIFICATION') {
    return <Navigate to="/pending-verification" replace />;
  }

  // Pending officer applicants must not access officer dashboards
  if (currentUser.status === 'PENDING_APPROVAL') {
    return <Navigate to="/officer-pending-approval" replace />;
  }

  // If a specific module key is required for this route, verify permissions
  if (moduleKey && !hasPermission(currentUser.role, moduleKey)) {
    // Redirect to their default permitted dashboard (e.g. /college-portal for COLLEGE_REP)
    const defaultRoute = ROLE_DETAILS[currentUser.role]?.defaultRoute || '/college-portal';
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};
