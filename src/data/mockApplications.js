/**
 * Mock Applications Dataset for AICTE Portal
 * Realistic Indian Technical Institutions across multiple regions & stages
 */

export const INITIAL_APPLICATIONS = [
  {
    id: 'AICTE-2026-SW-8901',
    institutionName: 'Vivekananda Institute of Technology, Bangalore',
    institutionCode: '1-34981275',
    applicationType: 'Increase in Intake / New Course',
    programme: 'Engineering & Technology (UG & PG)',
    region: 'South-Western',
    state: 'Karnataka',
    workflowId: 'WF-FULL',
    currentStage: 'SCRUTINY',
    status: 'DEFICIENCY_NOTIFIED',
    priority: 'HIGH',
    assignedOfficer: 'Dr. Suresh Kumar Nair',
    officerRole: 'Regional Officer',
    submissionDate: '2026-10-05',
    stageStartDate: '2026-10-14',
    nextDeadline: '2026-10-26', // Approaching deadline
    deficiencyCount: 1,
    missingDocCount: 1,
    deficiencyReason: 'Land Lease Deed registered validity document missing Annexure IV endorsement; FDR lien letter pending renewal.',
    observations: [
      {
        id: 'OBS-101',
        date: '2026-10-18',
        officer: 'Dr. Suresh Kumar Nair',
        stage: 'SCRUTINY',
        status: 'DEFICIENT',
        remarks: 'Land lease deed submitted does not show municipal boundary survey verification map. Registered deed is valid, but encumbrance certificate of last 30 years is required.'
      }
    ],
    documents: [
      { id: 'DOC-101', title: 'Land Registered Lease Deed (30 Years)', type: 'PDF', size: '4.2 MB', status: 'ACTION_REQUIRED', uploadDate: '2026-10-05' },
      { id: 'DOC-102', title: 'Fire Safety Certificate by State Fire Service', type: 'PDF', size: '1.8 MB', status: 'VERIFIED', uploadDate: '2026-10-05' },
      { id: 'DOC-103', title: 'Architect Completion & Barrier-Free Certificate', type: 'PDF', size: '3.1 MB', status: 'VERIFIED', uploadDate: '2026-10-05' },
      { id: 'DOC-104', title: 'AICTE Prescribed Undertaking on Anti-Ragging', type: 'PDF', size: '820 KB', status: 'VERIFIED', uploadDate: '2026-10-06' }
    ],
    timeline: [
      { stage: 'Application Submission', status: 'COMPLETED', date: '2026-10-05', note: 'Submitted online via institutional portal by Principal' },
      { stage: 'Fee Verification', status: 'COMPLETED', date: '2026-10-06', note: 'Scrutiny fee ₹1,50,000 received via Bharatkosh' },
      { stage: 'Document Scrutiny', status: 'IN_PROGRESS', date: '2026-10-18', note: 'Deficiency letter issued; College response awaited' }
    ],
    requestedIntake: [
      { course: 'B.Tech in Artificial Intelligence & Data Science', currentIntake: 60, proposedIntake: 120 },
      { course: 'B.Tech in Computer Science & Engineering', currentIntake: 180, proposedIntake: 240 }
    ]
  },
  {
    id: 'AICTE-2026-W-4102',
    institutionName: 'Maharashtra Institute of Technology & Engineering, Pune',
    institutionCode: '1-10492811',
    applicationType: 'New Technical Institution',
    programme: 'Engineering & Technology',
    region: 'Western',
    state: 'Maharashtra',
    workflowId: 'WF-FULL',
    currentStage: 'EVC',
    status: 'EVC_SCHEDULED',
    priority: 'HIGH',
    assignedOfficer: 'Prof. (Dr.) Ananya Sen',
    officerRole: 'EVC Committee Lead',
    submissionDate: '2026-09-15',
    stageStartDate: '2026-10-10',
    nextDeadline: '2026-10-22', // OVERDUE (past deadline)
    deficiencyCount: 0,
    missingDocCount: 0,
    observations: [
      {
        id: 'OBS-102',
        date: '2026-10-02',
        officer: 'Regional Scrutiny Committee',
        stage: 'SCRUTINY',
        status: 'CLEARED',
        remarks: 'All preliminary documentation found compliant. Recommended for Expert Visit Committee (EVC) physical verification.'
      }
    ],
    documents: [
      { id: 'DOC-201', title: 'Society/Trust Registration Deed', type: 'PDF', size: '5.1 MB', status: 'VERIFIED', uploadDate: '2026-09-15' },
      { id: 'DOC-202', title: 'Campus Master Plan & Geo-coordinates Map', type: 'PDF', size: '8.4 MB', status: 'VERIFIED', uploadDate: '2026-09-15' },
      { id: 'DOC-203', title: 'Joint FDR with AICTE (₹1.00 Crore)', type: 'PDF', size: '1.2 MB', status: 'VERIFIED', uploadDate: '2026-09-16' },
      { id: 'DOC-204', title: 'Approved Building Plan by Local Authority', type: 'PDF', size: '6.7 MB', status: 'VERIFIED', uploadDate: '2026-09-16' }
    ],
    timeline: [
      { stage: 'Application Submission', status: 'COMPLETED', date: '2026-09-15', note: 'New institution charter submitted' },
      { stage: 'Document Scrutiny', status: 'COMPLETED', date: '2026-10-02', note: 'Cleared without deficiencies' },
      { stage: 'EVC Physical Inspection', status: 'IN_PROGRESS', date: '2026-10-12', note: 'Committee visit scheduled; visit report overdue' }
    ],
    requestedIntake: [
      { course: 'B.Tech Computer Engineering', currentIntake: 0, proposedIntake: 120 },
      { course: 'B.Tech Robotics and Automation', currentIntake: 0, proposedIntake: 60 }
    ]
  },
  {
    id: 'AICTE-2026-S-3209',
    institutionName: 'Coimbatore Institute of Engineering & Technology, Coimbatore',
    institutionCode: '1-29401928',
    applicationType: 'Extension of Approval (EoA)',
    programme: 'Engineering, Management & MCA',
    region: 'Southern',
    state: 'Tamil Nadu',
    workflowId: 'WF-ONLY-SCRUTINY',
    currentStage: 'SCRUTINY',
    status: 'IN_REVIEW',
    priority: 'NORMAL',
    assignedOfficer: 'Smt. Priya Varma',
    officerRole: 'Compliance Reviewer',
    submissionDate: '2026-10-12',
    stageStartDate: '2026-10-14',
    nextDeadline: '2026-10-29',
    deficiencyCount: 0,
    missingDocCount: 0,
    observations: [],
    documents: [
      { id: 'DOC-301', title: 'Annual Mandatory Disclosure 2026-27', type: 'PDF', size: '2.5 MB', status: 'VERIFIED', uploadDate: '2026-10-12' },
      { id: 'DOC-302', title: 'Faculty Cadre Ratio & Pay Commission Undertaking', type: 'PDF', size: '1.1 MB', status: 'PENDING', uploadDate: '2026-10-12' },
      { id: 'DOC-303', title: 'Occupancy Certificate issued by Revenue Divisional Officer', type: 'PDF', size: '3.4 MB', status: 'VERIFIED', uploadDate: '2026-10-12' }
    ],
    timeline: [
      { stage: 'Application Submission', status: 'COMPLETED', date: '2026-10-12', note: 'Routine Extension of Approval submitted' },
      { stage: 'Document Scrutiny', status: 'IN_PROGRESS', date: '2026-10-14', note: 'Reviewing faculty roster compliance' }
    ],
    requestedIntake: [
      { course: 'B.Tech Electrical & Electronics Engineering', currentIntake: 120, proposedIntake: 120 },
      { course: 'Master of Business Administration (MBA)', currentIntake: 60, proposedIntake: 60 }
    ]
  },
  {
    id: 'AICTE-2026-N-7612',
    institutionName: 'Delhi Technological & Management Institute, New Delhi',
    institutionCode: '1-84019231',
    applicationType: 'Increase in Intake / New Course',
    programme: 'Management & Computer Applications',
    region: 'Northern',
    state: 'Delhi NCR',
    workflowId: 'WF-SCRUTINY-EVC',
    currentStage: 'SAC_SHC',
    status: 'SAC_HEARING',
    priority: 'HIGH',
    assignedOfficer: 'Dr. Rajesh Sharma',
    officerRole: 'Bureau Officer',
    submissionDate: '2026-08-20',
    stageStartDate: '2026-10-08',
    nextDeadline: '2026-10-27',
    deficiencyCount: 2,
    missingDocCount: 0,
    observations: [
      {
        id: 'OBS-103',
        date: '2026-09-04',
        officer: 'Northern Regional Office',
        stage: 'SCRUTINY',
        status: 'DEFICIENT',
        remarks: 'Library titles count is below the minimum prescribed norm in AICTE Approval Process Handbook (APH) Table 6.1.'
      },
      {
        id: 'OBS-104',
        date: '2026-09-28',
        officer: 'EVC Team 04',
        stage: 'EVC',
        status: 'DEFICIENT',
        remarks: 'Server room physical air-conditioning and generator backup capacity inadequate during physical inspection. College requested SAC hearing.'
      }
    ],
    documents: [
      { id: 'DOC-401', title: 'Compliance Affidavit submitted for SAC', type: 'PDF', size: '2.9 MB', status: 'VERIFIED', uploadDate: '2026-10-06' },
      { id: 'DOC-402', title: 'Generator Purchase Invoice & Installation Report', type: 'PDF', size: '1.4 MB', status: 'VERIFIED', uploadDate: '2026-10-06' }
    ],
    timeline: [
      { stage: 'Application Submission', status: 'COMPLETED', date: '2026-08-20', note: 'Initial application' },
      { stage: 'Document Scrutiny', status: 'COMPLETED', date: '2026-09-12', note: 'Resubmission accepted' },
      { stage: 'EVC Inspection', status: 'COMPLETED', date: '2026-09-28', note: 'Deficiencies recorded' },
      { stage: 'SAC / SHC Hearing Committee', status: 'IN_PROGRESS', date: '2026-10-08', note: 'Hearing scheduled with Standing Appellate Committee' }
    ],
    requestedIntake: [
      { course: 'MCA (Data Analytics & Cloud)', currentIntake: 60, proposedIntake: 120 }
    ]
  },
  {
    id: 'AICTE-2026-E-1588',
    institutionName: 'Heritage College of Technology, Kolkata',
    institutionCode: '1-51209384',
    applicationType: 'Extension of Approval (EoA)',
    programme: 'Engineering & Technology',
    region: 'Eastern',
    state: 'West Bengal',
    workflowId: 'WF-ONLY-SCRUTINY',
    currentStage: 'FINAL_APPROVAL',
    status: 'PENDING_APPROVAL',
    priority: 'NORMAL',
    assignedOfficer: 'Dr. Rajesh Sharma',
    officerRole: 'Bureau Officer',
    submissionDate: '2026-09-22',
    stageStartDate: '2026-10-16',
    nextDeadline: '2026-10-31',
    deficiencyCount: 0,
    missingDocCount: 0,
    observations: [
      {
        id: 'OBS-105',
        date: '2026-10-08',
        officer: 'Eastern Regional Scrutiny',
        stage: 'SCRUTINY',
        status: 'CLEARED',
        remarks: 'All norms verified and satisfied. Zero deficiencies noted.'
      }
    ],
    documents: [
      { id: 'DOC-501', title: 'NBA Accreditation Certificate (Tier-1)', type: 'PDF', size: '1.9 MB', status: 'VERIFIED', uploadDate: '2026-09-22' },
      { id: 'DOC-502', title: 'Audited Financial Statements FY 2025-26', type: 'PDF', size: '4.8 MB', status: 'VERIFIED', uploadDate: '2026-09-22' }
    ],
    timeline: [
      { stage: 'Application Submission', status: 'COMPLETED', date: '2026-09-22', note: 'Submitted' },
      { stage: 'Document Scrutiny', status: 'COMPLETED', date: '2026-10-08', note: 'Approved' },
      { stage: 'Executive Council Final Decision', status: 'IN_PROGRESS', date: '2026-10-16', note: 'Placed before EC Approval Bureau' }
    ],
    requestedIntake: [
      { course: 'B.Tech Information Technology', currentIntake: 180, proposedIntake: 180 },
      { course: 'B.Tech Electronics & Communication', currentIntake: 180, proposedIntake: 180 }
    ]
  },
  {
    id: 'AICTE-2026-C-9021',
    institutionName: 'Bhopal National Institute of Applied Sciences, Bhopal',
    institutionCode: '1-93041920',
    applicationType: 'New Technical Institution',
    programme: 'Polytechnic & Diploma Engineering',
    region: 'Central',
    state: 'Madhya Pradesh',
    workflowId: 'WF-FULL',
    currentStage: 'SCRUTINY',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    assignedOfficer: 'Dr. Suresh Kumar Nair',
    officerRole: 'Regional Officer',
    submissionDate: '2026-10-01',
    stageStartDate: '2026-10-08',
    nextDeadline: '2026-10-25',
    deficiencyCount: 0,
    missingDocCount: 2,
    observations: [],
    documents: [
      { id: 'DOC-601', title: 'Land Ownership Registry Documents', type: 'PDF', size: '12.4 MB', status: 'VERIFIED', uploadDate: '2026-10-01' },
      { id: 'DOC-602', title: 'Pollution Control Board Consent to Establish', type: 'PDF', size: '2.1 MB', status: 'PENDING', uploadDate: '2026-10-02' }
    ],
    timeline: [
      { stage: 'Application Submission', status: 'COMPLETED', date: '2026-10-01', note: 'Application lodged' },
      { stage: 'Document Scrutiny', status: 'IN_PROGRESS', date: '2026-10-08', note: 'Scrutiny cell verifying campus land area' }
    ],
    requestedIntake: [
      { course: 'Diploma in Civil Engineering', currentIntake: 0, proposedIntake: 60 },
      { course: 'Diploma in Mechanical Engineering', currentIntake: 0, proposedIntake: 60 }
    ]
  },
  {
    id: 'AICTE-2026-NW-6530',
    institutionName: 'Chandigarh Polytechnic Institute, Mohali',
    institutionCode: '1-77192038',
    applicationType: 'Extension of Approval (EoA)',
    programme: 'Engineering & Technology',
    region: 'North-Western',
    state: 'Punjab',
    workflowId: 'WF-ONLY-SCRUTINY',
    currentStage: 'FINAL_APPROVAL',
    status: 'APPROVED',
    priority: 'NORMAL',
    assignedOfficer: 'Dr. Rajesh Sharma',
    officerRole: 'Bureau Officer',
    submissionDate: '2026-08-10',
    stageStartDate: '2026-09-01',
    nextDeadline: '2026-09-25',
    deficiencyCount: 0,
    missingDocCount: 0,
    observations: [],
    documents: [],
    timeline: [
      { stage: 'Application Submission', status: 'COMPLETED', date: '2026-08-10', note: 'Submitted' },
      { stage: 'Document Scrutiny', status: 'COMPLETED', date: '2026-08-24', note: 'Scrutiny clear' },
      { stage: 'Executive Approval', status: 'COMPLETED', date: '2026-09-18', note: 'Approval Letter (EoA) Issued' }
    ],
    requestedIntake: [
      { course: 'Diploma Computer Engineering', currentIntake: 120, proposedIntake: 120 }
    ]
  },
  {
    id: 'AICTE-2026-SC-5511',
    institutionName: 'Hyderabad Premier Engineering College, Hyderabad',
    institutionCode: '1-44910283',
    applicationType: 'Increase in Intake / New Course',
    programme: 'Engineering & Technology',
    region: 'South-Central',
    state: 'Telangana',
    workflowId: 'WF-SCRUTINY-EVC',
    currentStage: 'EVC',
    status: 'EVC_PENDING_REPORT',
    priority: 'HIGH',
    assignedOfficer: 'Prof. (Dr.) Ananya Sen',
    officerRole: 'EVC Committee Member',
    submissionDate: '2026-09-10',
    stageStartDate: '2026-10-05',
    nextDeadline: '2026-10-21', // OVERDUE
    deficiencyCount: 1,
    missingDocCount: 0,
    observations: [],
    documents: [],
    timeline: [
      { stage: 'Application Submission', status: 'COMPLETED', date: '2026-09-10', note: 'Submitted' },
      { stage: 'Document Scrutiny', status: 'COMPLETED', date: '2026-09-25', note: 'Scrutiny completed' },
      { stage: 'EVC Physical Inspection', status: 'IN_PROGRESS', date: '2026-10-05', note: 'Visit took place on Oct 19; report upload pending' }
    ],
    requestedIntake: [
      { course: 'B.Tech Cyber Security', currentIntake: 60, proposedIntake: 120 }
    ]
  }
];
