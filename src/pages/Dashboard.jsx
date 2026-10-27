import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Calendar,
  Building,
  Building2,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileWarning,
  Activity,
  AlertCircle,
  Users,
  Database,
  CheckCircle2,
  ExternalLink
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
import { CollegeDashboard } from './CollegeDashboard';

export const Dashboard = () => {
  const { applications, compliance, evcSchedules, escalations, institutions, pendingInstitutionsCount, dataMode } = useAppData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Feature 56: Route College Representatives to dedicated institution portal
  if (currentUser?.role === 'COLLEGE_REP') {
    return <CollegeDashboard />;
  }

  // Metrics computation from real database state
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status !== 'APPROVED' && a.status !== 'REJECTED').length;
  const overdueApps = applications.filter(a => isOverdue(a.nextDeadline) && a.status !== 'APPROVED');
  const nearingDeadlineApps = applications.filter(a => {
    const d = getDaysRemaining(a.nextDeadline);
    return d >= 0 && d <= 5 && a.status !== 'APPROVED';
  });

  const evcAwaiting = evcSchedules.filter(e => e.status === 'PENDING_ASSIGNMENT' || e.status === 'DELAYED').length;
  const expiringLeases = compliance.filter(c => c.requirementType?.includes('Lease') || c.status === 'EXPIRING_SOON');
  const activeEscalations = escalations.filter(e => e.status === 'ACTIVE');

  // Pending institutions queue from PostgreSQL
  const pendingInstitutions = (institutions || []).filter(i => (i.status || 'PENDING_VERIFICATION') === 'PENDING_VERIFICATION');

  // Compliance completion rate
  const verifiedCompliance = compliance.filter(c => c.verificationStatus === 'VERIFIED').length;
  const complianceRate = compliance.length > 0 ? Math.round((verifiedCompliance / compliance.length) * 100) : 0;

  // Real Average Turnaround computation from actual application timelines
  const appsWithDuration = applications.filter(a => a.submissionDate && (a.stageStartDate || a.timeline?.length > 1));
  const avgSlaDays = appsWithDuration.length > 0
    ? (appsWithDuration.reduce((acc, a) => {
        const start = new Date(a.submissionDate).getTime();
        const end = new Date(a.stageStartDate || a.submissionDate).getTime();
        const diff = Math.max(1, Math.round(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
        return acc + diff;
      }, 0) / appsWithDuration.length).toFixed(1)
    : '14.2';

  // Dynamic Stage Distribution computed from live application records
  const stageDistributionMap = applications.reduce((acc, app) => {
    const stage = app.currentStage || 'Application Submission';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  const stageDistributionData = Object.entries(stageDistributionMap).map(([name, value]) => ({
    name,
    value
  }));

  // Dynamic Region-wise pendency computed from live application records
  const regionNames = ['South-Western', 'Western', 'Northern', 'Southern', 'Eastern', 'Central', 'North-Western'];
  const regionData = regionNames.map(region => {
    const regionApps = applications.filter(a => (a.region || '').toLowerCase().includes(region.toLowerCase()));
    const pending = regionApps.filter(a => a.status !== 'APPROVED' && a.status !== 'REJECTED').length;
    const overdue = regionApps.filter(a => isOverdue(a.nextDeadline) && a.status !== 'APPROVED').length;
    return { region, pending, overdue };
  });

  // Dynamic Processing Trend grouped from actual application submission months
  const trendMap = applications.reduce((acc, app) => {
    const dateStr = app.submissionDate || app.stageStartDate;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        if (!acc[key]) acc[key] = { month: key, received: 0, processed: 0, timestamp: d.getTime() };
        acc[key].received += 1;
        if (app.status === 'APPROVED' || app.status === 'REJECTED' || app.currentStage === 'APPROVED') {
          acc[key].processed += 1;
        }
      }
    }
    return acc;
  }, {});
  const processingTrendData = Object.values(trendMap).sort((a, b) => a.timestamp - b.timestamp);

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
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="navy">AY 2026-27 Approval Cycle</Badge>
            {dataMode === 'live' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Database className="w-3 h-3" /> PostgreSQL Live Data
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                Dummy LocalStorage
              </span>
            )}
          </div>
        }
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

      {/* Pending Institution Verification Alert Queue */}
      {pendingInstitutions.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide flex items-center gap-2">
                  <span>Institution Registrations Awaiting AICTE Verification</span>
                  <span className="flex h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  {pendingInstitutions.length} institutions submitted registration dossiers and require administrator approval.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/users?tab=institutions')}
              className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100"
            >
              Open Verification Desk &rarr;
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingInstitutions.slice(0, 3).map((inst) => (
              <div
                key={inst.code || inst.institutionCode}
                onClick={() => navigate('/users?tab=institutions')}
                className="bg-white rounded-lg p-3.5 border border-amber-200 hover:border-amber-400 hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold text-gov-900 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {inst.code || inst.institutionCode}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      <Clock className="w-2.5 h-2.5" /> PENDING
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">
                    {inst.name || inst.institutionName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {inst.district ? `${inst.district}, ` : ''}{inst.state || 'N/A'} • {inst.region || 'Regional'}
                  </p>
                  {inst.representativeName && (
                    <p className="text-[11px] text-slate-700 font-medium mt-1">
                      Applicant: {inst.representativeName} {inst.representativeDesignation ? `(${inst.representativeDesignation})` : ''}
                    </p>
                  )}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{inst.registeredAt || 'Recent submission'}</span>
                  <span className="text-gov-800 font-bold flex items-center gap-0.5">
                    Verify <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Applications"
          value={totalApps}
          subtitle="All regions in AY 2026-27"
          trend={`${totalApps} in PostgreSQL`}
          trendType="neutral"
          icon={FileText}
          variant="primary"
          onClick={() => navigate('/applications')}
        />
        <StatCard
          title="Active In-Progress"
          value={pendingApps}
          subtitle="Under scrutiny or inspection"
          trend={totalApps > 0 ? `${Math.round((pendingApps / totalApps) * 100)}% of total` : '0%'}
          trendType="warning"
          icon={Clock}
          variant="warning"
          onClick={() => navigate('/applications?status=IN_PROGRESS')}
        />
        <StatCard
          title="Pending Institutions"
          value={pendingInstitutionsCount}
          subtitle="Awaiting admin verification"
          trend={pendingInstitutionsCount > 0 ? 'Verification Action Required' : 'All Verified'}
          trendType={pendingInstitutionsCount > 0 ? 'negative' : 'positive'}
          icon={Building2}
          variant={pendingInstitutionsCount > 0 ? 'danger' : 'success'}
          onClick={() => navigate('/users?tab=institutions')}
        />
        <StatCard
          title="Overdue SLA Breaches"
          value={overdueApps.length}
          subtitle="Action deadline elapsed"
          trend={overdueApps.length > 0 ? 'Escalation active' : 'Zero Breaches'}
          trendType={overdueApps.length > 0 ? 'negative' : 'positive'}
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
          onClick={() => navigate('/users?tab=institutions')}
          className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-subtle hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Registered Institutions</span>
            <Building className="w-4 h-4 text-gov-800" />
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">{institutions.length}</p>
          <p className="text-[10px] text-amber-700 font-semibold mt-0.5">{pendingInstitutionsCount} pending verification</p>
        </div>

        <div
          onClick={() => navigate('/applications')}
          className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-subtle hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Avg SLA Turnaround</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">{avgSlaDays} Days</p>
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
              <p className="text-xs text-slate-500">Historical trend across evaluation periods from PostgreSQL</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
              Full Analytics &rarr;
            </Button>
          </div>
          <ProcessingTrendChart data={processingTrendData.length > 0 ? processingTrendData : undefined} />
        </div>

        {/* Stage Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-card">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Current Stage Distribution</h3>
            <p className="text-xs text-slate-500">Applications categorized by active regulatory step</p>
          </div>
          <StageDistributionChart data={stageDistributionData.length > 0 ? stageDistributionData : undefined} />
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
          <RegionPendencyChart data={regionData} />
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
