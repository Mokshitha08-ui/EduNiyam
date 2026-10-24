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
  RefreshCw
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import { formatDate, getDaysRemaining, isOverdue } from '../utils/dateUtils';
import { exportToCSV } from '../utils/exportService';

export const Compliance = () => {
  const { compliance, verifyComplianceDoc, uploadComplianceDoc } = useAppData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL, UPCOMING, OVERDUE, PENDING_VERIFICATION, VERIFIED, EXPIRING_SOON
  const [selectedType, setSelectedType] = useState('ALL');

  // Verify Modal
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [targetDoc, setTargetDoc] = useState(null);
  const [verifyDecision, setVerifyDecision] = useState('VERIFIED');
  const [verifyReason, setVerifyReason] = useState('');

  // Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Preview Modal
  const [previewItem, setPreviewItem] = useState(null);

  // Metrics
  const totalTracked = compliance.length;
  const overdueCount = compliance.filter(c => isOverdue(c.dueDate) && c.verificationStatus !== 'VERIFIED').length;
  const pendingVerifyCount = compliance.filter(c => c.verificationStatus === 'PENDING_VERIFICATION').length;
  const expiringCount = compliance.filter(c => c.status === 'EXPIRING_SOON').length;

  const filteredCompliance = useMemo(() => {
    return compliance.filter(item => {
      const matchSearch =
        !searchQuery ||
        item.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedType === 'ALL' || item.requirementType === selectedType;

      let matchFilter = true;
      if (selectedFilter === 'OVERDUE') {
        matchFilter = isOverdue(item.dueDate) && item.verificationStatus !== 'VERIFIED';
      } else if (selectedFilter === 'PENDING_VERIFICATION') {
        matchFilter = item.verificationStatus === 'PENDING_VERIFICATION';
      } else if (selectedFilter === 'VERIFIED') {
        matchFilter = item.verificationStatus === 'VERIFIED';
      } else if (selectedFilter === 'EXPIRING_SOON') {
        matchFilter = item.status === 'EXPIRING_SOON';
      }

      return matchSearch && matchType && matchFilter;
    });
  }, [compliance, searchQuery, selectedType, selectedFilter]);

  const handleOpenVerify = (doc) => {
    setTargetDoc(doc);
    setVerifyDecision('VERIFIED');
    setVerifyReason('');
    setIsVerifyModalOpen(true);
  };

  const handleSaveVerify = () => {
    verifyComplianceDoc(targetDoc.id, {
      status: verifyDecision,
      reason: verifyReason
    }, currentUser);
    setIsVerifyModalOpen(false);
  };

  const handleOpenUpload = (doc) => {
    setTargetDoc(doc);
    setUploadFile(null);
    setUploadError('');
    setIsUploadModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit.');
      return;
    }

    // Validate type
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only PDF, JPG, or PNG files are permitted.');
      return;
    }

    setUploadError('');
    setUploadFile(file);
  };

  const handleSaveUpload = () => {
    if (!uploadFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    uploadComplianceDoc(targetDoc.id, {
      fileName: uploadFile.name,
      fileSize: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`,
      fileType: uploadFile.type.includes('pdf') ? 'PDF' : 'IMAGE'
    }, currentUser);

    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance & Legal Document Repository"
        subtitle="Track time-bound undertakings, registered land leases, safety certifications, and FDR liens"
        badge={<Badge variant="navy">Compliance Management</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => exportToCSV(compliance, 'aicte_compliance_records.csv')}
          >
            Export Compliance Register
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedFilter('ALL')}
          className={`p-4 rounded-xl border bg-white shadow-card cursor-pointer transition-all ${
            selectedFilter === 'ALL' ? 'border-gov-600 ring-1 ring-gov-600' : 'border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tracked Requirements</span>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalTracked}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Statutory compliance items</p>
        </div>

        <div
          onClick={() => setSelectedFilter('EXPIRING_SOON')}
          className={`p-4 rounded-xl border bg-white shadow-card cursor-pointer transition-all ${
            selectedFilter === 'EXPIRING_SOON' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Expiring Leases & NOCs</span>
          <p className="mt-1 text-2xl font-bold text-amber-600">{expiringCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Under 30 days remaining</p>
        </div>

        <div
          onClick={() => setSelectedFilter('OVERDUE')}
          className={`p-4 rounded-xl border bg-white shadow-card cursor-pointer transition-all ${
            selectedFilter === 'OVERDUE' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overdue Obligations</span>
          <p className="mt-1 text-2xl font-bold text-rose-600">{overdueCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Immediate notice required</p>
        </div>

        <div
          onClick={() => setSelectedFilter('PENDING_VERIFICATION')}
          className={`p-4 rounded-xl border bg-white shadow-card cursor-pointer transition-all ${
            selectedFilter === 'PENDING_VERIFICATION' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Awaiting Verification</span>
          <p className="mt-1 text-2xl font-bold text-blue-600">{pendingVerifyCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Reviewer queue</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-card">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Institution, Document Name, ID..."
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
            <option value="Lease Document Validity">Lease Document Validity</option>
            <option value="Time-bound Undertaking">Time-bound Undertaking</option>
            <option value="Statutory Safety Certificate">Statutory Safety Certificate</option>
            <option value="Financial Compliance">Financial Compliance</option>
            <option value="Academic Norms">Academic Norms</option>
          </select>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="OVERDUE">Overdue</option>
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
              <th className="p-3">Expiry / Due Date</th>
              <th className="p-3">Version</th>
              <th className="p-3">Reviewer</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCompliance.map((item) => {
              const overdue = isOverdue(item.dueDate);
              const daysLeft = item.expiryDate ? getDaysRemaining(item.expiryDate) : null;

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-gov-800">{item.id}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800 line-clamp-1">{item.institutionName}</div>
                    <div className="text-[11px] text-slate-400">{item.region}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-900 line-clamp-1">{item.documentName}</div>
                    <div className="text-[10px] text-slate-500">{item.requirementType}</div>
                  </td>
                  <td className="p-3">
                    {item.expiryDate ? (
                      <div>
                        <span className="font-medium">{formatDate(item.expiryDate)}</span>
                        <div className={`text-[10px] font-bold ${daysLeft <= 30 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {daysLeft > 0 ? `${daysLeft}d validity remaining` : 'Expired'}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="font-medium">{formatDate(item.dueDate)}</span>
                        <div className={`text-[10px] font-bold ${overdue ? 'text-rose-600' : 'text-slate-400'}`}>
                          {overdue ? 'Breached' : 'Undertaking Due'}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-500">v{item.version}</td>
                  <td className="p-3 text-slate-600">{item.assignedReviewer}</td>
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

                      {/* Reviewer Action */}
                      {currentUser?.role !== 'COLLEGE_REP' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ShieldCheck}
                          onClick={() => handleOpenVerify(item)}
                        >
                          Verify
                        </Button>
                      )}

                      {/* College / Upload Action */}
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
          </tbody>
        </table>
      </div>

      {/* Verify Modal */}
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
            >
              Confirm {verifyDecision}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Verification Decision</label>
            <div className="mt-2 flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-emerald-700 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  checked={verifyDecision === 'VERIFIED'}
                  onChange={() => setVerifyDecision('VERIFIED')}
                />
                Approve & Mark Verified
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-rose-700 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  checked={verifyDecision === 'ACTION_REQUIRED'}
                  onChange={() => setVerifyDecision('ACTION_REQUIRED')}
                />
                Request Corrections
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Reviewer Justification / Remarks *</label>
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

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Compliance Document Evidence"
        subtitle={`Replace or submit renewal for ${targetDoc?.documentName}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveUpload}>
              Upload & Submit for Review
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {uploadError && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Choose File (PDF, PNG, JPG - Max 10MB)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="mt-2 block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gov-900 file:text-white hover:file:bg-gov-800"
            />
          </div>

          {uploadFile && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <p className="font-semibold text-slate-800">{uploadFile.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Size: {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Type: {uploadFile.type}
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={previewItem?.documentName || 'Document Metadata'}
        subtitle={`Reference ID: ${previewItem?.id}`}
        maxWidth="max-w-xl"
        footer={
          <Button variant="outline" size="sm" onClick={() => setPreviewItem(null)}>
            Close
          </Button>
        }
      >
        {previewItem && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="font-semibold text-slate-900">{previewItem.institutionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requirement Category:</span>
                <span className="text-slate-800">{previewItem.requirementType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Document Version:</span>
                <span className="font-mono font-bold text-gov-800">v{previewItem.version}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Verification Stamp:</span>
                <StatusBadge status={previewItem.verificationStatus} />
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Recorded Reviewer Notes:</span>
                <p className="text-slate-700 italic">{previewItem.notes || 'None recorded'}</p>
              </div>
            </div>

            <div className="p-6 text-center bg-slate-100 rounded-lg border border-dashed border-slate-300">
              <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">Mock Document Viewer</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                In this frontend prototype, documents are stored with metadata. Sensitive bytes are not persisted to client storage.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
