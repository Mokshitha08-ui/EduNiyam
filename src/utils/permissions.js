/**
 * Role Definitions & Permission Maps for AICTE Portal
 * Note: These are frontend UI navigation guards for demonstration.
 * In production, Spring Security enforces role authorities on all API endpoints.
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  REGIONAL_OFFICER: 'REGIONAL_OFFICER',
  BUREAU_OFFICER: 'BUREAU_OFFICER',
  EVC_MEMBER: 'EVC_MEMBER',
  COMPLIANCE_REVIEWER: 'COMPLIANCE_REVIEWER',
  COLLEGE_REP: 'COLLEGE_REP',
};

export const ROLE_DETAILS = {
  [ROLES.ADMIN]: {
    name: 'System Administrator',
    badge: 'HQ System Admin',
    defaultRoute: '/dashboard',
    allowedNav: ['dashboard', 'applications', 'workflows', 'evc', 'compliance', 'notifications', 'reports', 'users', 'audit', 'settings'],
  },
  [ROLES.REGIONAL_OFFICER]: {
    name: 'Regional Officer',
    badge: 'AICTE Regional Office (South-West)',
    defaultRoute: '/dashboard',
    allowedNav: ['dashboard', 'applications', 'workflows', 'evc', 'compliance', 'notifications', 'reports'],
  },
  [ROLES.BUREAU_OFFICER]: {
    name: 'Bureau Officer',
    badge: 'Approval Bureau (HQ New Delhi)',
    defaultRoute: '/dashboard',
    allowedNav: ['dashboard', 'applications', 'workflows', 'evc', 'compliance', 'notifications', 'reports'],
  },
  [ROLES.EVC_MEMBER]: {
    name: 'EVC Committee Member',
    badge: 'Expert Visit Committee',
    defaultRoute: '/evc',
    allowedNav: ['evc', 'applications', 'notifications'],
  },
  [ROLES.COMPLIANCE_REVIEWER]: {
    name: 'Compliance Reviewer',
    badge: 'Scrutiny & Compliance Cell',
    defaultRoute: '/compliance',
    allowedNav: ['compliance', 'applications', 'notifications', 'reports'],
  },
  [ROLES.COLLEGE_REP]: {
    name: 'College Representative',
    badge: 'Institutional Portal',
    defaultRoute: '/college-portal',
    allowedNav: ['college-portal', 'notifications'],
  },
};

export const hasPermission = (userRole, moduleKey) => {
  if (!userRole || !ROLE_DETAILS[userRole]) return false;
  return ROLE_DETAILS[userRole].allowedNav.includes(moduleKey);
};
