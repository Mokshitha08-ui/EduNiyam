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
};

// Workflows & Pathways API
export const workflowsApi = {
  getAll: async () => {
    return apiClient.get('/workflows');
  },
  getById: async (id) => {
    return apiClient.get(`/workflows/${id}`);
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
  schedule: async (id, payload) => {
    return apiClient.post(`/evc/schedules/${id}/assign`, payload);
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
  me: async () => {
    return apiClient.get('/auth/me');
  },
};
