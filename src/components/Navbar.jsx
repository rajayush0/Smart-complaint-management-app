import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/apiClient';

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  staff: { label: 'Staff', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  user:  { label: 'User',  color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/api/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* silent */ }
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'staff') return '/staff';
    return '/dashboard';
  };

  const roleConf = ROLE_CONFIG[user?.role] || ROLE_CONFIG.user;

  return (
    <nav className="navbar fade-up delay-1">
      {/* Logo */}
      <div onClick={() => navigate(getDashboardLink())} className="logo" style={{ cursor: 'pointer' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        ComplaintSys
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Role Badge */}
        <span style={{
          background: roleConf.bg, color: roleConf.color,
          border: `1px solid ${roleConf.border}`,
          padding: '5px 14px', borderRadius: '30px',
          fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize',
          letterSpacing: '0.03em'
        }}>
          {roleConf.label}
        </span>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => {
              setShowNotifs(v => !v);
              if (!showNotifs && unreadCount > 0) markAllRead();
            }}
            style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: '12px', padding: '9px', cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', position: 'relative', transition: 'var(--transition)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--glass-border-active)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            aria-label="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                background: '#ef4444', color: 'white', borderRadius: '50%',
                width: '18px', height: '18px', fontSize: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, boxShadow: '0 0 10px rgba(239,68,68,0.5)',
                border: '2px solid var(--bg-primary)'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifs && (
            <div className="fade-in" style={{
              position: 'absolute', right: 0, top: 'calc(100% + 10px)',
              width: '340px',
              background: 'rgba(13, 18, 32, 0.97)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              zIndex: 300,
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span style={{
                    background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                    padding: '3px 10px', borderRadius: '20px',
                    fontSize: '0.78rem', fontWeight: 600
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔔</div>
                  You're all caught up!
                </div>
              ) : (
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {notifications.slice(0, 8).map(notif => (
                    <div key={notif._id}
                      onClick={() => { if (notif.complaint) { navigate(`/complaint/${notif.complaint._id || notif.complaint}`); setShowNotifs(false); } }}
                      style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid var(--glass-border)',
                        cursor: notif.complaint ? 'pointer' : 'default',
                        background: notif.isRead ? 'transparent' : 'rgba(99,102,241,0.06)',
                        transition: 'var(--transition)',
                        display: 'flex', gap: '12px', alignItems: 'flex-start'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(99,102,241,0.06)'}
                    >
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: notif.isRead ? 'transparent' : '#6366f1',
                        marginTop: '6px', flexShrink: 0,
                        boxShadow: notif.isRead ? 'none' : '0 0 8px rgba(99,102,241,0.5)'
                      }} />
                      <div>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', margin: '0 0 4px', lineHeight: 1.4 }}>
                          {notif.message}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                          {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff`}
            alt={user?.name}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              border: '2px solid rgba(99,102,241,0.5)',
              objectFit: 'cover'
            }}
          />
          <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
            {user?.name?.split(' ')[0]}
          </span>
        </div>

        {/* My Profile */}
        <button onClick={() => navigate('/profile')} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          👤 Profile
        </button>

        {/* Logout */}
        <button onClick={logout} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          Logout
        </button>
      </div>
    </nav>
  );
}