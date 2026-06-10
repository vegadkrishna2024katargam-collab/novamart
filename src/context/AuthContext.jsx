import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import api from '../services/api';
import { isAdminEmail } from '../utils/authRole';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('commerce_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('commerce_token'));

  const persistSession = useCallback((payload) => {
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem('commerce_user', JSON.stringify(payload.user));
    localStorage.setItem('commerce_token', payload.token);
  }, []);

  const login = useCallback(async (credentials) => {
    const role = isAdminEmail(credentials.email) ? 'admin' : 'user';
    const { data } = await api.post('/auth/login', credentials);
    const session = {
      ...data,
      user: {
        ...data.user,
        role,
      },
    };
    persistSession(session);
    return session;
  }, [persistSession]);

  const signup = useCallback(async (formData) => {
    const { data } = await api.post('/auth/signup', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const session = {
      ...data,
      user: {
        ...data.user,
        role: 'user',
      },
    };
    persistSession(session);
    return session;
  }, [persistSession]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('commerce_user');
    localStorage.removeItem('commerce_token');
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) localStorage.setItem('commerce_user', JSON.stringify(nextUser));
    else localStorage.removeItem('commerce_user');
  }, []);

  const value = useMemo(() => ({ user, token, isAuthenticated: Boolean(token), login, signup, logout, updateUser }), [user, token, login, signup, logout, updateUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
