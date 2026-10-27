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
  AlertCircle,
  RefreshCw,
  CheckSquare,
  UserCheck
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
    acknowledgeNotification,
    completeNotificationAction,
    triggerSystemReminders,
    acknowledgeEscalation
  } = useAppData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' | 'escalations'
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [filterRead, setFilterRead] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [actionFilter, setActionFilter] = useState('ALL'); // 'ALL' | 'ACTION_REQUIRED' | 'ACKNOWLEDGED' | 'COMPLETED'
  const [isScanning, setIsScanning] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.actionCompleted).length;

  const handleTriggerReminders = async () => {
    setIsScanning(true);
    try {
      await triggerSystemReminders();
      alert('Statutory reminder scan completed. Active notifications refreshed.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      const matchUrgency = filterUrgency === 'ALL' || item.urgency === filterUrgency;
      const matchRead = filterRead === 'ALL' || (filterRead === 'UNREAD' && !item.read);

      let matchAction = true;
      if (actionFilter === 'ACTION_REQUIRED') {
        matchAction = item.actionRequired && !item.actionCompleted;
      } else if (actionFilter === 'ACKNOWLEDGED') {
        matchAction = item.acknowledged;
      } else if (actionFilter === 'COMPLETED') {
        matchAction = item.actionCompleted;
      }

      return matchUrgency && matchRead && matchAction;
    });
  }, [notifications, filterUrgency, filterRead, actionFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unified Alert & Escalation Management Centre"
        subtitle="Real-time statutory deadline alerts, deficiency triggers, and hierarchical administrative escalations"
        badge={<Badge variant="danger">{unreadCount} Unread Alerts</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              disabled={isScanning}
              onClick={handleTriggerReminders}
            >
              {isScanning ? 'Scanning...' : 'Run Statutory Scan'}
            </Button>
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
          {/* Action Status Filter Pills (Features 52, 53) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActionFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                actionFilter === 'ALL'
                  ? 'bg-gov-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              onClick={() => setActionFilter('ACTION_REQUIRED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                actionFilter === 'ACTION_REQUIRED'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Outstanding Actions ({actionRequiredCount})</span>
            </button>
            <button
              onClick={() => setActionFilter('ACKNOWLEDGED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                actionFilter === 'ACKNOWLEDGED'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Acknowledged Alerts</span>
            </button>
            <button
              onClick={() => setActionFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                actionFilter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Completed Tasks</span>
            </button>
          </div>

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
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No alerts match the selected criteria.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
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

                          {notif.acknowledged && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              <UserCheck className="w-3 h-3" /> Acknowledged
                            </span>
                          )}

                          {notif.actionCompleted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span>Target: <strong>{notif.recipientRole}</strong></span>
                          <span>&bull;</span>
                          <span>{notif.timestamp}</span>
                          {notif.acknowledgedBy && (
                            <>
                              <span>&bull;</span>
                              <span className="text-blue-700">Ack by: <strong>{notif.acknowledgedBy}</strong></span>
                            </>
                          )}
                          {notif.actionCompletedBy && (
                            <>
                              <span>&bull;</span>
                              <span className="text-emerald-700">Completed by: <strong>{notif.actionCompletedBy}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                      {/* Feature 52: Acknowledgement Tracking */}
                      {!notif.acknowledged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={UserCheck}
                          onClick={() => acknowledgeNotification(notif.id, currentUser)}
                          className="text-blue-700 hover:bg-blue-50 text-xs"
                        >
                          Acknowledge
                        </Button>
                      )}

                      {/* Feature 53: Task Completion */}
                      {notif.actionRequired && !notif.actionCompleted && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={CheckSquare}
                          onClick={() => completeNotificationAction(notif.id, currentUser)}
                          className="text-xs"
                        >
                          Mark Completed
                        </Button>
                      )}

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
              ))
            )}
          </div>
        </div>
      ) : (
        /* Escalations Tab (Features 54, 55) */
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>Automated Escalation Rule Engine:</strong> Actions exceeding SLA threshold timeframes (e.g. Scrutiny &gt; 7 days, EVC Report Upload &gt; 48 hours) trigger hierarchical notifications to Regional Officers (Level 1) or Bureau Heads (Level 2).
          </div>

          <div className="space-y-4">
            {escalations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">
                <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No active administrative escalations recorded.</p>
              </div>
            ) : (
              escalations.map((esc) => (
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

                  {esc.acknowledgedBy && (
                    <div className="mt-2 text-[11px] text-blue-700">
                      Resolved / Acknowledged by: <strong>{esc.acknowledgedBy}</strong>
                    </div>
                  )}

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
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
