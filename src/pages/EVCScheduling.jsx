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
  Upload,
  Eye,
  RotateCcw,
  XCircle,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AVAILABLE_EXPERTS } from '../data/mockEVC';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { evcApi, applicationsApi } from '../services/apiService';

export const EVCScheduling = () => {
  const { evcSchedules, scheduleEVCVisit, recordEVCCompletion, dataMode, fetchLiveData } = useAppData();
  const { currentUser } = useAuth();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // View Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  // Schedule / Assign Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    proposedDate: '',
    visitTime: '10:00 AM',
    mode: 'PHYSICAL',
    location: '',
    purpose: 'Statutory Physical Verification for AICTE Approval',
    instructions: 'Examine original land documents, building approval plans, lab stock registers, and bio-metric attendance.'
  });
  const [committeeRoster, setCommitteeRoster] = useState([
    { name: 'Prof. (Dr.) Ananya Sen', role: 'CHAIRMAN', affiliation: 'IIT Bombay (Retd.)', phone: '+91 94330 18273' },
    { name: 'Dr. Kailash Purohit', role: 'MEMBER_SECRETARY', affiliation: 'Council of Architecture Nominee', phone: '+91 98220 54129' },
    { name: 'Dr. G. Venkat Rao', role: 'SUBJECT_EXPERT', affiliation: 'Osmania University', phone: '+91 98490 11223' }
  ]);

  // Reschedule Modal State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    proposedDate: '',
    visitTime: '10:00 AM',
    rescheduleReason: ''
  });

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  // Report Submission Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    completionDate: new Date().toISOString().split('T')[0],
    recommendation: 'RECOMMEND_APPROVAL',
    observations: '',
    geoTaggedPhotosCount: 12,
    findings: [
      { area: 'Land & Built-up Area', status: 'COMPLIANT', remarks: 'Meets AICTE carpet area requirements' },
      { area: 'Core Laboratories & Equipment', status: 'COMPLIANT', remarks: 'Machinery operational; stock register verified' },
      { area: 'Faculty Cadre & Bio-metrics', status: 'COMPLIANT', remarks: 'Cadre ratio verified with original credentials' },
      { area: 'Library & Digital Resources', status: 'COMPLIANT', remarks: 'Consortium access active; adequate physical titles' },
      { area: 'Safety, Fire & Inclusivity', status: 'COMPLIANT', remarks: 'Fire NOC valid; barrier-free ramps available' }
    ]
  });

  // Report Review Modal State (Regional / Bureau Officers)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reportReviewDecision, setReportReviewDecision] = useState('ACCEPTED');
  const [reportReviewNotes, setReportReviewNotes] = useState('EVC report reviewed and accepted. Findings satisfy statutory norms.');

  const filteredSchedules = useMemo(() => {
    return evcSchedules.filter(item => {
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchRegion = selectedRegion === 'ALL' || item.region === selectedRegion;
      return matchStatus && matchRegion;
    });
  }, [evcSchedules, selectedStatus, selectedRegion]);

  // Handlers
  const handleOpenDetails = (item) => {
    setViewTarget(item);
    setIsDetailsModalOpen(true);
  };

  const handleOpenSchedule = (item) => {
    setTargetItem(item);
    setScheduleForm({
      proposedDate: item.proposedDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      visitTime: item.visitTime || '10:00 AM',
      mode: item.mode || 'PHYSICAL',
      location: item.location || `${item.institutionName} Campus, ${item.region}`,
      purpose: item.purpose || 'Statutory Physical Verification for AICTE Approval',
      instructions: item.instructions || 'Inspect physical infrastructure, laboratories, faculty cadre credentials, and campus safety.'
    });
    if (item.committeeMembers && item.committeeMembers.length > 0) {
      setCommitteeRoster(item.committeeMembers);
    } else {
      setCommitteeRoster([
        { name: 'Prof. (Dr.) Ananya Sen', role: 'CHAIRMAN', affiliation: 'IIT Bombay (Retd.)', phone: '+91 94330 18273' },
        { name: 'Dr. Kailash Purohit', role: 'MEMBER_SECRETARY', affiliation: 'Council of Architecture Nominee', phone: '+91 98220 54129' },
        { name: 'Dr. G. Venkat Rao', role: 'SUBJECT_EXPERT', affiliation: 'Osmania University', phone: '+91 98490 11223' }
      ]);
    }
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.proposedDate) {
      alert('Please choose a proposed visit date.');
      return;
    }
    // Check duplicates
    const names = committeeRoster.map(m => m.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) {
      alert('Duplicate committee members detected. Each expert may only be assigned once.');
      return;
    }

    setIsActionLoading(true);
    try {
      if (dataMode === 'live') {
        await evcApi.schedule(targetItem.id, {
          proposedDate: scheduleForm.proposedDate,
          mode: scheduleForm.mode,
          committeeMembers: committeeRoster
        });
        await fetchLiveData();
      } else {
        scheduleEVCVisit(targetItem.id, {
          proposedDate: scheduleForm.proposedDate,
          mode: scheduleForm.mode,
          committeeMembers: committeeRoster
        }, currentUser);
      }
      setIsScheduleModalOpen(false);
      alert('EVC inspection visit scheduled and expert committee assigned successfully.');
    } catch (err) {
      alert(`Failed to schedule visit: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenReschedule = (item) => {
    setTargetItem(item);
    setRescheduleForm({
      proposedDate: item.proposedDate || '',
      visitTime: item.visitTime || '10:00 AM',
      rescheduleReason: ''
    });
    setIsRescheduleModalOpen(true);
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleForm.proposedDate) {
      alert('Please select a new proposed date.');
      return;
    }
    if (!rescheduleForm.rescheduleReason.trim()) {
      alert('Statutory reason for rescheduling is mandatory.');
      return;
    }

    setIsActionLoading(true);
    try {
      if (dataMode === 'live') {
        await evcApi.rescheduleVisit(targetItem.id, {
          proposedDate: rescheduleForm.proposedDate,
          visitTime: rescheduleForm.visitTime,
          rescheduleReason: rescheduleForm.rescheduleReason
        });
        await fetchLiveData();
      } else {
        targetItem.proposedDate = rescheduleForm.proposedDate;
        targetItem.visitTime = rescheduleForm.visitTime;
        targetItem.status = 'RESCHEDULED';
        targetItem.rescheduleReason = rescheduleForm.rescheduleReason;
      }
      setIsRescheduleModalOpen(false);
      alert('EVC visit rescheduled successfully.');
    } catch (err) {
      alert(`Failed to reschedule visit: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenCancel = (item) => {
    setTargetItem(item);
    setCancellationReason('');
    setIsCancelModalOpen(true);
  };

  const handleSaveCancel = async () => {
    if (!cancellationReason.trim()) {
      alert('Cancellation reason is mandatory.');
      return;
    }
    setIsActionLoading(true);
    try {
      if (dataMode === 'live') {
        await evcApi.cancelVisit(targetItem.id, {
          cancellationReason
        });
        await fetchLiveData();
      } else {
        targetItem.status = 'CANCELLED';
        targetItem.cancellationReason = cancellationReason;
      }
      setIsCancelModalOpen(false);
      alert('EVC visit cancelled.');
    } catch (err) {
      alert(`Failed to cancel visit: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenReport = (item) => {
    setTargetItem(item);
    setReportForm({
      completionDate: item.completionDate || new Date().toISOString().split('T')[0],
      recommendation: item.recommendation || 'RECOMMEND_APPROVAL',
      observations: item.observations || '',
      geoTaggedPhotosCount: item.geoTaggedPhotosCount || 12,
      findings: [
        { area: 'Land & Built-up Area', status: 'COMPLIANT', remarks: 'Meets AICTE carpet area requirements' },
        { area: 'Core Laboratories & Equipment', status: 'COMPLIANT', remarks: 'Machinery operational; stock register verified' },
        { area: 'Faculty Cadre & Bio-metrics', status: 'COMPLIANT', remarks: 'Cadre ratio verified with original credentials' },
        { area: 'Library & Digital Resources', status: 'COMPLIANT', remarks: 'Consortium access active; adequate physical titles' },
        { area: 'Safety, Fire & Inclusivity', status: 'COMPLIANT', remarks: 'Fire NOC valid; barrier-free ramps available' }
      ]
    });
    setIsReportModalOpen(true);
  };

  const handleSaveReport = async () => {
    if (!reportForm.observations.trim()) {
      alert('Committee summary observations are required.');
      return;
    }
    setIsActionLoading(true);
    try {
      const findingsJson = JSON.stringify(reportForm.findings);
      if (dataMode === 'live') {
        await evcApi.submitReport(targetItem.id, {
          completionDate: reportForm.completionDate,
          recommendation: reportForm.recommendation,
          observations: reportForm.observations,
          findingsJson,
          geoTaggedPhotosCount: parseInt(reportForm.geoTaggedPhotosCount, 10) || 0
        });
        await fetchLiveData();
      } else {
        recordEVCCompletion(targetItem.id, {
          observations: reportForm.observations,
          status: 'INSPECTION_COMPLETED'
        }, currentUser);
        targetItem.recommendation = reportForm.recommendation;
        targetItem.reportStatus = 'REPORT_SUBMITTED';
        targetItem.completionDate = reportForm.completionDate;
        targetItem.geoTaggedPhotosCount = reportForm.geoTaggedPhotosCount;
      }
      setIsReportModalOpen(false);
      alert('EVC inspection report submitted successfully.');
    } catch (err) {
      alert(`Failed to submit report: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenReview = (item) => {
    setTargetItem(item);
    setReportReviewDecision('ACCEPTED');
    setReportReviewNotes('EVC report reviewed and found compliant with statutory norms.');
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async () => {
    setIsActionLoading(true);
    try {
      if (dataMode === 'live') {
        await evcApi.reviewReport(targetItem.id, {
          decision: reportReviewDecision,
          reviewNotes: reportReviewNotes
        });
        await fetchLiveData();
      } else {
        targetItem.reportStatus = reportReviewDecision === 'ACCEPTED' ? 'REPORT_REVIEWED' : 'REPORT_RETURNED';
      }
      setIsReviewModalOpen(false);
      alert(`EVC report determination saved: ${reportReviewDecision}`);
    } catch (err) {
      alert(`Failed to review report: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expert Visit Committee (EVC) Physical Inspections"
        subtitle="Manage physical infrastructure inspections, expert rosters, geo-tagged photos, and statutory reports"
        badge={<Badge variant="navy">Physical Inspection Cell</Badge>}
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
                <CalendarIcon className="w-3.5 h-3.5" /> Calendar View
              </button>
            </div>
          </div>
        }
      />

      {/* Filter and Overview Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 font-medium"
          >
            <option value="ALL">All Inspection Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RESCHEDULED">Rescheduled</option>
            <option value="INSPECTION_COMPLETED">Inspection Completed</option>
            <option value="PENDING_ASSIGNMENT">Pending Assignment</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 font-medium"
          >
            <option value="ALL">All AICTE Regions</option>
            <option value="Western">Western Region</option>
            <option value="South-Western">South-Western Region</option>
            <option value="South-Central">South-Central Region</option>
            <option value="Central">Central Region</option>
            <option value="Northern">Northern Region</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredSchedules.length}</strong> inspection visits
        </div>
      </div>

      {viewMode === 'list' ? (
        /* Inspection Schedules List */
        <div className="space-y-4">
          {filteredSchedules.map(item => {
            const isCompleted = item.status === 'INSPECTION_COMPLETED';
            const isCancelled = item.status === 'CANCELLED';
            const isReportSubmitted = item.reportStatus === 'REPORT_SUBMITTED';

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-card hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-gov-900">{item.id}</span>
                      <StatusBadge status={item.status} />
                      <Badge variant="navy">{item.region}</Badge>
                      <Badge variant="outline">{item.mode || 'PHYSICAL'}</Badge>
                      {item.recommendation && (
                        <Badge
                          variant={
                            item.recommendation === 'RECOMMEND_APPROVAL' ? 'success'
                            : item.recommendation === 'DEFICIENCIES_NOTED' ? 'amber'
                            : 'danger'
                          }
                        >
                          {item.recommendation}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{item.institutionName}</h3>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <span>App Ref: <strong className="font-mono text-gov-800">{item.applicationId}</strong></span>
                      <span>&bull;</span>
                      <span>Proposed Date: <strong>{item.proposedDate ? formatDate(item.proposedDate) : 'Not Slated'}</strong></span>
                      {item.visitTime && <span>({item.visitTime})</span>}
                      {item.completionDate && (
                        <>
                          <span>&bull;</span>
                          <span className="text-emerald-700 font-semibold">Completed: {formatDate(item.completionDate)}</span>
                        </>
                      )}
                      <span>&bull;</span>
                      <span>Report Status: <strong>{item.reportStatus || 'PENDING'}</strong></span>
                      {item.geoTaggedPhotosCount > 0 && (
                        <>
                          <span>&bull;</span>
                          <span>Photos: <strong>{item.geoTaggedPhotosCount} Geo-Tagged</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleOpenDetails(item)}
                    >
                      Details
                    </Button>

                    {!isCompleted && !isCancelled && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={CalendarCheck}
                          onClick={() => handleOpenSchedule(item)}
                        >
                          {item.proposedDate ? 'Edit Committee' : 'Assign & Schedule'}
                        </Button>

                        {item.proposedDate && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={RotateCcw}
                            onClick={() => handleOpenReschedule(item)}
                          >
                            Reschedule
                          </Button>
                        )}

                        <Button
                          variant="success"
                          size="sm"
                          icon={FileCheck}
                          onClick={() => handleOpenReport(item)}
                        >
                          Submit Report
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleOpenCancel(item)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {isReportSubmitted && currentUser?.role !== 'COLLEGE_REP' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={ShieldCheck}
                        onClick={() => handleOpenReview(item)}
                      >
                        Review Report
                      </Button>
                    )}
                  </div>
                </div>

                {/* Assigned Committee Preview */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Assigned Expert Committee ({item.committeeMembers?.length || 0} Members):
                    </span>
                    {!item.committeeMembers || item.committeeMembers.length === 0 ? (
                      <p className="text-slate-400 mt-1 italic">No committee members assigned yet.</p>
                    ) : (
                      <div className="mt-1 space-y-1">
                        {item.committeeMembers.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-gov-700" />
                            <strong>{m.name}</strong> &bull; <span className="text-slate-500">{m.role} ({m.affiliation})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Committee Findings & Report Summary:
                    </span>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {item.observations || 'Visit pending execution. Official inspection report not yet filed.'}
                    </p>
                    {item.rescheduleReason && (
                      <p className="text-amber-800 text-[11px] mt-1 bg-amber-50 p-1.5 rounded border border-amber-200">
                        <strong>Reschedule History:</strong> {item.rescheduleReason}
                      </p>
                    )}
                    {item.cancellationReason && (
                      <p className="text-rose-800 text-[11px] mt-1 bg-rose-50 p-1.5 rounded border border-rose-200">
                        <strong>Cancellation Reason:</strong> {item.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">EVC Inspection Itinerary Calendar (October 2026)</h3>
            <span className="text-xs text-slate-500">Physical on-site itinerary coordination</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="font-bold text-slate-400 p-2 uppercase text-[10px]">
                {d}
              </div>
            ))}

            {Array.from({ length: 31 }, (_, i) => i + 1).map(dayNum => {
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
                        onClick={() => handleOpenDetails(v)}
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

      {/* EVC Visit Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`EVC Visit Details: ${viewTarget?.id}`}
        subtitle={`Application Reference: ${viewTarget?.applicationId}`}
        maxWidth="max-w-2xl"
        footer={
          <Button variant="outline" size="sm" onClick={() => setIsDetailsModalOpen(false)}>
            Close
          </Button>
        }
      >
        {viewTarget && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{viewTarget.institutionName}</h4>
                  <p className="text-slate-500 mt-0.5">{viewTarget.region} Region &bull; Mode: {viewTarget.mode}</p>
                </div>
                <StatusBadge status={viewTarget.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Proposed Date:</span>
                  <strong>{viewTarget.proposedDate ? formatDate(viewTarget.proposedDate) : 'Not Set'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Visit Time:</span>
                  <strong>{viewTarget.visitTime || '10:00 AM'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Completed Date:</span>
                  <strong>{viewTarget.completionDate ? formatDate(viewTarget.completionDate) : 'Pending'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Report Status:</span>
                  <strong>{viewTarget.reportStatus || 'PENDING'}</strong>
                </div>
              </div>
            </div>

            {/* Committee Roster */}
            <div>
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                Expert Committee Members
              </h5>
              {!viewTarget.committeeMembers || viewTarget.committeeMembers.length === 0 ? (
                <p className="text-slate-400 italic">No members assigned.</p>
              ) : (
                <div className="space-y-2">
                  {viewTarget.committeeMembers.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white flex justify-between items-center">
                      <div>
                        <strong className="text-slate-800">{m.name}</strong>
                        <p className="text-slate-400 text-[10px]">{m.affiliation} {m.phone ? `• ${m.phone}` : ''}</p>
                      </div>
                      <Badge size="sm" variant="navy">{m.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendation & Findings */}
            {viewTarget.recommendation && (
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900">
                <span className="font-bold uppercase text-[10px] block">Committee Recommendation:</span>
                <p className="text-sm font-bold mt-0.5">{viewTarget.recommendation}</p>
              </div>
            )}

            {viewTarget.observations && (
              <div>
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                  Findings & Inspection Notes
                </h5>
                <p className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 leading-relaxed">
                  {viewTarget.observations}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Schedule / Committee Assignment Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule EVC Inspection Visit"
        subtitle={`Application: ${targetItem?.applicationId} — ${targetItem?.institutionName}`}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveSchedule} isLoading={isActionLoading}>
              Save Visit & Assign Committee
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Proposed Inspection Date *</label>
              <input
                type="date"
                value={scheduleForm.proposedDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, proposedDate: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Visit Time</label>
              <input
                type="text"
                value={scheduleForm.visitTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, visitTime: e.target.value })}
                placeholder="10:00 AM"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Inspection Mode</label>
              <select
                value={scheduleForm.mode}
                onChange={(e) => setScheduleForm({ ...scheduleForm, mode: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
              >
                <option value="PHYSICAL">PHYSICAL (On-site Inspection)</option>
                <option value="VIRTUAL">VIRTUAL (Live Video Tele-Inspection)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Campus Location</label>
              <input
                type="text"
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Committee Instructions</label>
            <textarea
              rows={2}
              value={scheduleForm.instructions}
              onChange={(e) => setScheduleForm({ ...scheduleForm, instructions: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          {/* Committee Members Assignment */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Assigned Committee Panel ({committeeRoster.length} Members)
              </label>
            </div>
            <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50/50 max-h-52 overflow-y-auto">
              {committeeRoster.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <div>
                    <strong className="text-slate-800">{m.name}</strong>
                    <p className="text-[10px] text-slate-400">{m.affiliation}</p>
                  </div>
                  <div>
                    <select
                      value={m.role}
                      onChange={(e) => {
                        const updated = [...committeeRoster];
                        updated[idx].role = e.target.value;
                        setCommitteeRoster(updated);
                      }}
                      className="w-full p-1.5 rounded border border-slate-300 text-[11px] font-semibold"
                    >
                      <option value="CHAIRMAN">CHAIRMAN</option>
                      <option value="MEMBER_SECRETARY">MEMBER_SECRETARY</option>
                      <option value="SUBJECT_EXPERT">SUBJECT_EXPERT</option>
                      <option value="AICTE_REP">AICTE_REP</option>
                    </select>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setCommitteeRoster(committeeRoster.filter((_, i) => i !== idx))}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex items-center gap-2">
                <select
                  id="addExpertSelect"
                  className="p-1.5 rounded border border-slate-300 text-xs flex-1"
                  defaultValue=""
                  onChange={(e) => {
                    const exp = AVAILABLE_EXPERTS.find(ex => ex.id === e.target.value);
                    if (exp) {
                      if (committeeRoster.some(m => m.name === exp.name)) {
                        alert('Expert already in committee.');
                        return;
                      }
                      setCommitteeRoster([...committeeRoster, {
                        name: exp.name,
                        role: 'SUBJECT_EXPERT',
                        affiliation: `${exp.specialization} (${exp.city})`,
                        phone: '+91 94330 18273'
                      }]);
                    }
                    e.target.value = '';
                  }}
                >
                  <option value="" disabled>+ Add Expert from AICTE National Pool...</option>
                  {AVAILABLE_EXPERTS.map(exp => (
                    <option key={exp.id} value={exp.id}>{exp.name} - {exp.specialization} ({exp.city})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Reschedule Visit Modal */}
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        title="Reschedule EVC Physical Inspection"
        subtitle={`Visit: ${targetItem?.id} — ${targetItem?.institutionName}`}
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsRescheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveReschedule} isLoading={isActionLoading}>
              Confirm Rescheduling
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">New Inspection Date *</label>
            <input
              type="date"
              value={rescheduleForm.proposedDate}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, proposedDate: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Visit Time</label>
            <input
              type="text"
              value={rescheduleForm.visitTime}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, visitTime: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Statutory Reschedule Reason *</label>
            <textarea
              rows={3}
              value={rescheduleForm.rescheduleReason}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, rescheduleReason: e.target.value })}
              placeholder="e.g. Committee Chairman unable to travel due to flight cancellation; rescheduled to next working Monday."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>
        </div>
      </Modal>

      {/* Cancel Visit Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel EVC Physical Inspection"
        subtitle={`Visit: ${targetItem?.id}`}
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCancelModalOpen(false)}>
              Back
            </Button>
            <Button variant="danger" size="sm" onClick={handleSaveCancel} isLoading={isActionLoading}>
              Confirm Cancellation
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Cancelling this visit will notify the institution and panel members. An auditable reason must be logged.
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Cancellation Reason *</label>
            <textarea
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g. Institution withdrew approval request."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>
        </div>
      </Modal>

      {/* Record Findings & Submit Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Submit EVC Physical Inspection Report"
        subtitle={`Institution: ${targetItem?.institutionName}`}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleSaveReport} isLoading={isActionLoading}>
              Sign & Submit Statutory Report
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Actual Inspection Date *</label>
              <input
                type="date"
                value={reportForm.completionDate}
                onChange={(e) => setReportForm({ ...reportForm, completionDate: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Geo-Tagged Photos Count</label>
              <input
                type="number"
                min="0"
                value={reportForm.geoTaggedPhotosCount}
                onChange={(e) => setReportForm({ ...reportForm, geoTaggedPhotosCount: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Overall Committee Recommendation *
            </label>
            <select
              value={reportForm.recommendation}
              onChange={(e) => setReportForm({ ...reportForm, recommendation: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-bold text-gov-900"
            >
              <option value="RECOMMEND_APPROVAL">RECOMMEND_APPROVAL (Norms verified & satisfied)</option>
              <option value="DEFICIENCIES_NOTED">DEFICIENCIES_NOTED (Critical or major non-compliances observed)</option>
              <option value="RECOMMEND_REJECTION">RECOMMEND_REJECTION (Gross misrepresentation or unviable campus)</option>
            </select>
          </div>

          {/* Structured Findings */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Infrastructure & Academic Verification Norms ({reportForm.findings.length} Areas)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {reportForm.findings.map((f, fIdx) => (
                <div key={fIdx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <strong className="text-slate-800">{f.area}</strong>
                    <p className="text-[10px] text-slate-400">{f.remarks}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {['COMPLIANT', 'DEFICIENT'].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          const updated = [...reportForm.findings];
                          updated[fIdx].status = st;
                          setReportForm({ ...reportForm, findings: updated });
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.status === st
                            ? st === 'COMPLIANT' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                            : 'bg-white border text-slate-600'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Summary Observations & Inspection Findings *
            </label>
            <textarea
              rows={3}
              value={reportForm.observations}
              onChange={(e) => setReportForm({ ...reportForm, observations: e.target.value })}
              placeholder="Record physical inspection observations, laboratory status, faculty verification, and building compliance..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>
        </div>
      </Modal>

      {/* Review Submitted EVC Report Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review Submitted EVC Report"
        subtitle={`Visit: ${targetItem?.id} — ${targetItem?.institutionName}`}
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveReview} isLoading={isActionLoading}>
              Save Review Determination
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Submitted Recommendation:</span>
            <div className="text-sm font-bold text-gov-900">{targetItem?.recommendation}</div>
            <p className="mt-1 text-slate-600">{targetItem?.observations}</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Review Determination</label>
            <select
              value={reportReviewDecision}
              onChange={(e) => setReportReviewDecision(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
            >
              <option value="ACCEPTED">ACCEPTED (Accept report; advance application)</option>
              <option value="RETURNED">RETURNED (Return for revision or incomplete verification)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Review Notes</label>
            <textarea
              rows={3}
              value={reportReviewNotes}
              onChange={(e) => setReportReviewNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
