import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

/**
 * Custom hook to use the AuthContext.
 * @returns {object} The authentication context value.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
