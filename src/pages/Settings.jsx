import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  RotateCcw,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  Server,
  Radio,
  Database,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Power,
  Layers,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { DataModeToggle } from '../components/common/DataModeToggle';
import { healthApi } from '../services/apiService';

export const Settings = () => {
  const {
    workflows,
    resetDemoData,
    dataMode,
    backendUrl,
    retryLiveFetch,
    isLiveLoading,
    liveError,
    createWorkflowTemplate,
    updateWorkflowTemplate,
    activateWorkflowTemplate,
    deactivateWorkflowTemplate
  } = useAppData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('data-mode'); // 'data-mode' | 'workflows' | 'thresholds' | 'system'

  // Configurable thresholds
  const [scrutinySla, setScrutinySla] = useState(7);
  const [evcSla, setEvcSla] = useState(10);
  const [escalationThreshold, setEscalationThreshold] = useState(14);
  const [reminderInterval, setReminderInterval] = useState(3);
  const [isSaved, setIsSaved] = useState(false);

  // Health ping state
  const [pingStatus, setPingStatus] = useState(null); // null | 'pinging' | 'online' | 'offline'
  const [pingMsg, setPingMsg] = useState('');

  // Workflow template management state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWfId, setSelectedWfId] = useState(null);
  const [wfActionLoading, setWfActionLoading] = useState(false);

  const initialTemplateForm = {
    id: '',
    name: '',
    code: '',
    description: '',
    version: '2026.1.0',
    applicableApplicationTypes: 'New Technical Institution',
    isDefault: false,
    stages: [
      { name: 'Application Submission', code: 'SUBMISSION', stageOrder: 1, targetDays: 3, roleAllowed: 'COLLEGE_REP', isMandatory: true, stageType: 'STANDARD' },
      { name: 'Document Scrutiny', code: 'SCRUTINY', stageOrder: 2, targetDays: 7, roleAllowed: 'REGIONAL_OFFICER', isMandatory: true, stageType: 'STANDARD' },
      { name: 'EVC Physical Inspection', code: 'EVC', stageOrder: 3, targetDays: 10, roleAllowed: 'EVC_MEMBER', isMandatory: false, stageType: 'INSPECTION' },
      { name: 'Executive Council Final Decision', code: 'FINAL_APPROVAL', stageOrder: 4, targetDays: 5, roleAllowed: 'ADMIN', isMandatory: true, stageType: 'DECISION' }
    ]
  };

  const [wfForm, setWfForm] = useState(initialTemplateForm);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SYSTEM_ADMIN';

  const handleOpenCreate = () => {
    setWfForm({
      ...initialTemplateForm,
      id: `WF-${Date.now().toString().slice(-6)}`,
      code: `WF_CUSTOM_${Date.now().toString().slice(-4)}`
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (wf) => {
    setSelectedWfId(wf.id);
    setWfForm({
      id: wf.id,
      name: wf.name || '',
      code: wf.code || '',
      description: wf.description || '',
      version: wf.version || '1.0.0',
      applicableApplicationTypes: wf.applicableApplicationTypes || '',
      isDefault: wf.isDefault || false,
      stages: (wf.stages || []).map((s, idx) => ({
        id: s.id,
        name: s.name || '',
        code: s.code || '',
        stageOrder: s.stageOrder || (idx + 1),
        targetDays: s.targetDays || 5,
        roleAllowed: s.roleAllowed || 'REGIONAL_OFFICER',
        isMandatory: s.isMandatory !== false,
        stageType: s.stageType || 'STANDARD'
      }))
    });
    setIsEditModalOpen(true);
  };

  const handleAddStage = () => {
    setWfForm(prev => ({
      ...prev,
      stages: [
        ...prev.stages,
        {
          name: 'New Review Stage',
          code: `STAGE_${prev.stages.length + 1}`,
          stageOrder: prev.stages.length + 1,
          targetDays: 7,
          roleAllowed: 'REGIONAL_OFFICER',
          isMandatory: true,
          stageType: 'STANDARD'
        }
      ]
    }));
  };

  const handleRemoveStage = (index) => {
    if (wfForm.stages.length <= 2) {
      alert('A workflow pathway must have at least 2 stages.');
      return;
    }
    setWfForm(prev => {
      const updated = prev.stages.filter((_, i) => i !== index);
      return {
        ...prev,
        stages: updated.map((stg, i) => ({ ...stg, stageOrder: i + 1 }))
      };
    });
  };

  const handleStageChange = (index, field, value) => {
    setWfForm(prev => {
      const updated = [...prev.stages];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, stages: updated };
    });
  };

  const handleSaveCreate = async () => {
    if (!wfForm.name.trim() || !wfForm.code.trim()) {
      alert('Workflow Name and Code are required.');
      return;
    }
    if (wfForm.stages.length < 2) {
      alert('Workflow must contain at least 2 stages.');
      return;
    }

    setWfActionLoading(true);
    try {
      await createWorkflowTemplate(wfForm, currentUser);
      setIsCreateModalOpen(false);
      alert('Workflow template created successfully.');
    } catch (err) {
      alert(`Error creating template: ${err.message}`);
    } finally {
      setWfActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!wfForm.name.trim()) {
      alert('Workflow Name is required.');
      return;
    }
    if (wfForm.stages.length < 2) {
      alert('Workflow must contain at least 2 stages.');
      return;
    }

    setWfActionLoading(true);
    try {
      await updateWorkflowTemplate(selectedWfId, {
        name: wfForm.name,
        description: wfForm.description,
        applicableApplicationTypes: wfForm.applicableApplicationTypes,
        stages: wfForm.stages
      }, currentUser);
      setIsEditModalOpen(false);
      alert('Workflow template updated successfully.');
    } catch (err) {
      alert(`Error updating template: ${err.message}`);
    } finally {
      setWfActionLoading(false);
    }
  };

  const handleToggleActive = async (wf) => {
    if (wf.status === 'ACTIVE') {
      if (!window.confirm(`Are you sure you want to deactivate workflow template "${wf.name}"? Active in-progress applications will complete their run.`)) {
        return;
      }
      try {
        await deactivateWorkflowTemplate(wf.id, currentUser);
      } catch (err) {
        alert(`Cannot deactivate: ${err.message}`);
      }
    } else {
      if (!window.confirm(`Activate workflow template "${wf.name}"? It will become available for matching applications.`)) {
        return;
      }
      try {
        await activateWorkflowTemplate(wf.id, currentUser);
      } catch (err) {
        alert(`Cannot activate: ${err.message}`);
      }
    }
  };

  const handleSaveConfig = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all applications, compliance records, and EVC items back to factory defaults?')) {
      resetDemoData();
      alert('Mock dataset reset to initial state.');
    }
  };

  const handleTestBackendConnection = async () => {
    setPingStatus('pinging');
    setPingMsg('Connecting to ' + backendUrl + '/health ...');
    try {
      const res = await healthApi.checkHealth();
      setPingStatus('online');
      setPingMsg(`Backend online! Response: ${JSON.stringify(res.data || 'OK 200')}`);
    } catch (err) {
      setPingStatus('offline');
      setPingMsg(`Connection failed: ${err.message}. Check that Spring Boot is running on ${backendUrl}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Rules & Portal SLA Configuration"
        subtitle="Manage statutory processing timelines, escalation thresholds, and backend connectivity modes"
        badge={<Badge variant="navy">System Administration</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={handleSaveConfig}
          >
            {isSaved ? 'Rules Saved!' : 'Save Rule Configuration'}
          </Button>
        }
      />

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Workflow configurations updated successfully in prototype memory.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('data-mode')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'data-mode'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Data Mode & Backend API</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
            dataMode === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {dataMode === 'live' ? 'Live Mode' : 'Dummy Mode'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('workflows')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'workflows'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Approval Pathways ({workflows.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('thresholds')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'thresholds'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>SLA & Escalation Thresholds</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'system'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Data Reset</span>
        </button>
      </div>

      {activeTab === 'data-mode' ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Portal Data Mode</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle between local mock demo state and live Spring Boot REST API streaming.
              </p>
            </div>
            <DataModeToggle />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dummy Data Mode Details */}
            <div className={`p-4 rounded-xl border transition-all ${
              dataMode === 'dummy' ? 'bg-blue-50/40 border-blue-300 ring-1 ring-blue-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-gov-800" />
                <h4 className="text-xs font-bold text-slate-900 uppercase">Dummy Data Mode</h4>
                {dataMode === 'dummy' && <Badge size="sm" variant="navy">Currently Active</Badge>}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Uses pre-seeded institutional approval applications, compliance records, EVC visits, and notifications stored safely in client-side localStorage. Changes survive page refreshes and can be reset at any time.
              </p>
              <ul className="mt-3 text-[11px] text-slate-500 space-y-1 list-disc pl-4">
                <li>Zero network latency / offline friendly</li>
                <li>Self-contained for offline evaluation and testing</li>
                <li>Changes never write to the production database</li>
              </ul>
            </div>

            {/* Live Data Mode Details */}
            <div className={`p-4 rounded-xl border transition-all ${
              dataMode === 'live' ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase">Live Data Mode</h4>
                {dataMode === 'live' && <Badge size="sm" variant="success">Currently Active</Badge>}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Connects through the central Axios service layer to your Java / Spring Boot application and PostgreSQL database. Never displays mock data as live records.
              </p>
              <div className="mt-3 text-xs bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">API Base Endpoint:</span>
                {backendUrl}
              </div>
            </div>
          </div>

          {/* Backend Connectivity Test */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Test Spring Boot Server Connection</h4>
                <p className="text-[11px] text-slate-500">
                  Sends an HTTP GET request to <code className="font-mono">{backendUrl}/health</code>.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={handleTestBackendConnection}
                isLoading={pingStatus === 'pinging'}
              >
                Ping Backend Health
              </Button>
            </div>

            {pingStatus && pingStatus !== 'pinging' && (
              <div className={`mt-3 p-3 rounded-lg border text-xs flex items-start gap-2 ${
                pingStatus === 'online' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {pingStatus === 'online' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{pingStatus === 'online' ? 'Backend Connected' : 'Backend Unreachable'}</p>
                  <p className="text-[11px] mt-0.5">{pingMsg}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'workflows' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-gov-50 to-white p-4 rounded-xl border border-gov-200">
            <div>
              <h3 className="text-sm font-bold text-gov-950 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gov-700" />
                Configurable Approval Workflow Pathways
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Statutory multi-stage progression pathways governing review, verification, inspection, and executive decision stages.
              </p>
            </div>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleOpenCreate}
              >
                Create Pathway Template
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {workflows.map(wf => (
              <div key={wf.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-card hover:border-gov-300 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{wf.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        wf.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : wf.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {wf.status || 'ACTIVE'}
                      </span>
                      {wf.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{wf.description}</p>
                    {wf.applicableApplicationTypes && (
                      <div className="text-[11px] text-gov-700 font-medium">
                        <strong>Applies to:</strong> {wf.applicableApplicationTypes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[11px] text-slate-400">Ver: {wf.version}</span>
                    <Badge size="sm" variant="navy">{wf.code}</Badge>
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Edit3}
                          onClick={() => handleOpenEdit(wf)}
                        >
                          Edit
                        </Button>
                        {wf.status === 'ACTIVE' ? (
                          <Button
                            variant="danger"
                            size="xs"
                            icon={Power}
                            onClick={() => handleToggleActive(wf)}
                            disabled={wf.isDefault}
                            title={wf.isDefault ? "Cannot deactivate default workflow" : "Deactivate workflow"}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            size="xs"
                            icon={CheckCircle2}
                            onClick={() => handleToggleActive(wf)}
                          >
                            Activate
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Stage Sequence & Role SLAs ({wf.stages?.length || 0} Stages):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
                    {wf.stages?.map((stg, i) => (
                      <div key={stg.id || i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                            <span>0{stg.stageOrder || i + 1}. {stg.code}</span>
                            {stg.isMandatory && (
                              <span className="text-amber-700 bg-amber-100 px-1 py-0.2 rounded font-bold">REQ</span>
                            )}
                          </div>
                          <span className="font-semibold text-slate-800 line-clamp-2">{stg.name}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-col gap-0.5 text-[10px]">
                          <span className="text-gov-800 font-bold">SLA: {stg.targetDays} days</span>
                          <span className="text-slate-500 font-medium">Role: {stg.roleAllowed}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'thresholds' ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card space-y-6">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b">Configurable Escalation & SLA Timelines</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Document Scrutiny SLA (Days)
              </label>
              <input
                type="number"
                value={scrutinySla}
                onChange={(e) => setScrutinySla(Number(e.target.value))}
                className="mt-1.5 w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
              <p className="text-[11px] text-slate-400 mt-1">Days allotted to Regional Officer for scrutiny verification</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                EVC Inspection & Report Upload SLA (Days)
              </label>
              <input
                type="number"
                value={evcSla}
                onChange={(e) => setEvcSla(Number(e.target.value))}
                className="mt-1.5 w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
              <p className="text-[11px] text-slate-400 mt-1">Days from EVC appointment to committee physical inspection</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Level 2 Bureau Escalation Threshold (Days Overdue)
              </label>
              <input
                type="number"
                value={escalationThreshold}
                onChange={(e) => setEscalationThreshold(Number(e.target.value))}
                className="mt-1.5 w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
              <p className="text-[11px] text-slate-400 mt-1">Trigger escalation notice to Member Secretary / Bureau Head</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Statutory Expiry Advance Alert Interval (Days)
              </label>
              <input
                type="number"
                value={reminderInterval}
                onChange={(e) => setReminderInterval(Number(e.target.value))}
                className="mt-1.5 w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
              <p className="text-[11px] text-slate-400 mt-1">Days before lease or undertaking deadline to notify college</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b">Prototype Data Reset</h3>
          <p className="text-xs text-slate-600 max-w-xl">
            This action clears all browser localStorage changes (e.g. stage movements, new applications, deficiency submissions, and EVC assignments) and restores the original realistic AICTE baseline mock dataset.
          </p>

          <Button
            variant="danger"
            size="md"
            icon={RotateCcw}
            onClick={handleResetData}
          >
            Reset All Mock Data to Default
          </Button>
        </div>
      )}

      {/* Modal: Create Workflow Template */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Approval Workflow Pathway"
        subtitle="Define a statutory multi-stage pathway with role assignments and SLAs"
        maxWidth="max-w-3xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSaveCreate}
              isLoading={wfActionLoading}
            >
              Create Pathway
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pathway Code *</label>
              <input
                type="text"
                value={wfForm.code}
                onChange={(e) => setWfForm({ ...wfForm, code: e.target.value.toUpperCase() })}
                placeholder="WF-NEW-PATHWAY"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs uppercase"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Pathway Name *</label>
              <input
                type="text"
                value={wfForm.name}
                onChange={(e) => setWfForm({ ...wfForm, name: e.target.value })}
                placeholder="e.g. Scrutiny + Virtual Expert Inspection Pathway"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Applicable Application Types</label>
              <input
                type="text"
                value={wfForm.applicableApplicationTypes}
                onChange={(e) => setWfForm({ ...wfForm, applicableApplicationTypes: e.target.value })}
                placeholder="e.g. New Technical Institution, EoA"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Version</label>
              <input
                type="text"
                value={wfForm.version}
                onChange={(e) => setWfForm({ ...wfForm, version: e.target.value })}
                placeholder="2026.1.0"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={wfForm.description}
              onChange={(e) => setWfForm({ ...wfForm, description: e.target.value })}
              placeholder="Regulatory description and scope of this workflow template..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          {/* Stages List */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Ordered Stages & SLA Rules ({wfForm.stages.length})
              </label>
              <Button
                variant="outline"
                size="xs"
                icon={Plus}
                onClick={handleAddStage}
              >
                Add Stage
              </Button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {wfForm.stages.map((stage, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col gap-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 font-bold text-slate-400 text-center text-xs">
                      #{idx + 1}
                    </span>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) => handleStageChange(idx, 'name', e.target.value)}
                        placeholder="Stage Name"
                        className="w-full p-1.5 rounded border border-slate-300 text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={stage.code}
                        onChange={(e) => handleStageChange(idx, 'code', e.target.value.toUpperCase())}
                        placeholder="CODE"
                        className="w-full p-1.5 rounded border border-slate-300 font-mono text-xs uppercase"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={stage.targetDays}
                        onChange={(e) => handleStageChange(idx, 'targetDays', Number(e.target.value))}
                        placeholder="Days"
                        className="w-full p-1.5 rounded border border-slate-300 text-xs"
                        title="Target SLA Days"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Trash2}
                        onClick={() => handleRemoveStage(idx)}
                        disabled={wfForm.stages.length <= 2}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 pl-8">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold">Role:</span>
                      <select
                        value={stage.roleAllowed}
                        onChange={(e) => handleStageChange(idx, 'roleAllowed', e.target.value)}
                        className="p-1 rounded border border-slate-300 text-xs bg-white"
                      >
                        <option value="COLLEGE_REP">COLLEGE_REP (Institution)</option>
                        <option value="REGIONAL_OFFICER">REGIONAL_OFFICER (Scrutiny)</option>
                        <option value="EVC_MEMBER">EVC_MEMBER (Inspection)</option>
                        <option value="BUREAU_OFFICER">BUREAU_OFFICER (SAC/SHC Hearing)</option>
                        <option value="ADMIN">ADMIN / EXECUTIVE COUNCIL (Final Decision)</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stage.isMandatory}
                        onChange={(e) => handleStageChange(idx, 'isMandatory', e.target.checked)}
                        className="rounded border-slate-300 text-gov-800"
                      />
                      <span>Mandatory Stage</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Edit Workflow Template */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Approval Workflow Pathway"
        subtitle={`Updating configuration for template: ${wfForm.code}`}
        maxWidth="max-w-3xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSaveEdit}
              isLoading={wfActionLoading}
            >
              Save Configuration
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pathway Name *</label>
            <input
              type="text"
              value={wfForm.name}
              onChange={(e) => setWfForm({ ...wfForm, name: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Applicable Application Types</label>
              <input
                type="text"
                value={wfForm.applicableApplicationTypes}
                onChange={(e) => setWfForm({ ...wfForm, applicableApplicationTypes: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Version (Auto-incremented on update)</label>
              <input
                type="text"
                disabled
                value={wfForm.version}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={wfForm.description}
              onChange={(e) => setWfForm({ ...wfForm, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          {/* Stages List */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Ordered Stages & SLA Rules ({wfForm.stages.length})
              </label>
              <Button
                variant="outline"
                size="xs"
                icon={Plus}
                onClick={handleAddStage}
              >
                Add Stage
              </Button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {wfForm.stages.map((stage, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col gap-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 font-bold text-slate-400 text-center text-xs">
                      #{idx + 1}
                    </span>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) => handleStageChange(idx, 'name', e.target.value)}
                        placeholder="Stage Name"
                        className="w-full p-1.5 rounded border border-slate-300 text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={stage.code}
                        onChange={(e) => handleStageChange(idx, 'code', e.target.value.toUpperCase())}
                        placeholder="CODE"
                        className="w-full p-1.5 rounded border border-slate-300 font-mono text-xs uppercase"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={stage.targetDays}
                        onChange={(e) => handleStageChange(idx, 'targetDays', Number(e.target.value))}
                        placeholder="Days"
                        className="w-full p-1.5 rounded border border-slate-300 text-xs"
                        title="Target SLA Days"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Trash2}
                        onClick={() => handleRemoveStage(idx)}
                        disabled={wfForm.stages.length <= 2}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 pl-8">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold">Role:</span>
                      <select
                        value={stage.roleAllowed}
                        onChange={(e) => handleStageChange(idx, 'roleAllowed', e.target.value)}
                        className="p-1 rounded border border-slate-300 text-xs bg-white"
                      >
                        <option value="COLLEGE_REP">COLLEGE_REP (Institution)</option>
                        <option value="REGIONAL_OFFICER">REGIONAL_OFFICER (Scrutiny)</option>
                        <option value="EVC_MEMBER">EVC_MEMBER (Inspection)</option>
                        <option value="BUREAU_OFFICER">BUREAU_OFFICER (SAC/SHC Hearing)</option>
                        <option value="ADMIN">ADMIN / EXECUTIVE COUNCIL (Final Decision)</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stage.isMandatory}
                        onChange={(e) => handleStageChange(idx, 'isMandatory', e.target.checked)}
                        className="rounded border-slate-300 text-gov-800"
                      />
                      <span>Mandatory Stage</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
