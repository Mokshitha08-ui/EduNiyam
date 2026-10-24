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

  const login = async (email, password, isLiveMode = false) => {
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      // If Live Data Mode is explicitly active, try authenticating with Spring Boot backend
      if (isLiveMode) {
        try {
          const response = await authApi.login({ email, password });
          if (response.data && response.data.token) {
            const liveUser = {
              ...response.data.user,
              token: response.data.token,
              loginTime: new Date().toISOString(),
              isLiveSession: true
            };
            setCurrentUser(liveUser);
            localStorage.setItem('aicte_auth_session', JSON.stringify(liveUser));
            setIsAuthenticating(false);
            return liveUser;
          }
        } catch (apiErr) {
          console.warn('Live authentication failed or backend unavailable:', apiErr);
          // Fall through to demo check or report failure if non-demo credentials
        }
      }

      // Demo authentication validation
      const user = INITIAL_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

      if (!user) {
        setAuthError('User with this email not found. Please use one of the documented demo accounts.');
        setIsAuthenticating(false);
        return false;
      }

      if (password !== DEMO_PASSWORD && password !== 'aicte@demo123') {
        setAuthError(`Invalid password. Demo password is "${DEMO_PASSWORD}" or "aicte@demo123".`);
        setIsAuthenticating(false);
        return false;
      }

      const sessionData = {
        ...user,
        token: `demo-jwt-token-${user.id}-${Date.now()}`,
        loginTime: new Date().toISOString(),
        isLiveSession: false
      };

      setCurrentUser(sessionData);
      localStorage.setItem('aicte_auth_session', JSON.stringify(sessionData));
      setIsAuthenticating(false);
      return sessionData;
    } catch (err) {
      setAuthError('An unexpected authentication error occurred.');
      setIsAuthenticating(false);
      return false;
    }
  };

  const demoLogin = (role) => {
    setAuthError(null);
    const user = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
    const sessionData = {
      ...user,
      token: `demo-jwt-token-${user.id}-${Date.now()}`,
      loginTime: new Date().toISOString(),
      isLiveSession: false
    };
    setCurrentUser(sessionData);
    localStorage.setItem('aicte_auth_session', JSON.stringify(sessionData));
    return sessionData;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aicte_auth_session');
  };

  const switchRole = (role) => {
    return demoLogin(role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        roleDetails: currentUser ? ROLE_DETAILS[currentUser.role] : null,
        login,
        demoLogin,
        switchRole,
        logout,
        authError,
        setAuthError,
        isAuthenticating,
        isAuthenticated: !!currentUser
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
