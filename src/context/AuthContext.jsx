import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  // activeOrg: the currently selected organization object
  const [activeOrg, setActiveOrg] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user (now includes populated organizations[])
  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);

      // Restore active org from localStorage, or default to first org
      const savedOrgId = localStorage.getItem('activeOrgId');
      const orgs = data.user?.organizations || [];

      if (orgs.length > 0) {
        const saved = orgs.find(o => o.org?._id === savedOrgId);
        const defaultOrg = orgs.find(o => o.isDefault) || orgs[0];
        const toSet = saved || defaultOrg;
        setActiveOrg({ ...toSet.org, myRole: toSet.role });
      }
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    fetchUser();
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('activeOrgId');
    setUser(null);
    setActiveOrg(null);
    window.location.href = '/login';
  };

  // Switch the active organization (for the org switcher in sidebar)
  const switchOrg = (org, role) => {
    const entry = { ...org, myRole: role };
    setActiveOrg(entry);
    localStorage.setItem('activeOrgId', org._id);
  };

  // Convenience: get user's role in the ACTIVE org (falls back to global role)
  const roleInActiveOrg = activeOrg?.myRole || user?.role || 'user';

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, fetchUser,
      activeOrg, switchOrg, roleInActiveOrg,
      orgs: user?.organizations || [],
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export default AuthContext;