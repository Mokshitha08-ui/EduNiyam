import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Users,
  MapPin,
  FileCheck,
  CalendarCheck,
  ShieldAlert,
  ChevronRight,
  Upload
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AVAILABLE_EXPERTS } from '../data/mockEVC';
import { formatDate, isOverdue } from '../utils/dateUtils';

export const EVCScheduling = () => {
  const { evcSchedules, scheduleEVCVisit, recordEVCCompletion, applications } = useAppData();
  const { currentUser } = useAuth();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [proposedDate, setProposedDate] = useState('');
  const [visitMode, setVisitMode] = useState('PHYSICAL');
  const [selectedExperts, setSelectedExperts] = useState([]);

  // Completion Modal State
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const filteredSchedules = useMemo(() => {
    return evcSchedules.filter(item => {
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchRegion = selectedRegion === 'ALL' || item.region === selectedRegion;
      return matchStatus && matchRegion;
    });
  }, [evcSchedules, selectedStatus, selectedRegion]);

  const handleOpenSchedule = (item) => {
    setTargetItem(item);
    setProposedDate(item.proposedDate || '');
    setVisitMode(item.mode || 'PHYSICAL');
    setSelectedExperts(item.committeeMembers?.map(m => m.name) || []);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = () => {
    if (!proposedDate) {
      alert('Please choose a proposed visit date.');
      return;
    }
    const committee = selectedExperts.map(name => {
      const exp = AVAILABLE_EXPERTS.find(e => e.name === name);
      return {
        name,
        role: exp?.role || 'Expert Member',
        affiliation: exp?.specialization || 'Technical Expert'
      };
    });

    scheduleEVCVisit(targetItem.id, {
      proposedDate,
      mode: visitMode,
      committeeMembers: committee
    }, currentUser);

    setIsScheduleModalOpen(false);
  };

  const handleOpenCompletion = (item) => {
    setTargetItem(item);
    setCompletionNotes(item.observations || '');
    setIsCompletionModalOpen(true);
  };

  const handleSaveCompletion = () => {
    if (!completionNotes.trim()) {
      alert('Please enter committee observations.');
      return;
    }
    recordEVCCompletion(targetItem.id, {
      observations: completionNotes,
      status: 'INSPECTION_COMPLETED'
    }, currentUser);

    setIsCompletionModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expert Visit Committee (EVC) Scheduling"
        subtitle="Manage physical infrastructure inspections, committee rosters, and geo-tagged inspection reports"
        badge={<Badge variant="navy">Inspection Cell</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-subtle text-gov-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" /> Queue List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'calendar' ? 'bg-white shadow-subtle text-gov-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" /> Month Calendar
              </button>
            </div>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Visits Required</span>
          <p className="mt-1 text-2xl font-bold text-slate-900">{evcSchedules.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Approved scrutiny backlog</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Committee Assignment</span>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {evcSchedules.filter(e => e.status === 'PENDING_ASSIGNMENT').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting panel selection</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overdue / Delayed Visits</span>
          <p className="mt-1 text-2xl font-bold text-rose-600">
            {evcSchedules.filter(e => e.status === 'DELAYED' || isOverdue(e.schedulingDeadline)).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">SLA threshold exceeded</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inspections Completed</span>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {evcSchedules.filter(e => e.status === 'INSPECTION_COMPLETED').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Reports submitted & signed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Filter:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
          >
            <option value="ALL">All Inspection Statuses</option>
            <option value="PENDING_ASSIGNMENT">Pending Assignment</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="DELAYED">Delayed / Reschedule Needed</option>
            <option value="INSPECTION_COMPLETED">Inspection Completed</option>
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
          >
            <option value="ALL">All Regions</option>
            <option value="Western">Western</option>
            <option value="South-Western">South-Western</option>
            <option value="South-Central">South-Central</option>
            <option value="Central">Central</option>
          </select>
        </div>
        <span className="text-xs text-slate-500">Showing {filteredSchedules.length} scheduled visits</span>
      </div>

      {/* List Queue View */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredSchedules.map((item) => {
            const overdue = isOverdue(item.schedulingDeadline);
            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-5 shadow-card transition-all ${
                  item.status === 'DELAYED' ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gov-800">{item.id}</span>
                      <span className="font-mono text-xs text-slate-500 font-semibold">({item.applicationId})</span>
                      <StatusBadge status={item.status} />
                      <Badge variant="navy">{item.visitType}</Badge>
                      {item.conflictStatus === 'CONFLICT' && (
                        <Badge variant="danger">Schedule Conflict Detected</Badge>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{item.institutionName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                      <span>Region: <strong>{item.region}</strong></span>
                      <span>&bull;</span>
                      <span>Target Deadline: <strong className={overdue ? 'text-rose-600' : ''}>{formatDate(item.schedulingDeadline)}</strong></span>
                      <span>&bull;</span>
                      <span>Proposed Date: <strong>{item.proposedDate ? formatDate(item.proposedDate) : 'Not Scheduled'}</strong></span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start lg:self-center">
                    <Button
                      variant={item.status === 'PENDING_ASSIGNMENT' ? 'primary' : 'outline'}
                      size="sm"
                      icon={CalendarCheck}
                      onClick={() => handleOpenSchedule(item)}
                    >
                      {item.proposedDate ? 'Reschedule / Edit Committee' : 'Assign & Schedule'}
                    </Button>

                    {item.status !== 'INSPECTION_COMPLETED' && (
                      <Button
                        variant="success"
                        size="sm"
                        icon={FileCheck}
                        onClick={() => handleOpenCompletion(item)}
                      >
                        Record Report
                      </Button>
                    )}
                  </div>
                </div>

                {/* Committee Members Assigned */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Assigned Committee Panel:</span>
                    {item.committeeMembers?.length === 0 ? (
                      <p className="text-slate-400 mt-1 italic">No committee members assigned yet.</p>
                    ) : (
                      <div className="mt-1 space-y-1">
                        {item.committeeMembers.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-gov-700" />
                            <strong>{m.name}</strong> - <span className="text-slate-500">{m.role} ({m.affiliation})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Inspection Observations / Status:</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {item.observations || 'Visit pending committee execution.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar Grid View */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">EVC Inspection Itinerary Calendar (October 2026)</h3>
            <span className="text-xs text-slate-500">Auto-conflict checking enabled</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="font-bold text-slate-500 py-1 bg-slate-50 rounded">
                {day}
              </div>
            ))}
            {/* 31 days */}
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-10-${dayNum < 10 ? '0' + dayNum : dayNum}`;
              const visitsOnThisDay = evcSchedules.filter(e => e.proposedDate === dateStr);

              return (
                <div
                  key={dayNum}
                  className={`min-h-[90px] p-1.5 rounded-lg border text-left flex flex-col justify-between ${
                    visitsOnThisDay.length > 0 ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-600">{dayNum}</span>
                  <div className="space-y-1">
                    {visitsOnThisDay.map(v => (
                      <div
                        key={v.id}
                        onClick={() => handleOpenSchedule(v)}
                        className="p-1 rounded bg-gov-900 text-white text-[9px] font-medium truncate cursor-pointer hover:bg-gov-800"
                        title={`${v.id}: ${v.institutionName}`}
                      >
                        {v.institutionName.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule / Assign Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule EVC Visit & Assign Committee"
        subtitle={`Application: ${targetItem?.applicationId} - ${targetItem?.institutionName}`}
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveSchedule}>
              Save Schedule & Notify Panel
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Proposed Visit Date *</label>
              <input
                type="date"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Inspection Mode</label>
              <select
                value={visitMode}
                onChange={(e) => setVisitMode(e.target.value)}
                className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
              >
                <option value="PHYSICAL">Physical On-Site Visit</option>
                <option value="HYBRID">Hybrid (Video Teleconference + Local Nominee)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Committee Experts from National Pool
            </label>
            <div className="border border-slate-200 rounded-lg p-2 max-h-48 overflow-y-auto space-y-1.5 text-xs">
              {AVAILABLE_EXPERTS.map(exp => {
                const isSelected = selectedExperts.includes(exp.name);
                return (
                  <label
                    key={exp.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border border-blue-200 text-gov-900' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExperts([...selectedExperts, exp.name]);
                          } else {
                            setSelectedExperts(selectedExperts.filter(n => n !== exp.name));
                          }
                        }}
                        className="rounded border-slate-300 text-gov-800"
                      />
                      <div>
                        <span className="font-bold">{exp.name}</span>
                        <p className="text-[10px] text-slate-500">{exp.role} &bull; {exp.specialization} ({exp.city})</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* Completion Modal */}
      <Modal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        title="Record Visit Completion & Committee Report"
        subtitle={`Submit inspection observations for ${targetItem?.institutionName}`}
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCompletionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleSaveCompletion}>
              Sign & Finalize Report
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Committee Findings & Observations *</label>
            <textarea
              rows={4}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="e.g. Physical infrastructure, laboratories, computers, and library collection inspected. Norms satisfied."
              className="mt-1 w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Upload Signed Committee Report & Geo-Photos</label>
            <input
              type="file"
              className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gov-50 file:text-gov-800 hover:file:bg-gov-100"
            />
            <p className="text-[10px] text-slate-400 mt-1">Geo-tagged photos with EXIF timestamp and committee signature sheet (PDF)</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
