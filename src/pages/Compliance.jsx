import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  Upload,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Filter,
  Download,
  Building,
  RefreshCw,
  Plus,
  Bell,
  Sparkles,
  History
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { complianceApi } from '../services/apiService';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import { formatDate, getDaysRemaining, isOverdue } from '../utils/dateUtils';
import { exportToCSV } from '../utils/exportService';

export const Compliance = () => {
  const {
    dataMode,
    compliance,
    createComplianceObligation,
    verifyComplianceDoc,
    uploadComplianceDoc,
    analyzeComplianceDoc,
    triggerComplianceReminders
  } = useAppData();
  const { currentUser } = useAuth();

  const isReviewerOrAdmin = currentUser?.role && currentUser.role !== 'COLLEGE_REP';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedReviewer, setSelectedReviewer] = useState('ALL');

  // Create Obligation Modal (Req 34)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    institutionCode: '1-34981275',
    institutionName: 'RV College of Engineering, Bengaluru',
    region: 'South-Western',
    requirementType: 'Statutory Safety Certificate',
    documentName: '',
    description: '',
    applicableClause: 'AICTE Approval Process Handbook 2026-27 Chapter VII',
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expiryDate: '',
    assignedReviewer: 'Dr. Vikram Joshi'
  });
  const [createError, setCreateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verify Modal (Req 36, 47)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [targetDoc, setTargetDoc] = useState(null);
  const [verifyDecision, setVerifyDecision] = useState('VERIFIED');
  const [verifyReason, setVerifyReason] = useState('');
  const [verifyError, setVerifyError] = useState('');

  // Upload / Evidence Submission Modal (Req 35, 40, 41)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [declarationText, setDeclarationText] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Inspect / Verification Results Modal (Req 44, 45, 46)
  const [previewItem, setPreviewItem] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Reminder Banner Feedback (Req 43)
  const [reminderFeedback, setReminderFeedback] = useState(null);

  // Scope items for COLLEGE_REP if institutionCode is set on currentUser
  const scopedCompliance = useMemo(() => {
    if (currentUser?.role === 'COLLEGE_REP' && currentUser?.institutionCode) {
      return compliance.filter(
        c => !c.institutionCode || c.institutionCode.toLowerCase() === currentUser.institutionCode.toLowerCase()
      );
    }
    return compliance;
  }, [compliance, currentUser]);

  // Dynamic Deadline & Validity Helper (Req 37, 38, 42)
  const computeDeadlineStatus = (item) => {
    if (item.deadlineStatus) return item.deadlineStatus;
    const vs = (item.verificationStatus || '').toUpperCase();
    if (vs === 'VERIFIED' || vs === 'COMPLIANT') return 'COMPLETED';
    if (!item.dueDate) return 'NO_DEADLINE';
    if (isOverdue(item.dueDate)) return 'OVERDUE';
    const rem = getDaysRemaining(item.dueDate);
    if (rem !== null && rem <= 14) return 'DUE_SOON';
    return 'UPCOMING';
  };

  const computeValidityStatus = (item) => {
    if (item.validityStatus) return item.validityStatus;
    if (!item.expiryDate) return 'NO_EXPIRY';
    const rem = getDaysRemaining(item.expiryDate);
    if (rem !== null && rem < 0) return 'EXPIRED';
    if (rem !== null && rem <= 30) return 'EXPIRING_SOON';
    return 'VALID';
  };

  // Database-backed / Scoped Compliance Statistics (Req 39)
  const stats = useMemo(() => {
    const total = scopedCompliance.length;
    const compliant = scopedCompliance.filter(
      c => c.verificationStatus === 'VERIFIED' || c.verificationStatus === 'COMPLIANT'
    ).length;
    const pendingVerify = scopedCompliance.filter(
      c => c.verificationStatus === 'PENDING_VERIFICATION' || c.verificationStatus === 'PENDING_REVIEW'
    ).length;
    const pendingSub = scopedCompliance.filter(
      c => c.verificationStatus === 'PENDING_SUBMISSION'
    ).length;
    const correctionReq = scopedCompliance.filter(
      c => c.verificationStatus === 'CORRECTION_REQUIRED' || c.verificationStatus === 'ACTION_REQUIRED'
    ).length;
    const nonCompliant = scopedCompliance.filter(
      c => c.verificationStatus === 'NON_COMPLIANT' || c.verificationStatus === 'REJECTED'
    ).length;
    const overdue = scopedCompliance.filter(c => computeDeadlineStatus(c) === 'OVERDUE').length;
    const expiringSoon = scopedCompliance.filter(c => {
      const v = computeValidityStatus(c);
      return v === 'EXPIRING_SOON' || c.status === 'EXPIRING_SOON';
    }).length;
    const expired = scopedCompliance.filter(c => computeValidityStatus(c) === 'EXPIRED').length;
    const completionPct = total > 0 ? Math.round((compliant / total) * 1000) / 10 : 0;

    return {
      total,
      compliant,
      pendingVerify,
      pendingSub,
      correctionReq,
      nonCompliant,
      overdue,
      expiringSoon,
      expired,
      completionPct
    };
  }, [scopedCompliance]);

  const requirementTypes = useMemo(() => {
    const set = new Set([
      'Lease Document Validity',
      'Time-bound Undertaking',
      'Statutory Safety Certificate',
      'Financial Compliance',
      'Academic Norms'
    ]);
    scopedCompliance.forEach(i => {
      if (i.requirementType) set.add(i.requirementType);
    });
    return Array.from(set);
  }, [scopedCompliance]);

  const reviewersList = useMemo(() => {
    const set = new Set();
    scopedCompliance.forEach(i => {
      if (i.assignedReviewer) set.add(i.assignedReviewer);
    });
    return Array.from(set);
  }, [scopedCompliance]);

  const filteredCompliance = useMemo(() => {
    return scopedCompliance.filter(item => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (item.institutionName || '').toLowerCase().includes(q) ||
        (item.institutionCode || '').toLowerCase().includes(q) ||
        (item.documentName || '').toLowerCase().includes(q) ||
        (item.requirementType || '').toLowerCase().includes(q) ||
        (item.id || '').toLowerCase().includes(q);

      const matchType = selectedType === 'ALL' || item.requirementType === selectedType;
      const matchReviewer = selectedReviewer === 'ALL' || item.assignedReviewer === selectedReviewer;

      let matchFilter = true;
      const dStatus = computeDeadlineStatus(item);
      const vStatus = computeValidityStatus(item);
      const verStatus = (item.verificationStatus || '').toUpperCase();

      if (selectedFilter === 'OVERDUE') {
        matchFilter = dStatus === 'OVERDUE';
      } else if (selectedFilter === 'DUE_SOON') {
        matchFilter = dStatus === 'DUE_SOON';
      } else if (selectedFilter === 'PENDING_VERIFICATION') {
        matchFilter = verStatus === 'PENDING_VERIFICATION' || verStatus === 'PENDING_REVIEW';
      } else if (selectedFilter === 'PENDING_SUBMISSION') {
        matchFilter = verStatus === 'PENDING_SUBMISSION';
      } else if (selectedFilter === 'VERIFIED') {
        matchFilter = verStatus === 'VERIFIED' || verStatus === 'COMPLIANT';
      } else if (selectedFilter === 'CORRECTION_REQUIRED') {
        matchFilter = verStatus === 'CORRECTION_REQUIRED' || verStatus === 'ACTION_REQUIRED';
      } else if (selectedFilter === 'NON_COMPLIANT') {
        matchFilter = verStatus === 'NON_COMPLIANT' || verStatus === 'REJECTED';
      } else if (selectedFilter === 'EXPIRING_SOON') {
        matchFilter = vStatus === 'EXPIRING_SOON' || item.status === 'EXPIRING_SOON';
      } else if (selectedFilter === 'EXPIRED') {
        matchFilter = vStatus === 'EXPIRED';
      }

      return matchSearch && matchType && matchReviewer && matchFilter;
    });
  }, [scopedCompliance, searchQuery, selectedType, selectedReviewer, selectedFilter]);

  const handleOpenCreateModal = () => {
    setCreateError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateObligation = async () => {
    if (!createForm.institutionCode.trim() || !createForm.institutionName.trim() || !createForm.documentName.trim() || !createForm.dueDate) {
      setCreateError('Institution Code, Institution Name, Document/Requirement Title, and Due Date are required.');
      return;
    }
    setIsSubmitting(true);
    setCreateError('');
    try {
      await createComplianceObligation(createForm, currentUser);
      setIsCreateModalOpen(false);
      setCreateForm(prev => ({ ...prev, documentName: '', description: '' }));
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create compliance obligation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerReminders = async () => {
    try {
      const res = await triggerComplianceReminders(30);
      setReminderFeedback(res);
    } catch (err) {
      alert(`Failed to trigger reminders: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOpenVerify = (doc) => {
    setTargetDoc(doc);
    setVerifyDecision('VERIFIED');
    setVerifyReason(doc.notes || '');
    setVerifyError('');
    setIsVerifyModalOpen(true);
  };

  const handleSaveVerify = async () => {
    const needsRemarks = ['ACTION_REQUIRED', 'CORRECTION_REQUIRED', 'NON_COMPLIANT', 'REJECTED'].includes(verifyDecision);
    if (needsRemarks && !verifyReason.trim()) {
      setVerifyError('Reviewer justification / remarks are mandatory when requesting corrections or marking non-compliant.');
      return;
    }
    setIsSubmitting(true);
    setVerifyError('');
    try {
      await verifyComplianceDoc(targetDoc.id, {
        status: verifyDecision,
        reason: verifyReason.trim()
      }, currentUser);
      setIsVerifyModalOpen(false);
    } catch (err) {
      setVerifyError(err.response?.data?.message || err.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenUpload = (doc) => {
    setTargetDoc(doc);
    setUploadFile(null);
    setDeclarationText(doc.declarationText || 'We solemnly affirm and declare that the attached statutory compliance certificate is authentic and valid.');
    setIssueDate(doc.issueDate || new Date().toISOString().split('T')[0]);
    setExpiryDate(doc.expiryDate || '');
    setUploadNotes('');
    setUploadError('');
    setIsUploadModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit.');
      return;
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(file.type) && !['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      setUploadError('Only PDF, JPG, or PNG files are permitted.');
      return;
    }

    setUploadError('');
    setUploadFile(file);
  };

  const handleSaveUpload = async () => {
    if (!uploadFile && !declarationText.trim()) {
      setUploadError('Please select a supporting document file or provide a statutory declaration.');
      return;
    }
    if (issueDate && expiryDate && expiryDate < issueDate) {
      setUploadError('Expiry Date cannot precede Issue Date.');
      return;
    }

    setIsSubmitting(true);
    setUploadError('');
    try {
      await uploadComplianceDoc(targetDoc.id, {
        file: uploadFile,
        fileName: uploadFile ? uploadFile.name : targetDoc.documentName,
        fileSize: uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB` : targetDoc.fileSize,
        fileType: uploadFile ? (uploadFile.type.includes('pdf') || uploadFile.name.endsWith('.pdf') ? 'PDF' : 'IMAGE') : 'PDF',
        declarationText: declarationText.trim(),
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
        notes: uploadNotes.trim() || null
      }, currentUser);
      setIsUploadModalOpen(false);
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunOcrAnalysis = async (item) => {
    setIsAnalyzing(true);
    try {
      const updated = await analyzeComplianceDoc(item.id);
      if (updated) {
        setPreviewItem(updated);
      }
    } catch (err) {
      alert(`OCR/Verification check error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadDocument = async (item) => {
    try {
      if (dataMode === 'live') {
        const blob = await complianceApi.download(item.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.documentName?.endsWith('.pdf') ? item.documentName : `${item.id}_${(item.documentName || 'compliance').replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const content = `AICTE COMPLIANCE RECORD\nID: ${item.id}\nInstitution: ${item.institutionName}\nDocument: ${item.documentName}\nVersion: v${item.version}\nStatus: ${item.verificationStatus}`;
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.id}_summary.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  // Parse JSON fields safely for Preview Modal
  const parsedOcr = useMemo(() => {
    if (!previewItem?.ocrExtractedJson) return null;
    try {
      return typeof previewItem.ocrExtractedJson === 'string'
        ? JSON.parse(previewItem.ocrExtractedJson)
        : previewItem.ocrExtractedJson;
    } catch {
      return null;
    }
  }, [previewItem]);

  const parsedAdvisory = useMemo(() => {
    if (!previewItem?.aiAdvisoryJson) return null;
    try {
      return typeof previewItem.aiAdvisoryJson === 'string'
        ? JSON.parse(previewItem.aiAdvisoryJson)
        : previewItem.aiAdvisoryJson;
    } catch {
      return null;
    }
  }, [previewItem]);

  const parsedHistory = useMemo(() => {
    if (!previewItem?.versionHistoryJson) return [];
    try {
      return typeof previewItem.versionHistoryJson === 'string'
        ? JSON.parse(previewItem.versionHistoryJson)
        : previewItem.versionHistoryJson;
    } catch {
      return [];
    }
  }, [previewItem]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance & Legal Document Repository"
        subtitle="Track time-bound undertakings, registered land leases, safety certifications, OCR/advisory checks, and FDR liens"
        badge={<Badge variant="navy">Compliance & Document Management</Badge>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isReviewerOrAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Bell}
                  onClick={handleTriggerReminders}
                >
                  Trigger Renewal & Overdue Reminders
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={handleOpenCreateModal}
                >
                  New Compliance Obligation
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => exportToCSV(filteredCompliance, 'aicte_compliance_records.csv')}
            >
              Export Compliance Register
            </Button>
          </div>
        }
      />

      {reminderFeedback && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Renewal & Deadline Reminder Sweep Completed ({reminderFeedback.thresholdDays}d window):</strong>{' '}
              {reminderFeedback.remindersCreated} new notification(s) dispatched,{' '}
              {reminderFeedback.escalationsCreated} escalation(s) logged,{' '}
              {reminderFeedback.duplicatesSkipped} existing unread reminder(s) deduplicated.
            </span>
          </div>
          <button
            onClick={() => setReminderFeedback(null)}
            className="text-blue-700 hover:underline font-semibold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Database-Backed Compliance Completion & Statistics Summary (Req 39) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Statutory Compliance Completion Rate
            </span>
            <p className="text-[11px] text-slate-500">
              Denominator: {stats.compliant} Compliant / Verified out of {stats.total} active obligations in scope
              {stats.correctionReq > 0 ? ` • ${stats.correctionReq} Correction Required` : ''}
              {stats.nonCompliant > 0 ? ` • ${stats.nonCompliant} Non-Compliant` : ''}
              {stats.expired > 0 ? ` • ${stats.expired} Expired Validity` : ''}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-gov-800">{stats.completionPct}%</span>
            <span className="text-[11px] text-slate-400 block">Verified Compliant</span>
          </div>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${Math.min(100, stats.completionPct)}%` }}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div
          onClick={() => setSelectedFilter('ALL')}
          className={`p-4 rounded-xl border bg-white shadow-card cursor-pointer transition-all ${
            selectedFilter === 'ALL' ? 'border-gov-600 ring-1 ring-gov-600' : 'border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tracked Obligations</span>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{stats.compliant} verified compliant</p>
        </div>

        <div
          onClick={() => setSelectedFilter('PENDING_VERIFICATION')}
          className={`p-4 rounded-xl border bg-white shadow-card cursor-pointer transition-all ${
            selectedFilter === 'PENDING_VERIFICATION' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Awaiting Verification</span>
          <p className="mt-1 text-2xl font-bold text-blue-600">{stats.pendingVerify}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Reviewer queue ({stats.pendingSub} unsubmitted)</p>
        </div>

        <div
          onClick={() => setSelectedFilter('EXPIRING_SOON')}
          className={`p-4 rounded-xl border bg-white shadow-card cursor-pointer transition-all ${
            selectedFilter === 'EXPIRING_SOON' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Expiring Leases & NOCs</span>
          <p className="mt-1 text-2xl font-bold text-amber-600">{stats.expiringSoon}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Within 30d ({stats.expired} expired)</p>
        </div>

        <div
          onClick={() => setSelectedFilter('OVERDUE')}
          className={`p-4 rounded-xl border bg-white shadow-card cursor-pointer transition-all ${
            selectedFilter === 'OVERDUE' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overdue Deadlines</span>
          <p className="mt-1 text-2xl font-bold text-rose-600">{stats.overdue}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Past due date & unverified</p>
        </div>

        <div
          onClick={() => setSelectedFilter('CORRECTION_REQUIRED')}
          className={`p-4 rounded-xl border bg-white shadow-card cursor-pointer transition-all ${
            selectedFilter === 'CORRECTION_REQUIRED' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Action / Non-Compliant</span>
          <p className="mt-1 text-2xl font-bold text-rose-700">{stats.correctionReq + stats.nonCompliant}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Requires resubmission</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-card">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Institution, AICTE Code, Document Name, ID..."
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
          >
            <option value="ALL">All Requirement Types</option>
            {requirementTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={selectedReviewer}
            onChange={(e) => setSelectedReviewer(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
          >
            <option value="ALL">All Reviewers</option>
            {reviewersList.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified / Compliant</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="PENDING_SUBMISSION">Pending Submission</option>
            <option value="CORRECTION_REQUIRED">Correction / Action Required</option>
            <option value="NON_COMPLIANT">Non-Compliant / Rejected</option>
            <option value="OVERDUE">Overdue Deadline</option>
            <option value="DUE_SOON">Due Within 14 Days</option>
            <option value="EXPIRING_SOON">Expiring Within 30 Days</option>
            <option value="EXPIRED">Expired Document</option>
          </select>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">Reference ID</th>
              <th className="p-3">Institution & Region</th>
              <th className="p-3">Requirement & Document</th>
              <th className="p-3">Deadline & Validity</th>
              <th className="p-3">Version & OCR</th>
              <th className="p-3">Reviewer</th>
              <th className="p-3">Verification Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCompliance.map((item) => {
              const deadlineState = computeDeadlineStatus(item);
              const validityState = computeValidityStatus(item);
              const expiryDaysLeft = item.expiryDate ? getDaysRemaining(item.expiryDate) : null;
              const dueDaysLeft = item.dueDate ? getDaysRemaining(item.dueDate) : null;

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-gov-800">{item.id}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800 line-clamp-1">{item.institutionName}</div>
                    <div className="text-[11px] text-slate-400">
                      {item.institutionCode ? `${item.institutionCode} • ` : ''}{item.region}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-900 line-clamp-1">{item.documentName}</div>
                    <div className="text-[10px] text-slate-500">{item.requirementType}</div>
                  </td>
                  <td className="p-3 space-y-1">
                    {item.dueDate && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-600">Due: {formatDate(item.dueDate)}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            deadlineState === 'OVERDUE'
                              ? 'bg-rose-50 text-rose-700'
                              : deadlineState === 'DUE_SOON'
                              ? 'bg-amber-50 text-amber-700'
                              : deadlineState === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {deadlineState === 'OVERDUE'
                            ? `OVERDUE (${Math.abs(dueDaysLeft || 0)}d)`
                            : deadlineState}
                        </span>
                      </div>
                    )}
                    {item.expiryDate && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-600">Exp: {formatDate(item.expiryDate)}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            validityState === 'EXPIRED'
                              ? 'bg-rose-50 text-rose-700'
                              : validityState === 'EXPIRING_SOON'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {validityState === 'EXPIRED'
                            ? 'EXPIRED'
                            : validityState === 'EXPIRING_SOON'
                            ? `${expiryDaysLeft}d left`
                            : 'VALID'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-mono text-slate-700 font-semibold">v{item.version || '1.0'}</div>
                    {item.ocrStatus && item.ocrStatus !== 'NOT_RUN' && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        OCR: <span className="font-medium">{item.ocrStatus}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-slate-600">
                    <div>{item.assignedReviewer || 'Unassigned'}</div>
                    {item.verifiedBy && (
                      <div className="text-[10px] text-emerald-700">By: {item.verifiedBy}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={item.verificationStatus} />
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => setPreviewItem(item)}
                      >
                        Inspect
                      </Button>

                      {isReviewerOrAdmin && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ShieldCheck}
                          onClick={() => handleOpenVerify(item)}
                        >
                          Verify
                        </Button>
                      )}

                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Upload}
                        onClick={() => handleOpenUpload(item)}
                      >
                        Upload
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredCompliance.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  No compliance obligations match the selected filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Compliance Obligation Modal (Req 34) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Statutory Compliance Obligation"
        subtitle="Assign a new time-bound undertaking or mandatory certificate requirement to an institution"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateObligation} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Obligation'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          {createError && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700">
              {createError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Institution Code *</label>
              <input
                type="text"
                value={createForm.institutionCode}
                onChange={(e) => setCreateForm({ ...createForm, institutionCode: e.target.value })}
                placeholder="e.g. 1-34981275"
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Region *</label>
              <select
                value={createForm.region}
                onChange={(e) => setCreateForm({ ...createForm, region: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="South-Western">South-Western</option>
                <option value="South-Central">South-Central</option>
                <option value="Northern">Northern</option>
                <option value="Western">Western</option>
                <option value="Eastern">Eastern</option>
                <option value="Southern">Southern</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Institution Name *</label>
            <input
              type="text"
              value={createForm.institutionName}
              onChange={(e) => setCreateForm({ ...createForm, institutionName: e.target.value })}
              placeholder="Full Registered Institution Name"
              className="w-full p-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Requirement Category *</label>
              <select
                value={createForm.requirementType}
                onChange={(e) => setCreateForm({ ...createForm, requirementType: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Statutory Safety Certificate">Statutory Safety Certificate</option>
                <option value="Lease Document Validity">Lease Document Validity</option>
                <option value="Time-bound Undertaking">Time-bound Undertaking</option>
                <option value="Financial Compliance">Financial Compliance</option>
                <option value="Academic Norms">Academic Norms</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Assigned Reviewer</label>
              <input
                type="text"
                value={createForm.assignedReviewer}
                onChange={(e) => setCreateForm({ ...createForm, assignedReviewer: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Document / Undertaking Title *</label>
            <input
              type="text"
              value={createForm.documentName}
              onChange={(e) => setCreateForm({ ...createForm, documentName: e.target.value })}
              placeholder="e.g. Municipal Fire Safety NOC 2026-27"
              className="w-full p-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Submission Due Date *</label>
              <input
                type="date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Certificate Expiry Date (Optional)</label>
              <input
                type="date"
                value={createForm.expiryDate}
                onChange={(e) => setCreateForm({ ...createForm, expiryDate: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Applicable Statutory Clause / Description</label>
            <textarea
              rows={2}
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Specify AICTE APH clause and submission expectations..."
              className="w-full p-2 rounded-lg border border-slate-300"
            />
          </div>
        </div>
      </Modal>

      {/* Verify Modal (Req 36, 47) */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Verify Compliance Submission"
        subtitle={`Reviewing: ${targetDoc?.documentName} (${targetDoc?.institutionName})`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={verifyDecision === 'VERIFIED' ? 'success' : 'danger'}
              size="sm"
              onClick={handleSaveVerify}
              disabled={isSubmitting}
            >
              Confirm {verifyDecision.replace(/_/g, ' ')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {verifyError && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {verifyError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Authoritative Reviewer Decision</label>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-emerald-700 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  checked={verifyDecision === 'VERIFIED'}
                  onChange={() => setVerifyDecision('VERIFIED')}
                />
                Approve & Mark Verified (Compliant)
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-amber-700 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  checked={verifyDecision === 'CORRECTION_REQUIRED'}
                  onChange={() => setVerifyDecision('CORRECTION_REQUIRED')}
                />
                Request Correction / Resubmission
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-rose-700 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  checked={verifyDecision === 'NON_COMPLIANT'}
                  onChange={() => setVerifyDecision('NON_COMPLIANT')}
                />
                Reject / Mark Non-Compliant
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">
              Reviewer Justification / Remarks {verifyDecision !== 'VERIFIED' ? '*' : '(Recommended)'}
            </label>
            <textarea
              rows={3}
              value={verifyReason}
              onChange={(e) => setVerifyReason(e.target.value)}
              placeholder="e.g. Registered lease deed verified with Sub-Registrar seal and 30-year validity confirmed."
              className="mt-1 w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            />
          </div>
        </div>
      </Modal>

      {/* Upload & Evidence Submission Modal (Req 35, 40, 41) */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Compliance Document & Statutory Declaration"
        subtitle={`Submit or replace evidence for ${targetDoc?.documentName} (Current: v${targetDoc?.version || '1.0'})`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveUpload} disabled={isSubmitting}>
              {isSubmitting ? 'Uploading & Analyzing...' : 'Upload & Submit for Review'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          {uploadError && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 uppercase">
              Choose Document File (PDF, PNG, JPG - Max 10MB)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="mt-2 block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gov-900 file:text-white hover:file:bg-gov-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Uploading a new file increments the document version (v{targetDoc?.version || '1.0'} &rarr; v{(parseFloat(targetDoc?.version || '1.0') + 0.1).toFixed(1)}), archives prior version history, and triggers OCR/deterministic checks.
            </p>
          </div>

          {uploadFile && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <p className="font-semibold text-slate-800">{uploadFile.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Size: {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Type: {uploadFile.type || 'Document'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Certificate Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Certificate Expiry / Valid Until</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Statutory Declaration Statement *</label>
            <textarea
              rows={2}
              value={declarationText}
              onChange={(e) => setDeclarationText(e.target.value)}
              placeholder="Affirmation of compliance by Head of Institution / Registrar..."
              className="w-full p-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Submission Notes / Reference Number</label>
            <input
              type="text"
              value={uploadNotes}
              onChange={(e) => setUploadNotes(e.target.value)}
              placeholder="e.g. Renewed Municipal Fire NOC Ref #FSC-2026-889"
              className="w-full p-2 rounded-lg border border-slate-300"
            />
          </div>
        </div>
      </Modal>

      {/* Comprehensive Inspect & OCR/AI Verification Results Modal (Req 44, 45, 46) */}
      <Modal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={previewItem?.documentName || 'Document & Verification Inspection'}
        subtitle={`Reference ID: ${previewItem?.id} • Institution: ${previewItem?.institutionName} (${previewItem?.institutionCode || 'AICTE'})`}
        maxWidth="max-w-3xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={() => handleDownloadDocument(previewItem)}
              >
                Download Document
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={() => handleRunOcrAnalysis(previewItem)}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Run / Retry OCR & Verification Check'}
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPreviewItem(null)}>
              Close
            </Button>
          </div>
        }
      >
        {previewItem && (
          <div className="space-y-4 text-xs max-h-[72vh] overflow-y-auto pr-1">
            {/* 1. Core Metadata & Verification Stamp */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Authoritative Verification Status
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={previewItem.verificationStatus} />
                    <Badge variant="navy" size="sm">v{previewItem.version || '1.0'}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Validity & Deadline Classification
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 justify-end">
                    <StatusBadge status={computeDeadlineStatus(previewItem)} />
                    <StatusBadge status={computeValidityStatus(previewItem)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-500">Requirement Category:</span>{' '}
                  <span className="font-semibold text-slate-800">{previewItem.requirementType}</span>
                </div>
                <div>
                  <span className="text-slate-500">Assigned Reviewer:</span>{' '}
                  <span className="font-semibold text-slate-800">{previewItem.assignedReviewer || 'Compliance Cell'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Issue / Submission Date:</span>{' '}
                  <span className="font-medium text-slate-800">
                    {formatDate(previewItem.issueDate || previewItem.submissionDate) || 'Not Recorded'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Expiry / Due Date:</span>{' '}
                  <span className="font-medium text-slate-800">
                    {previewItem.expiryDate
                      ? `Expires ${formatDate(previewItem.expiryDate)}`
                      : `Due ${formatDate(previewItem.dueDate)}`}
                  </span>
                </div>
                {previewItem.verifiedBy && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Verified By:</span>{' '}
                    <span className="font-semibold text-emerald-700">{previewItem.verifiedBy}</span>
                  </div>
                )}
              </div>

              {previewItem.declarationText && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">Institutional Declaration:</span>
                  <p className="text-slate-800 bg-white p-2 rounded border border-slate-200">
                    {previewItem.declarationText}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-semibold block mb-0.5">Reviewer Remarks / Notes:</span>
                <p className="text-slate-700 italic">{previewItem.notes || 'No reviewer remarks recorded yet.'}</p>
              </div>
            </div>

            {/* 2. OCR Extraction Results (Req 44, 46) */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gov-700" />
                  <span className="font-bold uppercase tracking-wider text-slate-800">
                    OCR & Document Text Extraction
                  </span>
                </div>
                <Badge
                  variant={
                    previewItem.ocrStatus === 'EXTRACTED'
                      ? 'success'
                      : previewItem.ocrStatus === 'PASSWORD_PROTECTED' || previewItem.ocrStatus === 'UNREADABLE_OR_SCANNED_PDF'
                      ? 'danger'
                      : 'default'
                  }
                  size="sm"
                >
                  {previewItem.ocrStatus || 'NOT_RUN'}
                </Badge>
              </div>

              {parsedOcr ? (
                <div className="space-y-2">
                  <p className="text-slate-600">{parsedOcr.message}</p>
                  {parsedOcr.extractedFields && Object.keys(parsedOcr.extractedFields).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      {Object.entries(parsedOcr.extractedFields).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">{k}:</span>
                          <span className="font-mono font-semibold text-slate-800">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {parsedOcr.textSnippet && (
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                        Extracted Text Stream Preview:
                      </span>
                      <pre className="p-2.5 rounded bg-slate-900 text-slate-100 font-mono text-[11px] whitespace-pre-wrap overflow-x-auto">
                        {parsedOcr.textSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">
                  Click <strong>Run / Retry OCR & Verification Check</strong> below to inspect text readability and extract document metadata.
                </p>
              )}
            </div>

            {/* 3. Deterministic Validation & AI-Assisted Advisory Checks (Req 45, 46) */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-bold uppercase tracking-wider text-slate-800">
                    Deterministic Validation & AI Advisory Checks
                  </span>
                </div>
                <Badge variant="warning" size="sm">
                  Advisory Only — Human Review Authoritative
                </Badge>
              </div>

              {parsedAdvisory ? (
                <div className="space-y-3">
                  {Array.isArray(parsedAdvisory.deterministicChecks) && parsedAdvisory.deterministicChecks.length > 0 && (
                    <div className="space-y-1.5">
                      {parsedAdvisory.deterministicChecks.map((chk, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border flex items-start justify-between gap-2 ${
                            chk.status === 'PASSED'
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                              : chk.status === 'FLAGGED'
                              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                              : 'bg-amber-50/70 border-amber-200 text-amber-900'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-[11px]">{chk.check}</div>
                            <div className="text-[11px] mt-0.5">{chk.reason}</div>
                            {chk.evidence && (
                              <div className="text-[10px] opacity-80 font-mono mt-0.5">{chk.evidence}</div>
                            )}
                          </div>
                          <Badge
                            variant={chk.status === 'PASSED' ? 'success' : chk.status === 'FLAGGED' ? 'danger' : 'warning'}
                            size="sm"
                          >
                            {chk.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {parsedAdvisory.aiService && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span>AI Verification Provider Status: {parsedAdvisory.aiService.status}</span>
                        <span>
                          Confidence Score:{' '}
                          {parsedAdvisory.aiService.confidenceScore != null
                            ? `${parsedAdvisory.aiService.confidenceScore}%`
                            : 'N/A (Provider Not Configured)'}
                        </span>
                      </div>
                      <p className="text-slate-500">{parsedAdvisory.aiService.message}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">
                  No deterministic or AI advisory checks have been executed on this item yet. Click <strong>Run / Retry OCR & Verification Check</strong> to evaluate.
                </p>
              )}
            </div>

            {/* 4. Document Version History (Req 41) */}
            {parsedHistory.length > 0 && (
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-600" />
                  <span className="font-bold uppercase tracking-wider text-slate-800">
                    Prior Version History ({parsedHistory.length})
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {parsedHistory.map((ver, i) => (
                    <div key={i} className="py-2 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-mono font-bold text-gov-800 mr-2">v{ver.version}</span>
                        <span className="font-medium text-slate-800">{ver.documentName || ver.title}</span>
                        <span className="text-slate-400 ml-2">
                          ({ver.fileSize || ver.size || 'PDF'}) • Submitted {ver.submissionDate || ver.uploadDate || 'Prior'}
                        </span>
                      </div>
                      <StatusBadge status={ver.verificationStatus || ver.status || 'ARCHIVED'} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
