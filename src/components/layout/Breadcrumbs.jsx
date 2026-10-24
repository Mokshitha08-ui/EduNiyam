import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const routeNames = {
    dashboard: 'Dashboard',
    applications: 'Applications',
    workflows: 'Workflow Monitor',
    evc: 'EVC Scheduling',
    compliance: 'Compliance & Leases',
    'college-portal': 'College Portal',
    notifications: 'Alerts & Escalations',
    reports: 'Reports & Analytics',
    users: 'Users & Roles',
    audit: 'Audit Trail',
    settings: 'Settings & SLA Rules'
  };

  return (
    <nav className="flex items-center text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1.5">
        <li className="inline-flex items-center">
          <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-gov-800 transition-colors">
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Home</span>
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = routeNames[value] || value;

          return (
            <li key={to} className="inline-flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">{displayName}</span>
              ) : (
                <Link to={to} className="hover:text-gov-800 transition-colors truncate max-w-[150px]">
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
