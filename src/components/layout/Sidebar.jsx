import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  CalendarCheck,
  ShieldCheck,
  GraduationCap,
  Bell,
  BarChart3,
  Users,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { hasPermission } from '../../utils/permissions';

export const Sidebar = ({ isCollapsed, toggleCollapsed }) => {
  const { currentUser, roleDetails } = useAuth();
  const { notifications } = useAppData();
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    {
      key: 'dashboard',
      path: '/dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
    },
    {
      key: 'applications',
      path: '/applications',
      label: 'Applications Desk',
      icon: FileText,
    },
    {
      key: 'workflows',
      path: '/workflows',
      label: 'Workflow Monitor',
      icon: GitBranch,
    },
    {
      key: 'evc',
      path: '/evc',
      label: 'EVC Scheduling',
      icon: CalendarCheck,
    },
    {
      key: 'compliance',
      path: '/compliance',
      label: 'Compliance & Leases',
      icon: ShieldCheck,
    },
    {
      key: 'college-portal',
      path: '/college-portal',
      label: 'Institutional Portal',
      icon: GraduationCap,
    },
    {
      key: 'notifications',
      path: '/notifications',
      label: 'Alert & Escalations',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
      badgeColor: 'bg-rose-500'
    },
    {
      key: 'reports',
      path: '/reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
    {
      key: 'users',
      path: '/users',
      label: 'User Management',
      icon: Users,
    },
    {
      key: 'audit',
      path: '/audit',
      label: 'Regulatory Audit Trail',
      icon: History,
    },
    {
      key: 'settings',
      path: '/settings',
      label: 'Workflow & SLA Rules',
      icon: Settings,
    },
  ];

  // Filter based on user's role permissions
  const filteredNav = navItems.filter(item => {
    if (currentUser?.role === 'COLLEGE_REP' && item.key === 'college-portal') return true;
    return hasPermission(currentUser?.role, item.key);
  });

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-gov-900 text-slate-200 border-r border-gov-800 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Emblem */}
      <div>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gov-800/80 bg-gov-950/60">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* AICTE stylized emblem */}
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center p-1.5 shrink-0 border border-white/20 shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect width="100" height="100" rx="20" fill="#0f2942" />
                <path d="M50 15 L82 30 L82 52 C82 72 68 85 50 90 C32 85 18 72 18 52 L18 30 Z" fill="#e2e8f0" stroke="#38bdf8" strokeWidth="4"/>
                <circle cx="50" cy="50" r="14" fill="#0f2942"/>
                <circle cx="50" cy="50" r="6" fill="#f59e0b"/>
              </svg>
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  AICTE Portal
                </h1>
                <p className="text-[10px] text-slate-300 truncate font-medium">Approval Management System</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleCollapsed}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Active Role Notice */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-gov-950/50 border border-gov-700/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[11px] font-medium text-slate-300 truncate">
                {roleDetails?.badge || 'AICTE Official Portal'}
              </p>
            </div>
            {currentUser?.institution && (
              <p className="text-[10px] text-blue-300/80 truncate mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3 shrink-0" />
                {currentUser.institution}
              </p>
            )}
          </div>
        )}

        {/* Navigation list */}
        <nav className="mt-4 px-2 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gov-700 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-gov-800/80 hover:text-white'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-300' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {item.badge && !isCollapsed && (
                  <span className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white ${item.badgeColor || 'bg-blue-600'}`}>
                    {item.badge}
                  </span>
                )}
                {/* Collapsed dot badge */}
                {item.badge && isCollapsed && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-gov-900" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Notice */}
      <div className="p-3 border-t border-gov-800/80 bg-gov-950/40">
        {!isCollapsed ? (
          <div className="text-[10px] text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-blue-300">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Official AICTE Portal</span>
            </div>
            <p className="text-slate-300 leading-tight">
              AICTE Approval Management System
            </p>
          </div>
        ) : (
          <div className="flex justify-center text-blue-300" title="AICTE Approval Management System">
            <ShieldAlert className="w-4 h-4" />
          </div>
        )}
      </div>
    </aside>
  );
};
