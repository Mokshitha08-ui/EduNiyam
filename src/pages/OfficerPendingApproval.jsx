import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ShieldAlert,
  UserCheck,
  Building,
  Mail,
  Phone,
  ArrowLeft,
  LogOut,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const OfficerPendingApproval = ({ pendingDetails, onBackToLogin }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const details = pendingDetails || {
    id: 'REQ-PENDING',
    fullName: 'AICTE Officer Applicant',
    email: 'officer@aicte.gov.in',
    employeeId: 'EMP-PENDING',
    designation: 'Regional Officer',
    requestedRole: 'REGIONAL_OFFICER',
    department: 'Regional Approval Bureau',
    region: 'South-Western',
    contactNumber: '+91 98000 00000',
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };

  const handleLogout = () => {
    logout();
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-2xl mx-auto w-full">
        {/* Portal Emblem Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gov-900 p-3 shadow-lg border border-gov-800 mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect width="100" height="100" rx="20" fill="#0f2942" />
              <path d="M50 15 L82 30 L82 52 C82 72 68 85 50 90 C32 85 18 72 18 52 L18 30 Z" fill="#f8fafc" stroke="#38bdf8" strokeWidth="4"/>
              <circle cx="50" cy="50" r="14" fill="#0f2942"/>
              <circle cx="50" cy="50" r="6" fill="#f59e0b"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            All India Council for Technical Education
          </h1>
          <p className="text-sm font-semibold text-gov-700">
            AICTE Approval Management System — Official Cadre Desk
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-amber-50 border-b border-amber-200 p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-700" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-200/70 text-amber-900 border border-amber-400/50">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  Status: Pending Administrator Approval
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Request Ref: {details.id || 'REQ-AICTE'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-2">
                Officer Access Request Awaiting System Admin Verification
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Your request for official role privileges has been safely logged in the AICTE system. Privileged token generation and dashboard access are withheld until an authorized AICTE System Administrator reviews your credentials and confirms your employee ID.
              </p>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-6">
            {/* Applicant Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-gov-700" />
                Submitted Official Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Officer Full Name</span>
                  <span className="font-semibold text-slate-900">{details.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Staff / Employee ID</span>
                  <span className="font-mono font-bold text-gov-800">{details.employeeId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Requested Role / Cadre</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                    {details.requestedRole || details.designation}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Department / Bureau</span>
                  <span className="text-slate-800">{details.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Region</span>
                  <span className="text-slate-800">{details.region || 'All Regions'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Official Email</span>
                  <span className="font-mono text-slate-800">{details.email}</span>
                </div>
              </div>
            </div>

            {/* Approval Workflow Timeline */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Security Verification Workflow
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-900">Step 1: Access Request Submitted</p>
                    <p className="text-emerald-700 text-[11px]">Employee credentials and requested designation recorded with cryptographic password hash.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-amber-900">Step 2: Administrator Authorization (Current Stage)</p>
                    <p className="text-amber-700 text-[11px]">Authorized AICTE System Administrator cross-checks official staff records and validates jurisdiction.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-100 border border-slate-200 opacity-70">
                  <div className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold text-slate-500">3</div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-700">Step 3: Role Activation & Dashboard Dispatch</p>
                    <p className="text-slate-500 text-[11px]">Upon approval, official JWT credentials will grant access under the designated administrative role.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpline Notice */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-3 text-xs text-blue-900">
              <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Need assistance with your officer credentials?</span>
                <p className="text-blue-800 leading-relaxed text-[11px]">
                  Internal officer account verifications are processed by the AICTE HQ Informatics Division within 24 business hours. For urgent administrative clearance, contact the System Admin Cell at <strong className="font-semibold">admin-access@aicte-india.org</strong> with Reference Code <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">{details.id}</span>.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Login Page
              </button>

              <Button
                variant="outline"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
