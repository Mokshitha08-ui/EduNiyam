import apiClient from './apiClient';

/**
 * Spring Boot REST API Service Layer
 * Connects to backend endpoints defined in API_SPECIFICATION.md
 * Reads base URL from VITE_API_BASE_URL (configured in .env)
 */

export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
};

// System Health & Connectivity Check
export const healthApi = {
  checkHealth: async () => {
    return apiClient.get('/health');
  },
};

// Applications API
export const applicationsApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/applications', { params });
  },
  getById: async (id) => {
    return apiClient.get(`/applications/${id}`);
  },
  create: async (data) => {
    return apiClient.post('/applications', data);
  },
  update: async (id, data) => {
    return apiClient.put(`/applications/${id}`, data);
  },
  submitDraft: async (id) => {
    return apiClient.post(`/applications/${id}/submit`);
  },
  deleteDraft: async (id) => {
    return apiClient.delete(`/applications/${id}`);
  },
  advanceStage: async (id, payload) => {
    return apiClient.post(`/applications/${id}/advance-stage`, payload);
  },
  returnDeficiency: async (id, payload) => {
    return apiClient.post(`/applications/${id}/deficiency`, payload);
  },
  resubmit: async (id, payload) => {
    return apiClient.post(`/applications/${id}/resubmit`, payload);
  },
  assignOfficer: async (id, payload) => {
    return apiClient.patch(`/applications/${id}/assign-officer`, payload);
  },
  markEvc: async (id, payload) => {
    return apiClient.post(`/applications/${id}/mark-evc`, payload);
  },
  submitReview: async (id, payload) => {
    return apiClient.post(`/applications/${id}/reviews`, payload);
  },
  getReviews: async (id) => {
    return apiClient.get(`/applications/${id}/reviews`);
  },
  createObservation: async (id, payload) => {
    return apiClient.post(`/applications/${id}/observations`, payload);
  },
  verifyObservation: async (id, obsId, payload) => {
    return apiClient.post(`/applications/${id}/observations/${obsId}/verify`, payload);
  },
  getDeficiencies: async (id) => {
    return apiClient.get(`/applications/${id}/deficiencies`);
  },
};

// Workflows & Pathways API
export const workflowsApi = {
  getAll: async () => {
    return apiClient.get('/workflows');
  },
  getById: async (id) => {
    return apiClient.get(`/workflows/${id}`);
  },
  create: async (data) => {
    return apiClient.post('/workflows', data);
  },
  update: async (id, data) => {
    return apiClient.put(`/workflows/${id}`, data);
  },
  activate: async (id) => {
    return apiClient.post(`/workflows/${id}/activate`);
  },
  deactivate: async (id) => {
    return apiClient.post(`/workflows/${id}/deactivate`);
  },
  updateConfig: async (id, config) => {
    return apiClient.put(`/workflows/${id}/config`, config);
  },
};

// Compliance & Statutory Documents API
export const complianceApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/compliance', { params });
  },
  getById: async (id) => {
    return apiClient.get(`/compliance/${id}`);
  },
  verify: async (id, payload) => {
    return apiClient.post(`/compliance/${id}/verify`, payload);
  },
  upload: async (id, formData) => {
    return apiClient.post(`/compliance/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// EVC Inspection Schedules API
export const evcApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/evc/schedules', { params });
  },
  getById: async (id) => {
    return apiClient.get(`/evc/schedules/${id}`);
  },
  getByApplicationId: async (applicationId) => {
    return apiClient.get(`/evc/schedules/application/${applicationId}`);
  },
  createVisit: async (payload) => {
    return apiClient.post('/evc/schedules', payload);
  },
  rescheduleVisit: async (id, payload) => {
    return apiClient.post(`/evc/schedules/${id}/reschedule`, payload);
  },
  cancelVisit: async (id, payload) => {
    return apiClient.post(`/evc/schedules/${id}/cancel`, payload);
  },
  assignCommitteeMembers: async (id, payload) => {
    return apiClient.post(`/evc/schedules/${id}/assign-committee`, payload);
  },
  schedule: async (id, payload) => {
    return apiClient.post(`/evc/schedules/${id}/assign`, payload);
  },
  submitReport: async (id, payload) => {
    return apiClient.post(`/evc/schedules/${id}/report`, payload);
  },
  reviewReport: async (id, payload) => {
    return apiClient.post(`/evc/schedules/${id}/review-report`, payload);
  },
  complete: async (id, payload) => {
    return apiClient.post(`/evc/schedules/${id}/complete`, payload);
  },
};

// Alerts & Escalations API
export const notificationsApi = {
  getAll: async () => {
    return apiClient.get('/notifications');
  },
  markRead: async (id) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },
  markAllRead: async () => {
    return apiClient.patch('/notifications/read-all');
  },
};

export const escalationsApi = {
  getAll: async () => {
    return apiClient.get('/escalations');
  },
  acknowledge: async (id, payload) => {
    return apiClient.post(`/escalations/${id}/acknowledge`, payload);
  },
};

// Audit Trail API
export const auditApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/audit', { params });
  },
};

// User Accounts API
export const usersApi = {
  getAll: async () => {
    return apiClient.get('/users');
  },
  create: async (userData) => {
    return apiClient.post('/users', userData);
  },
  updateStatus: async (id, status) => {
    return apiClient.patch(`/users/${id}/status`, { status });
  },
};

// Authentication API (Real Spring Security)
export const authApi = {
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },
  loginStaff: async (credentials) => {
    return apiClient.post('/auth/staff/login', credentials);
  },
  createOfficerAccessRequest: async (data) => {
    return apiClient.post('/auth/staff/access-requests', data);
  },
  loginInstitution: async (credentials) => {
    return apiClient.post('/auth/institution/login', credentials);
  },
  registerInstitution: async (registrationData) => {
    return apiClient.post('/auth/institutions/register', registrationData);
  },
  me: async () => {
    return apiClient.get('/auth/me');
  },
  logout: async () => {
    return apiClient.post('/auth/logout');
  },
};

// Administrator Officer Request Management API
export const adminApi = {
  getOfficerRequests: async (status) => {
    const params = status ? { status } : {};
    return apiClient.get('/admin/officer-requests', { params });
  },
  approveOfficerRequest: async (id, payload = {}) => {
    return apiClient.post(`/admin/officer-requests/${id}/approve`, payload);
  },
  rejectOfficerRequest: async (id, payload = {}) => {
    return apiClient.post(`/admin/officer-requests/${id}/reject`, payload);
  },
  // Institution Verification Management
  getInstitutions: async (status) => {
    const params = status ? { status } : {};
    return apiClient.get('/admin/institutions', { params });
  },
  verifyInstitution: async (code) => {
    return apiClient.post(`/admin/institutions/${code}/verify`);
  },
  rejectInstitution: async (code, payload = {}) => {
    return apiClient.post(`/admin/institutions/${code}/reject`, payload);
  },
};
