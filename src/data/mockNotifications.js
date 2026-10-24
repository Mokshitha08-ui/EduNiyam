/**
 * Initial Mock Notifications and Escalations
 */

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-001',
    category: 'APPLICATION_OVERDUE',
    urgency: 'CRITICAL',
    title: 'EVC Visit Overdue - AICTE-2026-W-4102',
    message: 'Inspection for Maharashtra Institute of Technology & Engineering, Pune was scheduled for 2026-10-22 and is currently overdue.',
    entityType: 'APPLICATION',
    entityId: 'AICTE-2026-W-4102',
    timestamp: '2026-10-23 09:30 AM',
    read: false,
    recipientRole: 'REGIONAL_OFFICER',
    link: '/applications/AICTE-2026-W-4102'
  },
  {
    id: 'NOTIF-002',
    category: 'LEASE_EXPIRY',
    urgency: 'HIGH',
    title: 'Land Lease Deed Expiring in 22 Days',
    message: 'Registered 30-year lease for Vivekananda Institute of Technology, Bangalore expires on 2026-11-15. Renewal undertaking needed.',
    entityType: 'COMPLIANCE',
    entityId: 'CMP-2026-001',
    timestamp: '2026-10-24 08:00 AM',
    read: false,
    recipientRole: 'COMPLIANCE_REVIEWER',
    link: '/compliance'
  },
  {
    id: 'NOTIF-003',
    category: 'DEFICIENCY_RETURNED',
    urgency: 'HIGH',
    title: 'Scrutiny Deficiency Issued - AICTE-2026-SW-8901',
    message: 'Annexure IV boundary survey map missing in submitted Land Lease Deed. Clarification requested from institution Principal.',
    entityType: 'APPLICATION',
    entityId: 'AICTE-2026-SW-8901',
    timestamp: '2026-10-18 03:15 PM',
    read: false,
    recipientRole: 'COLLEGE_REP',
    link: '/applications/AICTE-2026-SW-8901'
  },
  {
    id: 'NOTIF-004',
    category: 'ESCALATION',
    urgency: 'CRITICAL',
    title: 'Level 2 Escalation: Overdue EVC Scheduling',
    message: 'Application AICTE-2026-SC-5511 report has exceeded 48 hours post physical inspection without report upload. Escalated to Bureau Officer.',
    entityType: 'ESCALATION',
    entityId: 'ESC-2026-001',
    timestamp: '2026-10-22 04:30 PM',
    read: false,
    recipientRole: 'BUREAU_OFFICER',
    link: '/evc'
  },
  {
    id: 'NOTIF-005',
    category: 'COMPLIANCE_RECEIVED',
    urgency: 'NORMAL',
    title: 'New Compliance Submission Received',
    message: 'Khasra Revenue records uploaded by Bhopal National Institute of Applied Sciences. Awaiting scrutiny officer verification.',
    entityType: 'COMPLIANCE',
    entityId: 'CMP-2026-006',
    timestamp: '2026-10-23 02:40 PM',
    read: true,
    recipientRole: 'COMPLIANCE_REVIEWER',
    link: '/compliance'
  },
  {
    id: 'NOTIF-006',
    category: 'EVC_REMINDER',
    urgency: 'NORMAL',
    title: 'Upcoming EVC Visit: Bhopal Polytechnic',
    message: 'Physical inspection scheduled for 2026-10-27 by Dr. V. K. Aggarwal panel. Logistics confirmed.',
    entityType: 'EVC',
    entityId: 'EVC-2026-004',
    timestamp: '2026-10-21 11:20 AM',
    read: true,
    recipientRole: 'EVC_MEMBER',
    link: '/evc'
  }
];

export const INITIAL_ESCALATIONS = [
  {
    id: 'ESC-2026-001',
    entityId: 'AICTE-2026-SC-5511',
    institutionName: 'Hyderabad Premier Engineering College',
    level: 'LEVEL_2',
    levelTitle: 'Bureau Head Escalation',
    recipient: 'Dr. Rajesh Sharma (Approval Bureau Head)',
    reason: 'EVC Physical inspection report upload delayed past SLA threshold (> 48 hours).',
    triggeredAt: '2026-10-22 04:30 PM',
    status: 'ACTIVE',
    acknowledgedBy: null
  },
  {
    id: 'ESC-2026-002',
    entityId: 'AICTE-2026-W-4102',
    institutionName: 'Maharashtra Institute of Technology & Engineering',
    level: 'LEVEL_1',
    levelTitle: 'Regional Officer Alert',
    recipient: 'Dr. Suresh Kumar Nair (Regional Officer)',
    reason: 'EVC inspection date breached target deadline by 2 days.',
    triggeredAt: '2026-10-23 09:30 AM',
    status: 'ACTIVE',
    acknowledgedBy: null
  }
];
