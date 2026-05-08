import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/apiClient';

const STATUS_STYLE = {
  'Open':        { bg: 'var(--status-open-bg)',    color: 'var(--status-open-text)',    border: 'var(--status-open-bd)' },
  'In Progress': { bg: 'var(--status-prog-bg)',    color: 'var(--status-prog-text)',    border: 'var(--status-prog-bd)' },
  'Resolved':    { bg: 'var(--status-res-bg)',     color: 'var(--status-res-text)',     border: 'var(--status-res-bd)' },
  'Closed':      { bg: 'var(--status-closed-bg)',  color: 'var(--status-closed-text)',  border: 'var(--status-closed-bd)' },
};
const PRIORITY_STYLE = {
  'Low':      { bg: 'var(--pri-low-bg)',  color: 'var(--pri-low-text)',  border: 'var(--pri-low-bd)' },
  'Medium':   { bg: 'var(--pri-med-bg)',  color: 'var(--pri-med-text)',  border: 'var(--pri-med-bd)' },
  'High':     { bg: 'var(--pri-high-bg)', color: 'var(--pri-high-text)', border: 'var(--pri-high-bd)' },
  'Critical': { bg: 'var(--pri-crit-bg)', color: 'var(--pri-crit-text)', border: 'var(--pri-crit-bd)' },
};

const PRIORITY_BORDER = {
  'Low':      '#059669',
  'Medium':   '#d97706',
  'High':     '#dc2626',
  'Critical': '#9333ea',
};

function Badge({ label, config }) {
  if (!config) return null;
  return (
    <span className="badge" style={{ background: config.bg, color: config.color, borderColor: config.border }}>
      {label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <div className="skel" style={{ width: '52%', height: 14, borderRadius: 6, marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skel" style={{ width: 68, height: 20, borderRadius: 20 }} />
          <div className="skel" style={{ width: 56, height: 20, borderRadius: 20 }} />
          <div className="skel" style={{ width: 80, height: 20, borderRadius: 20 }} />
        </div>
      </div>
      <div className="skel" style={{ width: 52, height: 14, borderRadius: 6 }} />
    </div>
  );
}

const STAT_FILTERS = ['All', 'Open', 'In Progress', 'Resolved'];

export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints,     setComplaints]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [filter,         setFilter]         = useState('All');
  const [updatingId,     setUpdatingId]     = useState(null);
  const [justResolvedId, setJustResolvedId] = useState(null);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/api/complaints');
      setComplaints(data.complaints || []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const updateStatus = async (complaintId, newStatus, e) => {
    e.stopPropagation();
    setUpdatingId(complaintId);
    try {
      await api.patch(`/api/complaints/${complaintId}/status`, { status: newStatus });
      setComplaints(prev =>
        prev.map(c => c._id === complaintId ? { ...c, status: newStatus } : c)
      );
      if (newStatus === 'Resolved') {
        setJustResolvedId(complaintId);
        setTimeout(() => setJustResolvedId(null), 700);
      }
    } catch { /* silent */ } finally { setUpdatingId(null); }
  };

  const filtered = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <DashboardLayout title="My Tasks">

      {/* Light-theme skeleton pulse, celebrate flash, action buttons */}
      <style>{`
        @keyframes skelPulse {
          0%, 100% { background: #e2e8f0; }
          50%       { background: #cbd5e1; }
        }
        .skel { animation: skelPulse 1.5s ease-in-out infinite; }

        @keyframes celebrate {
          0%   { background: var(--bg-card); }
          35%  { background: #d1fae5; }
          100% { background: var(--bg-card); }
        }
        .celebrating { animation: celebrate 0.65s ease both; }

        .btn-start {
          display: inline-flex; align-items: center; gap: 5px;
          background: #fffbeb; color: #d97706;
          border: 1px solid #fde68a;
          padding: 6px 12px; border-radius: var(--radius-sm);
          font-size: 0.78rem; font-weight: 600; cursor: pointer;
          transition: var(--transition);
        }
        .btn-start:hover:not(:disabled) { background: #fef3c7; border-color: #f59e0b; transform: translateY(-1px); }
        .btn-start:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-resolve {
          display: inline-flex; align-items: center; gap: 5px;
          background: var(--accent-light); color: var(--accent);
          border: 1px solid var(--accent-border);
          padding: 6px 12px; border-radius: var(--radius-sm);
          font-size: 0.78rem; font-weight: 600; cursor: pointer;
          transition: var(--transition);
        }
        .btn-resolve:hover:not(:disabled) { background: #d1fae5; border-color: var(--accent); transform: translateY(-1px); }
        .btn-resolve:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* Profile card */}
      <div className="card fade-up" style={{ padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18 }}>
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'S')}&background=10b981&color=fff`}
          alt={user?.name}
          style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid var(--accent-border)', objectFit: 'cover', flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {user?.specialization ? `${user.specialization} Specialist` : 'Staff Member'}
            {user?.specializationGroup && (
              <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'var(--accent-border)' }}>
                {user.specializationGroup}
              </span>
            )}
            {user?.experienceYears > 0 && (
              <span style={{ color: 'var(--text-muted)' }}>· {user.experienceYears} yrs exp</span>
            )}
          </p>
        </div>
        {/* Resolved achievement */}
        <div style={{
          background: complaints.filter(c => c.status === 'Resolved').length > 0 ? 'var(--status-res-bg)' : 'var(--bg-page)',
          border: `1px solid ${complaints.filter(c => c.status === 'Resolved').length > 0 ? 'var(--status-res-bd)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '12px 20px',
          textAlign: 'center',
          flexShrink: 0,
        }}>
          {(() => {
            const count = complaints.filter(c => c.status === 'Resolved').length;
            return (
              <>
                <p style={{ color: count > 0 ? 'var(--status-res-text)' : 'var(--text-muted)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 2px', lineHeight: 1 }}>{count}</p>
                <p style={{ color: count > 0 ? 'var(--status-res-text)' : 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, margin: 0 }}>Resolved ✅</p>
              </>
            );
          })()}
        </div>
      </div>

      {/* Stat filter cards */}
      <div className="fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 22 }}>
        {STAT_FILTERS.map(status => {
          const count = status === 'All' ? complaints.length : complaints.filter(c => c.status === status).length;
          return (
            <div key={status} className={`stat-card${filter === status ? ' active' : ''}`} onClick={() => setFilter(status)}>
              <p className="stat-card__label">{status === 'All' ? 'Total' : status}</p>
              <p className="stat-card__value">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Tasks list */}
      <div className="card fade-up delay-2" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {filter === 'All' ? 'All Tasks' : `${filter} Tasks`}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>({filtered.length})</span>
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
              <button key={s} className={`filter-pill${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          [1, 2, 3].map(i => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">✅</div>
            <h3>{filter === 'All' ? 'No tasks assigned yet' : `No ${filter} tasks`}</h3>
            <p>{filter === 'All' ? 'Check back later or contact your admin.' : `No tasks with "${filter}" status.`}</p>
          </div>
        ) : (
          filtered.map(complaint => (
            <div
              key={complaint._id}
              className={`complaint-row${justResolvedId === complaint._id ? ' celebrating' : ''}`}
              onClick={() => navigate(`/complaint/${complaint._id}`)}
              style={{ borderLeft: `3px solid ${PRIORITY_BORDER[complaint.priority] || 'transparent'}` }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6, color: 'var(--text-primary)' }}>
                  {complaint.title}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
                  <Badge label={complaint.status}   config={STATUS_STYLE[complaint.status]} />
                  <Badge label={complaint.priority} config={PRIORITY_STYLE[complaint.priority]} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{complaint.category}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                  {complaint.status !== 'In Progress' && complaint.status !== 'Resolved' && (
                    <button className="btn-start" onClick={e => updateStatus(complaint._id, 'In Progress', e)} disabled={updatingId === complaint._id}>
                      {updatingId === complaint._id ? '…' : '▶ Start'}
                    </button>
                  )}
                  {complaint.status !== 'Resolved' && (
                    <button className="btn-resolve" onClick={e => updateStatus(complaint._id, 'Resolved', e)} disabled={updatingId === complaint._id}>
                      {updatingId === complaint._id ? '…' : '✓ Resolve'}
                    </button>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 6 }}>
                  {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}>View →</span>
              </div>
            </div>
          ))
        )}
      </div>

    </DashboardLayout>
  );
}
