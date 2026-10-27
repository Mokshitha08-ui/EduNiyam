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
import { DynamicApplicationWizard } from '../components/applications/DynamicApplicationWizard';
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
  const handleSaveDraft = async (payload) => {
    setIsSubmitting(true);
    try {
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
      alert(err.response?.data?.message || err.message || 'Failed to save draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. FORMAL SUBMISSION (Full Validation)
  const handleSubmitApplication = async (payload) => {
    if (!window.confirm(`Confirm formal submission of approval application for ${payload.applicationType} (${payload.institutionName})? Once submitted, the application enters the official AICTE Scrutiny Pipeline.`)) {
      return;
    }

    setIsSubmitting(true);
    try {
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
      alert(err.response?.data?.message || err.message || 'Submission failed.');
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

      {/* Dynamic Multi-Step Application Creation & Draft Wizard Modal */}
      <DynamicApplicationWizard
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialData={{
          institutionName: currentUser?.institution || '',
          institutionCode: currentUser?.institutionCode || '',
          region: currentUser?.region || 'South-Western',
          state: 'Karnataka',
          applicationType: 'Extension of Approval (EoA)',
          programme: 'Engineering & Technology',
        }}
        onSaveDraft={handleSaveDraft}
        onSubmitApplication={handleSubmitApplication}
        currentUser={currentUser}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
