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
  ExternalLink
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DataModeToggle } from '../components/common/DataModeToggle';
import { healthApi } from '../services/apiService';

export const Settings = () => {
  const { workflows, resetDemoData, dataMode, backendUrl, retryLiveFetch, isLiveLoading, liveError } = useAppData();
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
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>Configurable Pathways:</strong> AICTE approval pathways are configured as structured data models allowing dynamic stage sequencing for Scrutiny, EVC, and SAC hearings.
          </div>

          <div className="grid grid-cols-1 gap-4">
            {workflows.map(wf => (
              <div key={wf.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{wf.name}</h3>
                    <p className="text-xs text-slate-500">{wf.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">Ver: {wf.version}</span>
                    <Badge size="sm" variant="navy">{wf.code}</Badge>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Stage Sequence & SLAs:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
                    {wf.stages.map((stg, i) => (
                      <div key={stg.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-[10px] text-slate-400 font-bold block">0{i+1}. {stg.code}</span>
                        <span className="font-semibold text-slate-800">{stg.name}</span>
                        <div className="mt-1 text-[11px] text-gov-800 font-bold">
                          SLA: {stg.targetDays} days
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
    </div>
  );
};
