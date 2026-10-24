/**
 * Mock Expert Visit Committee (EVC) Inspection Data
 */

export const INITIAL_EVC_SCHEDULES = [
  {
    id: 'EVC-2026-001',
    applicationId: 'AICTE-2026-W-4102',
    institutionName: 'Maharashtra Institute of Technology & Engineering, Pune',
    region: 'Western',
    visitType: 'Physical Inspection (New Campus)',
    status: 'DELAYED',
    schedulingDeadline: '2026-10-20',
    proposedDate: '2026-10-22', // Was supposed to be inspected on 22nd; delayed
    committeeMembers: [
      { name: 'Prof. (Dr.) Ananya Sen', role: 'Chairman / Academic Expert', affiliation: 'IIT Bombay (Retd.)', phone: '+91 94330 18273' },
      { name: 'Dr. Kailash Purohit', role: 'Architectural Expert', affiliation: 'Council of Architecture Nominee', phone: '+91 98220 54129' },
      { name: 'Shri Amit Deshmukh', role: 'Regional Officer Nominee', affiliation: 'AICTE Western Regional Office', phone: '+91 22 2285 1022' }
    ],
    mode: 'PHYSICAL',
    conflictStatus: 'NONE',
    completionDate: null,
    reportStatus: 'PENDING_UPLOAD',
    observations: 'Physical inspection was delayed due to regional heavy monsoon travel advisories. Need rescheduling.',
    geoTaggedPhotosCount: 0
  },
  {
    id: 'EVC-2026-002',
    applicationId: 'AICTE-2026-SW-8901',
    institutionName: 'Vivekananda Institute of Technology, Bangalore',
    region: 'South-Western',
    visitType: 'Physical Inspection (Intake Expansion)',
    status: 'PENDING_ASSIGNMENT',
    schedulingDeadline: '2026-10-30',
    proposedDate: null,
    committeeMembers: [],
    mode: 'PHYSICAL',
    conflictStatus: 'NONE',
    completionDate: null,
    reportStatus: 'NOT_SCHEDULED',
    observations: 'Application undergoing scrutiny deficiency resolution; to be queued for committee formation upon clearance.',
    geoTaggedPhotosCount: 0
  },
  {
    id: 'EVC-2026-003',
    applicationId: 'AICTE-2026-SC-5511',
    institutionName: 'Hyderabad Premier Engineering College, Hyderabad',
    region: 'South-Central',
    visitType: 'Surprise / Infrastructure Verification',
    status: 'INSPECTION_COMPLETED',
    schedulingDeadline: '2026-10-18',
    proposedDate: '2026-10-19',
    committeeMembers: [
      { name: 'Prof. (Dr.) Ananya Sen', role: 'Chairman', affiliation: 'IIT Bombay (Retd.)' },
      { name: 'Dr. G. Venkat Rao', role: 'Subject Expert (Cyber Security)', affiliation: 'Osmania University' }
    ],
    mode: 'PHYSICAL',
    conflictStatus: 'NONE',
    completionDate: '2026-10-19',
    reportStatus: 'REPORT_SUBMITTED',
    observations: 'Physical verification of 4 dedicated computer labs and 1Gbps leased line completed satisfactorily. Bio-metric attendance log verified.',
    geoTaggedPhotosCount: 18
  },
  {
    id: 'EVC-2026-004',
    applicationId: 'AICTE-2026-C-9021',
    institutionName: 'Bhopal National Institute of Applied Sciences, Bhopal',
    region: 'Central',
    visitType: 'Physical Inspection (Polytechnic)',
    status: 'SCHEDULED',
    schedulingDeadline: '2026-10-28',
    proposedDate: '2026-10-27',
    committeeMembers: [
      { name: 'Dr. V. K. Aggarwal', role: 'Chairman', affiliation: 'MANIT Bhopal' },
      { name: 'Prof. Meenakshi Soni', role: 'State DTE Nominee', affiliation: 'Govt. Polytechnic MP' }
    ],
    mode: 'PHYSICAL',
    conflictStatus: 'NONE',
    completionDate: null,
    reportStatus: 'VISIT_UPCOMING',
    observations: 'Travel itinerary and campus visit agenda circulated to institution management.',
    geoTaggedPhotosCount: 0
  }
];

export const AVAILABLE_EXPERTS = [
  { id: 'EXP-01', name: 'Prof. (Dr.) Ananya Sen', specialization: 'Computer Science / AI', city: 'Mumbai', role: 'Chairman' },
  { id: 'EXP-02', name: 'Dr. Kailash Purohit', specialization: 'Civil / Architecture', city: 'Pune', role: 'Architectural Member' },
  { id: 'EXP-03', name: 'Dr. G. Venkat Rao', specialization: 'Information Technology', city: 'Hyderabad', role: 'Subject Expert' },
  { id: 'EXP-04', name: 'Dr. V. K. Aggarwal', specialization: 'Mechanical Engineering', city: 'Bhopal', role: 'Chairman' },
  { id: 'EXP-05', name: 'Prof. Meenakshi Soni', specialization: 'Electrical Engineering', city: 'Indore', role: 'DTE Nominee' },
  { id: 'EXP-06', name: 'Prof. M. K. Narayanan', specialization: 'Electronics & Comm.', city: 'Chennai', role: 'Subject Expert' }
];
