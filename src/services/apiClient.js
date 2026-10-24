import axios from 'axios';

/**
 * Central Axios HTTP Client configured for future Spring Boot backend integration.
 * In this prototype phase, components use AppDataContext & mockDataService.
 * When the Spring Boot REST API is connected, set VITE_API_BASE_URL in your .env file.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor: Attach JWT authorization bearer token when Spring Security is active
apiClient.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem('aicte_auth_session');
    if (session) {
      try {
        const { token } = JSON.parse(session);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Failed to parse auth token', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle global 401 Unauthorized or 403 Forbidden redirects
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized. In production, user is redirected to /login.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
