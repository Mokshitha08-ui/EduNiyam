import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Calendar,
  Building,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileWarning,
  Activity,
  AlertCircle,
  Users
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { ProcessingTrendChart } from '../components/charts/ProcessingTrendChart';
import { StageDistributionChart } from '../components/charts/StageDistributionChart';
import { RegionPendencyChart } from '../components/charts/RegionPendencyChart';
import { isOverdue, getDaysRemaining, formatDate } from '../utils/dateUtils';
import { calculateRiskScore } from '../utils/riskScoring';

export const Dashboard = () => {
  const { applications, compliance, evcSchedules, escalations } = useAppData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Metrics computation
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status !== 'APPROVED' && a.status !== 'REJECTED').length;
  const overdueApps = applications.filter(a => isOverdue(a.nextDeadline) && a.status !== 'APPROVED');
  const nearingDeadlineApps = applications.filter(a => {
    const d = getDaysRemaining(a.nextDeadline);
    return d >= 0 && d <= 5 && a.status !== 'APPROVED';
  });

  const evcAwaiting = evcSchedules.filter(e => e.status === 'PENDING_ASSIGNMENT' || e.status === 'DELAYED').length;
  const expiringLeases = compliance.filter(c => c.requirementType.includes('Lease') || c.status === 'EXPIRING_SOON');
  const activeEscalations = escalations.filter(e => e.status === 'ACTIVE');

  // Compliance completion rate
  const verifiedCompliance = compliance.filter(c => c.verificationStatus === 'VERIFIED').length;
  const complianceRate = compliance.length > 0 ? Math.round((verifiedCompliance / compliance.length) * 100) : 0;

  // Urgent cases requiring immediate officer follow-up
  const urgentCases = applications
    .map(app => ({ app, risk: calculateRiskScore(app) }))
    .filter(({ risk, app }) => (risk.level === 'HIGH' || isOverdue(app.nextDeadline)) && app.status !== 'APPROVED')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="AICTE Institutional Approval Dashboard"
        subtitle={`Welcome, ${currentUser?.name} | Centralized Scrutiny, EVC Monitoring & Alert Management`}
        badge={<Badge variant="navy">AY 2026-27 Approval Cycle</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={() => navigate('/applications')}
            >
              View All Applications
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={AlertTriangle}
              onClick={() => navigate('/notifications')}
            >
              View {activeEscalations.length} Escalations
            </Button>
          </div>
        }
      />

      {/* Urgent Action Panel */}
      {urgentCases.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-rose-200/80">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-600 animate-pulse" />
              <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wide">
                Urgent Action Required (Immediate Follow-up Queue)
              </h3>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              {urgentCases.length} Critical Items
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentCases.map(({ app, risk }) => (
              <div
                key={app.id}
                onClick={() => navigate(`/applications/${app.id}`)}
                className="bg-white rounded-lg p-3.5 border border-rose-200 hover:border-rose-400 hover:shadow-subtle transition-all cursor-pointer flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{app.id}</span>
                    <Badge size="sm" variant="danger">{risk.level} RISK</Badge>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">{app.institutionName}</h4>
                  <p className="text-[11px] text-rose-700 mt-0.5 font-medium line-clamp-1">
                    {risk.reasons[0] || 'Target deadline elapsed'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Stage: <span className="font-semibold">{app.currentStage}</span> &bull; Assigned: {app.assignedOfficer}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={totalApps}
          subtitle="All regions in AY 2026-27"
          trend="+18% YoY"
          trendType="neutral"
          icon={FileText}
          variant="primary"
          onClick={() => navigate('/applications')}
        />
        <StatCard
          title="Active In-Progress"
          value={pendingApps}
          subtitle="Under scrutiny or inspection"
          trend={`${Math.round((pendingApps / totalApps) * 100)}% of total`}
          trendType="warning"
          icon={Clock}
          variant="warning"
          onClick={() => navigate('/applications?status=IN_PROGRESS')}
        />
        <StatCard
          title="Overdue SLA Breaches"
          value={overdueApps.length}
          subtitle="Action deadline elapsed"
          trend="Escalation active"
          trendType="negative"
          icon={AlertTriangle}
          variant="danger"
          onClick={() => navigate('/applications?status=OVERDUE')}
        />
        <StatCard
          title="Compliance Verified"
          value={`${complianceRate}%`}
          subtitle={`${verifiedCompliance} of ${compliance.length} certificates valid`}
          trend="Statutory Norms"
          trendType="positive"
          icon={ShieldCheck}
          variant="success"
          onClick={() => navigate('/compliance')}
        />
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => navigate('/evc')}
          className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-subtle hover:border-gov-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">EVC Scheduling Queue</span>
            <Calendar className="w-4 h-4 text-gov-700" />
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">{evcAwaiting}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Visits pending or delayed</p>
        </div>

        <div
          onClick={() => navigate('/compliance')}
          className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-subtle hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Expiring Leases</span>
            <Building className="w-4 h-4 text-amber-600" />
          </div>
          <p className="mt-1 text-xl font-bold text-amber-600">{expiringLeases.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Under 30 days remaining</p>
        </div>

        <div
          onClick={() => navigate('/applications')}
          className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-subtle hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Avg SLA Turnaround</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">18.4 Days</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Target SLA: 21 Days</p>
        </div>

        <div
          onClick={() => navigate('/notifications')}
          className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-subtle hover:border-rose-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Escalations</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="mt-1 text-xl font-bold text-rose-600">{activeEscalations.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Level 1 & 2 alerts</p>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Processing Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Applications Received vs Processed</h3>
              <p className="text-xs text-slate-500">Historical trend across previous 6 evaluation periods</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
              Full Analytics &rarr;
            </Button>
          </div>
          <ProcessingTrendChart />
        </div>

        {/* Stage Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-card">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Current Stage Distribution</h3>
            <p className="text-xs text-slate-500">Applications categorized by active regulatory step</p>
          </div>
          <StageDistributionChart />
        </div>
      </div>

      {/* Region-wise Pendency & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Region Pendency Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Region-wise Application Pendency</h3>
              <p className="text-xs text-slate-500">Workload and overdue cases across AICTE regional jurisdictions</p>
            </div>
            <Badge variant="navy">7 Regional Offices</Badge>
          </div>
          <RegionPendencyChart />
        </div>

        {/* Recent Application Movements */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Recent Application Movements</h3>
              <span className="text-[11px] text-slate-400 font-medium">Live Feed</span>
            </div>
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  className="group p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gov-800">{app.id}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-slate-800 font-medium mt-1 truncate">{app.institutionName}</p>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Stage: {app.currentStage}</span>
                    <span>{formatDate(app.stageStartDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate('/workflows')}
              className="text-xs font-semibold text-gov-800 hover:text-gov-900 flex items-center justify-center gap-1 mx-auto"
            >
              Open Workflow Kanban Board <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
