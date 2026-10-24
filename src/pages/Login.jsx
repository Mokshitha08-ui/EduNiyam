import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Database, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { INITIAL_USERS, DEMO_PASSWORD } from '../data/mockUsers';
import { ROLE_DETAILS } from '../utils/permissions';
import { Button } from '../components/common/Button';
import { DataModeToggle } from '../components/common/DataModeToggle';

export const Login = () => {
  const { login, demoLogin, authError, setAuthError } = useAuth();
  const { dataMode } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Please enter your official email address.');
      return;
    }
    if (!password) {
      setAuthError('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    const user = await login(email, password, dataMode === 'live');
    setIsLoading(false);
    if (user) {
      const redirectUrl = location.state?.from?.pathname || ROLE_DETAILS[user.role]?.defaultRoute || '/dashboard';
      navigate(redirectUrl, { replace: true });
    }
  };

  const handleDemoSelect = (user) => {
    setEmail(user.email);
    setPassword(DEMO_PASSWORD);
    demoLogin(user.role);
    const redirectUrl = ROLE_DETAILS[user.role]?.defaultRoute || '/dashboard';
    navigate(redirectUrl, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gov-950 to-gov-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Emblem */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 p-3 shadow-xl border border-white/20 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect width="100" height="100" rx="20" fill="#0f2942" />
            <path d="M50 15 L82 30 L82 52 C82 72 68 85 50 90 C32 85 18 72 18 52 L18 30 Z" fill="#f8fafc" stroke="#38bdf8" strokeWidth="4"/>
            <circle cx="50" cy="50" r="14" fill="#0f2942"/>
            <circle cx="50" cy="50" r="6" fill="#f59e0b"/>
          </svg>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white">
          All India Council for Technical Education
        </h2>
        <p className="mt-1 text-sm text-slate-300 font-medium">
          AICTE Approval Management System
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
          Centralized e-Governance Portal
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white text-slate-900 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl border border-slate-200">
          {/* Data Mode Selector on Login */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Data Mode:
              </span>
            </div>
            <DataModeToggle />
          </div>

          {/* Error Notice */}
          {authError && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Official Email Address
              </label>
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@demo.gov.in"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-gov-700 focus:border-gov-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demoPassword123"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-gov-700 focus:border-gov-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-gov-800 focus:ring-gov-700"
                />
                <span className="text-slate-600">Remember this terminal session</span>
              </label>
              <span className="text-slate-400 font-mono text-[11px]">Demo: demoPassword123</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Secure Portal Login
            </Button>
          </form>

          {/* Quick Demo Personas */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quick One-Click Demo Personas
              </span>
              <span className="text-[11px] text-gov-700 bg-gov-50 px-2 py-0.5 rounded font-mono">
                Click any role to enter
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIAL_USERS.map((user) => {
                const details = ROLE_DETAILS[user.role];
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleDemoSelect(user)}
                    className="p-2.5 text-left rounded-lg border border-slate-200 hover:border-gov-600 hover:bg-gov-50/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-gov-900">
                        {details?.name}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-gov-700" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.department}</p>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-[11px] text-slate-400 text-center leading-relaxed">
              Note: This is a frontend demonstration prototype with dual Dummy/Live Data modes. In production, authentication and role authorization are strictly validated via Spring Security JWT tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
