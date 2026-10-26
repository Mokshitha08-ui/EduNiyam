import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  FileText,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  Calendar,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  FileWarning
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatDate, getDaysRemaining, isOverdue } from '../utils/dateUtils';
import { calculateRiskScore } from '../utils/riskScoring';

export const CollegeDashboard = () => {
  const { applications, compliance, submitCollegeResponse, createNewApplication } = useAppData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Institution code for Vivekananda Institute of Technology
  const targetInstCode = currentUser?.institutionCode || '1-34981275';
  const targetInstName = currentUser?.institution || 'Vivekananda Institute of Technology, Bangalore';

  // Scoped Applications & Compliance for this college
  const collegeApps = applications.filter(a =>
    a.institutionCode === targetInstCode || a.institutionName.includes('Vivekananda')
  );

  const collegeCompliance = compliance.filter(c =>
    c.institutionCode === targetInstCode || c.institutionName.includes('Vivekananda')
  );

  // Active deficiencies
  const deficientApp = collegeApps.find(a => a.status === 'DEFICIENCY_NOTIFIED');

  // Response Modal State
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');
  const [docFile, setDocFile] = useState(null);

  // Multi-step Application Modal State
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [appStep, setAppStep] = useState(1);
  const [appType, setAppType] = useState('Increase in Intake / New Course');
  const [proposedCourse, setProposedCourse] = useState('');
  const [intakeCount, setIntakeCount] = useState(60);

  const handleOpenResponse = () => {
    setResponseNotes('');
    setDocFile(null);
    setIsResponseModalOpen(true);
  };

  const handleSaveResponse = () => {
    if (!responseNotes.trim()) {
      alert('Please enter your response notes.');
      return;
    }

    const newDocs = docFile ? [{
      id: `DOC-${Date.now().toString().slice(-4)}`,
      title: docFile.name,
      type: 'PDF',
      size: '2.1 MB',
      status: 'PENDING',
      uploadDate: new Date().toISOString().split('T')[0]
    }] : [];

    submitCollegeResponse(deficientApp.id, responseNotes, newDocs, currentUser);
    setIsResponseModalOpen(false);
    alert('Clarification & response successfully submitted to AICTE Scrutiny Cell.');
  };

  const handleStartNewApplication = async (status = 'SUBMITTED') => {
    if (status === 'SUBMITTED' && !proposedCourse.trim()) {
      alert('Please enter the proposed course name before formal submission.');
      return;
    }

    const payload = {
      institutionName: targetInstName,
      institutionCode: targetInstCode,
      applicationType: appType,
      programme: 'Engineering & Technology',
      region: currentUser?.region || 'South-Western',
      state: 'Karnataka',
      workflowId: 'WF-FULL',
      priority: 'NORMAL',
      status,
      requestedIntake: proposedCourse ? [{
        course: proposedCourse.trim(),
        currentIntake: 0,
        proposedIntake: Number(intakeCount) || 60
      }] : []
    };

    try {
      const newApp = await createNewApplication(payload, currentUser);
      setIsNewAppModalOpen(false);
      navigate(`/applications/${newApp.id}`);
    } catch (err) {
      alert('Error creating application: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Portal: Vivekananda Institute of Technology"
        subtitle="Manage academic approvals, deficiency compliances, and time-bound undertakings for AY 2026-27"
        badge={<Badge variant="navy">Permanent AICTE ID: 1-34981275</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => {
              setAppStep(1);
              setIsNewAppModalOpen(true);
            }}
          >
            Start New Application
          </Button>
        }
      />

      {/* College Profile Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gov-900 text-white flex items-center justify-center shrink-0 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{targetInstName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Affiliated with Visvesvaraya Technological University (VTU) &bull; Bengaluru Urban, Karnataka
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge size="sm" variant="success">Accredited Tier-1</Badge>
              <Badge size="sm" variant="default">Established: 1997</Badge>
              <Badge size="sm" variant="navy">South-Western Regional Jurisdiction</Badge>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1 min-w-[220px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Principal / Rep:</span>
            <span className="font-semibold text-slate-800">Dr. R. Ramanathan</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Contact Email:</span>
            <span className="font-mono text-gov-800 font-medium">principal@vitb.edu.in</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Active Applications:</span>
            <span className="font-bold text-slate-900">{collegeApps.length}</span>
          </div>
        </div>
      </div>

      {/* Pending Deficiencies Action Alert */}
      {deficientApp && (
        <div className="bg-amber-50 rounded-xl border border-amber-300 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <FileWarning className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                    Action Required: Scrutiny Deficiency Notice Issued
                  </h3>
                  <Badge size="sm" variant="danger">Application: {deficientApp.id}</Badge>
                </div>
                <p className="text-xs text-amber-900 mt-1 font-medium">
                  {deficientApp.deficiencyReason}
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Target Response Deadline: <strong>{formatDate(deficientApp.nextDeadline)}</strong> ({getDaysRemaining(deficientApp.nextDeadline)} days remaining)
                </p>
              </div>
            </div>

            <Button
              variant="danger"
              size="sm"
              icon={Upload}
              onClick={handleOpenResponse}
              className="shrink-0"
            >
              Submit Response & Files
            </Button>
          </div>
        </div>
      )}

      {/* Submitted Applications Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Institutional Approval Applications (AY 2026-27)</h3>
        <div className="space-y-4">
          {collegeApps.map(app => {
            const risk = calculateRiskScore(app);
            return (
              <div
                key={app.id}
                onClick={() => navigate(`/applications/${app.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-card hover:border-gov-600 transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-gov-800">{app.id}</span>
                    <StatusBadge status={app.status} />
                    <Badge variant="navy">{app.applicationType}</Badge>
                  </div>
                  <div className="text-xs text-slate-500">
                    Submitted on: <strong>{formatDate(app.submissionDate)}</strong>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Stage</span>
                    <span className="font-bold text-slate-800">{app.currentStage}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned AICTE Official</span>
                    <span className="font-medium text-slate-800">{app.assignedOfficer}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Deadline</span>
                    <span className="font-medium text-slate-800">{formatDate(app.nextDeadline)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Compliance Status</span>
                    <span className="font-medium text-slate-800">
                      {app.documents?.length || 0} Documents Uploaded
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Institutional Compliance & Lease Expiry Reminders */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Statutory Undertakings & Lease Expiry Tracking</h3>
        <div className="divide-y divide-slate-100 text-xs">
          {collegeCompliance.map(item => {
            const daysLeft = item.expiryDate ? getDaysRemaining(item.expiryDate) : null;
            const overdue = isOverdue(item.dueDate);

            return (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.documentName}</span>
                    <StatusBadge status={item.verificationStatus} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.requirementType} &bull; Version v{item.version}</p>
                </div>

                <div className="text-right">
                  {item.expiryDate ? (
                    <span className={`font-semibold ${daysLeft <= 30 ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                      Expires: {formatDate(item.expiryDate)} ({daysLeft} days)
                    </span>
                  ) : (
                    <span className={`font-semibold ${overdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                      Undertaking Due: {formatDate(item.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deficiency Response Modal */}
      <Modal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        title="Submit Deficiency Clarification & Evidence"
        subtitle={`Application: ${deficientApp?.id}`}
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsResponseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveResponse}>
              Transmit to AICTE
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Deficiency:</strong> {deficientApp?.deficiencyReason}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Institutional Response / Clarification *</label>
            <textarea
              rows={4}
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              placeholder="Detail the corrections, boundary surveyor certificate reference, or compliance steps taken..."
              className="mt-1 w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Attach Rectified Document (PDF)</label>
            <input
              type="file"
              onChange={(e) => setDocFile(e.target.files[0])}
              className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gov-900 file:text-white"
            />
          </div>
        </div>
      </Modal>

      {/* Multi-step New Application Wizard */}
      <Modal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        title="AICTE Institutional Approval Application Wizard"
        subtitle={`Step ${appStep} of 2 - ${targetInstName}`}
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStartNewApplication('DRAFT')}
              className="text-amber-800 border-amber-300 hover:bg-amber-50"
            >
              Save as Draft
            </Button>

            <div className="flex items-center gap-2">
              {appStep > 1 && (
                <Button variant="outline" size="sm" onClick={() => setAppStep(appStep - 1)}>
                  Previous
                </Button>
              )}
              {appStep === 1 ? (
                <Button variant="primary" size="sm" onClick={() => setAppStep(2)}>
                  Next: Course Details &rarr;
                </Button>
              ) : (
                <Button variant="success" size="sm" onClick={() => handleStartNewApplication('SUBMITTED')}>
                  Submit Application
                </Button>
              )}
            </div>
          </div>
        }
      >
        {appStep === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Application Category</label>
              <select
                value={appType}
                onChange={(e) => setAppType(e.target.value)}
                className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
              >
                <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
                <option value="Increase in Intake / New Course">Increase in Intake / New Course</option>
                <option value="Change of Site / Infrastructure">Change of Site / Infrastructure</option>
                <option value="Conversion to Co-Ed Institution">Conversion to Co-Ed Institution</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border text-xs text-slate-600 space-y-1">
              <p><strong>Applying Institution:</strong> {targetInstName}</p>
              <p><strong>AICTE Permanent ID:</strong> {targetInstCode}</p>
              <p><strong>Jurisdiction:</strong> South-Western Regional Office (Bangalore)</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Proposed Course / Programme *</label>
              <input
                type="text"
                value={proposedCourse}
                onChange={(e) => setProposedCourse(e.target.value)}
                placeholder="e.g. B.Tech in Artificial Intelligence & Machine Learning"
                className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Proposed Intake Seat Capacity</label>
              <input
                type="number"
                value={intakeCount}
                onChange={(e) => setIntakeCount(e.target.value)}
                className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
