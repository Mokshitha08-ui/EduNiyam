import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Filter,
  X,
  AlertTriangle,
  Building,
  CheckCircle,
  HelpCircle
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

  // Modal State for New Application
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    institutionName: '',
    institutionCode: '',
    applicationType: 'Extension of Approval (EoA)',
    programme: 'Engineering & Technology',
    region: 'South-Western',
    state: 'Karnataka',
    workflowId: 'WF-FULL',
    priority: 'NORMAL',
    proposedCourse: '',
    proposedIntake: 60
  });
  const [formError, setFormError] = useState('');

  // Extract filter options
  const regions = useMemo(() => ['ALL', ...new Set(applications.map(a => a.region))], [applications]);
  const types = useMemo(() => ['ALL', ...new Set(applications.map(a => a.applicationType))], [applications]);
  const stages = useMemo(() => ['ALL', ...new Set(applications.map(a => a.currentStage))], [applications]);

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
        matchesStatus = app.status !== 'APPROVED' && app.status !== 'REJECTED';
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

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newAppForm.institutionName.trim()) {
      setFormError('Institution Name is required');
      return;
    }

    const payload = {
      ...newAppForm,
      regionCode: newAppForm.region === 'South-Western' ? 'SW' : newAppForm.region === 'Western' ? 'W' : 'HQ',
      requestedIntake: newAppForm.proposedCourse ? [
        { course: newAppForm.proposedCourse, currentIntake: 0, proposedIntake: Number(newAppForm.proposedIntake) }
      ] : []
    };

    const created = createNewApplication(payload, currentUser);
    setIsCreateModalOpen(false);
    setNewAppForm({
      institutionName: '',
      institutionCode: '',
      applicationType: 'Extension of Approval (EoA)',
      programme: 'Engineering & Technology',
      region: 'South-Western',
      state: 'Karnataka',
      workflowId: 'WF-FULL',
      priority: 'NORMAL',
      proposedCourse: '',
      proposedIntake: 60
    });
    setFormError('');
    navigate(`/applications/${created.id}`);
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
              onClick={() => setIsCreateModalOpen(true)}
            >
              New Application
            </Button>
          </div>
        }
      />

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
              <option value="OVERDUE">Overdue Cases Only</option>
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

      {/* Create Application Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Lodge New Institutional Approval Application"
        subtitle="Submit preliminary details to register an application into the AICTE workflow pipeline"
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateSubmit}>
              Submit Application
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Institution Name *</label>
            <input
              type="text"
              required
              value={newAppForm.institutionName}
              onChange={(e) => setNewAppForm({ ...newAppForm, institutionName: e.target.value })}
              placeholder="e.g. National Institute of Engineering & Technology"
              className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">AICTE Permanent ID</label>
              <input
                type="text"
                value={newAppForm.institutionCode}
                onChange={(e) => setNewAppForm({ ...newAppForm, institutionCode: e.target.value })}
                placeholder="1-98402911"
                className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Region</label>
              <select
                value={newAppForm.region}
                onChange={(e) => setNewAppForm({ ...newAppForm, region: e.target.value })}
                className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
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
              <label className="block text-xs font-semibold text-slate-700 uppercase">Application Type</label>
              <select
                value={newAppForm.applicationType}
                onChange={(e) => setNewAppForm({ ...newAppForm, applicationType: e.target.value })}
                className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
              >
                <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
                <option value="New Technical Institution">New Technical Institution</option>
                <option value="Increase in Intake / New Course">Increase in Intake / New Course</option>
                <option value="Change of Site / Infrastructure">Change of Site / Infrastructure</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Applicable Workflow</label>
              <select
                value={newAppForm.workflowId}
                onChange={(e) => setNewAppForm({ ...newAppForm, workflowId: e.target.value })}
                className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
              >
                {workflows.map(wf => (
                  <option key={wf.id} value={wf.id}>{wf.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Proposed Technical Course</label>
            <input
              type="text"
              value={newAppForm.proposedCourse}
              onChange={(e) => setNewAppForm({ ...newAppForm, proposedCourse: e.target.value })}
              placeholder="e.g. B.Tech in Artificial Intelligence & Machine Learning"
              className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
