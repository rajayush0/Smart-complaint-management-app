import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import api from '../utils/apiClient';

export default function DashboardLayout({ title, actions, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowNotifs(false); };
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

  return (
    <div className="dash-layout">
      <Sidebar />

      <div className="dash-main">
        {/* Top bar */}
        <header className="dash-topbar">
          <span className="dash-topbar__title">{title}</span>

          <div className="dash-topbar__actions">
            {actions}

            {/* Notification bell */}
            <div style={{ position: 'relative' }} ref={dropRef}>
              <button
                className="btn-icon"
                style={{ position: 'relative' }}
                onClick={() => { setShowNotifs(v => !v); if (!showNotifs && unreadCount > 0) markAllRead(); }}
                aria-label="Notifications"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && <span className="notif-dot" />}
              </button>

              {showNotifs && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: 320, background: 'white', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                  zIndex: 300, overflow: 'hidden',
                }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      You're all caught up! 🎉
                    </div>
                  ) : (
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {notifications.slice(0, 8).map(n => (
                        <div key={n._id}
                          onClick={() => { if (n.complaint) { navigate(`/complaint/${n.complaint._id || n.complaint}`); setShowNotifs(false); } }}
                          style={{
                            padding: '12px 18px', borderBottom: '1px solid var(--border)',
                            cursor: n.complaint ? 'pointer' : 'default',
                            background: n.isRead ? 'white' : '#f0fdf4',
                            display: 'flex', gap: 10, alignItems: 'flex-start',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'white' : '#f0fdf4'}
                        >
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.isRead ? 'var(--border)' : 'var(--accent)', marginTop: 5, flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: '0 0 3px', lineHeight: 1.4 }}>{n.message}</p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                              {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Avatar */}
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=10b981&color=fff`}
              alt={user?.name}
              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-light)', cursor: 'pointer' }}
              title={user?.name}
            />
          </div>
        </header>

        {/* Page content */}
        <div className="dash-content">
          {children}
        </div>
      </div>
    </div>
  );
}
