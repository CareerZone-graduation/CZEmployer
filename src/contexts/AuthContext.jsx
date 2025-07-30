import { useState, useEffect, useCallback } from 'react';
import { getMe } from '@/services/authService';
import * as tokenUtil from '@/utils/token';
import { forcedLogout } from '@/utils/auth';
import { AuthContext } from '@/hooks/useAuth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const handleLogin = (userData, accessToken) => {
    tokenUtil.saveAccessToken(accessToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = useCallback(async () => {
    await forcedLogout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const validateSession = async () => {
      const token = tokenUtil.getAccessToken();
      if (!token) {
        setIsInitializing(false);
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        // The interceptor in apiClient will handle token refresh automatically
        const response = await getMe();
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid user data');
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        // forcedLogout is already called by the interceptor on refresh failure
        // We just need to ensure the state is clean
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsInitializing(false);
      }
    };

    validateSession();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isInitializing,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth hook has been moved to a separate file for Fast Refresh compatibility.
