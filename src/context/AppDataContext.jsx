import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { INITIAL_APPLICATIONS } from '../data/mockApplications';
import { INITIAL_WORKFLOWS } from '../data/mockWorkflows';
import { INITIAL_COMPLIANCE } from '../data/mockCompliance';
import { INITIAL_EVC_SCHEDULES } from '../data/mockEVC';
import { INITIAL_NOTIFICATIONS, INITIAL_ESCALATIONS } from '../data/mockNotifications';
import { INITIAL_AUDIT_LOGS } from '../data/mockAudit';
import { INITIAL_USERS } from '../data/mockUsers';
import { formatDateTime } from '../utils/dateUtils';
import {
  applicationsApi,
  workflowsApi,
  complianceApi,
  evcApi,
  notificationsApi,
  escalationsApi,
  auditApi,
  usersApi,
  institutionsApi,
  adminApi,
  dashboardApi,
  getApiBaseUrl
} from '../services/apiService';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // ================= DATA MODE STATE ================= //
  // 'dummy' (default) | 'live'
  const [dataMode, setDataModeState] = useState(() => {
    try {
      const storedMode = localStorage.getItem('aicte_data_mode');
      return storedMode === 'live' ? 'live' : 'dummy';
    } catch {
      return 'dummy';
    }
  });

  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [backendUrl, setBackendUrl] = useState(getApiBaseUrl());

  // ================= DUMMY / LOCAL MOCK STATE ================= //
  const [dummyApplications, setDummyApplications] = useState(() => {
    try {
      const stored = localStorage.getItem('aicte_applications_store');
      return stored ? JSON.parse(stored) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  const [dummyWorkflows, setDummyWorkflows] = useState(() => {
    try {
      const stored = localStorage.getItem('aicte_workflows_store');
      return stored ? JSON.parse(stored) : INITIAL_WORKFLOWS;
    } catch {
      return INITIAL_WORKFLOWS;
    }
  });

  const [dummyCompliance, setDummyCompliance] = useState(() => {
    try {
      const stored = localStorage.getItem('aicte_compliance_store');
      return stored ? JSON.parse(stored) : INITIAL_COMPLIANCE;
    } catch {
      return INITIAL_COMPLIANCE;
    }
  });

  const [dummyEvcSchedules, setDummyEvcSchedules] = useState(() => {
    try {
      const stored = localStorage.getItem('aicte_evc_store');
      return stored ? JSON.parse(stored) : INITIAL_EVC_SCHEDULES;
    } catch {
      return INITIAL_EVC_SCHEDULES;
    }
  });

  const [dummyNotifications, setDummyNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('aicte_notifications_store');
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [dummyEscalations, setDummyEscalations] = useState(() => {
    try {
      const stored = localStorage.getItem('aicte_escalations_store');
      return stored ? JSON.parse(stored) : INITIAL_ESCALATIONS;
    } catch {
      return INITIAL_ESCALATIONS;
    }
  });

  const [dummyAuditLogs, setDummyAuditLogs] = useState(() => {
    try {
      const stored = localStorage.getItem('aicte_audit_store');
      return stored ? JSON.parse(stored) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [dummyUsers, setDummyUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('aicte_users_store');
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [dummyInstitutions, setDummyInstitutions] = useState(() => {
    try {
      const stored = localStorage.getItem('aicte_demo_registered_institutions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // ================= LIVE STATE (FROM SPRING BOOT) ================= //
  const [liveApplications, setLiveApplications] = useState([]);
  const [liveWorkflows, setLiveWorkflows] = useState([]);
  const [liveCompliance, setLiveCompliance] = useState([]);
  const [liveEvcSchedules, setLiveEvcSchedules] = useState([]);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [liveEscalations, setLiveEscalations] = useState([]);
  const [liveAuditLogs, setLiveAuditLogs] = useState([]);
  const [liveUsers, setLiveUsers] = useState([]);
  const [liveInstitutions, setLiveInstitutions] = useState([]);

  // Sync Dummy Data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aicte_applications_store', JSON.stringify(dummyApplications));
    } catch (e) {
      console.warn('LocalStorage limit for dummy applications', e);
    }
  }, [dummyApplications]);

  useEffect(() => {
    localStorage.setItem('aicte_workflows_store', JSON.stringify(dummyWorkflows));
  }, [dummyWorkflows]);

  useEffect(() => {
    localStorage.setItem('aicte_compliance_store', JSON.stringify(dummyCompliance));
  }, [dummyCompliance]);

  useEffect(() => {
    localStorage.setItem('aicte_evc_store', JSON.stringify(dummyEvcSchedules));
  }, [dummyEvcSchedules]);

  useEffect(() => {
    localStorage.setItem('aicte_notifications_store', JSON.stringify(dummyNotifications));
  }, [dummyNotifications]);

  useEffect(() => {
    localStorage.setItem('aicte_escalations_store', JSON.stringify(dummyEscalations));
  }, [dummyEscalations]);

  useEffect(() => {
    localStorage.setItem('aicte_audit_store', JSON.stringify(dummyAuditLogs));
  }, [dummyAuditLogs]);

  useEffect(() => {
    localStorage.setItem('aicte_users_store', JSON.stringify(dummyUsers));
  }, [dummyUsers]);

  // ================= LIVE DATA FETCHING ENGINE ================= //
  const fetchLiveData = useCallback(async () => {
    setIsLiveLoading(true);
    setLiveError(null);
    const targetUrl = getApiBaseUrl();
    setBackendUrl(targetUrl);

    try {
      // Execute parallel calls against live Spring Boot endpoints
      const results = await Promise.allSettled([
        applicationsApi.getAll(),
        workflowsApi.getAll(),
        complianceApi.getAll(),
        evcApi.getAll(),
        notificationsApi.getAll(),
        escalationsApi.getAll(),
        auditApi.getAll(),
        usersApi.getAll(),
        institutionsApi.getAll()
      ]);

      const [
        appsRes,
        wfRes,
        compRes,
        evcRes,
        notifRes,
        escRes,
        auditRes,
        usersRes,
        instsRes
      ] = results;

      // If all calls were rejected (e.g. backend server is not running)
      const allFailed = results.every(r => r.status === 'rejected');
      if (allFailed) {
        const firstErr = appsRes.reason;
        const errMsg = firstErr?.message || 'Server connection failed';
        setLiveError(`Unable to connect to the live backend at ${targetUrl}. Check that the Spring Boot server is running or switch to Dummy Data. (${errMsg})`);
        setLiveApplications([]);
        setLiveWorkflows([]);
        setLiveCompliance([]);
        setLiveEvcSchedules([]);
        setLiveNotifications([]);
        setLiveEscalations([]);
        setLiveAuditLogs([]);
        setLiveUsers([]);
        setLiveInstitutions([]);
        setIsLiveLoading(false);
        return;
      }

      // Populate live state if endpoints succeeded
      setLiveApplications(appsRes.status === 'fulfilled' ? (appsRes.value.data?.content || appsRes.value.data || []) : []);
      setLiveWorkflows(wfRes.status === 'fulfilled' ? (wfRes.value.data?.content || wfRes.value.data || []) : []);
      setLiveCompliance(compRes.status === 'fulfilled' ? (compRes.value.data?.content || compRes.value.data || []) : []);
      setLiveEvcSchedules(evcRes.status === 'fulfilled' ? (evcRes.value.data?.content || evcRes.value.data || []) : []);
      setLiveNotifications(notifRes.status === 'fulfilled' ? (notifRes.value.data?.content || notifRes.value.data || []) : []);
      setLiveEscalations(escRes.status === 'fulfilled' ? (escRes.value.data?.content || escRes.value.data || []) : []);
      setLiveAuditLogs(auditRes.status === 'fulfilled' ? (auditRes.value.data?.content || auditRes.value.data || []) : []);
      setLiveUsers(usersRes.status === 'fulfilled' ? (usersRes.value.data?.content || usersRes.value.data || []) : []);
      setLiveInstitutions(instsRes.status === 'fulfilled' ? (instsRes.value.data?.content || instsRes.value.data || []) : []);

      setIsLiveLoading(false);
    } catch (err) {
      console.error('Fatal live backend error:', err);
      setLiveError(`Unable to connect to the live backend at ${targetUrl}. Check the server connection or switch to Dummy Data.`);
      setLiveApplications([]);
      setLiveWorkflows([]);
      setLiveCompliance([]);
      setLiveEvcSchedules([]);
      setLiveNotifications([]);
      setLiveEscalations([]);
      setLiveAuditLogs([]);
      setLiveUsers([]);
      setLiveInstitutions([]);
      setIsLiveLoading(false);
    }
  }, []);

  // Set Data Mode and persist to localStorage
  const setDataMode = (mode) => {
    const validMode = mode === 'live' ? 'live' : 'dummy';
    setDataModeState(validMode);
    try {
      localStorage.setItem('aicte_data_mode', validMode);
    } catch (e) {
      console.warn('Could not store data mode in localStorage', e);
    }

    if (validMode === 'live') {
      fetchLiveData();
    } else {
      setLiveError(null);
      setIsLiveLoading(false);
    }
  };

  // Fetch live data on mount, mode change, or authenticated user change
  useEffect(() => {
    if (!currentUser) {
      setLiveApplications([]);
      setLiveWorkflows([]);
      setLiveCompliance([]);
      setLiveEvcSchedules([]);
      setLiveNotifications([]);
      setLiveEscalations([]);
      setLiveAuditLogs([]);
      return;
    }
    if (dataMode === 'live') {
      fetchLiveData();
    }
  }, [dataMode, currentUser?.id, currentUser?.role, currentUser?.institutionCode, fetchLiveData]);

  // Scoped notifications for dummy mode: isolate institutional and role boundaries
  const scopedDummyNotifications = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN' || currentUser.role === 'SYSTEM_ADMIN') {
      return dummyNotifications;
    }
    if (currentUser.role === 'COLLEGE_REP') {
      const code = currentUser.institutionCode || '1-34981275';
      return dummyNotifications.filter(n =>
        n.recipientRole === 'COLLEGE_REP' &&
        (!n.institutionCode || n.institutionCode === code || (n.message && n.message.includes(currentUser.institution || 'Vivekananda')))
      );
    }
    return dummyNotifications.filter(n =>
      n.recipientRole === currentUser.role || n.recipientRole === 'ALL'
    );
  }, [dummyNotifications, currentUser]);

  // Active dataset selection: Strictly isolate dummy vs live records
  const applications = dataMode === 'live' ? liveApplications : dummyApplications;
  const workflows = dataMode === 'live' ? liveWorkflows : dummyWorkflows;
  const compliance = dataMode === 'live' ? liveCompliance : dummyCompliance;
  const evcSchedules = dataMode === 'live' ? liveEvcSchedules : dummyEvcSchedules;
  const notifications = dataMode === 'live' ? liveNotifications : scopedDummyNotifications;
  const escalations = dataMode === 'live' ? liveEscalations : dummyEscalations;
  const auditLogs = dataMode === 'live' ? liveAuditLogs : dummyAuditLogs;
  const users = dataMode === 'live' ? liveUsers : dummyUsers;
  const institutions = dataMode === 'live' ? liveInstitutions : dummyInstitutions;
  const pendingInstitutionsCount = institutions.filter(i => (i.status || 'PENDING_VERIFICATION') === 'PENDING_VERIFICATION').length;
  const verifiedInstitutionsCount = institutions.filter(i => i.status === 'VERIFIED').length;

  // Refresh institutions helper
  const refreshInstitutions = async () => {
    if (dataMode === 'live') {
      try {
        const res = await institutionsApi.getAll();
        if (res.data) {
          setLiveInstitutions(res.data);
        }
      } catch (err) {
        console.warn('Failed to refresh live institutions', err);
      }
    } else {
      const stored = JSON.parse(localStorage.getItem('aicte_demo_registered_institutions') || '[]');
      setDummyInstitutions(stored);
    }
  };

  // Helper to append audit event (local dummy mode)
  const addAuditLog = ({ entityId, action, previousState, newState, reason, user }) => {
    const newEntry = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: formatDateTime(new Date().toISOString()),
      user: user?.name || 'Authorized AICTE Official',
      role: user?.role || 'REGIONAL_OFFICER',
      entityId,
      action,
      previousState: previousState || 'N/A',
      newState: newState || 'N/A',
      reason: reason || 'Routine regulatory transition',
      ipAddress: '10.200.4.88 (Portal Session)'
    };

    if (dataMode === 'dummy') {
      setDummyAuditLogs(prev => [newEntry, ...prev]);
    } else {
      // In live mode, backend persists audit trail
      setLiveAuditLogs(prev => [newEntry, ...prev]);
    }
  };

  // Helper to push notification
  const addNotification = (notif) => {
    const newNotif = {
      id: `NOTIF-${Date.now().toString().slice(-5)}`,
      timestamp: formatDateTime(new Date().toISOString()),
      read: false,
      ...notif
    };
    if (dataMode === 'dummy') {
      setDummyNotifications(prev => [newNotif, ...prev]);
    } else {
      setLiveNotifications(prev => [newNotif, ...prev]);
    }
  };

  // ================= APPLICATION ACTIONS ================= //

  const updateApplicationStage = async (appId, newStage, reason, user) => {
    if (dataMode === 'live') {
      try {
        await applicationsApi.advanceStage(appId, { targetStage: newStage, remarks: reason });
        await fetchLiveData();
        return;
      } catch (err) {
        alert(`Failed to advance stage on live backend: ${err.message}`);
        return;
      }
    }

    // Dummy mode: local update
    let prevStage = '';
    setDummyApplications(prev => prev.map(app => {
      if (app.id === appId) {
        prevStage = app.currentStage;
        const updatedTimeline = [
          ...app.timeline,
          {
            stage: newStage,
            status: 'IN_PROGRESS',
            date: new Date().toISOString().split('T')[0],
            note: reason || `Advanced to ${newStage} by ${user?.name}`
          }
        ];
        return {
          ...app,
          currentStage: newStage,
          status: newStage === 'FINAL_APPROVAL' ? 'PENDING_APPROVAL' : 'IN_REVIEW',
          stageStartDate: new Date().toISOString().split('T')[0],
          timeline: updatedTimeline
        };
      }
      return app;
    }));

    addAuditLog({
      entityId: appId,
      action: 'STAGE_ADVANCED',
      previousState: prevStage,
      newState: newStage,
      reason,
      user
    });

    addNotification({
      category: 'STAGE_CHANGED',
      urgency: 'NORMAL',
      title: `Application ${appId} Advanced`,
      message: `Application moved from stage ${prevStage} to ${newStage}. Reason: ${reason}`,
      entityType: 'APPLICATION',
      entityId: appId,
      recipientRole: 'COLLEGE_REP',
      link: `/applications/${appId}`
    });
  };

  const returnApplicationDeficiency = async (appId, deficiencyReason, user) => {
    if (dataMode === 'live') {
      try {
        await applicationsApi.returnDeficiency(appId, { reason: deficiencyReason });
        await fetchLiveData();
        return;
      } catch (err) {
        alert(`Failed to issue deficiency notice on live backend: ${err.message}`);
        return;
      }
    }

    // Dummy mode: local update
    let targetApp = null;
    setDummyApplications(prev => prev.map(app => {
      if (app.id === appId) {
        targetApp = app;
        const newObs = {
          id: `OBS-${Date.now().toString().slice(-4)}`,
          date: new Date().toISOString().split('T')[0],
          officer: user?.name || 'Regional Scrutiny Committee',
          stage: app.currentStage,
          status: 'DEFICIENT',
          remarks: deficiencyReason
        };
        return {
          ...app,
          status: 'DEFICIENCY_NOTIFIED',
          deficiencyCount: (app.deficiencyCount || 0) + 1,
          deficiencyReason,
          observations: [newObs, ...(app.observations || [])]
        };
      }
      return app;
    }));

    addAuditLog({
      entityId: appId,
      action: 'RETURN_FOR_DEFICIENCY',
      previousState: targetApp?.status || 'IN_REVIEW',
      newState: 'DEFICIENCY_NOTIFIED',
      reason: deficiencyReason,
      user
    });

    addNotification({
      category: 'DEFICIENCY_RETURNED',
      urgency: 'HIGH',
      title: `Deficiency Notified: ${appId}`,
      message: `Deficiency observations recorded: "${deficiencyReason}". Mandatory correction required from institution.`,
      entityType: 'APPLICATION',
      entityId: appId,
      recipientRole: 'COLLEGE_REP',
      link: `/applications/${appId}`
    });
  };

  const submitCollegeResponse = async (appId, responseNotes, newDocuments, user) => {
    if (dataMode === 'live') {
      try {
        await applicationsApi.resubmit(appId, { responseNotes, documents: newDocuments });
        await fetchLiveData();
        return;
      } catch (err) {
        alert(`Failed to submit clarification on live backend: ${err.message}`);
        return;
      }
    }

    // Dummy mode: local update
    setDummyApplications(prev => prev.map(app => {
      if (app.id === appId) {
        const updatedDocs = [...app.documents];
        if (newDocuments && newDocuments.length) {
          updatedDocs.push(...newDocuments);
        }
        const updatedTimeline = [
          ...app.timeline,
          {
            stage: `${app.currentStage} (Resubmitted)`,
            status: 'IN_PROGRESS',
            date: new Date().toISOString().split('T')[0],
            note: responseNotes || 'Corrected compliance submitted by institution Principal'
          }
        ];
        return {
          ...app,
          status: 'RESUBMITTED',
          deficiencyReason: null,
          documents: updatedDocs,
          timeline: updatedTimeline
        };
      }
      return app;
    }));

    addAuditLog({
      entityId: appId,
      action: 'DEFICIENCY_RESUBMISSION',
      previousState: 'DEFICIENCY_NOTIFIED',
      newState: 'RESUBMITTED',
      reason: responseNotes,
      user
    });

    addNotification({
      category: 'COMPLIANCE_RECEIVED',
      urgency: 'NORMAL',
      title: `Institution Resubmission: ${appId}`,
      message: `Institution submitted response & clarification: "${responseNotes}". Ready for re-scrutiny.`,
      entityType: 'APPLICATION',
      entityId: appId,
      recipientRole: 'REGIONAL_OFFICER',
      link: `/applications/${appId}`
    });
  };

  const assignApplicationOfficer = async (appId, officerData, user) => {
    const officerName = typeof officerData === 'string' ? officerData : officerData?.officerName;
    const officerId = typeof officerData === 'object' ? officerData?.officerId : null;
    const reason = typeof officerData === 'object' ? (officerData?.reason || 'Assigned by regional officer') : 'Assigned by regional officer';

    if (dataMode === 'live') {
      try {
        await applicationsApi.assignOfficer(appId, { officerName, officerId, reason });
        await fetchLiveData();
        return;
      } catch (err) {
        alert(`Failed to assign officer on live backend: ${err.message}`);
        return;
      }
    }

    let priorOfficer = '';
    setDummyApplications(prev => prev.map(app => {
      if (app.id === appId) {
        priorOfficer = app.assignedOfficer;
        return {
          ...app,
          assignedOfficer: officerName,
          assignedOfficerId: officerId,
          assignmentReason: reason,
          assignedAt: new Date().toISOString()
        };
      }
      return app;
    }));

    addAuditLog({
      entityId: appId,
      action: 'OFFICER_REASSIGNED',
      previousState: priorOfficer || 'UNASSIGNED',
      newState: officerName,
      reason: reason,
      user
    });
  };

  const createNewApplication = async (newAppPayload, user) => {
    if (dataMode === 'live') {
      try {
        const res = await applicationsApi.create(newAppPayload);
        await fetchLiveData();
        return res.data;
      } catch (err) {
        alert(`Failed to create application on live backend: ${err.response?.data?.message || err.message}`);
        throw err;
      }
    }

    // Dummy mode creation
    const isDraft = newAppPayload.status === 'DRAFT';
    const newId = `AICTE-APP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRecord = {
      id: newId,
      institutionName: newAppPayload.institutionName,
      institutionCode: newAppPayload.institutionCode || '1-34981275',
      applicationType: newAppPayload.applicationType,
      programme: newAppPayload.programme || 'Engineering & Technology',
      region: newAppPayload.region || 'South-Western',
      state: newAppPayload.state || 'Karnataka',
      workflowId: newAppPayload.workflowId || 'WF-FULL',
      currentStage: isDraft ? 'DRAFT' : 'SUBMISSION',
      status: isDraft ? 'DRAFT' : 'SUBMITTED',
      priority: newAppPayload.priority || 'NORMAL',
      assignedOfficer: isDraft ? 'Draft Preparation' : 'Unassigned (Regional Queue)',
      officerRole: 'Regional Officer',
      submissionDate: isDraft ? null : new Date().toISOString().split('T')[0],
      stageStartDate: new Date().toISOString().split('T')[0],
      nextDeadline: isDraft
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deficiencyCount: 0,
      missingDocCount: 0,
      observations: [],
      documents: newAppPayload.documents || [],
      timeline: [
        {
          stage: isDraft ? 'Draft Preparation' : 'Application Submission',
          status: 'COMPLETED',
          date: new Date().toISOString().split('T')[0],
          note: isDraft ? 'Draft application initiated and saved' : 'Submitted online via college portal'
        }
      ],
      requestedIntake: newAppPayload.requestedIntake || []
    };

    setDummyApplications(prev => [newRecord, ...prev]);

    addAuditLog({
      entityId: newId,
      action: isDraft ? 'APPLICATION_DRAFT_CREATED' : 'APPLICATION_CREATED',
      previousState: 'NONE',
      newState: isDraft ? 'DRAFT' : 'SUBMITTED',
      reason: isDraft
        ? `Draft ${newAppPayload.applicationType} application saved`
        : `New ${newAppPayload.applicationType} application lodged`,
      user
    });

    if (!isDraft) {
      addNotification({
        category: 'APPLICATION_SUBMITTED',
        urgency: 'NORMAL',
        title: `New Application Lodged: ${newId}`,
        message: `${newAppPayload.institutionName} lodged application for ${newAppPayload.applicationType}.`,
        entityType: 'APPLICATION',
        entityId: newId,
        recipientRole: 'REGIONAL_OFFICER',
        link: `/applications/${newId}`
      });
    }

    return newRecord;
  };

  const updateApplicationDraft = async (appId, updatedPayload, user) => {
    if (dataMode === 'live') {
      try {
        const res = await applicationsApi.update(appId, updatedPayload);
        await fetchLiveData();
        return res.data;
      } catch (err) {
        alert(`Failed to update application draft on live backend: ${err.response?.data?.message || err.message}`);
        throw err;
      }
    }

    // Dummy mode: update local application
    let updatedApp = null;
    setDummyApplications(prev => prev.map(app => {
      if (app.id === appId) {
        updatedApp = {
          ...app,
          ...updatedPayload,
          requestedIntake: updatedPayload.requestedIntake || app.requestedIntake,
          updatedAt: new Date().toISOString()
        };
        return updatedApp;
      }
      return app;
    }));

    addAuditLog({
      entityId: appId,
      action: 'APPLICATION_DRAFT_UPDATED',
      previousState: 'DRAFT',
      newState: 'DRAFT',
      reason: 'Application draft progressive edits saved',
      user
    });

    return updatedApp;
  };

  const submitDraftApplication = async (appId, user) => {
    if (dataMode === 'live') {
      try {
        const res = await applicationsApi.submitDraft(appId);
        await fetchLiveData();
        return res.data;
      } catch (err) {
        alert(`Failed to submit application on live backend: ${err.response?.data?.message || err.message}`);
        throw err;
      }
    }

    // Dummy mode: submit local draft
    let submittedApp = null;
    setDummyApplications(prev => prev.map(app => {
      if (app.id === appId) {
        const updatedTimeline = [
          ...(app.timeline || []),
          {
            stage: 'Application Submission',
            status: 'COMPLETED',
            date: new Date().toISOString().split('T')[0],
            note: 'Application formally verified and submitted by institution'
          }
        ];
        submittedApp = {
          ...app,
          status: 'SUBMITTED',
          currentStage: 'SUBMISSION',
          submissionDate: new Date().toISOString().split('T')[0],
          stageStartDate: new Date().toISOString().split('T')[0],
          nextDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          timeline: updatedTimeline
        };
        return submittedApp;
      }
      return app;
    }));

    addAuditLog({
      entityId: appId,
      action: 'APPLICATION_SUBMITTED',
      previousState: 'DRAFT',
      newState: 'SUBMITTED',
      reason: 'Application draft formally submitted by institution',
      user
    });

    addNotification({
      category: 'APPLICATION_SUBMITTED',
      urgency: 'NORMAL',
      title: `Application Formally Submitted: ${appId}`,
      message: `${user?.institution || 'Institution'} submitted approval application. Assigned to Regional Scrutiny Queue.`,
      entityType: 'APPLICATION',
      entityId: appId,
      recipientRole: 'REGIONAL_OFFICER',
      link: `/applications/${appId}`
    });

    return submittedApp;
  };

  const deleteDraftApplication = async (appId, user) => {
    if (dataMode === 'live') {
      try {
        await applicationsApi.deleteDraft(appId);
        await fetchLiveData();
        return;
      } catch (err) {
        alert(`Failed to delete draft on live backend: ${err.response?.data?.message || err.message}`);
        throw err;
      }
    }

    setDummyApplications(prev => prev.filter(app => app.id !== appId));

    addAuditLog({
      entityId: appId,
      action: 'APPLICATION_DRAFT_DELETED',
      previousState: 'DRAFT',
      newState: 'DELETED',
      reason: 'Draft application discarded by institution',
      user
    });
  };

  // ================= EVC ACTIONS ================= //

  const scheduleEVCVisit = async (evcId, { proposedDate, committeeMembers, mode }, user) => {
    if (dataMode === 'live') {
      try {
        await evcApi.schedule(evcId, { proposedDate, committeeMembers, mode });
        await fetchLiveData();
        return;
      } catch (err) {
        alert(`Failed to schedule EVC on live backend: ${err.message}`);
        return;
      }
    }

    let priorState = '';
    setDummyEvcSchedules(prev => prev.map(item => {
      if (item.id === evcId) {
        priorState = item.status;
        return {
          ...item,
          status: 'SCHEDULED',
          proposedDate,
          committeeMembers: committeeMembers || item.committeeMembers,
          mode: mode || item.mode
        };
      }
      return item;
    }));

    addAuditLog({
      entityId: evcId,
      action: 'EVC_VISIT_SCHEDULED',
      previousState: priorState,
      newState: 'SCHEDULED',
      reason: `EVC inspection visit scheduled for ${proposedDate} (${mode || 'Physical'})`,
      user
    });

    addNotification({
      category: 'EVC_SCHEDULED',
      urgency: 'NORMAL',
      title: `EVC Scheduled for ${proposedDate}`,
      message: `Expert Visit Committee physical inspection slated for ${proposedDate}. Panel assigned.`,
      entityType: 'EVC',
      entityId: evcId,
      recipientRole: 'EVC_MEMBER',
      link: '/evc'
    });
  };

  const recordEVCCompletion = async (evcId, { observations, status = 'INSPECTION_COMPLETED' }, user) => {
    if (dataMode === 'live') {
      try {
        await evcApi.complete(evcId, { observations, status });
        await fetchLiveData();
        return;
      } catch (err) {
        alert(`Failed to record EVC completion on live backend: ${err.message}`);
        return;
      }
    }

    setDummyEvcSchedules(prev => prev.map(item => {
      if (item.id === evcId) {
        return {
          ...item,
          status,
          completionDate: new Date().toISOString().split('T')[0],
          reportStatus: 'REPORT_SUBMITTED',
          observations: observations || item.observations
        };
      }
      return item;
    }));

    addAuditLog({
      entityId: evcId,
      action: 'EVC_COMPLETED',
      previousState: 'SCHEDULED',
      newState: status,
      reason: observations || 'EVC committee inspection report finalized and signed.',
      user
    });
  };

  // ================= COMPLIANCE & DOCUMENT MANAGEMENT ACTIONS ================= //

  const createComplianceObligation = async (payload, user) => {
    if (dataMode === 'live') {
      const res = await complianceApi.create(payload);
      await fetchLiveData();
      return res.data;
    }

    const newId = `CMP-${Math.floor(100 + Math.random() * 899)}`;
    const newItem = {
      id: newId,
      institutionCode: payload.institutionCode,
      institutionName: payload.institutionName,
      region: payload.region || 'South-Central',
      applicationId: payload.applicationId || null,
      requirementType: payload.requirementType,
      documentName: payload.documentName,
      description: payload.description || '',
      applicableClause: payload.applicableClause || 'AICTE APH 2026-27 Mandatory Undertaking',
      documentType: 'PDF',
      dueDate: payload.dueDate,
      issueDate: payload.issueDate || null,
      expiryDate: payload.expiryDate || null,
      status: 'PENDING_SUBMISSION',
      verificationStatus: 'PENDING_SUBMISSION',
      deadlineStatus: 'UPCOMING',
      validityStatus: payload.expiryDate ? 'VALID' : 'NO_EXPIRY',
      assignedReviewer: payload.assignedReviewer || user?.name || 'Dr. Vikram Joshi',
      version: '1.0',
      notes: payload.notes || '',
      ocrStatus: 'NOT_RUN'
    };
    setDummyCompliance(prev => [newItem, ...prev]);
    addAuditLog({
      entityId: newId,
      action: 'COMPLIANCE_OBLIGATION_CREATED',
      previousState: 'NONE',
      newState: 'PENDING_SUBMISSION',
      reason: `Created compliance obligation: ${payload.documentName} for ${payload.institutionName}`,
      user
    });
    return newItem;
  };

  const verifyComplianceDoc = async (docId, { status, reason }, user) => {
    if (dataMode === 'live') {
      const res = await complianceApi.verify(docId, { status, reason });
      await fetchLiveData();
      return res.data;
    }

    let docName = '';
    setDummyCompliance(prev => prev.map(item => {
      if (item.id === docId) {
        docName = item.documentName;
        return {
          ...item,
          verificationStatus: status,
          status: status,
          verifiedBy: user?.name || 'Dr. Vikram Joshi',
          verifiedAt: new Date().toISOString(),
          notes: reason ? reason : item.notes
        };
      }
      return item;
    }));

    addAuditLog({
      entityId: docId,
      action: status === 'VERIFIED' || status === 'COMPLIANT' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_CORRECTION_REQUESTED',
      previousState: 'PENDING_VERIFICATION',
      newState: status,
      reason: reason || `Document verification outcome: ${status}`,
      user
    });

    addNotification({
      category: 'VERIFICATION_UPDATE',
      urgency: status === 'VERIFIED' || status === 'COMPLIANT' ? 'NORMAL' : 'HIGH',
      title: `Compliance Document: ${status}`,
      message: `${docName} status updated to ${status}. Remarks: ${reason || 'Satisfactory'}`,
      entityType: 'COMPLIANCE',
      entityId: docId,
      recipientRole: 'COLLEGE_REP',
      link: '/compliance'
    });
  };

  const uploadComplianceDoc = async (docId, { file, fileName, fileSize, fileType, declarationText, issueDate, expiryDate, notes }, user) => {
    if (dataMode === 'live') {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        if (declarationText) formData.append('declarationText', declarationText);
        if (issueDate) formData.append('issueDate', issueDate);
        if (expiryDate) formData.append('expiryDate', expiryDate);
        if (notes) formData.append('notes', notes);
        const res = await complianceApi.upload(docId, formData);
        await fetchLiveData();
        return res.data;
      } else {
        const res = await complianceApi.submitEvidence(docId, {
          documentName: fileName,
          fileSize,
          documentType: fileType || 'PDF',
          declarationText: declarationText || 'Submitted statutory compliance declaration and evidence.',
          issueDate: issueDate || null,
          expiryDate: expiryDate || null,
          notes: notes || null
        });
        await fetchLiveData();
        return res.data;
      }
    }

    setDummyCompliance(prev => prev.map(item => {
      if (item.id === docId) {
        let prevHistory = [];
        try {
          if (item.versionHistoryJson) prevHistory = JSON.parse(item.versionHistoryJson);
        } catch {
          prevHistory = [];
        }
        prevHistory.push({
          version: item.version || '1.0',
          documentName: item.documentName,
          fileSize: item.fileSize || '1.2 MB',
          submissionDate: item.submissionDate || null,
          submittedBy: item.submittedBy || 'College Representative',
          verificationStatus: item.verificationStatus,
          verifiedBy: item.verifiedBy || null,
          archivedAt: new Date().toISOString()
        });
        const nextVer = (parseFloat(item.version || '1.0') + 0.1).toFixed(1);
        return {
          ...item,
          documentName: fileName || item.documentName,
          fileSize: fileSize || '2.4 MB',
          documentType: fileType || 'PDF',
          declarationText: declarationText || item.declarationText,
          issueDate: issueDate || item.issueDate,
          expiryDate: expiryDate || item.expiryDate,
          notes: notes || item.notes,
          status: 'PENDING_VERIFICATION',
          verificationStatus: 'PENDING_VERIFICATION',
          verifiedBy: null,
          verifiedAt: null,
          submissionDate: new Date().toISOString().split('T')[0],
          submittedBy: user?.name || 'College Representative',
          version: nextVer,
          versionHistoryJson: JSON.stringify(prevHistory),
          ocrStatus: 'EXTRACTED'
        };
      }
      return item;
    }));

    addAuditLog({
      entityId: docId,
      action: 'DOCUMENT_UPLOADED',
      previousState: 'PENDING_SUBMISSION',
      newState: 'PENDING_VERIFICATION',
      reason: `Uploaded new version of document: ${fileName}`,
      user
    });
  };

  const analyzeComplianceDoc = async (docId) => {
    if (dataMode === 'live') {
      const res = await complianceApi.analyze(docId);
      await fetchLiveData();
      return res.data;
    }
    return null;
  };

  const triggerComplianceReminders = async (thresholdDays = 30) => {
    if (dataMode === 'live') {
      const res = await complianceApi.triggerReminders(thresholdDays);
      await fetchLiveData();
      return res.data;
    }
    return {
      thresholdDays,
      remindersCreated: 2,
      escalationsCreated: 1,
      duplicatesSkipped: 0,
      executedAt: new Date().toISOString()
    };
  };

  // ================= NOTIFICATIONS & ESCALATIONS ================= //

  const markNotificationRead = async (notifId) => {
    if (dataMode === 'live') {
      try {
        await notificationsApi.markRead(notifId);
      } catch (e) {
        console.warn('Live markRead failed', e);
      }
      setLiveNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
      return;
    }

    setDummyNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    if (dataMode === 'live') {
      try {
        await notificationsApi.markAllRead();
      } catch (e) {
        console.warn('Live markAllRead failed', e);
      }
      setLiveNotifications(prev => prev.map(n => ({ ...n, read: true })));
      return;
    }

    setDummyNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const acknowledgeNotification = async (notifId, user) => {
    if (dataMode === 'live') {
      try {
        await notificationsApi.acknowledge(notifId, { acknowledgedBy: user?.name });
        await fetchLiveData();
        return;
      } catch (err) {
        alert(`Failed to acknowledge notification on live backend: ${err.message}`);
        return;
      }
    }

    setDummyNotifications(prev => prev.map(n => {
      if (n.id === notifId) {
        return {
          ...n,
          acknowledged: true,
          read: true,
          acknowledgedBy: user?.name || 'Authorized Official',
          acknowledgedAt: new Date().toISOString()
        };
      }
      return n;
    }));

    addAuditLog({
      entityId: notifId,
      action: 'NOTIFICATION_ACKNOWLEDGED',
      previousState: 'PENDING_ACK',
      newState: 'ACKNOWLEDGED',
      reason: `Alert acknowledged by ${user?.name}`,
      user
    });
  };

  const completeNotificationAction = async (notifId, user) => {
    if (dataMode === 'live') {
      try {
        await notificationsApi.complete(notifId, { completedBy: user?.name });
        await fetchLiveData();
        return;
      } catch (err) {
        alert(`Failed to complete task on live backend: ${err.message}`);
        return;
      }
    }

    setDummyNotifications(prev => prev.map(n => {
      if (n.id === notifId) {
        return {
          ...n,
          actionCompleted: true,
          acknowledged: true,
          read: true,
          actionCompletedBy: user?.name || 'Authorized Official',
          actionCompletedAt: new Date().toISOString()
        };
      }
      return n;
    }));

    addAuditLog({
      entityId: notifId,
      action: 'NOTIFICATION_ACTION_COMPLETED',
      previousState: 'ACTION_REQUIRED',
      newState: 'ACTION_COMPLETED',
      reason: `Action item completed by ${user?.name}`,
      user
    });
  };

  const triggerSystemReminders = async () => {
    if (dataMode === 'live') {
      try {
        const res = await notificationsApi.triggerReminders();
        await fetchLiveData();
        return res.data;
      } catch (err) {
        console.warn('Live trigger reminders failed', err);
      }
    }
  };

  const acknowledgeEscalation = async (escId, user) => {
    if (dataMode === 'live') {
      try {
        await escalationsApi.acknowledge(escId, { acknowledgedBy: user?.name });
        await fetchLiveData();
        return;
      } catch (err) {
        alert(`Failed to acknowledge escalation on live backend: ${err.message}`);
        return;
      }
    }

    setDummyEscalations(prev => prev.map(esc => {
      if (esc.id === escId) {
        return {
          ...esc,
          status: 'RESOLVED',
          acknowledgedBy: user?.name || 'Authorized Official'
        };
      }
      return esc;
    }));

    addAuditLog({
      entityId: escId,
      action: 'ESCALATION_RESOLVED',
      previousState: 'ACTIVE',
      newState: 'RESOLVED',
      reason: 'Official acknowledged and addressed escalation condition',
      user
    });
  };

  // Workflow Template Management Actions
  const createWorkflowTemplate = async (templateData, user) => {
    if (dataMode === 'live') {
      try {
        const res = await workflowsApi.create(templateData);
        await fetchLiveData();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || err.message || 'Failed to create workflow template');
      }
    }

    const newId = templateData.id || `WF-${Date.now()}`;
    const newTemplate = {
      ...templateData,
      id: newId,
      status: templateData.status || 'DRAFT',
      version: templateData.version || '1.0.0',
      stages: templateData.stages || []
    };

    setDummyWorkflows(prev => [...prev, newTemplate]);

    addAuditLog({
      entityId: newId,
      action: 'WORKFLOW_CREATED',
      previousState: 'N/A',
      newState: newTemplate.status,
      reason: `New workflow template created: ${newTemplate.name}`,
      user
    });

    return newTemplate;
  };

  const updateWorkflowTemplate = async (workflowId, templateData, user) => {
    if (dataMode === 'live') {
      try {
        const res = await workflowsApi.update(workflowId, templateData);
        await fetchLiveData();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || err.message || 'Failed to update workflow template');
      }
    }

    setDummyWorkflows(prev => prev.map(wf => {
      if (wf.id === workflowId) {
        return {
          ...wf,
          ...templateData,
          stages: templateData.stages || wf.stages
        };
      }
      return wf;
    }));

    addAuditLog({
      entityId: workflowId,
      action: 'WORKFLOW_UPDATED',
      previousState: 'CURRENT',
      newState: 'UPDATED',
      reason: `Workflow template configuration modified`,
      user
    });
  };

  const activateWorkflowTemplate = async (workflowId, user) => {
    if (dataMode === 'live') {
      try {
        const res = await workflowsApi.activate(workflowId);
        await fetchLiveData();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || err.message || 'Failed to activate workflow template');
      }
    }

    setDummyWorkflows(prev => prev.map(wf => {
      if (wf.id === workflowId) {
        return { ...wf, status: 'ACTIVE' };
      }
      return wf;
    }));

    addAuditLog({
      entityId: workflowId,
      action: 'WORKFLOW_ACTIVATED',
      previousState: 'INACTIVE',
      newState: 'ACTIVE',
      reason: `Workflow template activated by administrator`,
      user
    });
  };

  const deactivateWorkflowTemplate = async (workflowId, user) => {
    if (dataMode === 'live') {
      try {
        const res = await workflowsApi.deactivate(workflowId);
        await fetchLiveData();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || err.message || 'Failed to deactivate workflow template');
      }
    }

    setDummyWorkflows(prev => prev.map(wf => {
      if (wf.id === workflowId) {
        return { ...wf, status: 'INACTIVE' };
      }
      return wf;
    }));

    addAuditLog({
      entityId: workflowId,
      action: 'WORKFLOW_DEACTIVATED',
      previousState: 'ACTIVE',
      newState: 'INACTIVE',
      reason: `Workflow template deactivated by administrator`,
      user
    });
  };

  // Reset to default mock data (Only applies to Dummy Mode)
  const resetDemoData = () => {
    localStorage.removeItem('aicte_applications_store');
    localStorage.removeItem('aicte_workflows_store');
    localStorage.removeItem('aicte_compliance_store');
    localStorage.removeItem('aicte_evc_store');
    localStorage.removeItem('aicte_notifications_store');
    localStorage.removeItem('aicte_escalations_store');
    localStorage.removeItem('aicte_audit_store');
    localStorage.removeItem('aicte_users_store');

    setDummyApplications(INITIAL_APPLICATIONS);
    setDummyWorkflows(INITIAL_WORKFLOWS);
    setDummyCompliance(INITIAL_COMPLIANCE);
    setDummyEvcSchedules(INITIAL_EVC_SCHEDULES);
    setDummyNotifications(INITIAL_NOTIFICATIONS);
    setDummyEscalations(INITIAL_ESCALATIONS);
    setDummyAuditLogs(INITIAL_AUDIT_LOGS);
    setDummyUsers(INITIAL_USERS);
  };

  return (
    <AppDataContext.Provider
      value={{
        // Data Mode state & functions
        dataMode,
        setDataMode,
        isLiveLoading,
        liveError,
        retryLiveFetch: fetchLiveData,
        backendUrl,

        // Data arrays (derived dynamically based on active mode)
        applications,
        workflows,
        compliance,
        evcSchedules,
        notifications,
        escalations,
        auditLogs,
        users,
        institutions,
        pendingInstitutionsCount,
        verifiedInstitutionsCount,
        refreshInstitutions,

        // Actions
        updateApplicationStage,
        returnApplicationDeficiency,
        submitCollegeResponse,
        assignApplicationOfficer,
        createNewApplication,
        updateApplicationDraft,
        submitDraftApplication,
        deleteDraftApplication,
        createWorkflowTemplate,
        updateWorkflowTemplate,
        activateWorkflowTemplate,
        deactivateWorkflowTemplate,
        scheduleEVCVisit,
        recordEVCCompletion,
        createComplianceObligation,
        verifyComplianceDoc,
        uploadComplianceDoc,
        analyzeComplianceDoc,
        triggerComplianceReminders,
        markNotificationRead,
        markAllNotificationsRead,
        acknowledgeNotification,
        completeNotificationAction,
        triggerSystemReminders,
        acknowledgeEscalation,
        addAuditLog,
        resetDemoData
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
