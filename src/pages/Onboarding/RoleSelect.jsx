import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

const ROLES = [
  {
    id: 'admin',
    label: 'Admin',
    icon: '👑',
    iconBg: '#fdf4ff',
    desc: 'Create and manage your organization, assign staff, and oversee all complaints.',
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: '👷',
    iconBg: '#fffbeb',
    desc: 'Handle complaints assigned to you, update statuses, and communicate with users.',
  },
  {
    id: 'user',
    label: 'User',
    icon: '👤',
    iconBg: '#eff6ff',
    desc: 'Submit and track your own complaints, and communicate with support staff.',
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) return;
    if (selected === 'admin') {
      navigate('/onboarding/org-setup', { state: { role: 'admin' } });
    } else {
      navigate('/onboarding/join', { state: { role: selected } });
    }
  };

  return (
    <div className="ob-page">
      <div className="ob-logo" onClick={() => navigate('/')}>
        <div className="ob-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        ComplaintSys
      </div>

      <div className="ob-card">
        <div className="ob-step-badge">Step 1 of 2</div>
        <h1 className="ob-title">Who are you?</h1>
        <p className="ob-sub">Select your role to set up your experience. You can belong to multiple organizations with different roles.</p>

        <div className="ob-role-grid">
          {ROLES.map(r => (
            <div
              key={r.id}
              className={`ob-role-card${selected === r.id ? ' selected' : ''}`}
              onClick={() => setSelected(r.id)}
            >
              <div className="ob-role-icon" style={{ background: r.iconBg }}>
                {r.icon}
              </div>
              <div className="ob-role-info">
                <h3>{r.label}</h3>
                <p>{r.desc}</p>
              </div>
              {/* Radio dot */}
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${selected === r.id ? 'var(--accent)' : 'var(--border)'}`,
                background: selected === r.id ? 'var(--accent)' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginLeft: 'auto', alignSelf: 'center',
                transition: 'var(--transition)',
              }}>
                {selected === r.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', marginTop: 24, padding: '12px' }}
          disabled={!selected}
          onClick={handleContinue}
        >
          Continue →
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 16 }}>
          You're signing in with Google. Your account is already secure.
        </p>
      </div>
    </div>
  );
}
