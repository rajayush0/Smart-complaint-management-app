import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Save token to localStorage
      localStorage.setItem('token', token);
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      navigate('/login?error=auth_failed');
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#0f0f0f',
      color: 'white',
      fontSize: '18px'
    }}>
      Logging you in... ✨
    </div>
  );
}