/**
 * Mock Configurable Workflow Templates & Stage Definitions
 * Prototype representation of AICTE approval pathways
 */

export const INITIAL_WORKFLOWS = [
  {
    id: 'WF-FULL',
    name: 'Scrutiny + EVC + SAC/SHC (Comprehensive Pathway)',
    code: 'SCRUTINY_EVC_SAC_SHC',
    description: 'Applicable for New Institution, Increase in Intake, or Significant Change in Site',
    version: '2026.2.1',
    effectiveDate: '2026-04-01',
    isDefault: true,
    stages: [
      { id: 'STG-01', name: 'Application Submission', code: 'SUBMISSION', targetDays: 3, roleAllowed: 'COLLEGE_REP' },
      { id: 'STG-02', name: 'Document Scrutiny', code: 'SCRUTINY', targetDays: 7, roleAllowed: 'REGIONAL_OFFICER' },
      { id: 'STG-03', name: 'EVC Physical Inspection', code: 'EVC', targetDays: 10, roleAllowed: 'EVC_MEMBER' },
      { id: 'STG-04', name: 'SAC / SHC Hearing Committee', code: 'SAC_SHC', targetDays: 5, roleAllowed: 'BUREAU_OFFICER' },
      { id: 'STG-05', name: 'Executive Council Final Decision', code: 'FINAL_APPROVAL', targetDays: 5, roleAllowed: 'ADMIN' },
    ],
    rules: {
      allowReturnForDeficiency: true,
      maxDeficiencyCycles: 3,
      deficiencyResolutionDays: 7,
      escalationThresholdDays: 14,
    }
  },
  {
    id: 'WF-SCRUTINY-EVC',
    name: 'Scrutiny + EVC (Standard Pathway)',
    code: 'SCRUTINY_EVC',
    description: 'Applicable for Introduction of New Technical Courses or Additional Divisions',
    version: '2026.1.4',
    effectiveDate: '2026-04-01',
    stages: [
      { id: 'STG-01', name: 'Application Submission', code: 'SUBMISSION', targetDays: 3, roleAllowed: 'COLLEGE_REP' },
      { id: 'STG-02', name: 'Document Scrutiny', code: 'SCRUTINY', targetDays: 7, roleAllowed: 'REGIONAL_OFFICER' },
      { id: 'STG-03', name: 'EVC Physical Inspection', code: 'EVC', targetDays: 10, roleAllowed: 'EVC_MEMBER' },
      { id: 'STG-05', name: 'Executive Council Final Decision', code: 'FINAL_APPROVAL', targetDays: 5, roleAllowed: 'ADMIN' },
    ],
    rules: {
      allowReturnForDeficiency: true,
      maxDeficiencyCycles: 2,
      deficiencyResolutionDays: 7,
      escalationThresholdDays: 12,
    }
  },
  {
    id: 'WF-ONLY-SCRUTINY',
    name: 'Only Scrutiny (Fast-Track EoA)',
    code: 'ONLY_SCRUTINY',
    description: 'Routine Extension of Approval (EoA) without intake variations or compliance infringements',
    version: '2026.1.0',
    effectiveDate: '2026-01-15',
    stages: [
      { id: 'STG-01', name: 'Application Submission', code: 'SUBMISSION', targetDays: 2, roleAllowed: 'COLLEGE_REP' },
      { id: 'STG-02', name: 'Document Scrutiny', code: 'SCRUTINY', targetDays: 5, roleAllowed: 'REGIONAL_OFFICER' },
      { id: 'STG-05', name: 'Executive Council Final Decision', code: 'FINAL_APPROVAL', targetDays: 3, roleAllowed: 'ADMIN' },
    ],
    rules: {
      allowReturnForDeficiency: true,
      maxDeficiencyCycles: 2,
      deficiencyResolutionDays: 5,
      escalationThresholdDays: 8,
    }
  },
  {
    id: 'WF-EVC-SAC',
    name: 'EVC + SAC/SHC (Special Review)',
    code: 'EVC_SAC_SHC',
    description: 'Surprise inspection verification and special hearing following regulatory compliance notices',
    version: '2026.1.1',
    effectiveDate: '2026-03-01',
    stages: [
      { id: 'STG-01', name: 'Notice Issued & Submission', code: 'SUBMISSION', targetDays: 4, roleAllowed: 'BUREAU_OFFICER' },
      { id: 'STG-03', name: 'EVC Physical Inspection', code: 'EVC', targetDays: 8, roleAllowed: 'EVC_MEMBER' },
      { id: 'STG-04', name: 'SAC / SHC Hearing Committee', code: 'SAC_SHC', targetDays: 5, roleAllowed: 'BUREAU_OFFICER' },
      { id: 'STG-05', name: 'Executive Council Final Decision', code: 'FINAL_APPROVAL', targetDays: 4, roleAllowed: 'ADMIN' },
    ],
    rules: {
      allowReturnForDeficiency: true,
      maxDeficiencyCycles: 1,
      deficiencyResolutionDays: 5,
      escalationThresholdDays: 10,
    }
  },
  {
    id: 'WF-ONLY-EVC',
    name: 'Only EVC (Physical Verification Pathway)',
    code: 'ONLY_EVC',
    description: 'Infrastructure verification for change of site or conversion to co-educational status',
    version: '2026.2.0',
    effectiveDate: '2026-02-10',
    stages: [
      { id: 'STG-01', name: 'Application Submission', code: 'SUBMISSION', targetDays: 3, roleAllowed: 'COLLEGE_REP' },
      { id: 'STG-03', name: 'EVC Physical Inspection', code: 'EVC', targetDays: 10, roleAllowed: 'EVC_MEMBER' },
      { id: 'STG-05', name: 'Executive Council Final Decision', code: 'FINAL_APPROVAL', targetDays: 4, roleAllowed: 'ADMIN' },
    ],
    rules: {
      allowReturnForDeficiency: true,
      maxDeficiencyCycles: 2,
      deficiencyResolutionDays: 7,
      escalationThresholdDays: 10,
    }
  }
];

export const WORKFLOW_STAGE_NAMES = {
  SUBMISSION: 'Application Submission',
  SCRUTINY: 'Document Scrutiny',
  EVC: 'EVC Physical Inspection',
  SAC_SHC: 'SAC / SHC Standing Hearing',
  FINAL_APPROVAL: 'Executive Approval',
  APPROVED: 'Approved / Issued',
  REJECTED: 'Rejected'
};
