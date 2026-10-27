import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  APPLICATION_TYPES,
  APPLICATION_TYPE_CONFIGS,
  FIELD_DEFINITIONS,
  getApplicationTypeConfig,
  sanitizeAnswersOnTypeChange,
  ACADEMIC_PROGRAMMES,
  AICTE_REGIONS,
} from '../../config/applicationWizardConfig';
import { documentsApi } from '../../services/apiService';
import {
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronLeft,
  Save,
  Send,
  ShieldCheck,
  FileText,
  Building,
  GraduationCap,
  Layers,
  HelpCircle,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Clock,
  Eye,
  Paperclip,
} from 'lucide-react';

export const DynamicApplicationWizard = ({
  isOpen,
  onClose,
  initialData = null,
  onSaveDraft,
  onSubmitApplication,
  currentUser,
  isSubmitting = false,
}) => {
  // Active application type
  const [selectedType, setSelectedType] = useState(
    initialData?.applicationType || APPLICATION_TYPES.EOA
  );

  // Active step (1-indexed, 1 through 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Form errors
  const [stepError, setStepError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Documents state: list of uploaded document objects
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploadErrors, setUploadErrors] = useState({});
  const [uploadingCodes, setUploadingCodes] = useState({});

  // Form answers state
  const [formData, setFormData] = useState({
    institutionName: currentUser?.institution || '',
    institutionCode: currentUser?.institutionCode || '1-34981275',
    region: currentUser?.region || 'South-Western',
    state: 'Karnataka',
    academicYear: '2026-27',
    applicationType: APPLICATION_TYPES.EOA,
    programme: 'Engineering & Technology',
    priority: 'NORMAL',
    // Statutory undertakings
    decLandNorms: true,
    decCadreRatio: true,
    decGrievance: true,
    decAuthenticity: true,
    ...initialData,
  });

  // Hidden file input refs keyed by documentCode
  const fileInputRefs = useRef({});

  // Load initialData when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      const type = initialData?.applicationType || selectedType || APPLICATION_TYPES.EOA;
      setSelectedType(type);
      setFormData(prev => ({
        ...prev,
        institutionName: currentUser?.institution || prev.institutionName || 'Vivekananda Institute of Technology, Bangalore',
        institutionCode: currentUser?.institutionCode || prev.institutionCode || '1-34981275',
        region: currentUser?.region || prev.region || 'South-Western',
        state: prev.state || 'Karnataka',
        academicYear: '2026-27',
        applicationType: type,
        programme: initialData?.programme || prev.programme || 'Engineering & Technology',
        priority: initialData?.priority || prev.priority || 'NORMAL',
        decLandNorms: initialData?.decLandNorms ?? true,
        decCadreRatio: initialData?.decCadreRatio ?? true,
        decGrievance: initialData?.decGrievance ?? true,
        decAuthenticity: initialData?.decAuthenticity ?? true,
        ...(initialData || {}),
      }));

      // Initialize uploaded docs from initialData if present
      if (initialData?.documents && Array.isArray(initialData.documents)) {
        setUploadedDocs(initialData.documents);
      } else {
        setUploadedDocs([]);
      }

      setCurrentStep(1);
      setStepError('');
      setFieldErrors({});
      setUploadErrors({});
      setUploadingCodes({});
    }
  }, [isOpen, initialData, currentUser]);

  // Current type configuration
  const currentConfig = useMemo(() => {
    return getApplicationTypeConfig(selectedType);
  }, [selectedType]);

  const steps = currentConfig.steps;
  const totalSteps = steps.length;

  // Handle application type change
  const handleTypeChange = (newType) => {
    setSelectedType(newType);
    setFormData(prev => sanitizeAnswersOnTypeChange(prev, newType));
    setStepError('');
    setFieldErrors({});
  };

  // Field change handler
  const handleFieldChange = (fieldKey, value) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
    if (fieldErrors[fieldKey]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldKey];
        return updated;
      });
    }
  };

  // Find uploaded doc matching requirement code
  const getUploadedDocForRequirement = (reqDoc) => {
    return uploadedDocs.find(d => {
      if (d.documentCode && d.documentCode.toUpperCase() === reqDoc.code.toUpperCase()) return true;
      if (d.title && d.title.toUpperCase().includes(reqDoc.code.toUpperCase())) return true;
      if (d.title && d.title.trim().toLowerCase() === reqDoc.title.trim().toLowerCase()) return true;
      return false;
    });
  };

  // Check which uploaded docs do not belong to the current type's requirements (preserved files)
  const nonApplicableUploadedDocs = useMemo(() => {
    const activeCodes = new Set((currentConfig.documents || []).map(d => d.code.toUpperCase()));
    return uploadedDocs.filter(d => {
      if (!d.documentCode) return false;
      return !activeCodes.has(d.documentCode.toUpperCase());
    });
  }, [uploadedDocs, currentConfig]);

  // Handle File Upload for a Requirement
  const handleFileUpload = async (reqDoc, file) => {
    if (!file) return;

    // Reset error for this code
    setUploadErrors(prev => {
      const u = { ...prev };
      delete u[reqDoc.code];
      return u;
    });

    // 1. Client-side extension validation
    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['pdf', 'png', 'jpg', 'jpeg'];
    if (!allowed.includes(ext)) {
      setUploadErrors(prev => ({
        ...prev,
        [reqDoc.code]: `Unsupported file type (.${ext}). Only PDF, PNG, JPG, and JPEG documents are permitted under AICTE norms.`,
      }));
      return;
    }

    // 2. Client-side size validation (10 MB max)
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadErrors(prev => ({
        ...prev,
        [reqDoc.code]: `File size exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please compress the document before uploading.`,
      }));
      return;
    }

    // Mark uploading state
    setUploadingCodes(prev => ({ ...prev, [reqDoc.code]: true }));

    try {
      const isLive = typeof window !== 'undefined' && localStorage.getItem('aicte_data_mode') === 'live';
      const existingDoc = getUploadedDocForRequirement(reqDoc);

      if (isLive) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('documentCode', reqDoc.code);
        fd.append('title', reqDoc.title);
        if (existingDoc?.id) {
          fd.append('documentId', existingDoc.id);
        }
        if (initialData?.id) {
          fd.append('applicationId', initialData.id);
        }
        fd.append('institutionCode', formData.institutionCode || currentUser?.institutionCode || '1-34981275');
        fd.append('institutionName', formData.institutionName || currentUser?.institution || 'Technical Institution');

        const res = await documentsApi.upload(fd);
        const savedDto = res.data;

        setUploadedDocs(prev => {
          const filtered = prev.filter(d =>
            !(d.documentCode && d.documentCode.toUpperCase() === reqDoc.code.toUpperCase()) &&
            d.id !== savedDto.id
          );
          return [
            ...filtered,
            {
              id: savedDto.id,
              documentCode: reqDoc.code,
              title: reqDoc.title,
              fileName: file.name,
              size: savedDto.size || `${Math.max(1, Math.round(file.size / 1024))} KB`,
              type: ext === 'pdf' ? 'PDF' : 'IMAGE',
              status: savedDto.status || 'PENDING_VERIFICATION',
              uploadDate: savedDto.uploadDate || new Date().toISOString().split('T')[0],
              fileUrl: savedDto.fileUrl,
              version: savedDto.version || '1.0',
            },
          ];
        });
      } else {
        // Dummy Mode
        const dummyId = existingDoc?.id || `DOC-DUMMY-${Date.now().toString().slice(-5)}`;
        const localUrl = URL.createObjectURL(file);

        setUploadedDocs(prev => {
          const filtered = prev.filter(d =>
            !(d.documentCode && d.documentCode.toUpperCase() === reqDoc.code.toUpperCase()) &&
            d.id !== dummyId
          );
          return [
            ...filtered,
            {
              id: dummyId,
              documentCode: reqDoc.code,
              title: reqDoc.title,
              fileName: file.name,
              size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
              type: ext === 'pdf' ? 'PDF' : 'IMAGE',
              status: 'PENDING_VERIFICATION',
              uploadDate: new Date().toISOString().split('T')[0],
              fileUrl: localUrl,
              version: '1.0',
            },
          ];
        });
      }
    } catch (err) {
      console.error('Document upload error:', err);
      setUploadErrors(prev => ({
        ...prev,
        [reqDoc.code]: err.response?.data?.message || err.message || 'Upload failed. Please check your network and retry.',
      }));
    } finally {
      setUploadingCodes(prev => {
        const u = { ...prev };
        delete u[reqDoc.code];
        return u;
      });
      // Clear file input value
      if (fileInputRefs.current[reqDoc.code]) {
        fileInputRefs.current[reqDoc.code].value = '';
      }
    }
  };

  // Remove Document Handler
  const handleRemoveDocument = async (docToRemove) => {
    if (!window.confirm(`Are you sure you want to remove the document "${docToRemove.title || docToRemove.fileName}"?`)) {
      return;
    }

    try {
      const isLive = typeof window !== 'undefined' && localStorage.getItem('aicte_data_mode') === 'live';
      if (isLive && docToRemove.id && !docToRemove.id.startsWith('DOC-DUMMY-')) {
        await documentsApi.delete(docToRemove.id);
      }
    } catch (err) {
      console.warn('Could not delete document from backend:', err);
    }

    setUploadedDocs(prev => prev.filter(d => d.id !== docToRemove.id));
  };

  // Download / Preview Document Handler
  const handleDownloadDocument = async (doc) => {
    try {
      const isLive = typeof window !== 'undefined' && localStorage.getItem('aicte_data_mode') === 'live';
      if (isLive && doc.id && !doc.id.startsWith('DOC-DUMMY-')) {
        const blob = await documentsApi.download(doc.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName || `${doc.title || doc.documentCode || 'AICTE_Document'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (doc.fileUrl) {
        window.open(doc.fileUrl, '_blank');
      } else {
        alert('Document file preview is not available in offline simulation.');
      }
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  // Step Validation
  const validateCurrentStep = (stepNumber) => {
    setStepError('');
    const newFieldErrors = {};

    // 1. If Step 3: Document Uploads Step
    if (stepNumber === 3) {
      const mandatoryDocs = (currentConfig.documents || []).filter(d => d.mandatory);
      const missing = [];

      for (const reqDoc of mandatoryDocs) {
        const found = getUploadedDocForRequirement(reqDoc);
        if (!found || found.status === 'NOT_UPLOADED') {
          missing.push(reqDoc.title);
        }
      }

      if (missing.length > 0) {
        setStepError(`Mandatory document(s) required: Please upload ${missing.join(', ')} before proceeding.`);
        return false;
      }
      return true;
    }

    // 2. Form fields validation for steps 1, 2, 4
    const activeStepDef = steps.find(s => s.stepNumber === stepNumber);
    if (!activeStepDef) return true;

    for (const fieldKey of activeStepDef.fields) {
      const fieldDef = FIELD_DEFINITIONS[fieldKey];
      if (!fieldDef) continue;

      const val = formData[fieldKey];

      // Custom validation logic
      if (fieldDef.validate) {
        const error = fieldDef.validate(val, formData);
        if (error) {
          newFieldErrors[fieldKey] = error;
        }
      } else if (fieldDef.required) {
        if (fieldDef.type === 'checkbox') {
          if (!val) {
            newFieldErrors[fieldKey] = `${fieldDef.label} must be affirmed.`;
          }
        } else if (val === undefined || val === null || String(val).trim() === '') {
          newFieldErrors[fieldKey] = `${fieldDef.label} is required.`;
        }
      }
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setStepError('Please complete all required fields correctly before proceeding.');
      return false;
    }

    setFieldErrors({});
    return true;
  };

  // Full validation before final submission
  const validateAllSteps = () => {
    setStepError('');
    for (let s = 1; s <= totalSteps - 1; s++) {
      if (!validateCurrentStep(s)) {
        setCurrentStep(s);
        return false;
      }
    }
    return true;
  };

  // Navigation: Next
  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  // Navigation: Previous
  const handlePrev = () => {
    setStepError('');
    setFieldErrors({});
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Construct complete payload for persistence
  const buildPayload = (status) => {
    const intakeArray = currentConfig.toIntakePayload ? currentConfig.toIntakePayload(formData) : [];

    // Filter type-specific answers for detailsJson
    const details = {};
    steps.forEach(s => {
      s.fields.forEach(f => {
        if (formData[f] !== undefined) {
          details[f] = formData[f];
        }
      });
    });

    return {
      id: initialData?.id || undefined,
      institutionName: formData.institutionName?.trim(),
      institutionCode: formData.institutionCode?.trim(),
      applicationType: selectedType,
      programme: formData.programme,
      priority: formData.priority || 'NORMAL',
      region: formData.region,
      state: formData.state,
      workflowId: currentConfig.workflowId,
      status,
      requestedIntake: intakeArray,
      detailsJson: JSON.stringify(details),
      documents: uploadedDocs,
    };
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    if (!formData.institutionName || !formData.institutionCode) {
      setStepError('Institution Name and AICTE Code are required to save a draft.');
      return;
    }
    const payload = buildPayload('DRAFT');
    if (onSaveDraft) {
      await onSaveDraft(payload);
    }
  };

  // Final Application Submission
  const handleSubmit = async () => {
    if (!validateAllSteps()) return;
    const payload = buildPayload('SUBMITTED');
    if (onSubmitApplication) {
      await onSubmitApplication(payload);
    }
  };

  // Check if any mandatory document is missing for submission
  const missingMandatoryDocs = useMemo(() => {
    const mandatory = (currentConfig.documents || []).filter(d => d.mandatory);
    return mandatory.filter(reqDoc => {
      const found = getUploadedDocForRequirement(reqDoc);
      return !found || found.status === 'NOT_UPLOADED';
    });
  }, [currentConfig, uploadedDocs]);

  // Helper renderer for input fields
  const renderField = (fieldKey) => {
    const def = FIELD_DEFINITIONS[fieldKey];
    if (!def) return null;

    const value = formData[fieldKey];
    const error = fieldErrors[fieldKey];

    if (def.type === 'checkbox') {
      return (
        <div key={fieldKey} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(fieldKey, e.target.checked)}
              className="mt-0.5 rounded text-gov-800 focus:ring-gov-700 h-4 w-4 border-slate-300"
            />
            <div className="flex-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                {def.label} {def.required && <span className="text-rose-500">*</span>}
              </span>
              {def.description && (
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {def.description}
                </p>
              )}
              {error && <p className="text-[11px] text-rose-600 font-semibold mt-1">{error}</p>}
            </div>
          </label>
        </div>
      );
    }

    if (def.type === 'textarea') {
      return (
        <div key={fieldKey} className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            {def.label} {def.required && <span className="text-rose-500">*</span>}
          </label>
          {def.description && <p className="text-[11px] text-slate-400">{def.description}</p>}
          <textarea
            rows={def.rows || 3}
            value={value || ''}
            placeholder={def.placeholder || ''}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            className={`w-full text-xs p-2.5 rounded-lg border ${
              error ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-gov-700'
            } focus:outline-none focus:ring-1`}
          />
          {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        </div>
      );
    }

    if (def.type === 'select') {
      return (
        <div key={fieldKey} className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            {def.label} {def.required && <span className="text-rose-500">*</span>}
          </label>
          {def.description && <p className="text-[11px] text-slate-400">{def.description}</p>}
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            className={`w-full text-xs p-2.5 rounded-lg border bg-white ${
              error ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-gov-700'
            } focus:outline-none focus:ring-1`}
          >
            <option value="">-- Select {def.label} --</option>
            {def.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        </div>
      );
    }

    return (
      <div key={fieldKey} className="space-y-1">
        <label className="block text-xs font-bold text-slate-700">
          {def.label} {def.required && <span className="text-rose-500">*</span>}
        </label>
        {def.description && <p className="text-[11px] text-slate-400">{def.description}</p>}
        <input
          type={def.type || 'text'}
          value={value ?? ''}
          placeholder={def.placeholder || ''}
          onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
          className={`w-full text-xs p-2.5 rounded-lg border ${
            error ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-gov-700'
          } focus:outline-none focus:ring-1`}
        />
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      </div>
    );
  };

  // Helper for document status badge
  const renderDocStatusBadge = (doc) => {
    if (!doc) {
      return <Badge size="sm" variant="default" className="bg-slate-100 text-slate-600">Not Uploaded</Badge>;
    }
    if (doc.status === 'VERIFIED') {
      return <Badge size="sm" variant="success" className="gap-1"><FileCheck className="w-3 h-3" /> Verified</Badge>;
    }
    if (doc.status === 'REJECTED') {
      return <Badge size="sm" variant="danger" className="gap-1"><AlertCircle className="w-3 h-3" /> Rejected</Badge>;
    }
    if (doc.status === 'CORRECTION_REQUIRED' || doc.status === 'ACTION_REQUIRED') {
      return <Badge size="sm" variant="warning" className="gap-1 bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3" /> Correction Required</Badge>;
    }
    return <Badge size="sm" variant="navy" className="gap-1 bg-blue-100 text-blue-800"><Clock className="w-3 h-3" /> Verification Pending</Badge>;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AICTE Institutional Approval Application Wizard"
      subtitle={`Step ${currentStep} of ${totalSteps} — ${formData.institutionName || 'Institutional Application'} (AY 2026-27)`}
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
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                onClick={handlePrev}
                disabled={isSubmitting}
              >
                Previous Step
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                variant="primary"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Continue to Step {currentStep + 1}
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                icon={Send}
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={missingMandatoryDocs.length > 0}
                title={missingMandatoryDocs.length > 0 ? 'Upload all mandatory documents before submission' : 'Submit Application'}
              >
                Confirm & Submit Application
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Dynamic Multi-Step Progress Indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs overflow-x-auto gap-1">
          {steps.map((s) => {
            const isCompleted = currentStep > s.stepNumber;
            const isActive = currentStep === s.stepNumber;
            return (
              <React.Fragment key={s.stepNumber}>
                <div
                  className={`flex items-center gap-1.5 font-bold shrink-0 transition-colors ${
                    isActive ? 'text-gov-800' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gov-900 text-white shadow-sm ring-2 ring-gov-600/30'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : s.stepNumber}
                  </div>
                  <span className="hidden sm:inline">{s.title}</span>
                </div>
                {s.stepNumber < totalSteps && (
                  <div
                    className={`h-0.5 flex-1 mx-1.5 transition-colors ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Global Error Banner */}
        {stepError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{stepError}</span>
          </div>
        )}

        {/* STEP 1: Institution & Category */}
        {currentStep === 1 && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3 rounded-lg bg-gov-50/70 border border-gov-200/80 text-gov-900 flex items-start gap-2.5">
              <Building className="w-4 h-4 text-gov-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Institutional Profile & Application Category</span>
                <p className="text-[11px] text-gov-700 mt-0.5">
                  Select your approval application type. The form questions, validation rules, and mandatory document requirements will adjust automatically according to AICTE Approval Process Handbook (APH 2026-27) norms.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {renderField('institutionName')}
              {renderField('institutionCode')}
              {renderField('region')}
              {renderField('state')}

              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  Application Approval Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-semibold text-gov-900 focus:outline-none focus:ring-1 focus:ring-gov-700"
                >
                  {Object.entries(APPLICATION_TYPES).map(([k, label]) => (
                    <option key={k} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1 italic">
                  {currentConfig.description}
                </p>
              </div>

              {renderField('programme')}
              {renderField('priority')}
            </div>
          </div>
        )}

        {/* STEP 2: Dynamic Type-Specific Questions */}
        {currentStep === 2 && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-gov-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{steps[1]?.title || 'Regulatory Parameters'}</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {steps[1]?.subtitle || 'Provide accurate details for scrutiny.'}
                </p>
              </div>
            </div>

            {/* If application type does NOT have intake (EoA, Closure, Change of Site, Co-Ed) */}
            {!currentConfig.hasIntake ? (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Intake Variation: <strong>Not applicable for this application type</strong> ({selectedType}).
                  </span>
                </div>
                <Badge size="sm" variant="success">No Intake Variation</Badge>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Intake Parameters:</strong> {currentConfig.intakePrompt}
                </span>
              </div>
            )}

            {/* Render all fields registered for Step 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {steps[1]?.fields.map((fieldKey) => {
                const def = FIELD_DEFINITIONS[fieldKey];
                const isFullWidth = def?.type === 'textarea' || fieldKey.includes('Address') || fieldKey.includes('Justification') || fieldKey.includes('Plan');
                return (
                  <div key={fieldKey} className={isFullWidth ? 'md:col-span-2' : ''}>
                    {renderField(fieldKey)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Mandatory & Supporting Documents Management */}
        {currentStep === 3 && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-gov-50/80 border border-gov-200 text-gov-900 flex items-start gap-2.5">
              <Paperclip className="w-4 h-4 text-gov-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Statutory Document Requirements & Repository</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Upload all applicable mandatory documents for <strong>{selectedType}</strong>. Accepted formats: <strong>PDF, PNG, JPG, JPEG</strong> (Maximum size: <strong>10 MB</strong> per file). Successfully uploaded files persist across drafts.
                </p>
              </div>
            </div>

            {/* Document Requirements Checklist for this Application Type */}
            <div className="space-y-3">
              {(currentConfig.documents || []).map((reqDoc) => {
                const uploaded = getUploadedDocForRequirement(reqDoc);
                const isUploading = !!uploadingCodes[reqDoc.code];
                const error = uploadErrors[reqDoc.code];

                return (
                  <div
                    key={reqDoc.code}
                    className={`p-3.5 rounded-xl border transition-all ${
                      uploaded
                        ? 'bg-slate-50/80 border-emerald-300'
                        : reqDoc.mandatory
                        ? 'bg-white border-amber-300 shadow-sm'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] text-gov-800 font-semibold bg-gov-50 px-1.5 py-0.5 rounded border border-gov-200">
                            {reqDoc.code}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs">{reqDoc.title}</h4>
                          {reqDoc.mandatory ? (
                            <Badge size="sm" variant="danger">Required</Badge>
                          ) : (
                            <Badge size="sm" variant="default">Optional</Badge>
                          )}
                          {renderDocStatusBadge(uploaded)}
                        </div>

                        {reqDoc.description && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            {reqDoc.description}
                          </p>
                        )}

                        <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                          <span>Formats: PDF, PNG, JPG, JPEG</span>
                          <span>&bull;</span>
                          <span>Max: 10 MB</span>
                        </div>

                        {/* If already uploaded, show file metadata & review remarks */}
                        {uploaded && (
                          <div className="mt-2.5 p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gov-800" />
                              <div>
                                <span className="font-semibold text-slate-800">{uploaded.fileName || uploaded.title}</span>
                                <span className="text-slate-400 ml-2">({uploaded.size} &bull; {uploaded.uploadDate})</span>
                                {uploaded.version && <span className="text-gov-700 ml-2 font-mono">v{uploaded.version}</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDownloadDocument(uploaded)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gov-800 hover:bg-gov-50 rounded border border-gov-200"
                                title="Download / Preview file"
                              >
                                <Download className="w-3 h-3" /> Preview
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(uploaded)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-50 rounded border border-rose-200"
                                title="Remove file"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Review Remarks if any */}
                        {uploaded?.verificationRemarks && (
                          <div className="mt-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                            <strong>Reviewer Note:</strong> {uploaded.verificationRemarks}
                          </div>
                        )}

                        {/* Error alert if upload failed */}
                        {error && (
                          <div className="mt-2 p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{error}</span>
                          </div>
                        )}
                      </div>

                      {/* Upload / Replace Actions */}
                      <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                        <input
                          type="file"
                          ref={el => fileInputRefs.current[reqDoc.code] = el}
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(reqDoc, e.target.files[0]);
                            }
                          }}
                        />

                        <Button
                          type="button"
                          variant={uploaded ? 'outline' : 'primary'}
                          size="sm"
                          icon={isUploading ? RefreshCw : Upload}
                          isLoading={isUploading}
                          disabled={isUploading}
                          onClick={() => {
                            if (fileInputRefs.current[reqDoc.code]) {
                              fileInputRefs.current[reqDoc.code].click();
                            }
                          }}
                        >
                          {isUploading ? 'Uploading...' : uploaded ? 'Replace' : 'Upload File'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Preserved / Non-Applicable Documents if application type was switched */}
            {nonApplicableUploadedDocs.length > 0 && (
              <div className="mt-4 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800 text-xs">
                    Other Uploaded Documents ({nonApplicableUploadedDocs.length} Preserved from Previous Selection)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  These documents were uploaded previously. They are kept safely associated with your institution without being deleted.
                </p>

                <div className="divide-y divide-slate-200 bg-white rounded-lg border border-slate-200">
                  {nonApplicableUploadedDocs.map(doc => (
                    <div key={doc.id} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{doc.title || doc.fileName}</span>
                        <span className="text-slate-400 ml-2">({doc.size || 'Attached'})</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded ml-2 font-mono">
                          {doc.documentCode || 'Additional'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadDocument(doc)}
                          className="text-gov-800 hover:underline text-[11px] font-medium"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc)}
                          className="text-rose-600 hover:underline text-[11px] font-medium ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Statutory Compliance Undertakings */}
        {currentStep === 4 && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3 rounded-lg bg-gov-50 border border-gov-200 text-gov-900 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-gov-800 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gov-950">Statutory Regulatory Undertakings (APH 2026-27)</h4>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  Under the All India Council for Technical Education Act, every institution must verify and affirm statutory adherence to spatial, faculty, and administrative criteria before submission.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {renderField('decLandNorms')}
              {renderField('decCadreRatio')}
              {renderField('decGrievance')}
              {renderField('decAuthenticity')}
            </div>
          </div>
        )}

        {/* STEP 5: Review Before Submission */}
        {currentStep === 5 && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-950">Pre-Submission Verification Summary</h4>
                <p className="mt-0.5 text-[11px] text-emerald-900">
                  Carefully review all application parameters and uploaded statutory files below. You can save this application as a <strong>Draft</strong> to continue later, or perform <strong>Formal Submission</strong> to send it to the AICTE Regional Scrutiny Cell.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
              {/* Institution and Application Header */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Institution</span>
                  <p className="font-bold text-slate-900">{formData.institutionName}</p>
                  <p className="font-mono text-gov-800 font-medium">Permanent AICTE ID: {formData.institutionCode}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Jurisdiction & Region</span>
                  <p className="font-bold text-slate-800">{formData.region}</p>
                  <p className="text-slate-500">{formData.state}</p>
                </div>
              </div>

              {/* Application Category & Priority */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Application Category</span>
                  <p className="font-bold text-gov-900">{selectedType}</p>
                  <span className="text-slate-500">Programme: {formData.programme}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Academic Cycle & Workflow</span>
                  <p className="font-bold text-slate-800">AY {formData.academicYear}</p>
                  <Badge size="sm" variant={formData.priority === 'HIGH' ? 'danger' : 'default'}>
                    {formData.priority} Priority
                  </Badge>
                </div>
              </div>

              {/* Dynamic Type-Specific Answers Breakdown */}
              <div className="pb-3 border-b border-slate-200">
                <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1.5">
                  Application-Specific Details:
                </span>

                {selectedType === APPLICATION_TYPES.EOA && (
                  <div className="grid grid-cols-2 gap-2 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500">Previous Approval Ref:</span>
                      <p className="font-mono font-semibold">{formData.eoaPreviousApprovalRef || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Accreditation:</span>
                      <p className="font-semibold">{formData.eoaAccreditationStatus || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Cadre Ratio:</span>
                      <p className="font-semibold">{formData.eoaFacultyRatioCompliant || '1:20'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Intake Variation:</span>
                      <p className="font-semibold text-emerald-700">None (Continuing existing approved capacity)</p>
                    </div>
                  </div>
                )}

                {(selectedType === APPLICATION_TYPES.INCREASE_INTAKE || selectedType === APPLICATION_TYPES.INCREASE_OR_NEW) && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{formData.proposedCourse}</span>
                      <Badge variant="navy">+{Number(formData.proposedIntake || 0) - Number(formData.currentIntake || 0)} Seats</Badge>
                    </div>
                    <p className="text-slate-600">
                      Currently Approved: <strong className="font-mono">{formData.currentIntake || 0} seats</strong> &rarr; Proposed Target: <strong className="font-mono text-gov-900">{formData.proposedIntake} seats</strong>
                    </p>
                    {formData.intakeJustification && (
                      <p className="text-slate-500 text-[11px] italic">"{formData.intakeJustification}"</p>
                    )}
                  </div>
                )}

                {selectedType === APPLICATION_TYPES.NEW_COURSE && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{formData.proposedCourse}</span>
                      <Badge variant="success">New Proposed Intake: {formData.proposedIntake} seats</Badge>
                    </div>
                    <p className="text-slate-600">
                      Level: <strong>{formData.courseLevel || 'Under Graduate'}</strong> | Emerging Area: <strong>{formData.isEmergingArea === 'YES' ? 'Yes' : 'No'}</strong>
                    </p>
                    <p className="text-slate-500 font-mono text-[11px]">University NOC: {formData.universityNocNumber || 'Pending'}</p>
                  </div>
                )}

                {selectedType === APPLICATION_TYPES.NEW_INSTITUTION && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                    <p className="font-bold text-slate-900">Sponsoring Trust: {formData.trustName} ({formData.trustRegNumber})</p>
                    <p className="text-slate-600">
                      Land Extent: <strong>{formData.landAreaAcres} Acres</strong> | Built-up Area: <strong>{formData.totalBuiltUpAreaSqM} sq. m</strong>
                    </p>
                    <p className="text-slate-600">
                      Inaugural Course: <strong>{formData.proposedCourse}</strong> ({formData.proposedIntake} seats)
                    </p>
                  </div>
                )}

                {selectedType === APPLICATION_TYPES.CLOSURE && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                    <p className="font-bold text-rose-800">Programme to Close: {formData.closureCourseName}</p>
                    <p className="text-slate-600">
                      Closure Mode: <strong>{formData.closureType}</strong> | Effective: <strong>AY {formData.closureEffectiveYear}</strong>
                    </p>
                    <p className="text-slate-500 text-[11px]">Primary Reason: {formData.closureReason}</p>
                  </div>
                )}

                {selectedType === APPLICATION_TYPES.CHANGE_SITE && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                    <p className="text-slate-600">Relocating from: <strong>{formData.oldCampusAddress}</strong></p>
                    <p className="font-bold text-gov-900">To New Campus: {formData.newCampusAddress} ({formData.newCampusDistrict})</p>
                    <p className="text-slate-500 text-[11px]">Distance: {formData.distanceOldToNewKm} km | CLU Order: {formData.cluOrderNumber}</p>
                  </div>
                )}

                {selectedType === APPLICATION_TYPES.CONVERSION_COED && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                    <p className="font-bold text-slate-900">Transition: {formData.currentGenderStatus} &rarr; {formData.proposedGenderStatus}</p>
                    <p className="text-slate-600">Restrooms & Amenities: <strong>{formData.coedRestroomReadiness}</strong></p>
                    <p className="text-slate-500 text-[11px]">Security Infrastructure: {formData.coedHostelSecurityArrangements}</p>
                  </div>
                )}
              </div>

              {/* Uploaded Documents Summary */}
              <div className="pb-3 border-b border-slate-200">
                <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1.5">
                  Uploaded Statutory Documents ({uploadedDocs.length}):
                </span>

                {missingMandatoryDocs.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Missing required documents: <strong>{missingMandatoryDocs.map(d => d.title).join(', ')}</strong>. Return to Step 3 to upload.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(currentConfig.documents || []).map(reqDoc => {
                    const uploaded = getUploadedDocForRequirement(reqDoc);
                    return (
                      <div
                        key={reqDoc.code}
                        className={`p-2 rounded border text-[11px] flex items-center justify-between ${
                          uploaded ? 'bg-white border-slate-200' : 'bg-rose-50/50 border-rose-200 text-rose-700'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <span className="font-semibold">{reqDoc.title}</span>
                          {reqDoc.mandatory && <span className="text-rose-500 font-bold ml-1">*</span>}
                        </div>
                        {renderDocStatusBadge(uploaded)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Statutory Undertakings Confirmation */}
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">
                  Statutory Affirmations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                    ✓ Land & Spatial Norms
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                    ✓ Faculty Cadre Ratio
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                    ✓ Anti-Ragging & ICC
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                    ✓ Solemn Affirmation of Truth
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
