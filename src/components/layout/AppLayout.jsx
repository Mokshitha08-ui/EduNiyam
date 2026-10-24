import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Breadcrumbs } from './Breadcrumbs';
import { LiveConnectionBanner } from '../common/LiveConnectionBanner';
import { AlertCircle, X } from 'lucide-react';

export const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:hidden transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          isCollapsed={false}
          toggleCollapsed={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Government System Banner */}
        {!dismissBanner && (
          <div className="bg-gov-950 text-blue-200 px-4 py-1.5 text-[11px] font-medium flex items-center justify-between border-b border-gov-800">
            <div className="flex items-center gap-2 mx-auto text-center truncate">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              <span className="truncate">
                <strong>AICTE Approval Management System:</strong> Centralized Institutional Approval Workflow, Compliance Monitoring &amp; Alert System.
              </span>
            </div>
            <button
              onClick={() => setDismissBanner(true)}
              className="text-blue-300 hover:text-white p-0.5 rounded"
              title="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <Topbar
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebarMobile={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Breadcrumbs />
          <LiveConnectionBanner />
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <p>
              &copy; 2026 All India Council for Technical Education (AICTE), Ministry of Education, Govt. of India.
            </p>
            <p className="font-mono text-[11px] text-slate-400">
              Frontend Client v1.0.0 &bull; Spring Boot REST Ready
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
