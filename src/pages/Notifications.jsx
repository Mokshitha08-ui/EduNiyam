import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  CheckCheck,
  Filter,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';

export const Notifications = () => {
  const {
    notifications,
    escalations,
    markNotificationRead,
    markAllNotificationsRead,
    acknowledgeEscalation
  } = useAppData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' | 'escalations'
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [filterRead, setFilterRead] = useState('ALL'); // 'ALL' | 'UNREAD'

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      const matchUrgency = filterUrgency === 'ALL' || item.urgency === filterUrgency;
      const matchRead = filterRead === 'ALL' || (filterRead === 'UNREAD' && !item.read);
      return matchUrgency && matchRead;
    });
  }, [notifications, filterUrgency, filterRead]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unified Alert & Escalation Management Centre"
        subtitle="Real-time statutory deadline alerts, deficiency triggers, and hierarchical administrative escalations"
        badge={<Badge variant="danger">{unreadCount} Unread Alerts</Badge>}
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                icon={CheckCheck}
                onClick={markAllNotificationsRead}
              >
                Mark All as Read
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'notifications'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>System Alerts ({notifications.length})</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('escalations')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'escalations'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Administrative Escalations ({escalations.length})</span>
        </button>
      </div>

      {activeTab === 'notifications' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-card">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 uppercase">Filter by Urgency:</span>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs"
              >
                <option value="ALL">All Urgencies</option>
                <option value="CRITICAL">Critical (Breached SLA)</option>
                <option value="HIGH">High Priority</option>
                <option value="NORMAL">Normal Information</option>
              </select>

              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="UNREAD">Unread Only</option>
              </select>
            </div>

            <span className="text-xs text-slate-500">
              Showing {filteredNotifications.length} notifications
            </span>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all ${
                  !notif.read ? 'bg-blue-50/40 border-blue-200 shadow-subtle' : 'bg-white border-slate-200 shadow-card'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {notif.urgency === 'CRITICAL' ? (
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : notif.urgency === 'HIGH' ? (
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Bell className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                        <Badge
                          size="sm"
                          variant={notif.urgency === 'CRITICAL' ? 'danger' : notif.urgency === 'HIGH' ? 'warning' : 'primary'}
                        >
                          {notif.urgency}
                        </Badge>
                        <Badge size="sm" variant="default">{notif.category}</Badge>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Target: <strong>{notif.recipientRole}</strong></span>
                        <span>&bull;</span>
                        <span>{notif.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markNotificationRead(notif.id)}
                      >
                        Mark Read
                      </Button>
                    )}

                    {notif.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={ArrowRight}
                        iconPosition="right"
                        onClick={() => {
                          markNotificationRead(notif.id);
                          navigate(notif.link);
                        }}
                      >
                        Take Action
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Escalations Tab */
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>Automated Escalation Rule Engine:</strong> Actions exceeding SLA threshold timeframes (e.g. Scrutiny &gt; 7 days, EVC Report Upload &gt; 48 hours) trigger hierarchical notifications to Regional Officers (Level 1) or Bureau Heads (Level 2).
          </div>

          <div className="space-y-4">
            {escalations.map((esc) => (
              <div
                key={esc.id}
                className="bg-white rounded-xl border border-rose-200 p-5 shadow-card"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-700">{esc.id}</span>
                    <Badge variant="danger">{esc.levelTitle}</Badge>
                    <StatusBadge status={esc.status} />
                  </div>
                  <div className="text-xs text-slate-500">
                    Triggered: <strong>{esc.triggeredAt}</strong>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Associated Application</span>
                    <span className="font-bold text-slate-900">{esc.institutionName}</span>
                    <p className="font-mono text-[11px] text-gov-800">{esc.entityId}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Escalation Recipient</span>
                    <span className="font-semibold text-slate-800">{esc.recipient}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Violation Cause</span>
                    <p className="text-slate-700">{esc.reason}</p>
                  </div>
                </div>

                {esc.status === 'ACTIVE' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckCircle2}
                      onClick={() => {
                        acknowledgeEscalation(esc.id, currentUser);
                        alert(`Escalation ${esc.id} acknowledged and logged.`);
                      }}
                    >
                      Acknowledge & Resolve Escalation
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
