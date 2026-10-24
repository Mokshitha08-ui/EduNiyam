import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  RotateCcw,
  LogOut,
  User,
  Shield,
  ChevronDown,
  ExternalLink,
  CheckCheck,
  AlertTriangle,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { ROLES, ROLE_DETAILS } from '../../utils/permissions';
import { Badge } from '../common/Badge';
import { DataModeToggle } from '../common/DataModeToggle';

export const Topbar = ({ isSidebarCollapsed, toggleSidebarMobile }) => {
  const { currentUser, logout, switchRole } = useAuth();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoData,
    applications
  } = useAppData();

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const roleRef = useRef(null);
  const searchRef = useRef(null);

  const unreadNotifications = notifications.filter(n => !n.read);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifMenu(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setShowRoleSwitcher(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick Global Search Handler
  const handleSearch = (q) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const filtered = applications.filter(app =>
      app.id.toLowerCase().includes(q.toLowerCase()) ||
      app.institutionName.toLowerCase().includes(q.toLowerCase()) ||
      app.region.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5);

    setSearchResults(filtered);
    setShowSearchDropdown(true);
  };

  const handleSelectSearchResult = (appId) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/applications/${appId}`);
  };

  const handleRoleChange = (newRole) => {
    switchRole(newRole);
    setShowRoleSwitcher(false);
    const targetRoute = ROLE_DETAILS[newRole]?.defaultRoute || '/dashboard';
    navigate(targetRoute);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all mock application, EVC, and compliance records back to initial prototype defaults?')) {
      resetDemoData();
      setShowUserMenu(false);
      alert('Mock dataset restored to original baseline.');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 shadow-subtle flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger & Global quick search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={toggleSidebarMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative w-full">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search applications, institutions, IDs..."
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-gov-600 focus:ring-1 focus:ring-gov-600 transition-all"
            />
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && (
            <div className="absolute left-0 mt-1 w-full bg-white rounded-xl shadow-elevation border border-slate-200 py-2 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Applications ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="px-3 py-3 text-xs text-slate-500 text-center">
                  No matching institutions or applications found.
                </div>
              ) : (
                searchResults.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleSelectSearchResult(app.id)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{app.id}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{app.institutionName}</p>
                    </div>
                    <Badge size="sm" variant={app.status === 'APPROVED' ? 'success' : 'primary'}>
                      {app.currentStage}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Data Mode Toggle, Role Switcher, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Data Mode Toggle (Dummy vs Live) */}
        <DataModeToggle />

        {/* Role Quick Switcher */}
        <div ref={roleRef} className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gov-200 bg-gov-50 text-gov-900 text-xs font-semibold hover:bg-gov-100 transition-colors"
            title="Switch demo persona"
          >
            <Shield className="w-3.5 h-3.5 text-gov-700" />
            <span className="hidden md:inline font-mono text-[11px]">Role:</span>
            <span className="truncate max-w-[120px]">{ROLE_DETAILS[currentUser?.role]?.name || 'Switch Role'}</span>
            <ChevronDown className="w-3 h-3 text-gov-600" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-elevation border border-slate-200 py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">Switch Demo Persona</p>
                <p className="text-[11px] text-slate-500">Test different role views and permissions:</p>
              </div>
              <div className="py-1">
                {Object.keys(ROLES).map(roleKey => {
                  const details = ROLE_DETAILS[roleKey];
                  const isCurrent = currentUser?.role === roleKey;
                  return (
                    <button
                      key={roleKey}
                      onClick={() => handleRoleChange(roleKey)}
                      className={`w-full px-3 py-2 text-left flex items-start gap-2.5 transition-colors ${
                        isCurrent ? 'bg-gov-50/80 text-gov-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`mt-0.5 w-2 h-2 rounded-full ${isCurrent ? 'bg-gov-700' : 'bg-slate-300'}`} />
                      <div>
                        <div className="text-xs font-medium">{details.name}</div>
                        <div className="text-[10px] text-slate-400">{details.badge}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications & Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-elevation border border-slate-200 z-50 overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                  <Badge size="sm" variant="danger">{unreadNotifications.length} unread</Badge>
                </div>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-gov-700 hover:text-gov-900 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.slice(0, 6).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      if (notif.link) {
                        navigate(notif.link);
                        setShowNotifMenu(false);
                      }
                    }}
                    className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 ${
                      !notif.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">{notif.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp?.split(' ')[1] || 'Just now'}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setShowNotifMenu(false);
                  }}
                  className="text-xs font-medium text-gov-700 hover:text-gov-900"
                >
                  View All Alerts & Escalations &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full border border-slate-300 object-cover"
            />
            <div className="hidden lg:block text-left text-xs">
              <p className="font-semibold text-slate-800 leading-none">{currentUser?.name?.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-none">{currentUser?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-elevation border border-slate-200 py-2 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <div className="mt-1">
                  <Badge size="sm" variant="navy">{ROLE_DETAILS[currentUser?.role]?.name}</Badge>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={handleResetData}
                  className="w-full px-4 py-2 text-left text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  Reset Prototype Mock Data
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
