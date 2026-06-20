import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Demo users for offline/fallback authentication
const DEMO_USERS = [
  {
    id: 'admin-1',
    _id: 'admin-1',
    name: 'Admin User',
    email: 'admin@shopsphere.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1 234 567 890',
    profileImage: '',
  },
  {
    id: 'user-1',
    _id: 'user-1',
    name: 'John Doe',
    email: 'user@shopsphere.com',
    password: 'user123',
    role: 'user',
    phone: '+1 234 567 891',
    profileImage: '',
  },
];

function findDemoUser(email, password) {
  const user = DEMO_USERS.find((u) => u.email === email);
  if (!user || user.password !== password) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

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
    try {
      // Try the real API first
      const { data } = await api.post('/auth/login', credentials);
      persistSession(data);
      return data;
    } catch (apiError) {
      // If API fails, use demo user fallback
      const demoUser = findDemoUser(credentials.email, credentials.password);
      if (demoUser) {
        const fakeToken = 'demo_' + btoa(JSON.stringify({ id: demoUser.id, role: demoUser.role }));
        const data = { user: demoUser, token: fakeToken };
        persistSession(data);
        return data;
      }
      throw new Error(apiError.response?.data?.message || 'Invalid email or password');
    }
  }, [persistSession]);

  const signup = useCallback(async (formData) => {
    try {
      const { data } = await api.post('/auth/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      persistSession(data);
      return data;
    } catch (apiError) {
      // Fallback: create a local demo user
      const email = formData.get ? formData.get('email') : formData.email;
      const name = formData.get ? formData.get('name') : formData.name;
      const newUser = {
        id: 'user-' + Date.now(),
        _id: 'user-' + Date.now(),
        name: name || email?.split('@')[0] || 'User',
        email: email,
        role: 'user',
        phone: formData.get ? formData.get('phone') : formData.phone || '',
        profileImage: '',
      };
      const fakeToken = 'demo_' + btoa(JSON.stringify({ id: newUser.id, role: newUser.role }));
      const data = { user: newUser, token: fakeToken };
      persistSession(data);
      return data;
    }
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

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    signup,
    logout,
    updateUser,
  }), [user, token, login, signup, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);