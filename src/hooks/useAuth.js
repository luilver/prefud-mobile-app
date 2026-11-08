import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/api';
import { ENDPOINTS } from '../api/endpoints';
import { storeAuth, getToken, getUser, clearAuth, DEV_TOKEN } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const savedToken = await getToken();
        if (!savedToken) {
          await storeAuth(DEV_TOKEN, { email: 'dev@pantry.local', isActive: true });
          setToken(DEV_TOKEN);
          setUser({ email: 'dev@pantry.local', isActive: true });
        } else {
          const savedUser = await getUser();
          setToken(savedToken);
          setUser(savedUser);
        }
      } finally {
        setLoading(false);
      }
    };
    loadAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      throw new Error('Please enter your email and password.');
    }
    await storeAuth(DEV_TOKEN, { email, isActive: true });
    setToken(DEV_TOKEN);
    setUser({ email, isActive: true });
    return { email, isActive: true, token: DEV_TOKEN };
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthError } from '../api/api';
