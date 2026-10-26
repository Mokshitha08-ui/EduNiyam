import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Filter,
  X,
  AlertTriangle,
  Building,
  CheckCircle,
  HelpCircle,
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Clock,
  Info
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { SearchInput } from '../components/common/SearchInput';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatDate, getDaysElapsed, getDaysRemaining, isOverdue } from '../utils/dateUtils';
import { calculateRiskScore } from '../utils/riskScoring';

export const Applications = () => {
  const { applications, createNewApplication, workflows } = useAppData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  // Multi-step Application Creation & Draft Wizard State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [formError, setFormError] = useState('');

  const [newAppForm, setNewAppForm] = useState({
    institutionName: '',
    institutionCode: '',
    applicationType: 'Extension of Approval (EoA)',
    programme: 'Engineering & Technology',
    academicYear: '2026-27',
    region: 'South-Western',
    state: 'Karnataka',
    workflowId: 'WF-FULL',
    priority: 'NORMAL',
    proposedCourse: 'B.Tech in Artificial Intelligence & Data Science',
    currentIntake: 0,
    proposedIntake: 60,
    decLandNorms: false,
    decCadreRatio: false,
    decGrievance: false,
    decAuthenticity: false
  });

  // Auto-populate institution details from currentUser if college rep
  useEffect(() => {
    if (currentUser && currentUser.role === 'COLLEGE_REP') {
      setNewAppForm(prev => ({
        ...prev,
        institutionName: currentUser.institutionName || currentUser.institution || prev.institutionName,
        institutionCode: currentUser.institutionCode || prev.institutionCode,
        region: currentUser.region || prev.region
      }));
    }
  }, [currentUser, isCreateModalOpen]);

  // Extract filter options
  const regions = useMemo(() => ['ALL', ...new Set(applications.map(a => a.region))], [applications]);
  const types = useMemo(() => ['ALL', ...new Set(applications.map(a => a.applicationType))], [applications]);
  const stages = useMemo(() => ['ALL', ...new Set(applications.map(a => a.currentStage))], [applications]);

  // Unassigned queue count
  const unassignedCount = useMemo(() => {
    return applications.filter(app =>
      (!app.assignedOfficerId && (!app.assignedOfficer || app.assignedOfficer.includes('Unassigned'))) &&
      app.status !== 'DRAFT'
    ).length;
  }, [applications]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Search
      const matchesSearch =
        !searchQuery ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.institutionCode && app.institutionCode.includes(searchQuery));

      // Filters
      const matchesRegion = selectedRegion === 'ALL' || app.region === selectedRegion;
      const matchesType = selectedType === 'ALL' || app.applicationType === selectedType;
      const matchesStage = selectedStage === 'ALL' || app.currentStage === selectedStage;
      const matchesPriority = selectedPriority === 'ALL' || app.priority === selectedPriority;
      
      let matchesStatus = true;
      if (selectedStatus === 'OVERDUE') {
        matchesStatus = isOverdue(app.nextDeadline) && app.status !== 'APPROVED';
      } else if (selectedStatus === 'IN_PROGRESS') {
        matchesStatus = app.status !== 'APPROVED' && app.status !== 'REJECTED' && app.status !== 'DRAFT';
      } else if (selectedStatus === 'UNASSIGNED') {
        matchesStatus = (!app.assignedOfficerId && (!app.assignedOfficer || app.assignedOfficer.includes('Unassigned'))) && app.status !== 'DRAFT';
      } else if (selectedStatus !== 'ALL') {
        matchesStatus = app.status === selectedStatus;
      }

      return matchesSearch && matchesRegion && matchesType && matchesStage && matchesStatus && matchesPriority;
    });
  }, [applications, searchQuery, selectedRegion, selectedType, selectedStage, selectedStatus, selectedPriority]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRegion('ALL');
    setSelectedType('ALL');
    setSelectedStage('ALL');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
  };

  // Step validation
  const validateStep = (step) => {
    setFormError('');
    if (step === 1) {
      if (!newAppForm.institutionName.trim()) {
        setFormError('Institution Name is mandatory.');
        return false;
      }
      if (!newAppForm.institutionCode.trim()) {
        setFormError('Institution Permanent AICTE ID / Code is mandatory.');
        return false;
      }
      if (!newAppForm.programme.trim()) {
        setFormError('Academic Programme is required.');
        return false;
      }
    } else if (step === 2) {
      if (!newAppForm.proposedCourse.trim()) {
        setFormError('Proposed Technical Course name is required.');
        return false;
      }
      if (Number(newAppForm.proposedIntake) <= 0) {
        setFormError('Proposed intake must be greater than zero.');
        return false;
      }
    } else if (step === 3) {
      if (!newAppForm.decLandNorms || !newAppForm.decCadreRatio || !newAppForm.decGrievance || !newAppForm.decAuthenticity) {
        setFormError('All statutory regulatory undertakings & compliance declarations must be checked.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setFormError('');
    setFormStep(prev => Math.max(prev - 1, 1));
  };

  // 1. SAVE AS DRAFT (Progressive Validation)
  const handleSaveDraft = async () => {
    setFormError('');
    if (!newAppForm.institutionName.trim()) {
      setFormError('Institution Name is required to initiate a draft.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...newAppForm,
        status: 'DRAFT',
        requestedIntake: newAppForm.proposedCourse ? [
          {
            course: newAppForm.proposedCourse.trim(),
            currentIntake: Number(newAppForm.currentIntake) || 0,
            proposedIntake: Number(newAppForm.proposedIntake) || 60
          }
        ] : []
      };

      const created = await createNewApplication(payload, currentUser);
      setIsCreateModalOpen(false);
      setActionSuccess({
        appId: created.id,
        isDraft: true,
        message: `Application Draft saved successfully with Reference Number: ${created.id}. You can reopen and complete it anytime.`
      });
      setTimeout(() => setActionSuccess(null), 8000);
      navigate(`/applications/${created.id}`);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. FORMAL SUBMISSION (Full Validation)
  const handleSubmitApplication = async () => {
    setFormError('');
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    if (!window.confirm(`Confirm formal submission of approval application for ${newAppForm.applicationType} (${newAppForm.institutionName})? Once submitted, the application enters the official AICTE Scrutiny Pipeline.`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...newAppForm,
        status: 'SUBMITTED',
        requestedIntake: [
          {
            course: newAppForm.proposedCourse.trim(),
            currentIntake: Number(newAppForm.currentIntake) || 0,
            proposedIntake: Number(newAppForm.proposedIntake) || 60
          }
        ]
      };

      const created = await createNewApplication(payload, currentUser);
      setIsCreateModalOpen(false);
      setActionSuccess({
        appId: created.id,
        isDraft: false,
        message: `Institutional approval application lodged successfully! Official Reference Number: ${created.id}. Application has entered the Regional Scrutiny Queue.`
      });
      setTimeout(() => setActionSuccess(null), 9000);
      navigate(`/applications/${created.id}`);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table Columns Definition
  const columns = [
    {
      header: 'App ID',
      key: 'id',
      render: (val) => <span className="font-mono font-bold text-gov-800">{val}</span>
    },
    {
      header: 'Institution Name',
      key: 'institutionName',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900 line-clamp-1">{val}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Code: {row.institutionCode || 'N/A'}</span>
            <span>&bull;</span>
            <span className="text-gov-700 font-medium">{row.region}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Application Type',
      key: 'applicationType',
      render: (val) => <span className="text-xs text-slate-700 font-medium">{val}</span>
    },
    {
      header: 'Current Stage',
      key: 'currentStage',
      render: (val) => <Badge variant="navy">{val}</Badge>
    },
    {
      header: 'Assigned Officer',
      key: 'assignedOfficer',
      render: (val) => <span className="text-xs text-slate-600">{val}</span>
    },
    {
      header: 'Ageing',
      key: 'submissionDate',
      render: (val) => (
        <span className="text-xs font-mono text-slate-600">
          {getDaysElapsed(val)} days
        </span>
      )
    },
    {
      header: 'Deadline',
      key: 'nextDeadline',
      render: (val) => {
        const remaining = getDaysRemaining(val);
        const overdue = isOverdue(val);
        return (
          <div className="text-xs">
            <div className="font-medium">{formatDate(val)}</div>
            <div className={`text-[10px] font-semibold ${overdue ? 'text-rose-600 font-bold' : remaining <= 3 ? 'text-amber-600' : 'text-slate-400'}`}>
              {overdue ? `${Math.abs(remaining)}d overdue` : `${remaining}d left`}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Risk Score',
      key: 'risk',
      sortable: false,
      render: (_, row) => {
        const risk = calculateRiskScore(row);
        return (
          <div className="group relative">
            <Badge size="sm" variant={risk.badgeColor} dot>
              {risk.level} ({risk.score})
            </Badge>
            {/* Tooltip on hover */}
            <div className="hidden group-hover:block absolute bottom-full left-0 z-50 mb-1 w-52 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg">
              <p className="font-bold border-b border-slate-700 pb-1 mb-1">Risk Factors:</p>
              <ul className="list-disc pl-3 space-y-0.5 text-slate-300">
                {risk.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    }
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Application Management Desk"
        subtitle="Manage and track institutional approval requests across scrutiny and EVC stages"
        badge={<Badge variant="default">{applications.length} Records</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setFormStep(1);
                setFormError('');
                setIsCreateModalOpen(true);
              }}
            >
              New Application
            </Button>
          </div>
        }
      />

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 animate-fadeIn ${
          actionSuccess.isDraft
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
        }`}>
          {actionSuccess.isDraft ? (
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <p className="font-bold uppercase tracking-wide">
              {actionSuccess.isDraft ? 'Draft Application Saved' : 'Application Successfully Lodged'}
            </p>
            <p className="mt-0.5 leading-relaxed">{actionSuccess.message}</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Application ID, Institute Name..."
            className="md:col-span-2"
          />

          <div className="flex items-center gap-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-gov-600"
            >
              <option value="ALL">All AICTE Regions</option>
              {regions.filter(r => r !== 'ALL').map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-gov-600"
            >
              <option value="ALL">All Stages</option>
              {stages.filter(s => s !== 'ALL').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500 uppercase text-[10px]">Filter by:</span>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-slate-700"
            >
              <option value="ALL">All Types</option>
              {types.filter(t => t !== 'ALL').map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNASSIGNED">Unassigned Queue</option>
              <option value="DRAFT">Draft Applications Only</option>
              <option value="OVERDUE">Overdue Cases Only</option>
              <option value="IN_PROGRESS">Active / In Progress</option>
              <option value="DEFICIENCY_NOTIFIED">Deficiency Notified</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="EVC_SCHEDULED">EVC Scheduled</option>
              <option value="APPROVED">Approved</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="NORMAL">Normal Priority</option>
            </select>

            {unassignedCount > 0 && (
              <button
                type="button"
                onClick={() => setSelectedStatus(selectedStatus === 'UNASSIGNED' ? 'ALL' : 'UNASSIGNED')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedStatus === 'UNASSIGNED'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Unassigned Queue ({unassignedCount})
              </button>
            )}
          </div>

          {(searchQuery || selectedRegion !== 'ALL' || selectedType !== 'ALL' || selectedStage !== 'ALL' || selectedStatus !== 'ALL' || selectedPriority !== 'ALL') && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Applications Data Table */}
      <DataTable
        columns={columns}
        data={filteredApplications}
        pageSize={8}
        exportFileName="aicte_applications_export.csv"
        onRowClick={(row) => navigate(`/applications/${row.id}`)}
        emptyTitle="No applications found"
        emptyDescription="Try clearing your search filters or check your spelling."
      />

      {/* Multi-Step Application Creation & Draft Wizard Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={
          formStep === 4
            ? "Review & Submit Institutional Approval Application"
            : `Lodge Application: Step ${formStep} of 4`
        }
        subtitle="AICTE Centralized Approval Workflow & Compliance Regulatory System (AY 2026-27)"
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              <Button
                variant="outline"
                size="sm"
                icon={Save}
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="text-amber-800 border-amber-300 hover:bg-amber-50"
              >
                Save as Draft
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (formStep > 1) {
                    handlePrevStep();
                  } else {
                    setIsCreateModalOpen(false);
                  }
                }}
                disabled={isSubmitting}
              >
                {formStep === 1 ? 'Cancel' : 'Previous Step'}
              </Button>

              {formStep < 4 ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={ChevronRight}
                  iconPosition="right"
                  onClick={handleNextStep}
                >
                  Continue to Step {formStep + 1}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Send}
                  onClick={handleSubmitApplication}
                  isLoading={isSubmitting}
                >
                  Confirm & Submit Application
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Step Indicator Progress Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
            <div className={`flex items-center gap-1.5 font-bold ${formStep >= 1 ? 'text-gov-800' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${formStep >= 1 ? 'bg-gov-800' : 'bg-slate-300'}`}>
                1
              </span>
              <span>Institution & Type</span>
            </div>
            <div className={`w-8 h-0.5 ${formStep >= 2 ? 'bg-gov-800' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-1.5 font-bold ${formStep >= 2 ? 'text-gov-800' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${formStep >= 2 ? 'bg-gov-800' : 'bg-slate-300'}`}>
                2
              </span>
              <span>Courses & Intake</span>
            </div>
            <div className={`w-8 h-0.5 ${formStep >= 3 ? 'bg-gov-800' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-1.5 font-bold ${formStep >= 3 ? 'text-gov-800' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${formStep >= 3 ? 'bg-gov-800' : 'bg-slate-300'}`}>
                3
              </span>
              <span>Declarations</span>
            </div>
            <div className={`w-8 h-0.5 ${formStep >= 4 ? 'bg-gov-800' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-1.5 font-bold ${formStep >= 4 ? 'text-gov-800' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${formStep >= 4 ? 'bg-gov-800' : 'bg-slate-300'}`}>
                4
              </span>
              <span>Review</span>
            </div>
          </div>

          {/* Error Message Alert */}
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* STEP 1: Institution & Academic Details */}
          {formStep === 1 && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={newAppForm.institutionName}
                  onChange={(e) => setNewAppForm({ ...newAppForm, institutionName: e.target.value })}
                  placeholder="e.g. National Institute of Engineering & Technology"
                  disabled={currentUser?.role === 'COLLEGE_REP'}
                  className={`w-full p-2.5 rounded-lg border text-xs focus:ring-1 focus:ring-gov-700 ${
                    currentUser?.role === 'COLLEGE_REP' ? 'bg-slate-100 text-slate-600 border-slate-300 cursor-not-allowed' : 'border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    AICTE Permanent ID / Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAppForm.institutionCode}
                    onChange={(e) => setNewAppForm({ ...newAppForm, institutionCode: e.target.value })}
                    placeholder="1-34981275"
                    disabled={currentUser?.role === 'COLLEGE_REP'}
                    className={`w-full p-2.5 rounded-lg border font-mono text-xs focus:ring-1 focus:ring-gov-700 ${
                      currentUser?.role === 'COLLEGE_REP' ? 'bg-slate-100 text-slate-600 border-slate-300 cursor-not-allowed' : 'border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    AICTE Regional Jurisdiction *
                  </label>
                  <select
                    value={newAppForm.region}
                    onChange={(e) => setNewAppForm({ ...newAppForm, region: e.target.value })}
                    disabled={currentUser?.role === 'COLLEGE_REP'}
                    className={`w-full p-2.5 rounded-lg border text-xs ${
                      currentUser?.role === 'COLLEGE_REP' ? 'bg-slate-100 text-slate-600 border-slate-300 cursor-not-allowed' : 'border-slate-300'
                    }`}
                  >
                    <option value="South-Western">South-Western (Bangalore)</option>
                    <option value="Western">Western (Mumbai)</option>
                    <option value="Southern">Southern (Chennai)</option>
                    <option value="Northern">Northern (Kanpur/Delhi)</option>
                    <option value="Eastern">Eastern (Kolkata)</option>
                    <option value="Central">Central (Bhopal)</option>
                    <option value="North-Western">North-Western (Chandigarh)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Application Category / Type *
                  </label>
                  <select
                    value={newAppForm.applicationType}
                    onChange={(e) => setNewAppForm({ ...newAppForm, applicationType: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-gov-700"
                  >
                    <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
                    <option value="New Technical Institution">New Technical Institution</option>
                    <option value="Increase in Intake / New Course">Increase in Intake / New Course</option>
                    <option value="Change of Site / Infrastructure">Change of Site / Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Academic Programme *
                  </label>
                  <select
                    value={newAppForm.programme}
                    onChange={(e) => setNewAppForm({ ...newAppForm, programme: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-gov-700"
                  >
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Management (MBA / PGDM)">Management (MBA / PGDM)</option>
                    <option value="Computer Applications (MCA)">Computer Applications (MCA)</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Architecture & Town Planning">Architecture & Town Planning</option>
                    <option value="Applied Arts & Crafts">Applied Arts & Crafts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    disabled
                    value={newAppForm.academicYear}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scrutiny Priority</label>
                  <select
                    value={newAppForm.priority}
                    onChange={(e) => setNewAppForm({ ...newAppForm, priority: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="NORMAL">Normal Processing (Standard Timeline)</option>
                    <option value="HIGH">High Priority (Expedited AICTE Cell)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Courses & Proposed Intake */}
          {formStep === 2 && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-gov-800 shrink-0 mt-0.5" />
                <p>
                  Specify the academic course specialization and requested intake strength in accordance with the National Norms for Faculty-Student Ratios.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Proposed Course / Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={newAppForm.proposedCourse}
                  onChange={(e) => setNewAppForm({ ...newAppForm, proposedCourse: e.target.value })}
                  placeholder="e.g. B.Tech in Artificial Intelligence & Machine Learning"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-gov-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current Approved Intake
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newAppForm.currentIntake}
                    onChange={(e) => setNewAppForm({ ...newAppForm, currentIntake: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <span className="text-[10px] text-slate-400">Leave 0 if applying for a brand new course</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Proposed Target Intake *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newAppForm.proposedIntake}
                    onChange={(e) => setNewAppForm({ ...newAppForm, proposedIntake: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <span className="text-[10px] text-slate-400">Standard batches are multiples of 30 / 60 seats</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Applicable Workflow Pathway
                </label>
                <select
                  value={newAppForm.workflowId}
                  onChange={(e) => setNewAppForm({ ...newAppForm, workflowId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                >
                  {workflows.map(wf => (
                    <option key={wf.id} value={wf.id}>{wf.name} ({wf.code})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Statutory Compliance & Undertakings */}
          {formStep === 3 && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-gov-50 border border-gov-200 text-gov-900 flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-gov-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gov-950">Statutory Regulatory Undertakings (APH 2026-27)</h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    Under the All India Council for Technical Education Act, every institution must verify and affirm statutory adherence to spatial, faculty, and administrative criteria before submission.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={newAppForm.decLandNorms}
                    onChange={(e) => setNewAppForm({ ...newAppForm, decLandNorms: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-gov-800 focus:ring-gov-700"
                  />
                  <div className="text-slate-800">
                    <span className="font-semibold">Land, Infrastructure & Built-up Area Adherence</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      The institution certifies possession of clear, unencumbered land and built-up instructional/administrative carpet areas strictly conforming to APH 2026-27 norms.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={newAppForm.decCadreRatio}
                    onChange={(e) => setNewAppForm({ ...newAppForm, decCadreRatio: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-gov-800 focus:ring-gov-700"
                  />
                  <div className="text-slate-800">
                    <span className="font-semibold">Faculty Cadre Ratio & Mandatory Qualifications</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Teaching faculty appointed as per AICTE cadre ratio (1:15 or 1:20) and pay scales prescribed under 7th CPC recommendations with verified biometric Aadhaar linkage.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={newAppForm.decGrievance}
                    onChange={(e) => setNewAppForm({ ...newAppForm, decGrievance: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-gov-800 focus:ring-gov-700"
                  />
                  <div className="text-slate-800">
                    <span className="font-semibold">Anti-Ragging, Grievance Cell & ICC Functional Status</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Institution has fully constituted and publicly displayed the Anti-Ragging Committee, Internal Complaints Committee (ICC), and Student Grievance Redressal Committee.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={newAppForm.decAuthenticity}
                    onChange={(e) => setNewAppForm({ ...newAppForm, decAuthenticity: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-gov-800 focus:ring-gov-700"
                  />
                  <div className="text-slate-800">
                    <span className="font-semibold">Solemn Affirmation of Document Authenticity</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      I solemnly affirm that all details submitted herein are true and accurate. Any misrepresentation shall render this application liable for immediate summary rejection under AICTE regulations.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Review Before Submission */}
          {formStep === 4 && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950">Pre-Submission Verification Summary</h4>
                  <p className="mt-0.5 text-[11px]">
                    Carefully review all application parameters below. You can save this application as a <strong>Draft</strong> to continue later, or perform <strong>Formal Submission</strong> to send it to the AICTE Regional Scrutiny Cell.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Institution</span>
                    <p className="font-bold text-slate-900">{newAppForm.institutionName}</p>
                    <p className="font-mono text-gov-800 font-medium">Permanent ID: {newAppForm.institutionCode}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Region & Jurisdiction</span>
                    <p className="font-bold text-slate-800">{newAppForm.region}</p>
                    <p className="text-slate-500">{newAppForm.state}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Application Type</span>
                    <p className="font-bold text-gov-900">{newAppForm.applicationType}</p>
                    <span className="text-slate-500">Programme: {newAppForm.programme}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Academic Cycle</span>
                    <p className="font-bold text-slate-800">AY {newAppForm.academicYear}</p>
                    <Badge size="sm" variant={newAppForm.priority === 'HIGH' ? 'danger' : 'default'}>
                      {newAppForm.priority} Priority
                    </Badge>
                  </div>
                </div>

                <div className="pb-3 border-b border-slate-200">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Requested Course & Intake</span>
                  <p className="font-bold text-slate-900">{newAppForm.proposedCourse}</p>
                  <p className="text-slate-600 mt-0.5">
                    Proposed Intake Capacity: <strong className="text-gov-900 font-mono">{newAppForm.proposedIntake} seats</strong> (Current: {newAppForm.currentIntake} seats)
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Statutory Affirmations</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                      ✓ Land & Building Norms
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                      ✓ Faculty Cadre Ratio
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                      ✓ Anti-Ragging & ICC
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                      ✓ Affirmation of Truth
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
