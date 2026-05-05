import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_USER = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'New Complaint',
    path: '/dashboard?new=1',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
];

const NAV_STAFF = [
  {
    label: 'My Queue',
    path: '/staff',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
];

const NAV_ADMIN = [
  {
    label: 'Overview',
    path: '/admin',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'All Complaints',
    path: '/admin?tab=complaints',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: 'Users',
    path: '/admin?tab=users',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const ROLE_COLORS = {
  admin: { bg: '#ecfdf5', color: '#059669' },
  staff: { bg: '#fffbeb', color: '#d97706' },
  user:  { bg: '#eff6ff', color: '#3b82f6' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems =
    user?.role === 'admin' ? NAV_ADMIN :
    user?.role === 'staff' ? NAV_STAFF : NAV_USER;

  const isActive = (path) => location.pathname === path.split('?')[0] && (
    !path.includes('?') || location.search.includes(path.split('?')[1])
  );

  const rc = ROLE_COLORS[user?.role] || ROLE_COLORS.user;

  return (
    <aside className="dash-sidebar">
      {/* Logo */}
      <div className="dash-sidebar__logo" onClick={() => navigate('/')}>
        <div className="dash-sidebar__logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        ComplaintSys
      </div>

      {/* Nav */}
      <div className="dash-sidebar__section">
        <span className="dash-sidebar__section-label">Main</span>
        {navItems.map(item => (
          <div
            key={item.label}
            className={`dash-nav-item${isActive(item.path) ? ' active' : ''}`}
            onClick={() => navigate(item.path.split('?')[0])}
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>

      <div className="dash-sidebar__section">
        <span className="dash-sidebar__section-label">Other</span>
        <div className="dash-nav-item" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </div>
        <div className="dash-nav-item" onClick={logout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </div>
      </div>

      {/* User footer */}
      <div className="dash-sidebar__footer">
        <div className="dash-sidebar__user">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=10b981&color=fff`}
            alt={user?.name}
          />
          <div className="dash-sidebar__user-info">
            <p className="dash-sidebar__user-name">{user?.name}</p>
            <p className="dash-sidebar__user-role">
              <span style={{ background: rc.bg, color: rc.color, padding: '1px 7px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700 }}>
                {user?.role}
              </span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
