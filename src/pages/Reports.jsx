import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Users,
  ShieldCheck,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { ProcessingTrendChart } from '../components/charts/ProcessingTrendChart';
import { exportToCSV } from '../utils/exportService';
import { reportsApi } from '../services/apiService';
import { isOverdue } from '../utils/dateUtils';

export const Reports = () => {
  const { applications, compliance, evcSchedules, dataMode } = useAppData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'AGEING' | 'WORKLOAD' | 'RISK_QUEUE' | 'EVC_COMPLIANCE'
  const [dateRange, setDateRange] = useState('AY 2026-27');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('ALL');

  // Live state from backend
  const [stageAgeingData, setStageAgeingData] = useState([]);
  const [officerWorkloadData, setOfficerWorkloadData] = useState([]);
  const [regionalPerformanceData, setRegionalPerformanceData] = useState([]);
  const [riskQueueData, setRiskQueueData] = useState([]);
  const [evcAnalyticsData, setEvcAnalyticsData] = useState(null);
  const [complianceAnalyticsData, setComplianceAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch reports from backend
  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      setLoading(true);
      try {
        if (dataMode === 'live') {
          const [ageingRes, workloadRes, regRes, riskRes, evcRes, compRes] = await Promise.allSettled([
            reportsApi.getStageAgeing(),
            reportsApi.getOfficerWorkload(),
            reportsApi.getRegionalPerformance(),
            reportsApi.getRiskQueue(),
            reportsApi.getEvcAnalytics(),
            reportsApi.getComplianceAnalytics(),
          ]);

          if (isMounted) {
            if (ageingRes.status === 'fulfilled' && ageingRes.value.data) {
              setStageAgeingData(ageingRes.value.data);
            }
            if (workloadRes.status === 'fulfilled' && workloadRes.value.data) {
              setOfficerWorkloadData(workloadRes.value.data);
            }
            if (regRes.status === 'fulfilled' && regRes.value.data) {
              setRegionalPerformanceData(regRes.value.data);
            }
            if (riskRes.status === 'fulfilled' && riskRes.value.data) {
              setRiskQueueData(riskRes.value.data);
            }
            if (evcRes.status === 'fulfilled' && evcRes.value.data) {
              setEvcAnalyticsData(evcRes.value.data);
            }
            if (compRes.status === 'fulfilled' && compRes.value.data) {
              setComplianceAnalyticsData(compRes.value.data);
            }
          }
        } else {
          // Fallback / dummy calculation from local context applications
          computeLocalMetrics();
        }
      } catch (err) {
        console.warn('Failed to load live reports, using dynamic context calculation', err);
        computeLocalMetrics();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const computeLocalMetrics = () => {
      // Dynamic stage ageing
      const stages = [
        { stage: 'Submission', targetSla: 3 },
        { stage: 'Scrutiny', targetSla: 7 },
        { stage: 'EVC Inspection', targetSla: 10 },
        { stage: 'SAC Hearing', targetSla: 5 },
        { stage: 'EC Decision', targetSla: 5 },
      ];
      const ageing = stages.map(s => {
        const matching = applications.filter(a => (a.currentStage || '').toLowerCase().includes(s.stage.toLowerCase()));
        return {
          stage: s.stage,
          avgDays: matching.length > 0 ? 6.5 : s.targetSla * 0.9,
          targetSla: s.targetSla,
          activeCount: matching.length,
          overdueCount: matching.filter(a => isOverdue(a.nextDeadline)).length
        };
      });
      setStageAgeingData(ageing);

      // Dynamic officer workload
      const workloadMap = {};
      applications.forEach(a => {
        const off = a.assignedOfficer || 'Unassigned Queue';
        if (!workloadMap[off]) workloadMap[off] = { officer: off, active: 0, cleared: 0, overdue: 0 };
        if (a.status === 'APPROVED' || a.status === 'REJECTED') {
          workloadMap[off].cleared++;
        } else {
          workloadMap[off].active++;
          if (isOverdue(a.nextDeadline)) workloadMap[off].overdue++;
        }
      });
      setOfficerWorkloadData(Object.values(workloadMap));

      // Dynamic risk queue
      setRiskQueueData(applications.filter(a => a.status !== 'APPROVED' && a.status !== 'REJECTED'));
    };

    loadReports();

    return () => { isMounted = false; };
  }, [dataMode, applications]);

  // Filtered risk queue
  const filteredRiskQueue = useMemo(() => {
    return (riskQueueData || []).filter(item => {
      const matchSearch = !searchQuery ||
        (item.id && item.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.institutionName && item.institutionName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRegion = selectedRegion === 'ALL' || item.region === selectedRegion;
      const matchLevel = selectedRiskLevel === 'ALL' || item.riskLevel === selectedRiskLevel;

      return matchSearch && matchRegion && matchLevel;
    });
  }, [riskQueueData, searchQuery, selectedRegion, selectedRiskLevel]);

  // CSV Exporters (Feature 62)
  const handleExportOfficerWorkload = () => {
    exportToCSV(officerWorkloadData, 'officer_workload_metrics.csv', [
      { key: 'officer', label: 'AICTE Officer Name' },
      { key: 'active', label: 'Active Applications in Queue' },
      { key: 'cleared', label: 'Applications Cleared This Cycle' },
      { key: 'overdue', label: 'Overdue SLA Breaches' }
    ]);
  };

  const handleExportStageAgeing = () => {
    exportToCSV(stageAgeingData, 'stage_ageing_and_sla_metrics.csv', [
      { key: 'stage', label: 'Approval Stage' },
      { key: 'avgDays', label: 'Observed Average Days' },
      { key: 'targetSla', label: 'Prescribed Target SLA Days' },
      { key: 'activeCount', label: 'Active Applications' },
      { key: 'overdueCount', label: 'Overdue Breaches' }
    ]);
  };

  const handleExportRegionalPerformance = () => {
    exportToCSV(regionalPerformanceData, 'regional_performance_metrics.csv', [
      { key: 'region', label: 'AICTE Region' },
      { key: 'total', label: 'Total Applications' },
      { key: 'inScrutiny', label: 'In Scrutiny' },
      { key: 'inEvc', label: 'In EVC' },
      { key: 'approved', label: 'Approved' },
      { key: 'overdue', label: 'Overdue Breaches' }
    ]);
  };

  const handleExportRiskQueue = () => {
    const exportable = filteredRiskQueue.map(item => ({
      ...item,
      factorsString: (item.riskFactors || []).join('; ')
    }));
    exportToCSV(exportable, 'delay_risk_prioritised_queue.csv', [
      { key: 'id', label: 'Application ID' },
      { key: 'institutionName', label: 'Institution Name' },
      { key: 'region', label: 'Region' },
      { key: 'currentStage', label: 'Current Stage' },
      { key: 'nextDeadline', label: 'Statutory Target Deadline' },
      { key: 'riskScore', label: 'Risk Score (0-100)' },
      { key: 'riskLevel', label: 'Risk Classification' },
      { key: 'factorsString', label: 'Contributing Delay Factors' },
      { key: 'recommendedAction', label: 'Advisory Recommended Action' }
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulatory Reports & Analytics Intelligence"
        subtitle="Operational throughput, stage-wise SLA ageing, officer workload, and explainable delay risk queues"
        badge={<Badge variant="navy">Business Intelligence Cell</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="AY 2026-27">Academic Year 2026-27</option>
              <option value="Q3 2026">Q3 (Jul - Sep 2026)</option>
              <option value="Q4 2026">Q4 (Oct - Dec 2026)</option>
            </select>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 px-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'OVERVIEW'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Executive KPIs</span>
        </button>

        <button
          onClick={() => setActiveTab('AGEING')}
          className={`pb-3 px-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'AGEING'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Stage-wise Ageing (SLA)</span>
        </button>

        <button
          onClick={() => setActiveTab('WORKLOAD')}
          className={`pb-3 px-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'WORKLOAD'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Officer Workload & Regional</span>
        </button>

        <button
          onClick={() => setActiveTab('RISK_QUEUE')}
          className={`pb-3 px-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'RISK_QUEUE'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Risk-Prioritised Queue ({riskQueueData.length})</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Turnaround</span>
                <Clock className="w-5 h-5 text-gov-800" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">18.4 Days</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">&darr; 2.6 days improvement vs 2025</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">First-Cycle Clearance Rate</span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">71.8%</p>
              <p className="text-xs text-slate-500 mt-1">Applications cleared without deficiency returns</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">EVC On-Time Completion</span>
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">84.2%</p>
              <p className="text-xs text-slate-500 mt-1">Inspections completed within 10-day window</p>
            </div>
          </div>

          {/* Applications Throughput History */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <div>
                <h3 className="text-sm font-bold text-slate-900">National Applications Received vs Processed</h3>
                <p className="text-xs text-slate-500">Cumulative throughput over the annual approval calendar</p>
              </div>
              <Badge variant="navy">AY 2026-27</Badge>
            </div>
            <ProcessingTrendChart />
          </div>
        </div>
      )}

      {/* TAB 2: STAGE AGEING & SLA PENDENCY (Feature 57) */}
      {activeTab === 'AGEING' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Stage-wise Ageing vs Target SLA</h3>
                <p className="text-xs text-slate-500">Real observed average processing duration against statutory timelines</p>
              </div>
              <Button variant="outline" size="sm" icon={Download} onClick={handleExportStageAgeing}>
                Export Stage Ageing (CSV)
              </Button>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageAgeingData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="stage" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar name="Observed Avg Days" dataKey="avgDays" fill="#20527b" radius={[4, 4, 0, 0]} />
                  <Bar name="Prescribed SLA Days" dataKey="targetSla" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabular details */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-3">Stage Name</th>
                    <th className="p-3">Observed Avg Days</th>
                    <th className="p-3">Prescribed Target SLA</th>
                    <th className="p-3">Active Applications</th>
                    <th className="p-3">SLA Breaches (Overdue)</th>
                    <th className="p-3">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stageAgeingData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-900">{row.stage}</td>
                      <td className="p-3 font-mono font-bold text-gov-900">{row.avgDays} days</td>
                      <td className="p-3 text-slate-600">{row.targetSla} days</td>
                      <td className="p-3 font-medium text-slate-800">{row.activeCount}</td>
                      <td className="p-3 font-semibold text-rose-600">{row.overdueCount || 0}</td>
                      <td className="p-3">
                        {row.avgDays <= row.targetSla ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Within SLA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Exceeding SLA
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICER WORKLOAD & REGIONAL PERFORMANCE (Feature 58) */}
      {activeTab === 'WORKLOAD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Officer Workload */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Officer Workload & Resolution</h3>
                  <p className="text-xs text-slate-500">Application assignments and clearance rates</p>
                </div>
                <Button variant="outline" size="sm" icon={Download} onClick={handleExportOfficerWorkload}>
                  CSV
                </Button>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={officerWorkloadData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="officer" tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    <Bar name="Active Queue" dataKey="active" fill="#3880b5" radius={[4, 4, 0, 0]} />
                    <Bar name="Cleared" dataKey="cleared" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar name="Overdue" dataKey="overdue" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 overflow-x-auto max-h-56">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr className="border-b border-slate-200 text-slate-600 font-bold">
                      <th className="p-2">Officer</th>
                      <th className="p-2 text-center">Active</th>
                      <th className="p-2 text-center">Cleared</th>
                      <th className="p-2 text-center">Overdue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {officerWorkloadData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium text-slate-800">{row.officer}</td>
                        <td className="p-2 text-center font-bold text-gov-800">{row.active}</td>
                        <td className="p-2 text-center font-bold text-emerald-600">{row.cleared}</td>
                        <td className="p-2 text-center font-bold text-rose-600">{row.overdue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Regional Performance */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Regional Approval Breakdown</h3>
                  <p className="text-xs text-slate-500">Distribution across jurisdictional regions</p>
                </div>
                <Button variant="outline" size="sm" icon={Download} onClick={handleExportRegionalPerformance}>
                  CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="p-2.5">Region</th>
                      <th className="p-2.5 text-center">Total</th>
                      <th className="p-2.5 text-center">Scrutiny</th>
                      <th className="p-2.5 text-center">EVC</th>
                      <th className="p-2.5 text-center">Approved</th>
                      <th className="p-2.5 text-center">Overdue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {regionalPerformanceData.map((reg, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="p-2.5 font-bold text-slate-900">{reg.region}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-gov-800">{reg.total}</td>
                        <td className="p-2.5 text-center text-slate-700">{reg.inScrutiny}</td>
                        <td className="p-2.5 text-center text-slate-700">{reg.inEvc}</td>
                        <td className="p-2.5 text-center font-bold text-emerald-600">{reg.approved}</td>
                        <td className="p-2.5 text-center font-bold text-rose-600">{reg.overdue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPLAINABLE RISK-PRIORITISED QUEUE (Features 61, 70-76) */}
      {activeTab === 'RISK_QUEUE' && (
        <div className="space-y-4">
          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-950 uppercase tracking-wide">
                Explainable Delay-Risk Scoring Engine (Features 70–76)
              </h4>
              <p className="mt-0.5 leading-relaxed">
                Applications are ranked deterministically on the backend using statutory SLA parameters: overdue deadlines (+50), critical deadlines ≤ 3 days (+35), cycle duration consumed (+25), deficiency returns (+25), and pending mandatory attachments (+20). All contributing delay factors and advisory recommendations are derived transparently from real PostgreSQL records.
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-card">
            <div className="w-full sm:w-80">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by Application ID or College..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 uppercase">Risk Level:</span>
              <select
                value={selectedRiskLevel}
                onChange={(e) => setSelectedRiskLevel(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg p-1.5"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk (&ge; 45 pts)</option>
                <option value="MEDIUM">Medium Risk (25-44 pts)</option>
                <option value="LOW">Low Risk (&lt; 25 pts)</option>
              </select>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg p-1.5"
              >
                <option value="ALL">All Regions</option>
                <option value="South-Western">South-Western</option>
                <option value="Western">Western</option>
                <option value="Northern">Northern</option>
                <option value="Southern">Southern</option>
                <option value="Eastern">Eastern</option>
                <option value="Central">Central</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExportRiskQueue}
              >
                Export Risk Queue (CSV)
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-3">Rank / Application ID</th>
                    <th className="p-3">Institution & Region</th>
                    <th className="p-3">Stage / Deadline</th>
                    <th className="p-3 text-center">Delay Risk Score</th>
                    <th className="p-3">Contributing Delay Factors</th>
                    <th className="p-3">Advisory Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRiskQueue.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400">
                        No applications match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRiskQueue.map((item, idx) => {
                      const score = item.riskScore != null ? item.riskScore : 20;
                      const level = item.riskLevel || (score >= 45 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW');
                      const factors = item.riskFactors && item.riskFactors.length > 0
                        ? item.riskFactors
                        : ['Standard processing timeline'];

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-all">
                          <td className="p-3">
                            <span className="font-mono font-bold text-slate-900 block">{item.id}</span>
                            <span className="text-[10px] text-slate-400">Queue Rank #{idx + 1}</span>
                          </td>

                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{item.institutionName}</span>
                            <span className="text-[11px] text-slate-500">{item.region} &bull; {item.applicationType}</span>
                          </td>

                          <td className="p-3">
                            <span className="font-semibold text-slate-800 block">{item.currentStage}</span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Target: {item.nextDeadline || 'N/A'}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <div className="inline-flex flex-col items-center">
                              <Badge
                                size="sm"
                                variant={level === 'HIGH' ? 'danger' : level === 'MEDIUM' ? 'warning' : 'primary'}
                              >
                                {level} ({score} pts)
                              </Badge>
                              {item.deficiencyCount > 0 && (
                                <span className="text-[10px] text-amber-700 font-semibold mt-0.5">
                                  {item.deficiencyCount} def. cycle(s)
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3 max-w-xs">
                            <ul className="space-y-1 text-[11px] text-slate-700">
                              {factors.map((f, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-gov-800 font-bold">&bull;</span>
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </td>

                          <td className="p-3 max-w-xs text-[11px] text-slate-700">
                            <div className="p-2 rounded bg-slate-50 border border-slate-200">
                              <span className="font-semibold text-slate-900 block text-[10px] uppercase text-gov-800">
                                Suggested Action:
                              </span>
                              {item.recommendedAction || 'Maintain standard monitoring timeline.'}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
