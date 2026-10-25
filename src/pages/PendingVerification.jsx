import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Clock,
  Building2,
  FileText,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ArrowLeft,
  HelpCircle,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const PendingVerification = ({ pendingDetails, onBackToLogin }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const details = pendingDetails || {
    institutionName: currentUser?.institution || currentUser?.institutionName || 'Technical Institution',
    institutionCode: currentUser?.institutionCode || '1-PENDING-REF',
    institutionType: currentUser?.institutionType || 'Engineering & Technology',
    state: currentUser?.state || 'Karnataka',
    district: currentUser?.district || 'Regional Directorate',
    representativeName: currentUser?.name || 'Authorized Signatory',
    email: currentUser?.email || 'representative@college.edu.in',
    contactNumber: currentUser?.phone || '+91 98000 00000',
    registeredAt: currentUser?.loginTime || new Date().toISOString().replace('T', ' ').slice(0, 16),
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Emblem & Portal Header */}
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
            AICTE Approval Management System — Institutional Portal
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
                  Status: Pending Verification
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Ref ID: {details.institutionCode}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-2">
                Institutional Registration Awaiting AICTE Approval
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Your institutional registration and representative credentials have been successfully logged in the system. Full portal access and approval workflow operations are restricted until official verification is finalized by the AICTE Regional Bureau.
              </p>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-6">
            {/* Institution Summary Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-gov-700" />
                Submitted Institution Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Official Institution Name</span>
                  <span className="font-semibold text-slate-900">{details.institutionName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Institution Code / College ID</span>
                  <span className="font-mono font-bold text-gov-800">{details.institutionCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Institution Type</span>
                  <span className="text-slate-800">{details.institutionType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">State & District</span>
                  <span className="text-slate-800">{details.district ? `${details.district}, ` : ''}{details.state}</span>
                </div>
              </div>
            </div>

            {/* Representative Details */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gov-700" />
                Authorized Representative
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <span className="font-semibold text-slate-900">{details.representativeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Official Email</span>
                  <span className="font-mono text-slate-800">{details.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact Number</span>
                  <span className="font-mono text-slate-800">{details.contactNumber}</span>
                </div>
              </div>
            </div>

            {/* Verification Lifecycle Stages */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                AICTE Verification Lifecycle
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-900">Step 1: Registration Form Submitted</p>
                    <p className="text-emerald-700 text-[11px]">Representative details and institution profile registered in AICTE database.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-amber-900">Step 2: Administrative Document Scrutiny (Current Stage)</p>
                    <p className="text-amber-700 text-[11px]">Regional Nodal Bureau verifies state NOC, registered trust charter, and land ownership records.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-100 border border-slate-200 opacity-70">
                  <div className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold text-slate-500">3</div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-700">Step 3: Portal Clearance & Approval Workflow Activation</p>
                    <p className="text-slate-500 text-[11px]">Upon regional officer clearance, status upgrades to VERIFIED and approval dashboard is enabled.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Bureau Help */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-3 text-xs text-blue-900">
              <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Need assistance with your verification status?</span>
                <p className="text-blue-800 leading-relaxed text-[11px]">
                  Institutional verifications typically take 2-4 working days. For urgent status inquiries, contact your AICTE Regional Bureau at <strong className="font-semibold">helpdesk-approval@aicte-india.org</strong> or call toll-free <strong className="font-semibold">1800-11-AICTE</strong> with Reference Code <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">{details.institutionCode}</span>.
                </p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Institutional Sign In
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
