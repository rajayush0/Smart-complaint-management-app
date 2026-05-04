import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch current user info
    fetch('http://localhost:5000/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        } else {
          navigate('/login');
        }
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#0f0f0f',
      color: 'white'
    }}>
      Loading...
    </div>
  );

  return (
    <div style={{
      background: '#0f0f0f',
      minHeight: '100vh',
      color: 'white',
      padding: '40px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <img
            src={user.avatar}
            alt={user.name}
            style={{ width: '60px', height: '60px', borderRadius: '50%' }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>
              Welcome, {user.name}! 👋
            </h1>
            <p style={{ margin: 0, color: '#888' }}>{user.email}</p>
          </div>
        </div>

        <div style={{
          background: '#252525',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Your Role</p>
          <p style={{
            margin: '4px 0 0',
            fontSize: '18px',
            color: user.role === 'admin' ? '#10b981' :
                   user.role === 'staff' ? '#f59e0b' : '#6366f1',
            fontWeight: 'bold',
            textTransform: 'capitalize'
          }}>
            {user.role}
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            width: '100%'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}