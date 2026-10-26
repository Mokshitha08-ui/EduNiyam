import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  UserCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  FileWarning,
  Send,
  Eye,
  Plus,
  Edit,
  Trash2,
  MapPin,
  RotateCcw,
  Check,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { applicationsApi, evcApi } from '../services/apiService';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatDate, getDaysRemaining, getDaysElapsed, isOverdue } from '../utils/dateUtils';
import { calculateRiskScore } from '../utils/riskScoring';

export const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    applications,
    workflows,
    dataMode,
    fetchLiveData,
    updateApplicationStage,
    returnApplicationDeficiency,
    submitCollegeResponse,
    assignApplicationOfficer,
    updateApplicationDraft,
    submitDraftApplication,
    deleteDraftApplication
  } = useAppData();
  const { currentUser } = useAuth();

  const application = applications.find(a => a.id === id);

  // Reviews & EVC state
  const [reviews, setReviews] = useState([]);
  const [evcSchedule, setEvcSchedule] = useState(null);

  // Scrutiny Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState('FORWARD_NEXT_STAGE');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [isReviewDraft, setIsReviewDraft] = useState(false);
  const [reviewChecklist, setReviewChecklist] = useState([
    { id: 'CHK-1', category: 'Statutory Documentation', title: 'Land Ownership & Registered Lease Deed', status: 'SATISFIED', remarks: '' },
    { id: 'CHK-2', category: 'Statutory Documentation', title: 'State Government & University NOC', status: 'SATISFIED', remarks: '' },
    { id: 'CHK-3', category: 'Infrastructure & Safety', title: 'Building Safety & Fire NOC Certificate', status: 'SATISFIED', remarks: '' },
    { id: 'CHK-4', category: 'Infrastructure & Safety', title: 'Barrier-Free Environment & Ramp/Lift Access', status: 'SATISFIED', remarks: '' },
    { id: 'CHK-5', category: 'Academic & Faculty', title: 'Faculty Cadre Ratio as per AICTE Norms (1:20)', status: 'SATISFIED', remarks: '' },
    { id: 'CHK-6', category: 'Academic & Faculty', title: 'Core Laboratories & Equipment Stock Registry', status: 'SATISFIED', remarks: '' },
    { id: 'CHK-7', category: 'Amenities & Governance', title: 'Internal Complaint Committee (ICC) & Anti-Ragging Cell', status: 'SATISFIED', remarks: '' }
  ]);

  // Mark for EVC Modal state
  const [isMarkEvcModalOpen, setIsMarkEvcModalOpen] = useState(false);
  const [evcReason, setEvcReason] = useState('Physical verification of infrastructure, faculty cadre, and laboratory norms required.');

  // Add Structured Deficiency Modal state
  const [isAddDeficiencyModalOpen, setIsAddDeficiencyModalOpen] = useState(false);
  const [deficiencyForm, setDeficiencyForm] = useState({
    type: 'DEFICIENCY',
    severity: 'CRITICAL',
    clause: 'Statutory Approval Norms Clause 4.2',
    description: '',
    correctiveAction: '',
    deadlineDays: 7
  });

  // Verify / Reopen Deficiency Modal state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedDeficiency, setSelectedDeficiency] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState('RESOLVED');
  const [verificationNotes, setVerificationNotes] = useState('');

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assignmentReason, setAssignmentReason] = useState('Assigned for regional scrutiny review');

  const [isDeficiencyModalOpen, setIsDeficiencyModalOpen] = useState(false);
  const [deficiencyReason, setDeficiencyReason] = useState('');

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [transitionNotes, setTransitionNotes] = useState('');

  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [resubmitNotes, setResubmitNotes] = useState('');

  const [previewDoc, setPreviewDoc] = useState(null);

  // Draft Edit state
  const [isEditDraftModalOpen, setIsEditDraftModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [editDraftForm, setEditDraftForm] = useState({
    applicationType: '',
    programme: '',
    priority: 'NORMAL',
    workflowId: 'WF-FULL',
    proposedCourse: '',
    currentIntake: 0,
    proposedIntake: 60
  });

  // Fetch reviews & EVC on mount/stage change
  React.useEffect(() => {
    if (!id) return;
    const loadExtra = async () => {
      try {
        const revList = await applicationsApi.getReviews(id);
        if (revList && Array.isArray(revList)) {
          setReviews(revList);
        }
      } catch (e) {
        // quiet
      }
      try {
        const evcRes = await evcApi.getByApplicationId(id);
        if (evcRes) {
          setEvcSchedule(evcRes);
        }
      } catch (e) {
        // quiet
      }
    };
    loadExtra();
  }, [id, application?.currentStage, application?.status]);

  if (!application) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Application Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">No record matching ID: {id}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/applications')}>
          Return to Applications List
        </Button>
      </div>
    );
  }

  const currentWorkflow = workflows.find(w => w.id === application.workflowId) || workflows[0] || { name: 'Standard Pathway', stages: [] };
  const workflowStages = currentWorkflow?.stages || [];
  const currentStageIndex = workflowStages.findIndex(s => s.code === application.currentStage);
  const nextStage = workflowStages[currentStageIndex + 1];

  const risk = calculateRiskScore(application);
  const daysRemaining = getDaysRemaining(application.nextDeadline);
  const isBreached = isOverdue(application.nextDeadline);

  // Handlers
  const handleAssignOfficer = () => {
    if (!selectedOfficer) {
      alert('Please select an AICTE official to assign.');
      return;
    }
    assignApplicationOfficer(application.id, {
      officerName: selectedOfficer,
      reason: assignmentReason || 'Assigned by authorized official'
    }, currentUser);
    setIsAssignModalOpen(false);
  };

  const handleReturnDeficiency = () => {
    if (!deficiencyReason.trim()) {
      alert('A clear regulatory deficiency reason is mandatory.');
      return;
    }
    returnApplicationDeficiency(application.id, deficiencyReason, currentUser);
    setIsDeficiencyModalOpen(false);
    setDeficiencyReason('');
  };

  const handleAdvanceStage = () => {
    if (!nextStage) return;
    updateApplicationStage(application.id, nextStage.code, transitionNotes, currentUser);
    setIsAdvanceModalOpen(false);
    setTransitionNotes('');
  };

  const handleCollegeResubmit = () => {
    if (!resubmitNotes.trim()) {
      alert('Please provide clarification notes or response.');
      return;
    }
    submitCollegeResponse(application.id, resubmitNotes, [], currentUser);
    setIsResubmitModalOpen(false);
    setResubmitNotes('');
  };

  const handleOpenEditDraft = () => {
    setEditDraftForm({
      applicationType: application.applicationType || 'Extension of Approval (EoA)',
      programme: application.programme || 'Engineering & Technology',
      priority: application.priority || 'NORMAL',
      workflowId: application.workflowId || 'WF-FULL',
      proposedCourse: application.requestedIntake?.[0]?.course || '',
      currentIntake: application.requestedIntake?.[0]?.currentIntake || 0,
      proposedIntake: application.requestedIntake?.[0]?.proposedIntake || 60
    });
    setIsEditDraftModalOpen(true);
  };

  const handleSaveDraftEdits = async () => {
    setIsActionLoading(true);
    try {
      const payload = {
        applicationType: editDraftForm.applicationType,
        programme: editDraftForm.programme,
        priority: editDraftForm.priority,
        workflowId: editDraftForm.workflowId,
        requestedIntake: editDraftForm.proposedCourse ? [{
          course: editDraftForm.proposedCourse.trim(),
          currentIntake: Number(editDraftForm.currentIntake) || 0,
          proposedIntake: Number(editDraftForm.proposedIntake) || 60
        }] : []
      };
      await updateApplicationDraft(application.id, payload, currentUser);
      setIsEditDraftModalOpen(false);
      alert('Draft edits saved successfully.');
    } catch (err) {
      alert('Error updating draft: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmitDraft = async () => {
    if (!window.confirm(`Formally submit application ${application.id} for AICTE scrutiny? Once submitted, the application will be locked for regulatory review.`)) {
      return;
    }
    setIsActionLoading(true);
    try {
      await submitDraftApplication(application.id, currentUser);
      alert(`Application ${application.id} successfully submitted into the AICTE scrutiny pipeline.`);
    } catch (err) {
      alert('Error submitting application: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!window.confirm(`Are you sure you want to discard draft ${application.id}? This action cannot be undone.`)) {
      return;
    }
    setIsActionLoading(true);
    try {
      await deleteDraftApplication(application.id, currentUser);
      navigate('/applications');
    } catch (err) {
      alert('Error deleting draft: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmitScrutinyReview = async () => {
    if (!reviewRemarks.trim()) {
      alert('Review remarks explaining the scrutiny evaluation are required.');
      return;
    }
    setIsActionLoading(true);
    try {
      if (dataMode === 'live') {
        await applicationsApi.submitReview(application.id, {
          stage: application.currentStage,
          decision: reviewDecision,
          remarks: reviewRemarks,
          checklistResults: reviewChecklist,
          isDraft: isReviewDraft
        });
        await fetchLiveData();
        const updatedReviews = await applicationsApi.getReviews(application.id);
        if (updatedReviews) setReviews(updatedReviews);
      } else {
        const mockRev = {
          id: 'REV-' + Date.now().toString().slice(-6),
          stage: application.currentStage,
          round: (reviews.length || 0) + 1,
          reviewerName: currentUser?.name || 'Scrutiny Officer',
          reviewerRole: currentUser?.role || 'REGIONAL_OFFICER',
          decision: reviewDecision,
          remarks: reviewRemarks,
          checklistResults: reviewChecklist,
          isDraft: isReviewDraft,
          createdAt: new Date().toISOString()
        };
        setReviews([mockRev, ...reviews]);
        if (!isReviewDraft && reviewDecision === 'DEFICIENCIES_NOTED') {
          returnApplicationDeficiency(application.id, reviewRemarks, currentUser);
        }
      }
      setIsReviewModalOpen(false);
      setReviewRemarks('');
      alert(`Scrutiny review successfully submitted with determination: ${reviewDecision}`);
    } catch (err) {
      alert(`Failed to submit review: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkEvc = async () => {
    if (!evcReason.trim()) {
      alert('Please specify the justification for requiring a physical EVC visit.');
      return;
    }
    setIsActionLoading(true);
    try {
      if (dataMode === 'live') {
        await applicationsApi.markEvc(application.id, { reason: evcReason });
        await fetchLiveData();
      } else {
        application.requiresEvc = true;
        application.evcReason = evcReason;
        application.evcMarkedBy = currentUser?.name;
        application.evcMarkedAt = new Date().toISOString();
      }
      setIsMarkEvcModalOpen(false);
      alert('Application flagged for mandatory physical EVC inspection.');
    } catch (err) {
      alert(`Failed to mark for EVC: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddDeficiency = async () => {
    if (!deficiencyForm.description.trim()) {
      alert('Deficiency description is required.');
      return;
    }
    setIsActionLoading(true);
    try {
      if (dataMode === 'live') {
        await applicationsApi.createObservation(application.id, {
          type: deficiencyForm.type,
          severity: deficiencyForm.severity,
          clause: deficiencyForm.clause,
          description: deficiencyForm.description,
          correctiveAction: deficiencyForm.correctiveAction,
          deadlineDays: parseInt(deficiencyForm.deadlineDays, 10) || 7
        });
        await fetchLiveData();
      } else {
        const newObs = {
          id: 'OBS-' + Date.now().toString().slice(-6),
          officer: currentUser?.name || 'Regional Officer',
          date: new Date().toISOString().split('T')[0],
          type: deficiencyForm.type,
          severity: deficiencyForm.severity,
          clauses: deficiencyForm.clause,
          remarks: deficiencyForm.description,
          correctiveAction: deficiencyForm.correctiveAction,
          status: 'OPEN',
          stage: application.currentStage
        };
        application.observations = [newObs, ...(application.observations || [])];
        application.status = 'DEFICIENCY_NOTIFIED';
      }
      setIsAddDeficiencyModalOpen(false);
      setDeficiencyForm({
        type: 'DEFICIENCY',
        severity: 'CRITICAL',
        clause: 'Statutory Approval Norms Clause 4.2',
        description: '',
        correctiveAction: '',
        deadlineDays: 7
      });
      alert('Regulatory deficiency / observation recorded successfully.');
    } catch (err) {
      alert(`Failed to record observation: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleVerifyDeficiency = async () => {
    if (!selectedDeficiency) return;
    setIsActionLoading(true);
    try {
      if (dataMode === 'live') {
        await applicationsApi.verifyObservation(application.id, selectedDeficiency.id, {
          status: verifyStatus,
          verificationNotes: verificationNotes.trim() || `Verified by ${currentUser?.name}`
        });
        await fetchLiveData();
      } else {
        selectedDeficiency.status = verifyStatus;
        selectedDeficiency.verificationNotes = verificationNotes;
        selectedDeficiency.verifiedBy = currentUser?.name;
        if (verifyStatus === 'REOPENED') {
          application.status = 'DEFICIENCY_NOTIFIED';
        }
      }
      setIsVerifyModalOpen(false);
      setVerificationNotes('');
      setSelectedDeficiency(null);
      alert(`Deficiency ${selectedDeficiency.id} updated to ${verifyStatus}.`);
    } catch (err) {
      alert(`Failed to verify deficiency: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top back bar and actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/applications')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-gov-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applications List
        </button>

        {/* Action Buttons for Authorized Roles */}
        <div className="flex flex-wrap items-center gap-2">
          {currentUser?.role !== 'COLLEGE_REP' && application.status !== 'DRAFT' && (
            <>
              <Button
                variant="primary"
                size="sm"
                icon={ShieldCheck}
                onClick={() => setIsReviewModalOpen(true)}
              >
                Conduct Scrutiny Review
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => setIsAddDeficiencyModalOpen(true)}
              >
                Add Deficiency / Observation
              </Button>

              {!application.requiresEvc && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={MapPin}
                  onClick={() => setIsMarkEvcModalOpen(true)}
                >
                  Mark for EVC
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                icon={UserCheck}
                onClick={() => {
                  setSelectedOfficer(application.assignedOfficer);
                  setIsAssignModalOpen(true);
                }}
              >
                Assign Officer
              </Button>

              {application.status !== 'DEFICIENCY_NOTIFIED' && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={FileWarning}
                  onClick={() => setIsDeficiencyModalOpen(true)}
                >
                  Return for Deficiency
                </Button>
              )}

              {nextStage && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => setIsAdvanceModalOpen(true)}
                >
                  Advance to {nextStage.name}
                </Button>
              )}
            </>
          )}

          {/* College Response Button */}
          {application.status === 'DEFICIENCY_NOTIFIED' && (
            <Button
              variant="success"
              size="sm"
              icon={Upload}
              onClick={() => setIsResubmitModalOpen(true)}
            >
              Submit Deficiency Clarification
            </Button>
          )}

          {/* Draft Actions for College Rep or Admin */}
          {application.status === 'DRAFT' && (currentUser?.role === 'COLLEGE_REP' || currentUser?.role === 'SYSTEM_ADMIN' || currentUser?.role === 'ADMIN') && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={handleOpenEditDraft}
              >
                Edit Draft
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                onClick={handleSubmitDraft}
                isLoading={isActionLoading}
              >
                Submit Application
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={handleDeleteDraft}
                disabled={isActionLoading}
              >
                Discard Draft
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Draft Status Banner */}
      {application.status === 'DRAFT' && (
        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold uppercase tracking-wide text-amber-950">
                Draft Application — Pending Formal Submission
              </h4>
              <p className="mt-0.5 text-amber-900 leading-relaxed">
                This approval application is saved as a draft under Reference Number <strong className="font-mono">{application.id}</strong>. You may edit course intake and programme details, or submit it to the Regional Scrutiny Cell when ready.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" icon={Edit} onClick={handleOpenEditDraft}>
              Edit Draft
            </Button>
            <Button variant="primary" size="sm" icon={Send} onClick={handleSubmitDraft} isLoading={isActionLoading}>
              Submit Now
            </Button>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-base font-bold text-gov-900">{application.id}</span>
              <StatusBadge status={application.status} />
              <Badge variant={risk.badgeColor} dot>
                {risk.level} DEADLINE RISK
              </Badge>
              <Badge variant="navy">{application.applicationType}</Badge>
              {application.requiresEvc && (
                <Badge variant="amber" dot>
                  MANDATORY EVC REQUIRED
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{application.institutionName}</h1>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span>Permanent AICTE ID: <strong>{application.institutionCode}</strong></span>
              <span>&bull;</span>
              <span>Region: <strong>{application.region}</strong></span>
              <span>&bull;</span>
              <span>Programme: <strong>{application.programme}</strong></span>
            </p>
            {application.requiresEvc && application.evcReason && (
              <p className="text-[11px] text-amber-800 mt-1.5 font-medium bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block">
                <strong>EVC Trigger Reason:</strong> {application.evcReason}
              </p>
            )}
          </div>

          {/* Deadline & SLA Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[240px]">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Stage Target Deadline
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-base font-bold text-slate-900">{formatDate(application.nextDeadline)}</span>
              <span className={`text-xs font-bold ${isBreached ? 'text-rose-600' : daysRemaining <= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isBreached ? `${Math.abs(daysRemaining)} Days Overdue` : `${daysRemaining} Days Remaining`}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Assigned: <strong>{application.assignedOfficer}</strong> ({application.officerRole})
            </p>
          </div>
        </div>

        {/* Workflow Progress Stepper */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Configured Pathway: {currentWorkflow.name}
            </span>
            <span className="text-xs text-slate-500">
              Stage {currentStageIndex + 1} of {workflowStages.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-3">
            {workflowStages.map((stg, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stg.id}
                  className={`p-3 rounded-lg border text-xs transition-all ${
                    isCurrent
                      ? 'bg-gov-900 text-white border-gov-900 shadow-sm font-semibold'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider">Step 0{idx + 1}</span>
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isCurrent ? (
                      <Clock className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
                    ) : null}
                  </div>
                  <div className="font-medium truncate">{stg.name}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">SLA: {stg.targetDays} days</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deficiency Banner if active */}
      {application.deficiencyReason && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 flex-1">
            <h4 className="font-bold uppercase tracking-wider text-amber-800">
              Regulatory Deficiency Return Notice ({application.deficiencyCount} cycle(s))
            </h4>
            <p className="mt-1 font-medium">{application.deficiencyReason}</p>
            <p className="text-[11px] text-amber-700 mt-1">
              Institution must upload rectifying documents and submit formal clarification before application can advance.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Details, Documents, Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Documents & Scrutiny Observations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Uploaded Documents */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mandatory Application Documents</h3>
                <p className="text-xs text-slate-500">Statutory affidavits, land lease deed, fire safety, and infrastructure approvals</p>
              </div>
              <Badge variant="navy">{application.documents?.length || 0} Files</Badge>
            </div>

            <div className="divide-y divide-slate-100">
              {application.documents?.map(doc => (
                <div key={doc.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{doc.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        {doc.type} &bull; {doc.size} &bull; Uploaded on {formatDate(doc.uploadDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.status} />
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setPreviewDoc(doc)}
                    >
                      Inspect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scrutiny Deficiencies & Structured Observations */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Regulatory Deficiencies & Findings</h3>
                <p className="text-xs text-slate-500">Statutory clauses, severity levels, rectification deadlines, and resolution tracking</p>
              </div>
              {currentUser?.role !== 'COLLEGE_REP' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsAddDeficiencyModalOpen(true)}
                >
                  Record Deficiency
                </Button>
              )}
            </div>

            {(!application.observations || application.observations.length === 0) ? (
              <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                No regulatory deficiencies or non-compliances recorded.
              </div>
            ) : (
              <div className="space-y-3">
                {application.observations.map(obs => {
                  const isOpen = obs.status === 'OPEN' || obs.status === 'DEFICIENT' || obs.status === 'REOPENED';
                  const isResponded = obs.status === 'RESPONDED' || obs.status === 'UNDER_VERIFICATION';
                  const isResolved = obs.status === 'RESOLVED' || obs.status === 'CLEARED';

                  return (
                    <div key={obs.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gov-900">{obs.id}</span>
                          <Badge size="sm" variant={obs.type === 'DEFICIENCY' ? 'danger' : 'navy'}>
                            {obs.type || 'DEFICIENCY'}
                          </Badge>
                          <Badge size="sm" variant={obs.severity === 'CRITICAL' ? 'danger' : obs.severity === 'MAJOR' ? 'amber' : 'outline'}>
                            {obs.severity || 'MAJOR'}
                          </Badge>
                          <span className="text-[11px] text-slate-500 font-medium">Clause: {obs.clauses || 'Norms Clause 4.2'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge size="sm" variant={isResolved ? 'success' : isResponded ? 'amber' : 'danger'}>
                            {obs.status}
                          </Badge>
                          {currentUser?.role !== 'COLLEGE_REP' && (
                            <div className="flex items-center gap-1">
                              {!isResolved && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDeficiency(obs);
                                    setVerifyStatus('RESOLVED');
                                    setVerificationNotes('Rectification verified and found compliant with statutory norms.');
                                    setIsVerifyModalOpen(true);
                                  }}
                                  className="px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold text-[10px] hover:bg-emerald-700 transition"
                                >
                                  Resolve
                                </button>
                              )}
                              {isResolved && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDeficiency(obs);
                                    setVerifyStatus('REOPENED');
                                    setVerificationNotes('Deficiency reopened due to inadequate rectification evidence.');
                                    setIsVerifyModalOpen(true);
                                  }}
                                  className="px-2 py-0.5 rounded bg-amber-600 text-white font-semibold text-[10px] hover:bg-amber-700 transition"
                                >
                                  Reopen
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-slate-800 leading-relaxed font-medium">
                        {obs.remarks}
                      </div>

                      {obs.correctiveAction && (
                        <div className="bg-amber-50/80 p-2 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
                          <strong>Corrective Action Required:</strong> {obs.correctiveAction}
                        </div>
                      )}

                      {obs.responseNotes && (
                        <div className="bg-blue-50/80 p-2 rounded-lg border border-blue-200 text-blue-900 text-[11px]">
                          <strong>Institution Clarification Response:</strong> {obs.responseNotes}
                        </div>
                      )}

                      {obs.verificationNotes && (
                        <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 text-slate-700 text-[11px]">
                          <strong>Verification Determination ({obs.verifiedBy || 'Officer'}):</strong> {obs.verificationNotes}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Recorded by {obs.officer || 'Scrutiny Officer'} on {formatDate(obs.date)} &bull; Stage: {obs.stage || application.currentStage}</span>
                        {obs.deadline && <span>Rectification Deadline: <strong className="text-slate-600">{formatDate(obs.deadline)}</strong></span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chronological Scrutiny Reviews History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Stage Review & Evaluation History</h3>
                <p className="text-xs text-slate-500">Auditable review rounds, checklist results, and formal officer recommendations</p>
              </div>
              <Badge variant="navy">{reviews.length} Review(s)</Badge>
            </div>

            {reviews.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500">
                <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                No formal scrutiny reviews recorded yet for this application.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev, idx) => (
                  <div key={rev.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-2.5 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge size="sm" variant="navy">Round {rev.round || 1}</Badge>
                        <span className="font-semibold text-slate-800">Stage: {rev.stage}</span>
                        {rev.isDraft && <Badge size="sm" variant="amber">Draft Review</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          size="sm"
                          variant={
                            rev.decision === 'RECOMMEND_APPROVAL' || rev.decision === 'APPROVED' ? 'success'
                            : rev.decision === 'DEFICIENCIES_NOTED' ? 'amber'
                            : rev.decision === 'RECOMMEND_REJECTION' || rev.decision === 'REJECTED' ? 'danger'
                            : 'navy'
                          }
                        >
                          {rev.decision}
                        </Badge>
                        <span className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</span>
                      </div>
                    </div>

                    <div className="text-slate-700 font-medium">
                      {rev.remarks}
                    </div>

                    {rev.checklistResults && rev.checklistResults.length > 0 && (
                      <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Evaluated Checklist Items ({rev.checklistResults.length})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {rev.checklistResults.map((chk, cIdx) => (
                            <div key={cIdx} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-100 text-[11px]">
                              <span className="text-slate-700 truncate pr-2">{chk.title || chk.id}</span>
                              <Badge
                                size="sm"
                                variant={chk.status === 'SATISFIED' ? 'success' : chk.status === 'NOT_SATISFIED' ? 'danger' : 'outline'}
                              >
                                {chk.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400">
                      Evaluated by: <strong>{rev.reviewerName}</strong> ({rev.reviewerRole})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EVC Inspection Details Card if Required or Scheduled */}
          {(application.requiresEvc || evcSchedule) && (
            <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-card">
              <div className="flex items-center justify-between mb-3 border-b border-blue-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Expert Visit Committee (EVC) Inspection</h3>
                    <p className="text-xs text-slate-500">Physical verification of infrastructure, laboratories, and safety compliance</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/evc')}
                >
                  Manage in EVC Cell
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Inspection Status</span>
                  <div className="mt-0.5 font-bold text-slate-800">
                    {evcSchedule ? evcSchedule.status : 'PENDING SCHEDULING'}
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Proposed Visit Date</span>
                  <div className="mt-0.5 font-bold text-slate-800">
                    {evcSchedule?.proposedDate ? formatDate(evcSchedule.proposedDate) : 'Not Scheduled'}
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Committee Recommendation</span>
                  <div className="mt-0.5 font-bold text-gov-800">
                    {evcSchedule?.recommendation || 'Pending Inspection'}
                  </div>
                </div>
              </div>

              {evcSchedule?.committeeMembers && evcSchedule.committeeMembers.length > 0 && (
                <div className="text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Assigned Expert Committee:</span>
                  <div className="flex flex-wrap gap-2">
                    {evcSchedule.committeeMembers.map((m, mIdx) => (
                      <span key={mIdx} className="bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 font-medium">
                        {m.name} ({m.role})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Requested Intake Summary */}
          {application.requestedIntake?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Proposed Programme & Intake Capacity</h3>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Proposed Technical Course</th>
                    <th className="py-2 px-3 text-right">Current Intake</th>
                    <th className="py-2 px-3 text-right">Proposed Intake</th>
                    <th className="py-2 px-3 text-right">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {application.requestedIntake.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-medium text-slate-800">{item.course}</td>
                      <td className="py-2 px-3 text-right text-slate-500">{item.currentIntake}</td>
                      <td className="py-2 px-3 text-right font-bold text-gov-900">{item.proposedIntake}</td>
                      <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                        +{item.proposedIntake - item.currentIntake}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Stage Timeline & Risk Breakdown */}
        <div className="space-y-6">
          {/* Risk Scoring Transparent Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Deterministic Deadline Risk Score</h3>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 mb-3">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Risk Level</span>
                <p className="text-lg font-bold text-slate-900">{risk.level}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Calculated Score</span>
                <p className="text-lg font-mono font-bold text-gov-800">{risk.score}/100</p>
              </div>
            </div>

            <div className="text-xs space-y-1.5">
              <p className="font-semibold text-slate-700 text-[11px] uppercase">Evaluation Factors:</p>
              <ul className="space-y-1 text-slate-600">
                {risk.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-gov-700 font-bold">&bull;</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Activity & Stage Progression History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Stage Movement History
            </h3>
            <div className="relative pl-6 space-y-5 border-l-2 border-slate-200">
              {application.timeline?.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    item.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-gov-700'
                  }`} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.stage}</h4>
                    <p className="text-[10px] text-slate-400">{formatDate(item.date)}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Assign Officer */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Scrutiny Officer"
        subtitle={`Assign an authorized AICTE official to application ${application.id}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAssignOfficer}>
              Confirm Assignment
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select AICTE Official *</label>
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            >
              <option value="">-- Choose AICTE Official --</option>
              <option value="Dr. Suresh Kumar Nair">Dr. Suresh Kumar Nair (Regional Officer)</option>
              <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma (Bureau Officer - HQ)</option>
              <option value="Smt. Priya Varma">Smt. Priya Varma (Compliance Reviewer)</option>
              <option value="Prof. (Dr.) Ananya Sen">Prof. (Dr.) Ananya Sen (EVC Committee Member)</option>
              <option value="AICTE Admin">AICTE System Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assignment Reason / Scope</label>
            <input
              type="text"
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              placeholder="e.g. Assigned for regional scrutiny review and syllabus verification"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Return for Deficiency */}
      <Modal
        isOpen={isDeficiencyModalOpen}
        onClose={() => setIsDeficiencyModalOpen(false)}
        title="Return Application for Deficiencies"
        subtitle="Specify mandatory regulatory deficiencies. This returns the application to the institution."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDeficiencyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleReturnDeficiency}>
              Issue Deficiency Notice
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase">Mandatory Reason / Regulatory Clause *</label>
          <textarea
            rows={4}
            value={deficiencyReason}
            onChange={(e) => setDeficiencyReason(e.target.value)}
            placeholder="e.g. Land Lease Deed does not include certified survey boundary map from Tahsildar/Revenue Authority as per APH Clause 2.4..."
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </Modal>

      {/* Modal: Advance Stage */}
      <Modal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        title={`Advance to ${nextStage?.name}`}
        subtitle={`Verify compliance before transitioning ${application.id} to next stage in the approval pathway`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAdvanceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdvanceStage}>
              Advance Application
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            You are moving this application from <strong>{application.currentStage}</strong> to <strong>{nextStage?.name}</strong>.
            Target SLA for the new stage will be <strong>{nextStage?.targetDays} days</strong>.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Officer Remarks / Recommendation</label>
            <input
              type="text"
              value={transitionNotes}
              onChange={(e) => setTransitionNotes(e.target.value)}
              placeholder="e.g. Scrutiny cleared with complete documentation. Recommended for physical EVC."
              className="mt-1 w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: College Clarification Resubmission */}
      <Modal
        isOpen={isResubmitModalOpen}
        onClose={() => setIsResubmitModalOpen(false)}
        title="Institutional Response & Resubmission"
        subtitle="Submit compliance evidence or clarifications against the notified deficiency"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsResubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleCollegeResubmit}>
              Submit Resubmission
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Institution Response Notes *</label>
            <textarea
              rows={3}
              value={resubmitNotes}
              onChange={(e) => setResubmitNotes(e.target.value)}
              placeholder="Explain rectifications made, attach revenue surveyor certificates, etc."
              className="mt-1 w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Mock Document Upload</label>
            <input
              type="file"
              className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gov-50 file:text-gov-800 hover:file:bg-gov-100"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Document Preview */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || 'Document Inspection'}
        subtitle={`Document Metadata & Statutory Stamp`}
        maxWidth="max-w-xl"
        footer={
          <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
            Close
          </Button>
        }
      >
        {previewDoc && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Document ID:</span>
                <span className="font-mono font-bold text-slate-800">{previewDoc.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Type & Size:</span>
                <span className="font-semibold text-slate-800">{previewDoc.type} ({previewDoc.size})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Upload Date:</span>
                <span className="text-slate-800">{formatDate(previewDoc.uploadDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Verification Status:</span>
                <StatusBadge status={previewDoc.status} />
              </div>
            </div>

            <div className="p-8 text-center bg-slate-100 rounded-lg border border-dashed border-slate-300">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Prototype PDF Document Viewer</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                In production connected with Spring Boot, this displays an embedded PDF viewer fetched securely from S3/MinIO bucket.
              </p>
            </div>
          </div>
        )}
      </Modal>
      {/* Modal: Edit Draft Application */}
      <Modal
        isOpen={isEditDraftModalOpen}
        onClose={() => setIsEditDraftModalOpen(false)}
        title={`Edit Draft Application: ${application.id}`}
        subtitle="Modify academic programme, courses, and target intake before formal submission"
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditDraftModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveDraftEdits} isLoading={isActionLoading}>
              Save Draft Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Application Type
            </label>
            <select
              value={editDraftForm.applicationType}
              onChange={(e) => setEditDraftForm({ ...editDraftForm, applicationType: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            >
              <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
              <option value="New Technical Institution">New Technical Institution</option>
              <option value="Increase in Intake / New Course">Increase in Intake / New Course</option>
              <option value="Change of Site / Infrastructure">Change of Site / Infrastructure</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Programme
              </label>
              <select
                value={editDraftForm.programme}
                onChange={(e) => setEditDraftForm({ ...editDraftForm, programme: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              >
                <option value="Engineering & Technology">Engineering & Technology</option>
                <option value="Management (MBA / PGDM)">Management (MBA / PGDM)</option>
                <option value="Computer Applications (MCA)">Computer Applications (MCA)</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Architecture & Town Planning">Architecture & Town Planning</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={editDraftForm.priority}
                onChange={(e) => setEditDraftForm({ ...editDraftForm, priority: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Proposed Technical Course
            </label>
            <input
              type="text"
              value={editDraftForm.proposedCourse}
              onChange={(e) => setEditDraftForm({ ...editDraftForm, proposedCourse: e.target.value })}
              placeholder="e.g. B.Tech in Artificial Intelligence & Machine Learning"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current Intake
              </label>
              <input
                type="number"
                min="0"
                value={editDraftForm.currentIntake}
                onChange={(e) => setEditDraftForm({ ...editDraftForm, currentIntake: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Proposed Target Intake
              </label>
              <input
                type="number"
                min="1"
                value={editDraftForm.proposedIntake}
                onChange={(e) => setEditDraftForm({ ...editDraftForm, proposedIntake: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Conduct Stage Scrutiny Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Conduct Scrutiny Review: ${application.id}`}
        subtitle={`Stage: ${application.currentStage} — Complete statutory checklist and formal officer determination`}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isReviewDraft}
                onChange={(e) => setIsReviewDraft(e.target.checked)}
                className="rounded border-slate-300 text-gov-900 focus:ring-gov-900"
              />
              Save as Draft Review
            </label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSubmitScrutinyReview} isLoading={isActionLoading}>
                {isReviewDraft ? 'Save Draft Review' : 'Submit Final Determination'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-2">
              Stage Evaluation Checklist ({reviewChecklist.length} Items)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {reviewChecklist.map((item, idx) => (
                <div key={item.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{item.category}</span>
                    <p className="font-medium text-slate-800">{item.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {['SATISFIED', 'NOT_SATISFIED', 'NOT_APPLICABLE'].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          const updated = [...reviewChecklist];
                          updated[idx] = { ...updated[idx], status: st };
                          setReviewChecklist(updated);
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                          item.status === st
                            ? st === 'SATISFIED' ? 'bg-emerald-600 text-white'
                              : st === 'NOT_SATISFIED' ? 'bg-rose-600 text-white'
                              : 'bg-slate-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {st === 'SATISFIED' ? 'Compliant' : st === 'NOT_SATISFIED' ? 'Deficient' : 'N/A'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Formal Officer Determination / Action
            </label>
            <select
              value={reviewDecision}
              onChange={(e) => setReviewDecision(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-gov-900"
            >
              <option value="FORWARD_NEXT_STAGE">FORWARD_NEXT_STAGE (Advance to next workflow stage)</option>
              <option value="RECOMMEND_APPROVAL">RECOMMEND_APPROVAL (Recommend for statutory grant of approval)</option>
              <option value="DEFICIENCIES_NOTED">DEFICIENCIES_NOTED (Issue regulatory deficiency notice to institution)</option>
              <option value="RECOMMEND_REJECTION">RECOMMEND_REJECTION (Recommend rejection due to insurmountable violations)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Review Remarks & Statutory Justification *
            </label>
            <textarea
              rows={3}
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              placeholder="Record detailed statutory remarks, findings, and evaluation rationale..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>
        </div>
      </Modal>

      {/* Mark for Mandatory EVC Modal */}
      <Modal
        isOpen={isMarkEvcModalOpen}
        onClose={() => setIsMarkEvcModalOpen(false)}
        title={`Trigger Mandatory EVC Visit: ${application.id}`}
        subtitle="Mandate physical on-site committee inspection prior to approval consideration"
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsMarkEvcModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleMarkEvc} isLoading={isActionLoading}>
              Confirm EVC Trigger
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Flagging this application requires an Expert Visit Committee to conduct an on-site physical inspection before approval can be granted.
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Statutory Justification / EVC Reason *
            </label>
            <textarea
              rows={3}
              value={evcReason}
              onChange={(e) => setEvcReason(e.target.value)}
              placeholder="e.g. Physical verification of newly constructed workshop block, safety norms, and laboratory equipment required."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>
        </div>
      </Modal>

      {/* Record Structured Deficiency Modal */}
      <Modal
        isOpen={isAddDeficiencyModalOpen}
        onClose={() => setIsAddDeficiencyModalOpen(false)}
        title={`Record Regulatory Finding: ${application.id}`}
        subtitle="Log statutory deficiency or formal observation against institution"
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddDeficiencyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddDeficiency} isLoading={isActionLoading}>
              Record Finding
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Finding Type</label>
              <select
                value={deficiencyForm.type}
                onChange={(e) => setDeficiencyForm({ ...deficiencyForm, type: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              >
                <option value="DEFICIENCY">DEFICIENCY (Blocks Approval)</option>
                <option value="OBSERVATION">OBSERVATION (Advisory Note)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Severity Level</label>
              <select
                value={deficiencyForm.severity}
                onChange={(e) => setDeficiencyForm({ ...deficiencyForm, severity: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="MAJOR">MAJOR</option>
                <option value="MINOR">MINOR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clause / Norm Reference</label>
            <input
              type="text"
              value={deficiencyForm.clause}
              onChange={(e) => setDeficiencyForm({ ...deficiencyForm, clause: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Deficiency Description *</label>
            <textarea
              rows={2}
              value={deficiencyForm.description}
              onChange={(e) => setDeficiencyForm({ ...deficiencyForm, description: e.target.value })}
              placeholder="e.g. Fire safety NOC expired; Faculty cadre ratio in Computer Engineering is below required 1:20 norm."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Corrective Action Required</label>
            <textarea
              rows={2}
              value={deficiencyForm.correctiveAction}
              onChange={(e) => setDeficiencyForm({ ...deficiencyForm, correctiveAction: e.target.value })}
              placeholder="e.g. Upload renewed Fire Safety Certificate issued by State Disaster Management Authority."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Rectification Window (Days)</label>
            <select
              value={deficiencyForm.deadlineDays}
              onChange={(e) => setDeficiencyForm({ ...deficiencyForm, deadlineDays: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            >
              <option value="7">7 Calendar Days</option>
              <option value="15">15 Calendar Days</option>
              <option value="30">30 Calendar Days</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Verify / Reopen Deficiency Modal */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title={`Verify Deficiency: ${selectedDeficiency?.id}`}
        subtitle="Review institutional rectification and determine closure or reopening"
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleVerifyDeficiency} isLoading={isActionLoading}>
              Save Verification Determination
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-800">{selectedDeficiency?.remarks}</div>
            {selectedDeficiency?.responseNotes && (
              <p className="mt-1 text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
                <strong>Institution Response:</strong> {selectedDeficiency.responseNotes}
              </p>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Verification Status</label>
            <select
              value={verifyStatus}
              onChange={(e) => setVerifyStatus(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
            >
              <option value="RESOLVED">RESOLVED (Rectification Accepted & Compliant)</option>
              <option value="REOPENED">REOPENED (Rectification Inadequate; Return to Institution)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Verification Notes *</label>
            <textarea
              rows={3}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Record verification findings and basis for closure/reopening..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
