/**
 * Initial Mock Audit Trail Entries
 */

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'AUD-001',
    timestamp: '2026-10-23 09:30 AM',
    user: 'System Auto-Engine',
    role: 'SYSTEM',
    entityId: 'AICTE-2026-W-4102',
    action: 'ESCALATION_TRIGGERED',
    previousState: 'SCHEDULED',
    newState: 'DELAYED',
    reason: 'Target EVC inspection date breached by 24 hours without completion submission.',
    ipAddress: '10.200.4.1 (Internal Worker)'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-10-22 04:30 PM',
    user: 'System Auto-Engine',
    role: 'SYSTEM',
    entityId: 'AICTE-2026-SC-5511',
    action: 'ESCALATION_TRIGGERED',
    previousState: 'INSPECTION_COMPLETED',
    newState: 'REPORT_OVERDUE',
    reason: 'Inspection report upload time exceeded SLA threshold of 48 hours.',
    ipAddress: '10.200.4.1 (Internal Worker)'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-10-18 03:15 PM',
    user: 'Dr. Suresh Kumar Nair',
    role: 'REGIONAL_OFFICER',
    entityId: 'AICTE-2026-SW-8901',
    action: 'RETURN_FOR_DEFICIENCY',
    previousState: 'SCRUTINY_IN_PROGRESS',
    newState: 'DEFICIENCY_NOTIFIED',
    reason: 'Land lease deed missing Annexure IV boundary verification stamp. FDR lien renewal notice issued.',
    ipAddress: '14.139.128.45'
  },
  {
    id: 'AUD-004',
    timestamp: '2026-10-16 02:00 PM',
    user: 'Dr. Rajesh Sharma',
    role: 'BUREAU_OFFICER',
    entityId: 'AICTE-2026-E-1588',
    action: 'STAGE_ADVANCED',
    previousState: 'SCRUTINY',
    newState: 'FINAL_APPROVAL',
    reason: 'Scrutiny cleared with 100% compliance. Forwarded for Executive Council final signoff.',
    ipAddress: '14.139.120.12'
  },
  {
    id: 'AUD-005',
    timestamp: '2026-10-12 11:20 AM',
    user: 'Dr. Suresh Kumar Nair',
    role: 'REGIONAL_OFFICER',
    entityId: 'AICTE-2026-W-4102',
    action: 'STAGE_ADVANCED',
    previousState: 'SCRUTINY',
    newState: 'EVC',
    reason: 'Document scrutiny passed without deficiencies. Routed to Expert Visit Committee panel.',
    ipAddress: '14.139.128.45'
  },
  {
    id: 'AUD-006',
    timestamp: '2026-10-05 10:14 AM',
    user: 'Dr. R. Ramanathan',
    role: 'COLLEGE_REP',
    entityId: 'AICTE-2026-SW-8901',
    action: 'APPLICATION_SUBMITTED',
    previousState: 'DRAFT',
    newState: 'SUBMITTED',
    reason: 'Application for Intake Expansion in AI/DS and CSE courses lodged along with Bharathkosh fee receipt.',
    ipAddress: '49.206.12.88'
  }
];
