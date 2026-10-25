import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  HelpCircle,
  FileText,
  UserCheck,
  Phone,
  MapPin,
  Landmark,
  Users,
  ClipboardCheck,
  ShieldCheck,
  X,
  ArrowLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { Button } from '../components/common/Button';
import { DataModeToggle } from '../components/common/DataModeToggle';
import { PendingVerification } from './PendingVerification';
import { OfficerPendingApproval } from './OfficerPendingApproval';
import { ROLE_DETAILS } from '../utils/permissions';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi NCR', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Chandigarh', 'Puducherry'
];

const INSTITUTION_TYPES = [
  'Engineering & Technology (UG & PG)',
  'Management & PGDM',
  'Pharmacy (B.Pharm & M.Pharm)',
  'Polytechnic & Diploma Engineering',
  'Architecture & Planning',
  'MCA & Computer Applications',
  'Applied Arts & Crafts',
  'Hotel Management & Catering Technology'
];

// Five Officer Designation Cards
const OFFICER_CARDS = [
  {
    id: 'REGIONAL_OFFICER',
    name: 'Regional Officer',
    icon: MapPin,
    description: 'Regional applications, assignments, and stage-wise monitoring.',
    role: 'REGIONAL_OFFICER',
    demoEmail: 'officer@demo.gov.in',
    department: 'Regional Approval & Scrutiny',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'BUREAU_OFFICER',
    name: 'Bureau Officer',
    icon: Landmark,
    description: 'Application scrutiny, approval workflow processing, and deficiency management.',
    role: 'BUREAU_OFFICER',
    demoEmail: 'bureau@demo.gov.in',
    department: 'Policy & Institutional Approvals Bureau',
    color: 'from-sky-600 to-blue-800',
  },
  {
    id: 'EVC_MEMBER',
    name: 'EVC Committee Member',
    icon: Users,
    description: 'Assigned inspections, EVC schedules, and committee evaluations.',
    role: 'EVC_MEMBER',
    demoEmail: 'committee@demo.gov.in',
    department: 'Expert Visit & Physical Inspection Panel',
    color: 'from-teal-600 to-emerald-800',
  },
  {
    id: 'COMPLIANCE_REVIEWER',
    name: 'Compliance Reviewer',
    icon: ClipboardCheck,
    description: 'Compliance documents, undertakings, verification, and deadlines.',
    role: 'COMPLIANCE_REVIEWER',
    demoEmail: 'compliance@demo.gov.in',
    department: 'Legal Compliance & Document Verification Cell',
    color: 'from-amber-600 to-orange-800',
  },
  {
    id: 'SYSTEM_ADMIN',
    name: 'System Administrator',
    icon: ShieldCheck,
    description: 'Authorized user management, workflow configuration, and system settings.',
    role: 'SYSTEM_ADMIN',
    demoEmail: 'admin@demo.gov.in',
    department: 'National Informatics & AICTE HQ',
    color: 'from-slate-700 to-gov-950',
    adminOnly: true,
  },
];

export const Login = () => {
  const {
    loginInstitution,
    registerInstitution,
    loginStaff,
    requestOfficerAccess,
    authError,
    setAuthError,
    isAuthenticating
  } = useAuth();

  const { dataMode } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();

  // Top Category: 'college' | 'officer'
  const [userCategory, setUserCategory] = useState('college');

  // Selected Officer Card (null means showing designation selection grid)
  const [selectedOfficerCard, setSelectedOfficerCard] = useState(null);

  // College Tab: 'signin' | 'signup'
  const [collegeTab, setCollegeTab] = useState('signin');

  // Officer Sub-Tab: 'signin' | 'request_access'
  const [officerTab, setOfficerTab] = useState('signin');

  // College Sign In Form
  const [collegeCode, setCollegeCode] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [collegePassword, setCollegePassword] = useState('');
  const [showCollegePassword, setShowCollegePassword] = useState(false);

  // College Sign Up Form
  const [collegeSignUpData, setCollegeSignUpData] = useState({
    institutionName: '',
    institutionCode: '',
    institutionType: 'Engineering & Technology (UG & PG)',
    state: 'Karnataka',
    district: '',
    address: '',
    representativeName: '',
    email: '',
    contactNumber: '',
    designation: 'Principal',
    password: '',
    confirmPassword: '',
  });
  const [showCollegeSignUpPass, setShowCollegeSignUpPass] = useState(false);
  const [showCollegeSignUpConfirm, setShowCollegeSignUpConfirm] = useState(false);

  // Officer Sign In Form
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [showOfficerPassword, setShowOfficerPassword] = useState(false);

  // Officer Request Access Form
  const [officerRequestData, setOfficerRequestData] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    designation: 'Regional Officer',
    requestedRole: 'REGIONAL_OFFICER',
    department: 'Regional Approval & Scrutiny',
    region: 'South-Western (Bangalore)',
    contactNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showOfficerReqPass, setShowOfficerReqPass] = useState(false);
  const [showOfficerReqConfirm, setShowOfficerReqConfirm] = useState(false);

  // Modals & Slips
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [collegeRegSuccess, setCollegeRegSuccess] = useState(null);
  const [officerReqSuccess, setOfficerReqSuccess] = useState(null);
  const [pendingVerificationUser, setPendingVerificationUser] = useState(null);
  const [pendingOfficerApproval, setPendingOfficerApproval] = useState(null);

  // ==========================================
  // HANDLERS: College Authentication
  // ==========================================
  const handleCollegeSignIn = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!collegeCode.trim()) {
      setAuthError('Please enter your Institution Code / College ID (e.g. 1-34981275).');
      return;
    }
    if (!collegeEmail.trim()) {
      setAuthError('Please enter the registered official email address.');
      return;
    }
    if (!collegePassword) {
      setAuthError('Please enter your account password.');
      return;
    }

    const result = await loginInstitution(
      {
        institutionCode: collegeCode.trim(),
        email: collegeEmail.trim(),
        password: collegePassword,
      },
      dataMode === 'live'
    );

    if (result.success && result.user) {
      if (result.user.status === 'PENDING_VERIFICATION') {
        setPendingVerificationUser(result.user);
        return;
      }
      navigate('/college-portal', { replace: true });
    } else if (result.isPending && result.registration) {
      setPendingVerificationUser(result.registration);
    }
  };

  const handleCollegeSignUp = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!collegeSignUpData.institutionName.trim()) {
      setAuthError('Official Institution Name is required.');
      return;
    }
    if (!collegeSignUpData.district.trim()) {
      setAuthError('District is required.');
      return;
    }
    if (!collegeSignUpData.address.trim()) {
      setAuthError('Full postal address of the campus is required.');
      return;
    }
    if (!collegeSignUpData.representativeName.trim()) {
      setAuthError('Authorized representative full name is required.');
      return;
    }
    if (!collegeSignUpData.email.trim() || !collegeSignUpData.email.includes('@')) {
      setAuthError('Please enter a valid official email address.');
      return;
    }
    if (!/^\d{10}$/.test(collegeSignUpData.contactNumber.trim())) {
      setAuthError('Contact number must be a valid 10-digit mobile number.');
      return;
    }
    if (collegeSignUpData.password.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }
    if (collegeSignUpData.password !== collegeSignUpData.confirmPassword) {
      setAuthError('Password and Confirm Password do not match.');
      return;
    }

    const result = await registerInstitution(collegeSignUpData, dataMode === 'live');
    if (result.success && result.data) {
      setCollegeRegSuccess(result.data);
    }
  };

  // ==========================================
  // HANDLERS: Officer Authentication
  // ==========================================
  const handleSelectOfficerCard = (card) => {
    setSelectedOfficerCard(card);
    setOfficerEmail('');
    setOfficerPassword('');
    setOfficerTab('signin');
    setAuthError(null);
    setOfficerReqSuccess(null);

    // Set default requested role for access request form
    setOfficerRequestData((prev) => ({
      ...prev,
      designation: card.name,
      requestedRole: card.role === 'SYSTEM_ADMIN' ? 'REGIONAL_OFFICER' : card.role,
      department: card.department,
    }));
  };

  const handleOfficerSignIn = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!officerEmail.trim()) {
      setAuthError('Please enter your official AICTE email address.');
      return;
    }
    if (!officerPassword) {
      setAuthError('Please enter your account password.');
      return;
    }

    const result = await loginStaff(
      {
        email: officerEmail.trim(),
        password: officerPassword,
        requestedRole: selectedOfficerCard?.role,
      },
      dataMode === 'live'
    );

    if (result.success && result.user) {
      const destRoute = ROLE_DETAILS[result.user.role]?.defaultRoute || '/dashboard';
      navigate(destRoute, { replace: true });
    } else if (result.isPending && result.request) {
      setPendingOfficerApproval(result.request);
    }
  };

  const handleOfficerRequestAccess = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!officerRequestData.fullName.trim()) {
      setAuthError('Official full name is required.');
      return;
    }
    if (!officerRequestData.email.trim() || !officerRequestData.email.includes('@')) {
      setAuthError('Valid official email address is required.');
      return;
    }
    if (!officerRequestData.employeeId.trim()) {
      setAuthError('Employee ID / Official Staff ID is required.');
      return;
    }
    if (!/^\d{10}$/.test(officerRequestData.contactNumber.trim())) {
      setAuthError('Contact number must be a valid 10-digit mobile number.');
      return;
    }
    if (officerRequestData.password.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }
    if (officerRequestData.password !== officerRequestData.confirmPassword) {
      setAuthError('Password and Confirm Password do not match.');
      return;
    }

    const result = await requestOfficerAccess(officerRequestData, dataMode === 'live');
    if (result.success && result.data) {
      setOfficerReqSuccess(result.data);
    }
  };

  // Demo auto-fill helpers
  const fillCollegeDemo = () => {
    setCollegeCode('1-34981275');
    setCollegeEmail('college@demo.edu.in');
    setCollegePassword('demoPassword123');
    setAuthError(null);
  };

  const fillOfficerDemo = (card) => {
    setOfficerEmail(card.demoEmail);
    setOfficerPassword('demoPassword123');
    setAuthError(null);
  };

  // Render Pending Slips if triggered
  if (pendingVerificationUser) {
    return (
      <PendingVerification
        pendingDetails={pendingVerificationUser}
        onBackToLogin={() => {
          setPendingVerificationUser(null);
          setAuthError(null);
        }}
      />
    );
  }

  if (pendingOfficerApproval) {
    return (
      <OfficerPendingApproval
        pendingDetails={pendingOfficerApproval}
        onBackToLogin={() => {
          setPendingOfficerApproval(null);
          setAuthError(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gov-950 to-gov-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl text-center">
        {/* Emblem */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 p-3 shadow-2xl border border-white/20 mb-3 backdrop-blur-sm">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect width="100" height="100" rx="20" fill="#0f2942" />
            <path d="M50 15 L82 30 L82 52 C82 72 68 85 50 90 C32 85 18 72 18 52 L18 30 Z" fill="#f8fafc" stroke="#38bdf8" strokeWidth="4"/>
            <circle cx="50" cy="50" r="14" fill="#0f2942"/>
            <circle cx="50" cy="50" r="6" fill="#f59e0b"/>
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          All India Council for Technical Education
        </h1>
        <p className="mt-1 text-sm text-slate-300 font-medium">
          AICTE Approval Management System
        </p>
        <p className="text-xs text-blue-300/80 font-mono mt-0.5">
          Secure Institutional and Official Access
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white text-slate-900 py-7 px-6 sm:px-10 rounded-2xl shadow-2xl border border-slate-200">
          {/* Top Bar: Data Mode Selector */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Integrated Portal Access Desk
              </span>
            </div>
            <DataModeToggle />
          </div>

          {/* User Category Segmented Control: College vs AICTE Officer */}
          <div className="grid grid-cols-2 p-1.5 mb-6 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setUserCategory('college');
                setSelectedOfficerCard(null);
                setAuthError(null);
              }}
              className={`py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2.5 ${
                userCategory === 'college'
                  ? 'bg-gov-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
              <span>College / Institution</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUserCategory('officer');
                setAuthError(null);
              }}
              className={`py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2.5 ${
                userCategory === 'officer'
                  ? 'bg-gov-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span>AICTE Officer</span>
            </button>
          </div>

          {/* Error Notice */}
          {authError && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Access Verification Notice:</span>
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* ========================================================
              CATEGORY 1: COLLEGE / INSTITUTION FLOW (Preserved)
             ======================================================== */}
          {userCategory === 'college' && (
            <div>
              {/* College Sub-tabs: Sign In vs Sign Up */}
              <div className="flex items-center justify-center gap-4 mb-6 pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setCollegeTab('signin');
                    setAuthError(null);
                    setCollegeRegSuccess(null);
                  }}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                    collegeTab === 'signin'
                      ? 'border-gov-800 text-gov-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Institutional Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCollegeTab('signup');
                    setAuthError(null);
                    setCollegeRegSuccess(null);
                  }}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                    collegeTab === 'signup'
                      ? 'border-gov-800 text-gov-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Institutional Sign Up
                </button>
              </div>

              {/* Registration Success Confirmation */}
              {collegeRegSuccess && (
                <div className="mb-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-emerald-950">
                          Institutional Registration Submitted
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          PENDING_VERIFICATION
                        </span>
                      </div>
                      <p className="text-emerald-800 text-[11px] leading-relaxed">
                        {collegeRegSuccess.message}
                      </p>
                      <div className="p-3 bg-white/80 rounded-lg border border-emerald-200 font-mono text-[11px]">
                        <span>Allocated PID: </span>
                        <strong className="text-gov-900 font-bold">{collegeRegSuccess.institutionCode}</strong>
                      </div>
                      <div className="pt-2 flex items-center gap-3">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setCollegeCode(collegeRegSuccess.institutionCode);
                            setCollegeTab('signin');
                            setCollegeRegSuccess(null);
                          }}
                        >
                          Proceed to Sign In
                        </Button>
                        <button
                          type="button"
                          onClick={() => {
                            setPendingVerificationUser(collegeRegSuccess);
                            setCollegeRegSuccess(null);
                          }}
                          className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline"
                        >
                          View Pending Slip
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* College Sign In Tab */}
              {collegeTab === 'signin' && (
                <form onSubmit={handleCollegeSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Institution Code / College ID <span className="text-rose-500">*</span>
                    </label>
                    <div className="mt-1.5 relative">
                      <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={collegeCode}
                        onChange={(e) => setCollegeCode(e.target.value)}
                        placeholder="e.g. 1-34981275"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-gov-700 focus:border-gov-700 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Registered Official Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="mt-1.5 relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={collegeEmail}
                        onChange={(e) => setCollegeEmail(e.target.value)}
                        placeholder="college@demo.edu.in"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-gov-700 focus:border-gov-700"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPasswordOpen(true)}
                        className="text-[11px] font-semibold text-gov-700 hover:text-gov-900 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="mt-1.5 relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type={showCollegePassword ? 'text' : 'password'}
                        value={collegePassword}
                        onChange={(e) => setCollegePassword(e.target.value)}
                        placeholder="Enter institutional account password"
                        className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-gov-700 focus:border-gov-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCollegePassword(!showCollegePassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showCollegePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-semibold mt-2"
                    isLoading={isAuthenticating}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Sign In to Institutional Portal
                  </Button>

                  {/* Dummy Auto-Fill Helper */}
                  {dataMode === 'dummy' && (
                    <div className="p-3 rounded-lg bg-gov-50/70 border border-gov-200/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-gov-900 block">Verified Demo College:</span>
                        <span className="text-slate-600 text-[11px] font-mono">
                          1-34981275 | college@demo.edu.in
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={fillCollegeDemo}
                        className="px-2.5 py-1 text-[11px] font-bold uppercase rounded bg-gov-700 text-white hover:bg-gov-800 transition-colors shrink-0"
                      >
                        Auto Fill
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* College Sign Up Tab */}
              {collegeTab === 'signup' && (
                <form onSubmit={handleCollegeSignUp} className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
                      1. Institution Profile
                    </h3>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Official Institution Name *</label>
                      <input
                        type="text"
                        value={collegeSignUpData.institutionName}
                        onChange={(e) => setCollegeSignUpData({ ...collegeSignUpData, institutionName: e.target.value })}
                        placeholder="e.g. National Institute of Technology"
                        className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-gov-700"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">College ID (Optional)</label>
                        <input
                          type="text"
                          value={collegeSignUpData.institutionCode}
                          onChange={(e) => setCollegeSignUpData({ ...collegeSignUpData, institutionCode: e.target.value })}
                          placeholder="e.g. 1-88992211"
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Institution Type *</label>
                        <select
                          value={collegeSignUpData.institutionType}
                          onChange={(e) => setCollegeSignUpData({ ...collegeSignUpData, institutionType: e.target.value })}
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                        >
                          {INSTITUTION_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">State / UT *</label>
                        <select
                          value={collegeSignUpData.state}
                          onChange={(e) => setCollegeSignUpData({ ...collegeSignUpData, state: e.target.value })}
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">District *</label>
                        <input
                          type="text"
                          value={collegeSignUpData.district}
                          onChange={(e) => setCollegeSignUpData({ ...collegeSignUpData, district: e.target.value })}
                          placeholder="e.g. Bengaluru Urban"
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Full Campus Address *</label>
                      <textarea
                        rows={2}
                        value={collegeSignUpData.address}
                        onChange={(e) => setCollegeSignUpData({ ...collegeSignUpData, address: e.target.value })}
                        placeholder="Complete postal address..."
                        className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg resize-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
                      2. Authorized Representative
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
                        <input
                          type="text"
                          value={collegeSignUpData.representativeName}
                          onChange={(e) => setCollegeSignUpData({ ...collegeSignUpData, representativeName: e.target.value })}
                          placeholder="Dr. Rajeshwari Sharma"
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Designation *</label>
                        <select
                          value={collegeSignUpData.designation}
                          onChange={(e) => setCollegeSignUpData({ ...collegeSignUpData, designation: e.target.value })}
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                        >
                          <option value="Principal">Principal</option>
                          <option value="Director">Director</option>
                          <option value="Dean / Registrar">Dean / Registrar</option>
                          <option value="Authorized Nodal Officer">Authorized Nodal Officer</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Official Email *</label>
                        <input
                          type="email"
                          value={collegeSignUpData.email}
                          onChange={(e) => setCollegeSignUpData({ ...collegeSignUpData, email: e.target.value })}
                          placeholder="principal@college.ac.in"
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Mobile (10 Digits) *</label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={collegeSignUpData.contactNumber}
                          onChange={(e) => setCollegeSignUpData({ ...collegeSignUpData, contactNumber: e.target.value.replace(/\D/g, '') })}
                          placeholder="9845112233"
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Account Password *</label>
                        <input
                          type="password"
                          value={collegeSignUpData.password}
                          onChange={(e) => setCollegeSignUpData({ ...collegeSignUpData, password: e.target.value })}
                          placeholder="Min 8 chars"
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Confirm Password *</label>
                        <input
                          type="password"
                          value={collegeSignUpData.confirmPassword}
                          onChange={(e) => setCollegeSignUpData({ ...collegeSignUpData, confirmPassword: e.target.value })}
                          placeholder="Repeat password"
                          className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-semibold mt-2"
                    isLoading={isAuthenticating}
                  >
                    Submit Institutional Registration
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================
              CATEGORY 2: AICTE OFFICER FLOW
             ======================================================== */}
          {userCategory === 'officer' && (
            <div>
              {/* STAGE A: Designation Selection Grid */}
              {!selectedOfficerCard && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="text-center mb-4">
                    <h2 className="text-base font-bold text-slate-900">
                      Select Official AICTE Designation
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose your authorized administrative cadre to proceed to secure sign in or request access.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {OFFICER_CARDS.map((card) => {
                      const IconComp = card.icon;
                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => handleSelectOfficerCard(card)}
                          className="p-4 text-left rounded-xl border border-slate-200 hover:border-gov-700 hover:bg-gov-50/40 transition-all group flex flex-col justify-between shadow-sm hover:shadow-md relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-gov-700"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gov-900 text-white flex items-center justify-center shrink-0 shadow group-hover:scale-105 transition-transform">
                              <IconComp className="w-5 h-5 text-sky-300" />
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-gov-100 group-hover:text-gov-900">
                              {card.role}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-bold text-sm text-slate-900 group-hover:text-gov-900">
                              {card.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                              {card.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-gov-700 group-hover:text-gov-900">
                            <span>Proceed to Access Desk</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => setUserCategory('college')}
                      className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to College / Institution Access
                    </button>
                    <span className="text-[11px] text-slate-400">Government of India • e-Governance System</span>
                  </div>
                </div>
              )}

              {/* STAGE B: Specific Officer Sign In or Request Access Form */}
              {selectedOfficerCard && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Selected Designation Header & Back Button */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-gov-900 text-white flex items-center justify-center shadow">
                        {React.createElement(selectedOfficerCard.icon, { className: 'w-5 h-5 text-sky-300' })}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          {selectedOfficerCard.name} Desk
                        </h2>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Role: {selectedOfficerCard.role}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOfficerCard(null);
                        setAuthError(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Change Designation
                    </button>
                  </div>

                  {/* Non-Admin Sub-Tabs (Sign In vs Request Access) */}
                  {!selectedOfficerCard.adminOnly && (
                    <div className="flex items-center justify-center gap-6 pb-2 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setOfficerTab('signin');
                          setAuthError(null);
                          setOfficerReqSuccess(null);
                        }}
                        className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                          officerTab === 'signin'
                            ? 'border-gov-800 text-gov-900'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {selectedOfficerCard.name} Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOfficerTab('request_access');
                          setAuthError(null);
                          setOfficerReqSuccess(null);
                        }}
                        className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                          officerTab === 'request_access'
                            ? 'border-gov-800 text-gov-900'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Request Officer Access
                      </button>
                    </div>
                  )}

                  {/* Officer Request Submitted Confirmation */}
                  {officerReqSuccess && (
                    <div className="mb-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 animate-fadeIn">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-emerald-950">
                              Officer Access Request Submitted
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              PENDING_APPROVAL
                            </span>
                          </div>
                          <p className="text-emerald-800 text-[11px] leading-relaxed">
                            {officerReqSuccess.message}
                          </p>
                          <div className="p-3 bg-white/80 rounded-lg border border-emerald-200 font-mono text-[11px]">
                            <span>Request Reference: </span>
                            <strong className="text-gov-900 font-bold">{officerReqSuccess.id}</strong>
                          </div>
                          <div className="pt-2 flex items-center gap-3">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setOfficerEmail(officerReqSuccess.email);
                                setOfficerTab('signin');
                                setOfficerReqSuccess(null);
                              }}
                            >
                              Return to Sign In Tab
                            </Button>
                            <button
                              type="button"
                              onClick={() => {
                                setPendingOfficerApproval(officerReqSuccess);
                                setOfficerReqSuccess(null);
                              }}
                              className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline"
                            >
                              View Request Status Slip
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Officer Sign In Tab */}
                  {(officerTab === 'signin' || selectedOfficerCard.adminOnly) && (
                    <form onSubmit={handleOfficerSignIn} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Official AICTE Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="mt-1.5 relative">
                          <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            value={officerEmail}
                            onChange={(e) => setOfficerEmail(e.target.value)}
                            placeholder="officer@demo.gov.in"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-gov-700 focus:border-gov-700"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Account Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="mt-1.5 relative">
                          <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type={showOfficerPassword ? 'text' : 'password'}
                            value={officerPassword}
                            onChange={(e) => setOfficerPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-gov-700 focus:border-gov-700"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOfficerPassword(!showOfficerPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showOfficerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full font-semibold mt-2"
                        isLoading={isAuthenticating}
                        icon={ArrowRight}
                        iconPosition="right"
                      >
                        Authenticate as {selectedOfficerCard.name}
                      </Button>

                      {/* Demo Auto-Fill Chip for this designation */}
                      {dataMode === 'dummy' && (
                        <div className="p-3 rounded-lg bg-gov-50/70 border border-gov-200/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-gov-900 block">
                              Demo {selectedOfficerCard.name}:
                            </span>
                            <span className="text-slate-600 text-[11px] font-mono">
                              {selectedOfficerCard.demoEmail}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => fillOfficerDemo(selectedOfficerCard)}
                            className="px-2.5 py-1 text-[11px] font-bold uppercase rounded bg-gov-700 text-white hover:bg-gov-800 transition-colors shrink-0"
                          >
                            Auto Fill
                          </button>
                        </div>
                      )}

                      {!selectedOfficerCard.adminOnly && (
                        <div className="text-center pt-2 text-xs text-slate-600">
                          <span>Not registered yet as an AICTE Officer? </span>
                          <button
                            type="button"
                            onClick={() => {
                              setOfficerTab('request_access');
                              setAuthError(null);
                            }}
                            className="font-bold text-gov-700 hover:text-gov-900 underline ml-1"
                          >
                            Request Official Access
                          </button>
                        </div>
                      )}
                    </form>
                  )}

                  {/* Officer Request Access Tab (Non-Admin only) */}
                  {officerTab === 'request_access' && !selectedOfficerCard.adminOnly && (
                    <form onSubmit={handleOfficerRequestAccess} className="space-y-3.5">
                      <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg text-[11px] text-blue-900 leading-relaxed">
                        <strong className="font-semibold">Official Access Protocol:</strong> Submit this request to seek role-based approval. System Administrators review and activate accounts against official council records.
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">Officer Full Name *</label>
                          <input
                            type="text"
                            value={officerRequestData.fullName}
                            onChange={(e) => setOfficerRequestData({ ...officerRequestData, fullName: e.target.value })}
                            placeholder="Dr. Ramesh Chandra"
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">Official Staff / Employee ID *</label>
                          <input
                            type="text"
                            value={officerRequestData.employeeId}
                            onChange={(e) => setOfficerRequestData({ ...officerRequestData, employeeId: e.target.value })}
                            placeholder="e.g. AICTE-EMP-1049"
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">Official Email *</label>
                          <input
                            type="email"
                            value={officerRequestData.email}
                            onChange={(e) => setOfficerRequestData({ ...officerRequestData, email: e.target.value })}
                            placeholder="officer@aicte.gov.in"
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">Contact Number (10 Digits) *</label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={officerRequestData.contactNumber}
                            onChange={(e) => setOfficerRequestData({ ...officerRequestData, contactNumber: e.target.value.replace(/\D/g, '') })}
                            placeholder="9810112233"
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">Designation / Cadre *</label>
                          <select
                            value={officerRequestData.requestedRole}
                            onChange={(e) => {
                              const chosen = OFFICER_CARDS.find((c) => c.role === e.target.value);
                              setOfficerRequestData({
                                ...officerRequestData,
                                requestedRole: e.target.value,
                                designation: chosen?.name || e.target.value,
                                department: chosen?.department || officerRequestData.department,
                              });
                            }}
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                          >
                            <option value="REGIONAL_OFFICER">Regional Officer</option>
                            <option value="BUREAU_OFFICER">Bureau Officer</option>
                            <option value="EVC_MEMBER">EVC Committee Member</option>
                            <option value="COMPLIANCE_REVIEWER">Compliance Reviewer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">Assigned Region / Jurisdiction</label>
                          <select
                            value={officerRequestData.region}
                            onChange={(e) => setOfficerRequestData({ ...officerRequestData, region: e.target.value })}
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                          >
                            <option value="All Regions (National HQ)">All Regions (National HQ)</option>
                            <option value="South-Western (Bangalore)">South-Western (Bangalore)</option>
                            <option value="Southern (Chennai)">Southern (Chennai)</option>
                            <option value="Western (Mumbai)">Western (Mumbai)</option>
                            <option value="Northern (Kanpur)">Northern (Kanpur)</option>
                            <option value="North-Western (Chandigarh)">North-Western (Chandigarh)</option>
                            <option value="Eastern (Kolkata)">Eastern (Kolkata)</option>
                            <option value="Central (Bhopal)">Central (Bhopal)</option>
                            <option value="South-Central (Hyderabad)">South-Central (Hyderabad)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">Create Password *</label>
                          <input
                            type="password"
                            value={officerRequestData.password}
                            onChange={(e) => setOfficerRequestData({ ...officerRequestData, password: e.target.value })}
                            placeholder="Min 8 characters"
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">Confirm Password *</label>
                          <input
                            type="password"
                            value={officerRequestData.confirmPassword}
                            onChange={(e) => setOfficerRequestData({ ...officerRequestData, confirmPassword: e.target.value })}
                            placeholder="Repeat password"
                            className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full font-semibold mt-2"
                        isLoading={isAuthenticating}
                      >
                        Submit Official Access Request
                      </Button>

                      <div className="text-center pt-2 text-xs text-slate-600">
                        <button
                          type="button"
                          onClick={() => setOfficerTab('signin')}
                          className="font-bold text-gov-700 hover:text-gov-900 underline"
                        >
                          Switch back to Officer Sign In
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer Notice */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              AICTE e-Governance Portal — Governed by AICTE Approval Process Handbook (APH) standards. All official sign-ins and access requests are cryptographically audited.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-gov-900 font-bold text-sm">
                <Shield className="w-5 h-5 text-gov-700" />
                <span>AICTE Credential Recovery Protocol</span>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                In compliance with Government of India cybersecurity regulations, automated password resets to public email accounts are restricted for AICTE institutional and official users.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 block">Procedure for Institutional Recovery:</span>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>Issue a letter on college letterhead signed by the Principal/Trustee.</li>
                  <li>Email to your designated Regional Bureau Nodal Officer.</li>
                  <li>One-time credentials will be dispatched to the verified mobile number.</li>
                </ol>
              </div>
              <p className="text-[11px] text-slate-500">
                Helpline: <strong>011-29581000</strong> | Email: <strong>helpdesk-recovery@aicte-india.org</strong>
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsForgotPasswordOpen(false)}
              >
                Understood & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
