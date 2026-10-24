import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldAlert,
  ArrowRight,
  User,
  Clock,
  Terminal
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { exportToCSV } from '../utils/exportService';

export const AuditTrail = () => {
  const { auditLogs } = useAppData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  const actionTypes = useMemo(() => {
    return ['ALL', ...new Set(auditLogs.map(l => l.action))];
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch =
        !searchQuery ||
        log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.reason.toLowerCase().includes(searchQuery.toLowerCase());

      const matchAction = selectedAction === 'ALL' || log.action === selectedAction;
      return matchSearch && matchAction;
    });
  }, [auditLogs, searchQuery, selectedAction]);

  const handleExport = () => {
    exportToCSV(filteredLogs, 'regulatory_audit_trail.csv', [
      { key: 'timestamp', label: 'Timestamp' },
      { key: 'user', label: 'Actor Name' },
      { key: 'role', label: 'Role Authority' },
      { key: 'entityId', label: 'Entity / Application ID' },
      { key: 'action', label: 'Action Performed' },
      { key: 'previousState', label: 'Previous State' },
      { key: 'newState', label: 'New State' },
      { key: 'reason', label: 'Recorded Justification' },
      { key: 'ipAddress', label: 'IP Address / Node' }
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulatory Compliance Audit Trail"
        subtitle="Immutable ledger recording institutional application stage changes, deficiency returns, and verifications"
        badge={<Badge variant="navy">System Ledger</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExport}
          >
            Export Audit Log (CSV)
          </Button>
        }
      />

      {/* Audit Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-700 flex items-start gap-3">
        <Terminal className="w-5 h-5 text-gov-800 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-900 uppercase tracking-wide">
            Tamper-Evident Regulatory Compliance Notice
          </h4>
          <p className="mt-0.5">
            This log reflects all state mutations during the active browser session and persists to demo localStorage. In production, every state transition is securely persisted in PostgreSQL with digital signatures, actor IDs, and immutable append-only constraints.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-card">
        <div className="w-full sm:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Entity ID, Officer, Keyword..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Action Type:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
          >
            {actionTypes.map(a => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Entity ID</th>
              <th className="p-3">Action Performed</th>
              <th className="p-3">Actor & Role</th>
              <th className="p-3">State Transition</th>
              <th className="p-3">Recorded Justification</th>
              <th className="p-3">IP Node</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors font-sans">
                <td className="p-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                  {log.timestamp}
                </td>
                <td className="p-3 font-mono font-bold text-gov-800 whitespace-nowrap">
                  {log.entityId}
                </td>
                <td className="p-3">
                  <Badge
                    size="sm"
                    variant={
                      log.action.includes('DEFICIENCY') || log.action.includes('ESCALATION')
                        ? 'danger'
                        : log.action.includes('VERIFIED') || log.action.includes('ADVANCED')
                        ? 'success'
                        : 'navy'
                    }
                  >
                    {log.action}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="font-semibold text-slate-800">{log.user}</div>
                  <div className="text-[10px] text-slate-400">{log.role}</div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">{log.previousState}</span>
                    <ArrowRight className="w-3 h-3 text-slate-300" />
                    <span className="font-bold text-slate-800">{log.newState}</span>
                  </div>
                </td>
                <td className="p-3 text-slate-600 max-w-xs truncate" title={log.reason}>
                  {log.reason}
                </td>
                <td className="p-3 font-mono text-slate-400 text-[10px]">
                  {log.ipAddress || '10.200.4.1'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
