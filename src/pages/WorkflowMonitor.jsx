import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Kanban,
  Table as TableIcon,
  AlertTriangle,
  Clock,
  Filter,
  Settings,
  ChevronRight,
  ArrowRight,
  Building,
  User
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { WORKFLOW_STAGE_NAMES } from '../data/mockWorkflows';
import { formatDate, getDaysElapsed, getDaysRemaining, isOverdue } from '../utils/dateUtils';
import { calculateRiskScore } from '../utils/riskScoring';

export const WorkflowMonitor = () => {
  const { applications, workflows } = useAppData();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [selectedWorkflow, setSelectedWorkflow] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  // Stages to show on Kanban
  const kanbanStages = [
    { code: 'SUBMISSION', label: '1. Submission Queue', color: 'border-slate-300' },
    { code: 'SCRUTINY', label: '2. Document Scrutiny', color: 'border-blue-400' },
    { code: 'EVC', label: '3. EVC Inspection', color: 'border-amber-400' },
    { code: 'SAC_SHC', label: '4. SAC / Hearing', color: 'border-purple-400' },
    { code: 'FINAL_APPROVAL', label: '5. Executive Approval', color: 'border-emerald-500' },
  ];

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchWf = selectedWorkflow === 'ALL' || app.workflowId === selectedWorkflow;
      const matchReg = selectedRegion === 'ALL' || app.region === selectedRegion;
      const matchUnassigned = !showUnassignedOnly || (!app.assignedOfficerId && (!app.assignedOfficer || app.assignedOfficer.includes('Unassigned')));
      return matchWf && matchReg && matchUnassigned;
    });
  }, [applications, selectedWorkflow, selectedRegion, showUnassignedOnly]);

  // Bottleneck detection
  const stageStats = useMemo(() => {
    const stats = {};
    kanbanStages.forEach(s => {
      const appsInStage = filteredApps.filter(a => a.currentStage === s.code);
      const overdueCount = appsInStage.filter(a => isOverdue(a.nextDeadline)).length;
      stats[s.code] = {
        count: appsInStage.length,
        overdueCount,
        isBottleneck: appsInStage.length >= 3 || overdueCount >= 2
      };
    });
    return stats;
  }, [filteredApps]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurable Workflow Monitor"
        subtitle="Visual pipeline and bottleneck tracker across statutory AICTE approval pathways"
        badge={<Badge variant="navy">Multi-Pathway Pipeline</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'kanban' ? 'bg-white shadow-subtle text-gov-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" /> Board
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'table' ? 'bg-white shadow-subtle text-gov-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" /> Table
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Settings}
              onClick={() => navigate('/settings')}
            >
              Configure SLA Rules
            </Button>
          </div>
        }
      />

      {/* Filter Toolbar & Bottleneck Alert */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filter Pipeline:</span>
          <select
            value={selectedWorkflow}
            onChange={(e) => setSelectedWorkflow(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-gov-600"
          >
            <option value="ALL">All Configured Workflows</option>
            {workflows.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-gov-600"
          >
            <option value="ALL">All Regions</option>
            <option value="South-Western">South-Western</option>
            <option value="Western">Western</option>
            <option value="Southern">Southern</option>
            <option value="Northern">Northern</option>
            <option value="Eastern">Eastern</option>
            <option value="Central">Central</option>
          </select>

          <button
            type="button"
            onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showUnassignedOnly
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Unassigned Queue
          </button>
        </div>

        {/* Bottleneck Summary */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Active Bottlenecks:</span>
          {Object.entries(stageStats).filter(([_, st]) => st.isBottleneck).length > 0 ? (
            <Badge variant="danger" dot>
              {Object.entries(stageStats).filter(([_, st]) => st.isBottleneck).length} Stages Backlogged
            </Badge>
          ) : (
            <Badge variant="success" dot>Smooth SLA Flow</Badge>
          )}
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kanbanStages.map((stage) => {
            const stageApps = filteredApps.filter(a => a.currentStage === stage.code);
            const stat = stageStats[stage.code];

            return (
              <div
                key={stage.code}
                className={`bg-slate-100/70 rounded-xl border-t-4 border p-3 flex flex-col min-h-[550px] ${
                  stage.color
                } ${stat?.isBottleneck ? 'border-r-2 border-rose-300/80 bg-rose-50/20' : 'border-slate-200'}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{stage.label}</h3>
                    <p className="text-[10px] text-slate-500">
                      {stat?.overdueCount > 0 && (
                        <span className="text-rose-600 font-semibold">{stat.overdueCount} overdue &bull; </span>
                      )}
                      <span>{stageApps.length} active</span>
                    </p>
                  </div>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageApps.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      No applications in stage
                    </div>
                  ) : (
                    stageApps.map((app) => {
                      const risk = calculateRiskScore(app);
                      const overdue = isOverdue(app.nextDeadline);
                      const remaining = getDaysRemaining(app.nextDeadline);

                      return (
                        <div
                          key={app.id}
                          onClick={() => navigate(`/applications/${app.id}`)}
                          className="bg-white rounded-lg p-3 border border-slate-200/90 shadow-subtle hover:border-gov-400 hover:shadow-card transition-all cursor-pointer text-left"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[11px] font-bold text-gov-800">{app.id}</span>
                            <Badge size="sm" variant={risk.badgeColor}>
                              {risk.level}
                            </Badge>
                          </div>

                          <h4 className="text-xs font-semibold text-slate-800 line-clamp-2">{app.institutionName}</h4>

                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                            <span>{app.region}</span>
                            <span className={overdue ? 'text-rose-600 font-bold' : remaining <= 3 ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                              {overdue ? `${Math.abs(remaining)}d overdue` : `${remaining}d left`}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="truncate max-w-[120px]">{app.assignedOfficer}</span>
                            <span>{getDaysElapsed(app.stageStartDate)}d in stage</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">Application ID</th>
                <th className="p-3">Institution</th>
                <th className="p-3">Current Stage</th>
                <th className="p-3">Workflow Pathway</th>
                <th className="p-3">Stage Ageing</th>
                <th className="p-3">Next Deadline</th>
                <th className="p-3">Risk Assessment</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => {
                const risk = calculateRiskScore(app);
                const overdue = isOverdue(app.nextDeadline);
                return (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono font-bold text-gov-800">{app.id}</td>
                    <td className="p-3 font-medium text-slate-800">{app.institutionName}</td>
                    <td className="p-3">
                      <Badge variant="navy">{app.currentStage}</Badge>
                    </td>
                    <td className="p-3 text-slate-500">{app.workflowId}</td>
                    <td className="p-3 font-mono">{getDaysElapsed(app.stageStartDate)} days</td>
                    <td className="p-3">
                      <span className={overdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {formatDate(app.nextDeadline)}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge size="sm" variant={risk.badgeColor} dot>{risk.level}</Badge>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
