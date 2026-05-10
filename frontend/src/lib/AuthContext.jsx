import React, { createContext, useContext } from 'react';

const FAKE_USER = {
  id: 'local-user',
  email: 'you@localhost',
  full_name: 'Local User',
  role: 'admin',
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const value = {
    user: FAKE_USER,
    isAuthenticated: true,
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authError: null,
    appPublicSettings: null,
    authChecked: true,
    logout: () => {},
    navigateToLogin: () => {},
    checkUserAuth: async () => {},
    checkAppState: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
