import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const needsOnboarding = searchParams.get('onboarding') === 'true';

    if (token) {
      login(token);
      // Give AuthContext a moment to set the user, then redirect
      setTimeout(() => {
        if (needsOnboarding) {
          navigate('/onboarding', { replace: true });
        } else {
          // Role-based redirect handled inside ProtectedRoute/dashboard
          navigate('/dashboard', { replace: true });
        }
      }, 100);
    } else {
      navigate('/login?error=auth_failed');
    }
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