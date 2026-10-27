import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS, DEMO_PASSWORD } from '../data/mockUsers';
import { ROLE_DETAILS } from '../utils/permissions';
import { authApi } from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize to stored session or NULL.
  // When no session exists, user MUST log in first at /login.
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('aicte_auth_session');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse auth session', e);
    }
    return null;
  });

  const [authError, setAuthError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Institutional Sign In
  const loginInstitution = async ({ institutionCode, email, password }, isLiveMode = false) => {
    setAuthError(null);
    setIsAuthenticating(true);
    const isLive = isLiveMode || (typeof window !== 'undefined' && localStorage.getItem('aicte_data_mode') === 'live');

    try {
      if (isLive) {
        try {
          const response = await authApi.loginInstitution({ institutionCode, email, password });
          if (response.data && response.data.token) {
            const liveUser = {
              ...response.data.user,
              token: response.data.token,
              loginTime: new Date().toISOString(),
              isLiveSession: true,
            };
            setCurrentUser(liveUser);
            localStorage.setItem('aicte_auth_session', JSON.stringify(liveUser));
            setIsAuthenticating(false);
            return { success: true, user: liveUser };
          }
        } catch (apiErr) {
          const msg = apiErr.response?.data?.message || apiErr.message || 'Unable to connect to live backend authentication service.';
          setAuthError(msg);
          setIsAuthenticating(false);
          if (msg.includes('PENDING_VERIFICATION')) {
            return {
              success: false,
              error: msg,
              isPending: true,
              registration: {
                institutionCode: (institutionCode || '').trim(),
                email: (email || '').trim(),
                status: 'PENDING_VERIFICATION',
              },
            };
          }
          return { success: false, error: msg };
        }
      }

      // Dummy Data Mode Validation
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanCode = (institutionCode || '').trim();

      if (!cleanCode) {
        const msg = 'Please enter your College ID / Institution Code (e.g. 1-34981275).';
        setAuthError(msg);
        setIsAuthenticating(false);
        return { success: false, error: msg };
      }

      // Check registered demo institutions first
      const storedRegistrations = JSON.parse(localStorage.getItem('aicte_demo_registered_institutions') || '[]');
      const foundDemoRegistration = storedRegistrations.find(
        (r) => r.email?.toLowerCase() === cleanEmail
      );

      if (foundDemoRegistration) {
        if (foundDemoRegistration.institutionCode !== cleanCode) {
          const msg = 'College ID / Institution Code does not match the registered representative email.';
          setAuthError(msg);
          setIsAuthenticating(false);
          return { success: false, error: msg };
        }

        if (foundDemoRegistration.password !== password) {
          const msg = 'Invalid password for this registered demo institution.';
          setAuthError(msg);
          setIsAuthenticating(false);
          return { success: false, error: msg };
        }

        if (foundDemoRegistration.status === 'PENDING_VERIFICATION') {
          const msg = 'Your institution registration is currently PENDING_VERIFICATION by AICTE Regional Office. Dashboard access will be activated once verified.';
          setAuthError(msg);
          setIsAuthenticating(false);
          return { success: false, error: msg, isPending: true, registration: foundDemoRegistration };
        }

        // If verified demo institution
        const sessionData = {
          id: `USR-DEMO-${foundDemoRegistration.institutionCode}`,
          name: foundDemoRegistration.representativeName,
          email: foundDemoRegistration.email,
          role: 'COLLEGE_REP',
          department: foundDemoRegistration.designation,
          region: foundDemoRegistration.region || 'South-Western',
          institution: foundDemoRegistration.institutionName,
          institutionCode: foundDemoRegistration.institutionCode,
          status: foundDemoRegistration.status || 'ACTIVE',
          token: `demo-jwt-token-USR-006-${Date.now()}`,
          loginTime: new Date().toISOString(),
          isLiveSession: false,
        };

        setCurrentUser(sessionData);
        localStorage.setItem('aicte_auth_session', JSON.stringify(sessionData));
        setIsAuthenticating(false);
        return { success: true, user: sessionData };
      }

      // Check documented College Representative in mock data (USR-006)
      const collegeUser = INITIAL_USERS.find(
        (u) => u.role === 'COLLEGE_REP' && u.email.toLowerCase() === cleanEmail
      );

      if (!collegeUser) {
        const msg = 'No institutional account registered with this official email. Please verify credentials or complete Institutional Sign Up.';
        setAuthError(msg);
        setIsAuthenticating(false);
        return { success: false, error: msg };
      }

      if (collegeUser.institutionCode !== cleanCode) {
        const msg = 'College ID / Institution Code does not match the registered representative email.';
        setAuthError(msg);
        setIsAuthenticating(false);
        return { success: false, error: msg };
      }

      if (password !== DEMO_PASSWORD && password !== 'aicte@demo123') {
        const msg = `Invalid password. Demo password is "${DEMO_PASSWORD}" or "aicte@demo123".`;
        setAuthError(msg);
        setIsAuthenticating(false);
        return { success: false, error: msg };
      }

      const sessionData = {
        ...collegeUser,
        token: `demo-jwt-token-${collegeUser.id}-${Date.now()}`,
        loginTime: new Date().toISOString(),
        isLiveSession: false,
      };

      setCurrentUser(sessionData);
      localStorage.setItem('aicte_auth_session', JSON.stringify(sessionData));
      setIsAuthenticating(false);
      return { success: true, user: sessionData };
    } catch (err) {
      const msg = 'An unexpected authentication error occurred.';
      setAuthError(msg);
      setIsAuthenticating(false);
      return { success: false, error: msg };
    }
  };

  // Institutional Sign Up
  const registerInstitution = async (formData, isLiveMode = false) => {
    setAuthError(null);
    setIsAuthenticating(true);
    const isLive = isLiveMode || (typeof window !== 'undefined' && localStorage.getItem('aicte_data_mode') === 'live');

    try {
      if (isLive) {
        try {
          const res = await authApi.registerInstitution(formData);
          setIsAuthenticating(false);
          return { success: true, data: res.data };
        } catch (apiErr) {
          const msg = apiErr.response?.data?.message || apiErr.message || 'Institutional registration failed on the server.';
          setAuthError(msg);
          setIsAuthenticating(false);
          return { success: false, error: msg };
        }
      }

      // Dummy Data Mode: Isolated mock registration
      const cleanEmail = (formData.email || '').trim().toLowerCase();
      const cleanCode = (formData.institutionCode || '').trim();

      if (!cleanCode) {
        const msg = 'College ID / Institution Code is required (e.g. 1-34981275).';
        setAuthError(msg);
        setIsAuthenticating(false);
        return { success: false, error: msg };
      }

      const storedRegistrations = JSON.parse(localStorage.getItem('aicte_demo_registered_institutions') || '[]');

      if (
        INITIAL_USERS.some((u) => u.email.toLowerCase() === cleanEmail) ||
        storedRegistrations.some((r) => r.email?.toLowerCase() === cleanEmail)
      ) {
        const msg = `Official email address is already registered: ${formData.email}`;
        setAuthError(msg);
        setIsAuthenticating(false);
        return { success: false, error: msg };
      }

      if (
        INITIAL_USERS.some((u) => u.institutionCode === cleanCode) ||
        storedRegistrations.some((r) => r.institutionCode === cleanCode)
      ) {
        const msg = `College ID / Institution Code is already registered: ${cleanCode}`;
        setAuthError(msg);
        setIsAuthenticating(false);
        return { success: false, error: msg };
      }

      const finalCode = cleanCode;

      const newRecord = {
        ...formData,
        institutionCode: finalCode,
        status: 'PENDING_VERIFICATION',
        isDemoRecord: true,
        registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };

      storedRegistrations.push(newRecord);
      localStorage.setItem('aicte_demo_registered_institutions', JSON.stringify(storedRegistrations));

      setIsAuthenticating(false);
      return {
        success: true,
        data: {
          success: true,
          message: 'Institutional registration submitted successfully. Your application is awaiting administrator verification. Official credentials will be activated upon verification.',
          institutionCode: finalCode,
          institutionName: formData.institutionName,
          status: 'PENDING_VERIFICATION',
          registeredAt: newRecord.registeredAt,
          isDemo: true,
        },
      };
    } catch (err) {
      const msg = 'Registration error: ' + (err.message || 'Unexpected failure');
      setAuthError(msg);
      setIsAuthenticating(false);
      return { success: false, error: msg };
    }
  };

  // AICTE Officer Sign In
  const loginStaff = async ({ email, password, requestedRole }, isLiveMode = false) => {
    setAuthError(null);
    setIsAuthenticating(true);
    const isLive = isLiveMode || (typeof window !== 'undefined' && localStorage.getItem('aicte_data_mode') === 'live');

    try {
      if (isLive) {
        try {
          const response = await authApi.loginStaff({ email, password, requestedRole });
          if (response.data && response.data.token) {
            const liveUser = {
              ...response.data.user,
              token: response.data.token,
              loginTime: new Date().toISOString(),
              isLiveSession: true,
            };
            setCurrentUser(liveUser);
            localStorage.setItem('aicte_auth_session', JSON.stringify(liveUser));
            setIsAuthenticating(false);
            return { success: true, user: liveUser };
          }
        } catch (apiErr) {
          const msg = apiErr.response?.data?.message || apiErr.message || 'Officer authentication failed on live backend.';
          setAuthError(msg);
          setIsAuthenticating(false);
          if (msg.includes('PENDING_APPROVAL')) {
            return {
              success: false,
              error: msg,
              isPending: true,
              request: {
                email: (email || '').trim(),
                requestedRole: requestedRole || 'REGIONAL_OFFICER',
                status: 'PENDING_APPROVAL',
              },
            };
          }
          return { success: false, error: msg };
        }
      }

      // Dummy Data Mode Validation
      const cleanEmail = (email || '').trim().toLowerCase();

      // Check pending/rejected officer requests in mock storage
      const mockOfficerRequests = JSON.parse(localStorage.getItem('aicte_demo_officer_requests') || '[]');
      const pendingReq = mockOfficerRequests.find((r) => r.email?.toLowerCase() === cleanEmail);
      if (pendingReq) {
        if (pendingReq.status === 'PENDING_APPROVAL') {
          const msg = 'Officer Access Request is currently PENDING_APPROVAL. An authorized administrator must review and approve your request before access is granted.';
          setAuthError(msg);
          setIsAuthenticating(false);
          return { success: false, error: msg, isPending: true, request: pendingReq };
        }
        if (pendingReq.status === 'REJECTED') {
          const msg = `Your Officer Access Request was REJECTED by System Administration. Reason: ${pendingReq.rejectionReason || 'Incomplete credentials'}`;
          setAuthError(msg);
          setIsAuthenticating(false);
          return { success: false, error: msg };
        }
      }

      // Check approved mock officers
      const mockApprovedOfficers = JSON.parse(localStorage.getItem('aicte_demo_approved_officers') || '[]');
      let user = mockApprovedOfficers.find((u) => u.email?.toLowerCase() === cleanEmail);

      // Otherwise check INITIAL_USERS
      if (!user) {
        user = INITIAL_USERS.find((u) => u.email?.toLowerCase() === cleanEmail);
      }

      if (!user) {
        const msg = 'Unregistered official email address. Please check your credentials or submit an Officer Access Request.';
        setAuthError(msg);
        setIsAuthenticating(false);
        return { success: false, error: msg };
      }

      if (user.role === 'COLLEGE_REP') {
        const msg = 'Access restricted: This account belongs to a College Representative. Please use the College / Institution Sign In tab.';
        setAuthError(msg);
        setIsAuthenticating(false);
        return { success: false, error: msg };
      }

      if (password !== DEMO_PASSWORD && password !== 'aicte@demo123' && user.password !== password) {
        const msg = `Invalid password for official account. Use demo password "${DEMO_PASSWORD}" for demo accounts.`;
        setAuthError(msg);
        setIsAuthenticating(false);
        return { success: false, error: msg };
      }

      // Verify Role Mismatch
      if (requestedRole) {
        const actualRole = user.role;
        const match =
          actualRole.toUpperCase() === requestedRole.toUpperCase() ||
          (requestedRole === 'SYSTEM_ADMIN' && actualRole === 'ADMIN') ||
          (requestedRole === 'ADMIN' && actualRole === 'SYSTEM_ADMIN');

        if (!match) {
          const msg = `Role mismatch: Your official account is assigned the role ${actualRole}, but you are attempting to sign in under ${requestedRole}. Please select the matching designation card.`;
          setAuthError(msg);
          setIsAuthenticating(false);
          return { success: false, error: msg };
        }
      }

      const sessionData = {
        ...user,
        role: user.role === 'SYSTEM_ADMIN' ? 'ADMIN' : user.role,
        token: `demo-jwt-token-${user.id}-${Date.now()}`,
        loginTime: new Date().toISOString(),
        isLiveSession: false,
        status: user.status || 'ACTIVE',
      };

      setCurrentUser(sessionData);
      localStorage.setItem('aicte_auth_session', JSON.stringify(sessionData));
      setIsAuthenticating(false);
      return { success: true, user: sessionData };
    } catch (err) {
      const msg = 'An unexpected authentication error occurred.';
      setAuthError(msg);
      setIsAuthenticating(false);
      return { success: false, error: msg };
    }
  };

  // AICTE Officer Access Request (Sign Up)
  const requestOfficerAccess = async (formData, isLiveMode = false) => {
    setAuthError(null);
    setIsAuthenticating(true);
    const isLive = isLiveMode || (typeof window !== 'undefined' && localStorage.getItem('aicte_data_mode') === 'live');

    try {
      if (isLive) {
        try {
          const res = await authApi.createOfficerAccessRequest(formData);
          setIsAuthenticating(false);
          return { success: true, data: res.data };
        } catch (apiErr) {
          const msg = apiErr.response?.data?.message || apiErr.message || 'Officer access request submission failed.';
          setAuthError(msg);
          setIsAuthenticating(false);
          return { success: false, error: msg };
        }
      }

      // Dummy Data Mode: Isolated mock storage
      const cleanEmail = (formData.email || '').trim().toLowerCase();
      const cleanEmpId = (formData.employeeId || '').trim();

      const storedRequests = JSON.parse(localStorage.getItem('aicte_demo_officer_requests') || '[]');

      if (
        INITIAL_USERS.some((u) => u.email?.toLowerCase() === cleanEmail) ||
        storedRequests.some((r) => r.email?.toLowerCase() === cleanEmail)
      ) {
        const msg = `Official email address is already registered: ${formData.email}`;
        setAuthError(msg);
        setIsAuthenticating(false);
        return { success: false, error: msg };
      }

      if (storedRequests.some((r) => r.employeeId === cleanEmpId)) {
        const msg = `Employee ID is already registered: ${cleanEmpId}`;
        setAuthError(msg);
        setIsAuthenticating(false);
        return { success: false, error: msg };
      }

      const requestId = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;
      const newRecord = {
        ...formData,
        id: requestId,
        status: 'PENDING_APPROVAL',
        isDemoRecord: true,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };

      storedRequests.unshift(newRecord);
      localStorage.setItem('aicte_demo_officer_requests', JSON.stringify(storedRequests));

      setIsAuthenticating(false);
      return {
        success: true,
        data: {
          id: requestId,
          status: 'PENDING_APPROVAL',
          message: 'Officer Access Request submitted successfully. Your request is awaiting verification and approval by an authorized AICTE System Administrator.',
          ...newRecord,
        },
      };
    } catch (err) {
      const msg = 'Officer request error: ' + (err.message || 'Unexpected failure');
      setAuthError(msg);
      setIsAuthenticating(false);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aicte_auth_session');
    try {
      authApi.logout().catch(() => {});
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        roleDetails: currentUser ? ROLE_DETAILS[currentUser.role] : null,
        loginInstitution,
        registerInstitution,
        loginStaff,
        requestOfficerAccess,
        logout,
        authError,
        setAuthError,
        isAuthenticating,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
