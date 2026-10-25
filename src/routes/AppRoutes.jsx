import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Applications } from '../pages/Applications';
import { ApplicationDetails } from '../pages/ApplicationDetails';
import { WorkflowMonitor } from '../pages/WorkflowMonitor';
import { EVCScheduling } from '../pages/EVCScheduling';
import { Compliance } from '../pages/Compliance';
import { CollegeDashboard } from '../pages/CollegeDashboard';
import { Notifications } from '../pages/Notifications';
import { Reports } from '../pages/Reports';
import { UsersRoles } from '../pages/UsersRoles';
import { AuditTrail } from '../pages/AuditTrail';
import { Settings } from '../pages/Settings';
import { NotFound } from '../pages/NotFound';
import { PendingVerification } from '../pages/PendingVerification';
import { OfficerPendingApproval } from '../pages/OfficerPendingApproval';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Pending Status Routes */}
      <Route path="/pending-verification" element={<PendingVerification />} />
      <Route path="/officer-pending-approval" element={<OfficerPendingApproval />} />

      {/* Protected Portal Routes under AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute moduleKey="dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="applications"
          element={
            <ProtectedRoute moduleKey="applications">
              <Applications />
            </ProtectedRoute>
          }
        />

        <Route
          path="applications/:id"
          element={
            <ProtectedRoute moduleKey="applications">
              <ApplicationDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="workflows"
          element={
            <ProtectedRoute moduleKey="workflows">
              <WorkflowMonitor />
            </ProtectedRoute>
          }
        />

        <Route
          path="evc"
          element={
            <ProtectedRoute moduleKey="evc">
              <EVCScheduling />
            </ProtectedRoute>
          }
        />

        <Route
          path="compliance"
          element={
            <ProtectedRoute moduleKey="compliance">
              <Compliance />
            </ProtectedRoute>
          }
        />

        <Route
          path="college-portal"
          element={
            <ProtectedRoute moduleKey="college-portal">
              <CollegeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="notifications"
          element={
            <ProtectedRoute moduleKey="notifications">
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="reports"
          element={
            <ProtectedRoute moduleKey="reports">
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="users"
          element={
            <ProtectedRoute moduleKey="users">
              <UsersRoles />
            </ProtectedRoute>
          }
        />

        <Route
          path="audit"
          element={
            <ProtectedRoute moduleKey="audit">
              <AuditTrail />
            </ProtectedRoute>
          }
        />

        <Route
          path="settings"
          element={
            <ProtectedRoute moduleKey="settings">
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
