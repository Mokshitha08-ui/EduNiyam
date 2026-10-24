import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Users,
  ShieldCheck,
  Clock,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAppData } from '../context/AppDataContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProcessingTrendChart } from '../components/charts/ProcessingTrendChart';
import { exportToCSV } from '../utils/exportService';

const OFFICER_WORKLOAD_DATA = [
  { officer: 'Dr. Suresh Nair', active: 14, cleared: 28, overdue: 3 },
  { officer: 'Dr. Rajesh Sharma', active: 18, cleared: 35, overdue: 4 },
  { officer: 'Smt. Priya Varma', active: 22, cleared: 41, overdue: 2 },
  { officer: 'Prof. Ananya Sen', active: 9, cleared: 19, overdue: 1 },
];

const STAGE_AGEING_DATA = [
  { stage: 'Submission', avgDays: 2.1, targetSla: 3 },
  { stage: 'Scrutiny', avgDays: 8.4, targetSla: 7 },
  { stage: 'EVC Inspection', avgDays: 12.2, targetSla: 10 },
  { stage: 'SAC Hearing', avgDays: 4.8, targetSla: 5 },
  { stage: 'EC Decision', avgDays: 3.9, targetSla: 5 },
];

export const Reports = () => {
  const { applications, compliance, evcSchedules } = useAppData();

  const [dateRange, setDateRange] = useState('AY 2026-27');
  const [reportCategory, setReportCategory] = useState('ALL');

  const handleExportOfficerWorkload = () => {
    exportToCSV(OFFICER_WORKLOAD_DATA, 'officer_workload_metrics.csv', [
      { key: 'officer', label: 'AICTE Officer Name' },
      { key: 'active', label: 'Active Applications in Queue' },
      { key: 'cleared', label: 'Applications Cleared This Cycle' },
      { key: 'overdue', label: 'Overdue SLA Breaches' }
    ]);
  };

  const handleExportStageAgeing = () => {
    exportToCSV(STAGE_AGEING_DATA, 'stage_ageing_and_sla_metrics.csv', [
      { key: 'stage', label: 'Approval Stage' },
      { key: 'avgDays', label: 'Observed Average Days' },
      { key: 'targetSla', label: 'Prescribed Target SLA Days' }
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulatory Reports & Analytics Intelligence"
        subtitle="Operational throughput, stage-wise SLA ageing, and institutional compliance trends"
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Ageing vs SLA Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stage-wise Ageing vs Target SLA</h3>
              <p className="text-xs text-slate-500">Identifies where regulatory delays concentrate</p>
            </div>
            <Button variant="outline" size="sm" icon={Download} onClick={handleExportStageAgeing}>
              CSV
            </Button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STAGE_AGEING_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
        </div>

        {/* Officer Workload Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Officer Workload & Resolution Metrics</h3>
              <p className="text-xs text-slate-500">Scrutiny queue balancing across assigned officers</p>
            </div>
            <Button variant="outline" size="sm" icon={Download} onClick={handleExportOfficerWorkload}>
              CSV
            </Button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={OFFICER_WORKLOAD_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="officer" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar name="Active in Queue" dataKey="active" fill="#3880b5" radius={[4, 4, 0, 0]} />
                <Bar name="Cleared Cases" dataKey="cleared" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Overdue Breaches" dataKey="overdue" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
  );
};
