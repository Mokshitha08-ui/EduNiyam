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
  Plus
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
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
    updateApplicationStage,
    returnApplicationDeficiency,
    submitCollegeResponse,
    assignApplicationOfficer
  } = useAppData();
  const { currentUser } = useAuth();

  const application = applications.find(a => a.id === id);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('');

  const [isDeficiencyModalOpen, setIsDeficiencyModalOpen] = useState(false);
  const [deficiencyReason, setDeficiencyReason] = useState('');

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [transitionNotes, setTransitionNotes] = useState('');

  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [resubmitNotes, setResubmitNotes] = useState('');

  const [previewDoc, setPreviewDoc] = useState(null);

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

  const currentWorkflow = workflows.find(w => w.id === application.workflowId) || workflows[0];
  const workflowStages = currentWorkflow.stages;
  const currentStageIndex = workflowStages.findIndex(s => s.code === application.currentStage);
  const nextStage = workflowStages[currentStageIndex + 1];

  const risk = calculateRiskScore(application);
  const daysRemaining = getDaysRemaining(application.nextDeadline);
  const isBreached = isOverdue(application.nextDeadline);

  // Handlers
  const handleAssignOfficer = () => {
    if (!selectedOfficer) return;
    assignApplicationOfficer(application.id, selectedOfficer, currentUser);
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
          {currentUser?.role !== 'COLLEGE_REP' && (
            <>
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
        </div>
      </div>

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
            </div>
            <h1 className="text-xl font-bold text-slate-900">{application.institutionName}</h1>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span>Permanent AICTE ID: <strong>{application.institutionCode}</strong></span>
              <span>&bull;</span>
              <span>Region: <strong>{application.region}</strong></span>
              <span>&bull;</span>
              <span>Programme: <strong>{application.programme}</strong></span>
            </p>
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

          {/* Scrutiny Observations & Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Scrutiny Cell Observations</h3>
                <p className="text-xs text-slate-500">Official findings recorded by Scrutiny Committee and Regional Officers</p>
              </div>
            </div>

            {application.observations?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No scrutiny defects recorded so far.</p>
            ) : (
              <div className="space-y-3">
                {application.observations?.map(obs => (
                  <div key={obs.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{obs.officer}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(obs.date)}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{obs.remarks}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge size="sm" variant={obs.status === 'CLEARED' ? 'success' : 'danger'}>
                        {obs.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400">Stage: {obs.stage}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
        subtitle={`Select an authorized AICTE scrutiny officer for application ${application.id}`}
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
          <label className="block text-xs font-semibold text-slate-700 uppercase">Select AICTE Official</label>
          <select
            value={selectedOfficer}
            onChange={(e) => setSelectedOfficer(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
          >
            <option value="Dr. Suresh Kumar Nair">Dr. Suresh Kumar Nair (Regional Officer)</option>
            <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma (Bureau Officer - HQ)</option>
            <option value="Smt. Priya Varma">Smt. Priya Varma (Compliance Reviewer)</option>
            <option value="Prof. (Dr.) Ananya Sen">Prof. (Dr.) Ananya Sen (EVC Committee Member)</option>
          </select>
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
    </div>
  );
};
