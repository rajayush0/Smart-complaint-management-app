import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/apiClient';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/login?error=auth_failed', { replace: true });
      return;
    }

    const handleAuth = async () => {
      // Store token in localStorage (login() does this synchronously)
      // so the api call below can immediately attach it as a Bearer header
      login(token);

      try {
        const { data } = await api.get('/auth/me');
        const user = data.user;

        if (!user.onboardingComplete) {
          navigate('/onboarding', { replace: true });
          return;
        }

        if (user.role === 'admin')       navigate('/admin',     { replace: true });
        else if (user.role === 'staff')  navigate('/staff',     { replace: true });
        else                             navigate('/dashboard', { replace: true });
      } catch {
        navigate('/login?error=auth_failed', { replace: true });
      }
    };

    handleAuth();
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      height: '100vh', gap: '16px', background: 'var(--bg-page)'
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid var(--border)',
        borderTop: '3px solid var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Signing you in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
