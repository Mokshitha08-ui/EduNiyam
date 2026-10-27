/**
 * AICTE Institutional Approval Application Wizard Configuration
 * 
 * Defines application types, multi-step sequences, dynamic fields,
 * validation rules, and regulatory document requirements according
 * to AICTE Approval Process Handbook (APH 2026-27) norms.
 */

export const APPLICATION_TYPES = {
  EOA: 'Extension of Approval (EoA)',
  INCREASE_INTAKE: 'Increase in Approved Intake',
  NEW_COURSE: 'Introduction of New Course / Programme',
  NEW_INSTITUTION: 'New Technical Institution',
  CLOSURE: 'Closure / Discontinuation of Programme',
  CHANGE_SITE: 'Change of Site / Infrastructure',
  CONVERSION_COED: 'Conversion to Co-Ed Institution',
  // Combo alias for backward compatibility with existing records
  INCREASE_OR_NEW: 'Increase in Intake / New Course',
};

export const ACADEMIC_PROGRAMMES = [
  'Engineering & Technology',
  'Management (MBA / PGDM)',
  'Computer Applications (MCA)',
  'Pharmacy',
  'Architecture & Town Planning',
  'Applied Arts & Crafts',
  'Hotel Management & Catering Technology (HMCT)',
];

export const PROGRAMME_LEVELS = [
  'Under Graduate (UG)',
  'Post Graduate (PG)',
  'Diploma',
  'Post Diploma',
];

export const AICTE_REGIONS = [
  { value: 'South-Western', label: 'South-Western (Bangalore)' },
  { value: 'Western', label: 'Western (Mumbai)' },
  { value: 'Southern', label: 'Southern (Chennai)' },
  { value: 'Northern', label: 'Northern (Kanpur/Delhi)' },
  { value: 'Eastern', label: 'Eastern (Kolkata)' },
  { value: 'Central', label: 'Central (Bhopal)' },
  { value: 'North-Western', label: 'North-Western (Chandigarh)' },
];

/**
 * Detailed configuration for each AICTE Application Type
 */
export const APPLICATION_TYPE_CONFIGS = {
  [APPLICATION_TYPES.EOA]: {
    id: 'EOA',
    label: APPLICATION_TYPES.EOA,
    code: 'EOA',
    workflowId: 'WF-ONLY-SCRUTINY',
    description: 'Routine annual extension of approval for existing AICTE-approved institutions without intake variations.',
    hasIntake: false,
    intakePrompt: 'Not applicable. Routine continuation of existing approved intake capacity.',
    steps: [
      {
        stepNumber: 1,
        title: 'Institution & Category',
        subtitle: 'Verify institution identity and application category',
        fields: ['institutionName', 'institutionCode', 'region', 'state', 'applicationType', 'programme', 'priority']
      },
      {
        stepNumber: 2,
        title: 'Continuation & Accreditation',
        subtitle: 'Details of previous approvals and current accreditation standing',
        fields: ['eoaPreviousApprovalRef', 'eoaPreviousYear', 'eoaAccreditationStatus', 'eoaNbaValidity', 'eoaFacultyRatioCompliant', 'eoaRemarks']
      },
      {
        stepNumber: 3,
        title: 'Mandatory & Supporting Documents',
        subtitle: 'Upload statutory documents, affidavits, and regulatory proofs',
        fields: []
      },
      {
        stepNumber: 4,
        title: 'Statutory Undertakings',
        subtitle: 'Affirmation of compliance with AICTE statutory norms',
        fields: ['decLandNorms', 'decCadreRatio', 'decGrievance', 'decAuthenticity']
      },
      {
        stepNumber: 5,
        title: 'Review & Confirm',
        subtitle: 'Review application summary before draft save or formal submission',
        fields: []
      }
    ],
    documents: [
      { code: 'DOC-EOA-PREV', title: 'Previous AICTE EoA Order Copy (AY 2025-26)', mandatory: true },
      { code: 'DOC-EOA-SAFETY', title: 'Latest Building & Fire Safety Certificate', mandatory: true },
      { code: 'DOC-EOA-FIN', title: 'Audited Financial Statements (Previous FY)', mandatory: true },
      { code: 'DOC-EOA-NBA', title: 'NBA / NAAC Accreditation Letter', mandatory: false },
    ],
    toIntakePayload: () => []
  },

  [APPLICATION_TYPES.INCREASE_INTAKE]: {
    id: 'INCREASE_INTAKE',
    label: APPLICATION_TYPES.INCREASE_INTAKE,
    code: 'INCR_INTAKE',
    workflowId: 'WF-FULL',
    description: 'Expansion of student seat capacity in an existing approved technical course/programme.',
    hasIntake: true,
    intakePrompt: 'Specify the existing approved course, current capacity, and target intake in multiples of 30 or 60.',
    steps: [
      {
        stepNumber: 1,
        title: 'Institution & Category',
        subtitle: 'Verify institution identity and application category',
        fields: ['institutionName', 'institutionCode', 'region', 'state', 'applicationType', 'programme', 'priority']
      },
      {
        stepNumber: 2,
        title: 'Intake Expansion Details',
        subtitle: 'Specify course, current and proposed intake, and justification',
        fields: ['proposedCourse', 'courseLevel', 'currentIntake', 'proposedIntake', 'intakeJustification', 'additionalClassroomsAvailable', 'additionalFacultyRecruited']
      },
      {
        stepNumber: 3,
        title: 'Mandatory & Supporting Documents',
        subtitle: 'Upload statutory documents, affidavits, and regulatory proofs',
        fields: []
      },
      {
        stepNumber: 4,
        title: 'Statutory Undertakings',
        subtitle: 'Affirmation of compliance with AICTE statutory norms',
        fields: ['decLandNorms', 'decCadreRatio', 'decGrievance', 'decAuthenticity']
      },
      {
        stepNumber: 5,
        title: 'Review & Confirm',
        subtitle: 'Review application summary before draft save or formal submission',
        fields: []
      }
    ],
    documents: [
      { code: 'DOC-INCR-RES', title: 'Governing Council Resolution for Intake Expansion', mandatory: true },
      { code: 'DOC-INCR-FLOOR', title: 'Architect Plan with Additional Built-up Instructional Area', mandatory: true },
      { code: 'DOC-INCR-FACULTY', title: 'Cadre-wise Faculty List with Aadhaar Linkage', mandatory: true },
      { code: 'DOC-INCR-ENROLL', title: 'Past 3-Year Admission Cut-off & Enrollment Data', mandatory: true },
    ],
    toIntakePayload: (data) => [
      {
        course: (data.proposedCourse || '').trim(),
        currentIntake: Number(data.currentIntake) || 0,
        proposedIntake: Number(data.proposedIntake) || 60,
      }
    ]
  },

  [APPLICATION_TYPES.NEW_COURSE]: {
    id: 'NEW_COURSE',
    label: APPLICATION_TYPES.NEW_COURSE,
    code: 'NEW_COURSE',
    workflowId: 'WF-SCRUTINY-EVC',
    description: 'Introduction of an additional course, specialization or emerging discipline in an existing institution.',
    hasIntake: true,
    intakePrompt: 'Specify the proposed new technical course title and proposed intake strength (typically 30 or 60 seats).',
    steps: [
      {
        stepNumber: 1,
        title: 'Institution & Category',
        subtitle: 'Verify institution identity and application category',
        fields: ['institutionName', 'institutionCode', 'region', 'state', 'applicationType', 'programme', 'priority']
      },
      {
        stepNumber: 2,
        title: 'New Course Proposal',
        subtitle: 'Course title, level, proposed intake, and laboratory readiness',
        fields: ['proposedCourse', 'courseLevel', 'proposedIntake', 'isEmergingArea', 'universityNocNumber', 'specializedLabAreaSqM', 'industryMoUSigned']
      },
      {
        stepNumber: 3,
        title: 'Mandatory & Supporting Documents',
        subtitle: 'Upload statutory documents, affidavits, and regulatory proofs',
        fields: []
      },
      {
        stepNumber: 4,
        title: 'Statutory Undertakings',
        subtitle: 'Affirmation of compliance with AICTE statutory norms',
        fields: ['decLandNorms', 'decCadreRatio', 'decGrievance', 'decAuthenticity']
      },
      {
        stepNumber: 5,
        title: 'Review & Confirm',
        subtitle: 'Review application summary before draft save or formal submission',
        fields: []
      }
    ],
    documents: [
      { code: 'DOC-NEWCRS-UNIV', title: 'Affiliating University In-Principle NOC', mandatory: true },
      { code: 'DOC-NEWCRS-DPR', title: 'Detailed Project Report (DPR) & Syllabus Copy', mandatory: true },
      { code: 'DOC-NEWCRS-LAB', title: 'Specialized Laboratory Equipment Readiness List', mandatory: true },
    ],
    toIntakePayload: (data) => [
      {
        course: (data.proposedCourse || '').trim(),
        currentIntake: 0,
        proposedIntake: Number(data.proposedIntake) || 60,
      }
    ]
  },

  [APPLICATION_TYPES.NEW_INSTITUTION]: {
    id: 'NEW_INSTITUTION',
    label: APPLICATION_TYPES.NEW_INSTITUTION,
    code: 'NEW_INST',
    workflowId: 'WF-FULL',
    description: 'First-time establishment approval for a new technical institution.',
    hasIntake: true,
    intakePrompt: 'Enter the initial proposed course and initial intake capacity for the inaugural academic year.',
    steps: [
      {
        stepNumber: 1,
        title: 'Sponsoring Trust & Location',
        subtitle: 'Details of the sponsoring society/trust and campus territory',
        fields: ['institutionName', 'institutionCode', 'region', 'state', 'applicationType', 'programme', 'trustName', 'trustRegNumber', 'trustRegDate']
      },
      {
        stepNumber: 2,
        title: 'Land & Proposed Programmes',
        subtitle: 'Campus land ownership, built-up carpet area, and inaugural intake',
        fields: ['landAreaAcres', 'landOwnershipType', 'totalBuiltUpAreaSqM', 'proposedCourse', 'courseLevel', 'proposedIntake', 'fdrAmountLakhs']
      },
      {
        stepNumber: 3,
        title: 'Mandatory & Supporting Documents',
        subtitle: 'Upload statutory documents, affidavits, and regulatory proofs',
        fields: []
      },
      {
        stepNumber: 4,
        title: 'Statutory Undertakings',
        subtitle: 'Affirmation of compliance with AICTE statutory norms',
        fields: ['decLandNorms', 'decCadreRatio', 'decGrievance', 'decAuthenticity']
      },
      {
        stepNumber: 5,
        title: 'Review & Confirm',
        subtitle: 'Review application summary before draft save or formal submission',
        fields: []
      }
    ],
    documents: [
      { code: 'DOC-NEWINST-TRUST', title: 'Registered Trust Deed / Memorandum of Association', mandatory: true },
      { code: 'DOC-NEWINST-LAND', title: 'Land Title Deed & Non-Encumbrance Certificate', mandatory: true },
      { code: 'DOC-NEWINST-PLAN', title: 'Approved Master Campus Plan & Building Layout', mandatory: true },
      { code: 'DOC-NEWINST-FDR', title: 'Bank Joint Fixed Deposit Receipt (FDR) / Corpus Proof', mandatory: true },
    ],
    toIntakePayload: (data) => [
      {
        course: (data.proposedCourse || '').trim(),
        currentIntake: 0,
        proposedIntake: Number(data.proposedIntake) || 60,
      }
    ]
  },

  [APPLICATION_TYPES.CLOSURE]: {
    id: 'CLOSURE',
    label: APPLICATION_TYPES.CLOSURE,
    code: 'CLOSURE',
    workflowId: 'WF-ONLY-SCRUTINY',
    description: 'Progressive or complete closure / discontinuation of an existing approved programme or course.',
    hasIntake: false,
    intakePrompt: 'Not applicable. Course discontinuation does not involve proposed intake.',
    steps: [
      {
        stepNumber: 1,
        title: 'Institution & Category',
        subtitle: 'Verify institution identity and application category',
        fields: ['institutionName', 'institutionCode', 'region', 'state', 'applicationType', 'programme', 'priority']
      },
      {
        stepNumber: 2,
        title: 'Closure & Student Protection',
        subtitle: 'Identify programme to discontinue, effective year, and student safeguard plan',
        fields: ['closureCourseName', 'closureType', 'closureEffectiveYear', 'closureReason', 'studentTransitionPlan', 'facultyReallocationDetails']
      },
      {
        stepNumber: 3,
        title: 'Mandatory & Supporting Documents',
        subtitle: 'Upload statutory documents, affidavits, and regulatory proofs',
        fields: []
      },
      {
        stepNumber: 4,
        title: 'Statutory Undertakings',
        subtitle: 'Affirmation of compliance with AICTE statutory norms',
        fields: ['decLandNorms', 'decCadreRatio', 'decGrievance', 'decAuthenticity']
      },
      {
        stepNumber: 5,
        title: 'Review & Confirm',
        subtitle: 'Review application summary before draft save or formal submission',
        fields: []
      }
    ],
    documents: [
      { code: 'DOC-CLOSE-RES', title: 'Governing Council Resolution for Course Discontinuation', mandatory: true },
      { code: 'DOC-CLOSE-NOC', title: 'Affiliating University NOC for Programme Closure', mandatory: true },
      { code: 'DOC-CLOSE-STUDENT', title: 'Student Safeguard & Completion Plan Affidavit', mandatory: true },
    ],
    toIntakePayload: () => []
  },

  [APPLICATION_TYPES.CHANGE_SITE]: {
    id: 'CHANGE_SITE',
    label: APPLICATION_TYPES.CHANGE_SITE,
    code: 'CHG_SITE',
    workflowId: 'WF-FULL',
    description: 'Relocation of an existing approved campus or change of institution site.',
    hasIntake: false,
    intakePrompt: 'Not applicable. Campus relocation does not involve intake modifications.',
    steps: [
      {
        stepNumber: 1,
        title: 'Institution & Category',
        subtitle: 'Verify institution identity and application category',
        fields: ['institutionName', 'institutionCode', 'region', 'state', 'applicationType', 'programme', 'priority']
      },
      {
        stepNumber: 2,
        title: 'Site Relocation Parameters',
        subtitle: 'Details of old site, proposed new site, and shifting schedule',
        fields: ['oldCampusAddress', 'newCampusAddress', 'newCampusDistrict', 'distanceOldToNewKm', 'newLandAreaAcres', 'newBuiltUpAreaSqM', 'cluOrderNumber', 'shiftingTargetDate']
      },
      {
        stepNumber: 3,
        title: 'Mandatory & Supporting Documents',
        subtitle: 'Upload statutory documents, affidavits, and regulatory proofs',
        fields: []
      },
      {
        stepNumber: 4,
        title: 'Statutory Undertakings',
        subtitle: 'Affirmation of compliance with AICTE statutory norms',
        fields: ['decLandNorms', 'decCadreRatio', 'decGrievance', 'decAuthenticity']
      },
      {
        stepNumber: 5,
        title: 'Review & Confirm',
        subtitle: 'Review application summary before draft save or formal submission',
        fields: []
      }
    ],
    documents: [
      { code: 'DOC-SITE-MASTER', title: 'Municipal / Town Planning Approved Master Plan', mandatory: true },
      { code: 'DOC-SITE-CLU', title: 'Change of Land Use (CLU) Certificate', mandatory: true },
      { code: 'DOC-SITE-SAFETY', title: 'PWD / Structural Engineer Building Safety Certificate', mandatory: true },
    ],
    toIntakePayload: () => []
  },

  [APPLICATION_TYPES.CONVERSION_COED]: {
    id: 'CONVERSION_COED',
    label: APPLICATION_TYPES.CONVERSION_COED,
    code: 'CONV_COED',
    workflowId: 'WF-ONLY-EVC',
    description: 'Change in institution gender status from Women-Only to Co-Educational institution.',
    hasIntake: false,
    intakePrompt: 'Not applicable. Gender status conversion does not alter course intake.',
    steps: [
      {
        stepNumber: 1,
        title: 'Institution & Category',
        subtitle: 'Verify institution identity and application category',
        fields: ['institutionName', 'institutionCode', 'region', 'state', 'applicationType', 'programme', 'priority']
      },
      {
        stepNumber: 2,
        title: 'Co-Ed Conversion Details',
        subtitle: 'Current status, governing resolution, and facility readiness',
        fields: ['currentGenderStatus', 'proposedGenderStatus', 'coedResolutionDate', 'coedRestroomReadiness', 'coedHostelSecurityArrangements', 'coedEffectiveYear']
      },
      {
        stepNumber: 3,
        title: 'Mandatory & Supporting Documents',
        subtitle: 'Upload statutory documents, affidavits, and regulatory proofs',
        fields: []
      },
      {
        stepNumber: 4,
        title: 'Statutory Undertakings',
        subtitle: 'Affirmation of compliance with AICTE statutory norms',
        fields: ['decLandNorms', 'decCadreRatio', 'decGrievance', 'decAuthenticity']
      },
      {
        stepNumber: 5,
        title: 'Review & Confirm',
        subtitle: 'Review application summary before draft save or formal submission',
        fields: []
      }
    ],
    documents: [
      { code: 'DOC-COED-RES', title: 'Sponsoring Trust Resolution for Co-Ed Status', mandatory: true },
      { code: 'DOC-COED-UNIV', title: 'University & State Government In-Principle NOC', mandatory: true },
      { code: 'DOC-COED-INSPECT', title: 'Campus Infrastructure & Security Self-Assessment', mandatory: true },
    ],
    toIntakePayload: () => []
  },

  // Combo legacy option
  [APPLICATION_TYPES.INCREASE_OR_NEW]: {
    id: 'INCREASE_OR_NEW',
    label: APPLICATION_TYPES.INCREASE_OR_NEW,
    code: 'INCR_OR_NEW',
    workflowId: 'WF-FULL',
    description: 'Increase in approved student intake or introduction of a new technical course.',
    hasIntake: true,
    intakePrompt: 'Specify the proposed course title and requested target intake strength.',
    steps: [
      {
        stepNumber: 1,
        title: 'Institution & Category',
        subtitle: 'Verify institution identity and application category',
        fields: ['institutionName', 'institutionCode', 'region', 'state', 'applicationType', 'programme', 'priority']
      },
      {
        stepNumber: 2,
        title: 'Course & Intake Capacity',
        subtitle: 'Specify course, current and proposed target intake',
        fields: ['proposedCourse', 'courseLevel', 'currentIntake', 'proposedIntake', 'intakeJustification', 'additionalClassroomsAvailable']
      },
      {
        stepNumber: 3,
        title: 'Mandatory & Supporting Documents',
        subtitle: 'Upload statutory documents, affidavits, and regulatory proofs',
        fields: []
      },
      {
        stepNumber: 4,
        title: 'Statutory Undertakings',
        subtitle: 'Affirmation of compliance with AICTE statutory norms',
        fields: ['decLandNorms', 'decCadreRatio', 'decGrievance', 'decAuthenticity']
      },
      {
        stepNumber: 5,
        title: 'Review & Confirm',
        subtitle: 'Review application summary before draft save or formal submission',
        fields: []
      }
    ],
    documents: [
      { code: 'DOC-INCR-RES', title: 'Governing Council Resolution for Course / Intake Variation', mandatory: true },
      { code: 'DOC-INCR-FLOOR', title: 'Architect Plan with Additional Built-up Area', mandatory: true },
    ],
    toIntakePayload: (data) => [
      {
        course: (data.proposedCourse || '').trim(),
        currentIntake: Number(data.currentIntake) || 0,
        proposedIntake: Number(data.proposedIntake) || 60,
      }
    ]
  }
};

/**
 * Registry of all question field definitions
 */
export const FIELD_DEFINITIONS = {
  // Common Step 1 fields
  institutionName: {
    label: 'Official Institution Name',
    type: 'text',
    placeholder: 'e.g. National Institute of Technology',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'Official Institution Name is mandatory.' : null),
  },
  institutionCode: {
    label: 'Permanent AICTE ID / Institution Code',
    type: 'text',
    placeholder: 'e.g. 1-34981275',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'Permanent AICTE ID is mandatory.' : null),
  },
  region: {
    label: 'AICTE Regional Jurisdiction',
    type: 'select',
    options: AICTE_REGIONS,
    required: true,
  },
  state: {
    label: 'State / Territory',
    type: 'text',
    required: true,
  },
  applicationType: {
    label: 'Application Category / Type',
    type: 'select',
    options: Object.values(APPLICATION_TYPES).map(t => ({ value: t, label: t })),
    required: true,
  },
  programme: {
    label: 'Academic Programme',
    type: 'select',
    options: ACADEMIC_PROGRAMMES.map(p => ({ value: p, label: p })),
    required: true,
  },
  priority: {
    label: 'Processing Priority',
    type: 'select',
    options: [
      { value: 'NORMAL', label: 'Normal Processing (Standard Timeline)' },
      { value: 'HIGH', label: 'High Priority (Expedited AICTE Cell)' },
    ],
    required: true,
  },

  // Extension of Approval (EoA) fields
  eoaPreviousApprovalRef: {
    label: 'Previous Academic Year Approval Letter Reference Number',
    type: 'text',
    placeholder: 'e.g. F.No. South-Western/1-34981275/2025/EOA',
    required: true,
    helperText: 'Reference number from the official AICTE EoA letter issued for AY 2025-26.',
    validate: (val) => (!val || !val.trim() ? 'Previous Year AICTE Approval Letter Reference is required.' : null),
  },
  eoaPreviousYear: {
    label: 'Previous Approval Academic Cycle',
    type: 'text',
    defaultValue: 'AY 2025-26',
    readOnly: true,
    required: false,
  },
  eoaAccreditationStatus: {
    label: 'Institutional Accreditation Standing',
    type: 'select',
    options: [
      { value: 'NBA_TIER_1', label: 'NBA Accredited (Tier-I / Washington Accord)' },
      { value: 'NBA_TIER_2', label: 'NBA Accredited (Tier-II)' },
      { value: 'NAAC_A_PLUS', label: 'NAAC Grade A+ or A++ Accredited' },
      { value: 'NAAC_A', label: 'NAAC Grade A Accredited' },
      { value: 'APPLIED_PENDING', label: 'Accreditation Applied / SAR Submitted' },
      { value: 'NOT_ACCREDITED', label: 'Non-Accredited Institution (Self-Financed)' },
    ],
    required: true,
  },
  eoaNbaValidity: {
    label: 'Accreditation Validity Expiry Date',
    type: 'date',
    required: false,
    helperText: 'Leave blank if not currently accredited.',
  },
  eoaFacultyRatioCompliant: {
    label: 'Faculty-to-Student Ratio Currently Maintained',
    type: 'select',
    options: [
      { value: '1:15', label: '1:15 (Compliant with AICTE UG Engineering Norms)' },
      { value: '1:20', label: '1:20 (Compliant with Standard AICTE Cadre Norms)' },
      { value: '1:12', label: '1:12 (Compliant with PG / MBA / MCA Norms)' },
    ],
    required: true,
  },
  eoaRemarks: {
    label: 'Continuation Compliance Remarks',
    type: 'textarea',
    placeholder: 'State any special certifications, autonomous status updates, or academic milestones...',
    required: false,
  },

  // Increase in Intake fields
  proposedCourse: {
    label: 'Technical Course / Discipline Name',
    type: 'text',
    placeholder: 'e.g. B.Tech in Computer Science & Engineering',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'Technical Course name is mandatory.' : null),
  },
  courseLevel: {
    label: 'Qualification Level',
    type: 'select',
    options: PROGRAMME_LEVELS.map(l => ({ value: l, label: l })),
    required: true,
  },
  currentIntake: {
    label: 'Currently Approved Intake (Seats)',
    type: 'number',
    min: 0,
    defaultValue: 0,
    placeholder: 'e.g. 60',
    helperText: 'Enter 0 if this is a newly proposed course.',
    validate: (val) => (isNaN(val) || Number(val) < 0 ? 'Current intake cannot be negative.' : null),
  },
  proposedIntake: {
    label: 'Proposed Target Intake Capacity (Seats)',
    type: 'number',
    min: 1,
    placeholder: 'e.g. 120',
    required: true,
    helperText: 'Standard AICTE division batches are multiples of 30 or 60.',
    validate: (val) => (!val || Number(val) <= 0 ? 'Proposed intake must be greater than zero.' : null),
  },
  intakeJustification: {
    label: 'Justification for Intake Increase',
    type: 'textarea',
    placeholder: 'Detail 100% past 3-year admissions, high placement statistics, and regional industry demand...',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'Justification for intake expansion is required.' : null),
  },
  additionalClassroomsAvailable: {
    label: 'Additional Instructional Classrooms Available (Carpet Area)',
    type: 'text',
    placeholder: 'e.g. 3 Classrooms (198 sq. meters)',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'Classroom availability confirmation is required.' : null),
  },
  additionalFacultyRecruited: {
    label: 'Additional Faculty Identified / Appointed',
    type: 'select',
    options: [
      { value: 'APPOINTED', label: 'Fully Appointed & Biometrically Verified' },
      { value: 'OFFERS_ISSUED', label: 'Selection Committee Completed / Offers Issued' },
      { value: 'UNDER_RECRUITMENT', label: 'Advertised / Recruitment in Progress' },
    ],
    required: true,
  },

  // New Course specific fields
  isEmergingArea: {
    label: 'Aligns with AICTE National Emerging Areas / Industry 4.0',
    type: 'select',
    options: [
      { value: 'YES', label: 'Yes (AI, Data Science, IoT, Cybersecurity, Robotics, EV Tech)' },
      { value: 'NO', label: 'No (Conventional Engineering / Core Discipline)' },
    ],
    required: true,
  },
  universityNocNumber: {
    label: 'Affiliating University In-Principle NOC Reference Number',
    type: 'text',
    placeholder: 'e.g. VTU/ACA/2026/NOC-4421',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'University In-Principle NOC number is required.' : null),
  },
  specializedLabAreaSqM: {
    label: 'Specialized Laboratory Carpet Area Available (sq. meters)',
    type: 'number',
    placeholder: 'e.g. 150',
    required: true,
    validate: (val) => (!val || Number(val) <= 0 ? 'Specialized laboratory area is required.' : null),
  },
  industryMoUSigned: {
    label: 'Active Industry MoUs for Hands-on Training / Internships',
    type: 'select',
    options: [
      { value: 'YES_MULTIPLE', label: 'Yes (2 or more active industrial MoUs signed)' },
      { value: 'YES_ONE', label: 'Yes (1 active industrial MoU signed)' },
      { value: 'IN_PROCESS', label: 'Under Negotiation / In Process' },
    ],
    required: true,
  },

  // New Technical Institution fields
  trustName: {
    label: 'Sponsoring Trust / Society / Section 8 Company Name',
    type: 'text',
    placeholder: 'e.g. Rashtriya Shikshana Samithi Trust',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'Sponsoring Trust Name is mandatory.' : null),
  },
  trustRegNumber: {
    label: 'Trust / Society Registration Number',
    type: 'text',
    placeholder: 'e.g. REG-KAR-2004-9842',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'Trust Registration Number is mandatory.' : null),
  },
  trustRegDate: {
    label: 'Date of Trust / Society Registration',
    type: 'date',
    required: true,
    validate: (val) => (!val ? 'Registration Date is mandatory.' : null),
  },
  landAreaAcres: {
    label: 'Contiguous Campus Land Area (in Acres)',
    type: 'number',
    step: '0.1',
    min: 0,
    placeholder: 'e.g. 7.5',
    required: true,
    helperText: 'Urban norm: min 2.5 acres; Rural norm: min 7.5 acres for Technical Institutions.',
    validate: (val) => (!val || Number(val) <= 0 ? 'Land Area in Acres is mandatory.' : null),
  },
  landOwnershipType: {
    label: 'Land Title Ownership Category',
    type: 'select',
    options: [
      { value: 'OWNED_TITLE', label: 'Ownership with Clear Unencumbered Title Deed' },
      { value: 'GOVT_LEASE_30YR', label: 'Government Leasehold (30+ Years)' },
      { value: 'DEED_GIFT', label: 'Registered Gift Deed from Sponsoring Body' },
    ],
    required: true,
  },
  totalBuiltUpAreaSqM: {
    label: 'Total Instructional & Administrative Carpet Area (sq. meters)',
    type: 'number',
    placeholder: 'e.g. 12500',
    required: true,
    validate: (val) => (!val || Number(val) <= 0 ? 'Total built-up area is mandatory.' : null),
  },
  fdrAmountLakhs: {
    label: 'AICTE Joint FDR / Corpus Security Deposit (in Lakhs INR)',
    type: 'number',
    placeholder: 'e.g. 35',
    required: true,
    helperText: 'As prescribed under Chapter I of AICTE Approval Process Handbook.',
    validate: (val) => (!val || Number(val) <= 0 ? 'Corpus deposit amount is required.' : null),
  },

  // Closure of Programme fields
  closureCourseName: {
    label: 'Programme / Course to be Discontinued',
    type: 'text',
    placeholder: 'e.g. B.Tech in Information Technology',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'Name of programme to be discontinued is mandatory.' : null),
  },
  closureType: {
    label: 'Category of Course Closure',
    type: 'select',
    options: [
      { value: 'PROGRESSIVE_CLOSURE', label: 'Progressive Closure (No 1st-year intake, existing batches complete normally)' },
      { value: 'COMPLETE_CLOSURE', label: 'Complete Immediate Closure (No students currently enrolled)' },
    ],
    required: true,
  },
  closureEffectiveYear: {
    label: 'Effective Academic Cycle for Discontinuation',
    type: 'select',
    options: [
      { value: '2026-27', label: 'AY 2026-27' },
      { value: '2027-28', label: 'AY 2027-28' },
    ],
    required: true,
  },
  closureReason: {
    label: 'Primary Reason for Closure',
    type: 'select',
    options: [
      { value: 'ZERO_ADMISSION', label: 'Zero or near-zero admissions for 3 consecutive academic sessions' },
      { value: 'OBSOLESCENCE', label: 'Technological obsolescence / Shift to emerging disciplines' },
      { value: 'RATIONALIZATION', label: 'Institutional resource rationalization by Sponsoring Body' },
      { value: 'AFFILIATION_WITHDRAWN', label: 'Withdrawal of university curriculum affiliation' },
    ],
    required: true,
  },
  studentTransitionPlan: {
    label: 'Student Protection & Degree Completion Plan',
    type: 'textarea',
    placeholder: 'Affirm that all currently enrolled students shall continue to receive teaching, laboratory and examination facilities until degree completion without hindrance...',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'Student transition and protection plan is mandatory.' : null),
  },
  facultyReallocationDetails: {
    label: 'Faculty Reallocation & Settlement Status',
    type: 'textarea',
    placeholder: 'Detail redeployment to allied departments, retraining programs, or voluntary retirement arrangements...',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'Faculty reallocation details are mandatory.' : null),
  },

  // Change of Site fields
  oldCampusAddress: {
    label: 'Existing Campus Address',
    type: 'textarea',
    placeholder: 'Full address of currently approved campus...',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'Existing campus address is mandatory.' : null),
  },
  newCampusAddress: {
    label: 'Proposed New Campus Address',
    type: 'textarea',
    placeholder: 'Survey numbers, village/town, taluk, postal code of new site...',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'Proposed new campus address is mandatory.' : null),
  },
  newCampusDistrict: {
    label: 'District of New Campus Site',
    type: 'text',
    placeholder: 'e.g. Bengaluru Rural',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'New campus district is mandatory.' : null),
  },
  distanceOldToNewKm: {
    label: 'Distance between Old and New Sites (km)',
    type: 'number',
    placeholder: 'e.g. 14.5',
    required: true,
    validate: (val) => (!val || Number(val) < 0 ? 'Distance between sites is required.' : null),
  },
  newLandAreaAcres: {
    label: 'New Site Land Extent (in Acres)',
    type: 'number',
    step: '0.1',
    placeholder: 'e.g. 10.2',
    required: true,
    validate: (val) => (!val || Number(val) <= 0 ? 'New site land extent is mandatory.' : null),
  },
  newBuiltUpAreaSqM: {
    label: 'Constructed Built-Up Carpet Area at New Site (sq. meters)',
    type: 'number',
    placeholder: 'e.g. 15400',
    required: true,
    validate: (val) => (!val || Number(val) <= 0 ? 'New site built-up carpet area is mandatory.' : null),
  },
  cluOrderNumber: {
    label: 'Change of Land Use (CLU) Government Order Number',
    type: 'text',
    placeholder: 'e.g. GO/REV/CLU-2025/1194',
    required: true,
    validate: (val) => (!val || !val.trim() ? 'CLU order number is mandatory.' : null),
  },
  shiftingTargetDate: {
    label: 'Target Date for Complete Campus Relocation',
    type: 'date',
    required: true,
    validate: (val) => (!val ? 'Target shifting date is mandatory.' : null),
  },

  // Conversion to Co-Ed fields
  currentGenderStatus: {
    label: 'Current Gender Status of Institution',
    type: 'select',
    options: [
      { value: 'WOMEN_ONLY', label: 'Women-Only Technical Institution' },
      { value: 'MEN_ONLY', label: 'Men-Only Technical Institution' },
    ],
    required: true,
  },
  proposedGenderStatus: {
    label: 'Proposed Gender Status',
    type: 'select',
    options: [
      { value: 'CO_ED', label: 'Co-Educational Technical Institution' },
    ],
    required: true,
  },
  coedResolutionDate: {
    label: 'Sponsoring Trust Governing Body Resolution Date',
    type: 'date',
    required: true,
    validate: (val) => (!val ? 'Resolution Date is mandatory.' : null),
  },
  coedRestroomReadiness: {
    label: 'Adequate & Segregated Restroom Facilities Ready',
    type: 'select',
    options: [
      { value: 'YES_VERIFIED', label: 'Yes, fully constructed and verified as per AICTE spatial norms' },
      { value: 'IN_PROGRESS', label: 'Under completion (prior to start of AY 2026-27)' },
    ],
    required: true,
  },
  coedHostelSecurityArrangements: {
    label: 'Campus Security, Lighting & CCTV Coverage',
    type: 'select',
    options: [
      { value: 'FULLY_EQUIPPED', label: 'Fully equipped with 24x7 security, boundary wall & CCTV surveillance' },
      { value: 'UPGRADATION_ACTIVE', label: 'Security upgradation currently underway' },
    ],
    required: true,
  },
  coedEffectiveYear: {
    label: 'Target Academic Year for Co-Ed Admissions',
    type: 'select',
    options: [
      { value: '2026-27', label: 'AY 2026-27' },
      { value: '2027-28', label: 'AY 2027-28' },
    ],
    required: true,
  },

  // Statutory Compliance Undertakings (Common)
  decLandNorms: {
    label: 'Land, Infrastructure & Built-up Area Adherence',
    type: 'checkbox',
    description: 'The institution certifies possession of clear, unencumbered land and built-up instructional/administrative carpet areas strictly conforming to APH 2026-27 norms.',
    required: true,
    validate: (val) => (!val ? 'Land & built-up norms undertaking must be affirmed.' : null),
  },
  decCadreRatio: {
    label: 'Faculty Cadre Ratio & Mandatory Qualifications',
    type: 'checkbox',
    description: 'Teaching faculty appointed as per AICTE cadre ratio (1:15 or 1:20) and pay scales prescribed under 7th CPC recommendations with verified biometric Aadhaar linkage.',
    required: true,
    validate: (val) => (!val ? 'Faculty cadre ratio undertaking must be affirmed.' : null),
  },
  decGrievance: {
    label: 'Anti-Ragging, Grievance Cell & ICC Functional Status',
    type: 'checkbox',
    description: 'Institution has fully constituted and publicly displayed the Anti-Ragging Committee, Internal Complaints Committee (ICC), and Student Grievance Redressal Committee.',
    required: true,
    validate: (val) => (!val ? 'Statutory grievance and anti-ragging undertaking must be affirmed.' : null),
  },
  decAuthenticity: {
    label: 'Solemn Affirmation of Document Authenticity',
    type: 'checkbox',
    description: 'I solemnly affirm that all details submitted herein are true and accurate. Any misrepresentation shall render this application liable for immediate summary rejection under AICTE regulations.',
    required: true,
    validate: (val) => (!val ? 'Affirmation of truth and authenticity must be affirmed.' : null),
  },
};

/**
 * Returns the configuration for a given application type
 */
export function getApplicationTypeConfig(appType) {
  if (!appType) return APPLICATION_TYPE_CONFIGS[APPLICATION_TYPES.EOA];
  
  if (APPLICATION_TYPE_CONFIGS[appType]) {
    return APPLICATION_TYPE_CONFIGS[appType];
  }

  // Fallback matching by substring
  const lower = appType.toLowerCase();
  if (lower.includes('extension') || lower.includes('eoa')) {
    return APPLICATION_TYPE_CONFIGS[APPLICATION_TYPES.EOA];
  }
  if (lower.includes('increase in approved') || (lower.includes('increase') && !lower.includes('new course'))) {
    return APPLICATION_TYPE_CONFIGS[APPLICATION_TYPES.INCREASE_INTAKE];
  }
  if (lower.includes('new technical') || lower.includes('new institution')) {
    return APPLICATION_TYPE_CONFIGS[APPLICATION_TYPES.NEW_INSTITUTION];
  }
  if (lower.includes('closure') || lower.includes('discontinuation')) {
    return APPLICATION_TYPE_CONFIGS[APPLICATION_TYPES.CLOSURE];
  }
  if (lower.includes('site') || lower.includes('infrastructure')) {
    return APPLICATION_TYPE_CONFIGS[APPLICATION_TYPES.CHANGE_SITE];
  }
  if (lower.includes('co-ed') || lower.includes('coed')) {
    return APPLICATION_TYPE_CONFIGS[APPLICATION_TYPES.CONVERSION_COED];
  }
  if (lower.includes('new course') || lower.includes('programme')) {
    return APPLICATION_TYPE_CONFIGS[APPLICATION_TYPES.NEW_COURSE];
  }

  return APPLICATION_TYPE_CONFIGS[APPLICATION_TYPES.INCREASE_OR_NEW];
}

/**
 * Filters and clears stale answers when the user changes application type.
 * Preserves common institutional attributes and valid statutory declarations.
 */
export function sanitizeAnswersOnTypeChange(prevAnswers, newAppType) {
  const newConfig = getApplicationTypeConfig(newAppType);
  const preservedKeys = new Set([
    'institutionName',
    'institutionCode',
    'region',
    'state',
    'applicationType',
    'programme',
    'priority',
    'academicYear',
    'decLandNorms',
    'decCadreRatio',
    'decGrievance',
    'decAuthenticity',
  ]);

  // Also collect all valid fields defined across all steps of the new config
  newConfig.steps.forEach(step => {
    step.fields.forEach(f => preservedKeys.add(f));
  });

  const sanitized = { ...prevAnswers, applicationType: newAppType };

  // Remove keys that are not part of the preserved set or new config
  Object.keys(sanitized).forEach(k => {
    if (!preservedKeys.has(k) && !k.startsWith('doc_')) {
      delete sanitized[k];
    }
  });

  // If new type does not have intake, clear proposedCourse and intake numbers
  if (!newConfig.hasIntake) {
    delete sanitized.proposedCourse;
    delete sanitized.currentIntake;
    delete sanitized.proposedIntake;
    delete sanitized.courseLevel;
  }

  return sanitized;
}
