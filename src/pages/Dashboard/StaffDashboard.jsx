import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/apiClient';

const STATUS_STYLE = {
  'Open':        { bg: 'var(--status-open-bg)',   color: 'var(--status-open-text)',   border: 'var(--status-open-bd)' },
  'In Progress': { bg: 'var(--status-prog-bg)',   color: 'var(--status-prog-text)',   border: 'var(--status-prog-bd)' },
  'Resolved':    { bg: 'var(--status-res-bg)',    color: 'var(--status-res-text)',    border: 'var(--status-res-bd)' },
  'Closed':      { bg: 'var(--status-closed-bg)', color: 'var(--status-closed-text)', border: 'var(--status-closed-bd)' },
};
const PRIORITY_STYLE = {
  'Low':      { bg: 'var(--pri-low-bg)',  color: 'var(--pri-low-text)',  border: 'var(--pri-low-bd)' },
  'Medium':   { bg: 'var(--pri-med-bg)',  color: 'var(--pri-med-text)',  border: 'var(--pri-med-bd)' },
  'High':     { bg: 'var(--pri-high-bg)', color: 'var(--pri-high-text)', border: 'var(--pri-high-bd)' },
  'Critical': { bg: 'var(--pri-crit-bg)', color: 'var(--pri-crit-text)', border: 'var(--pri-crit-bd)' },
};

function Badge({ label, config }) {
  if (!config) return null;
  return <span className="badge" style={{ background: config.bg, color: config.color, borderColor: config.border }}>{label}</span>;
}

const STAT_FILTERS = ['All', 'Open', 'In Progress', 'Resolved'];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/complaints');
      setComplaints(data.complaints || []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const filteredComplaints = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <DashboardLayout
      title="My Queue"
      actions={
        <button className="btn-ghost" onClick={fetchComplaints} style={{ gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-.41-7.46" />
          </svg>
          Refresh
        </button>
      }
    >
      {/* Stat cards */}
      <div className="fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 22 }}>
        {STAT_FILTERS.map(status => {
          const count = status === 'All' ? complaints.length : complaints.filter(c => c.status === status).length;
          return (
            <div key={status} className={`stat-card${filter === status ? ' active' : ''}`} onClick={() => setFilter(status)}>
              <p className="stat-card__label">{status === 'All' ? 'Total Assigned' : status}</p>
              <p className="stat-card__value">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Complaints table */}
      <div className="card fade-up delay-2" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            Assigned Complaints
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>({filteredComplaints.length})</span>
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {STAT_FILTERS.map(s => (
              <button key={s} className={`filter-pill${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, gap: 14 }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading queue…</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🎉</div>
            <h3>All clear!</h3>
            <p>No {filter !== 'All' ? filter.toLowerCase() + ' ' : ''}complaints to manage.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(c => (
                  <tr key={c._id}>
                    <td>
                      <p style={{ fontWeight: 600, margin: '0 0 3px', color: 'var(--text-primary)' }}>{c.title}</p>
                      {c.submittedBy?.name && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>by {c.submittedBy.name}</p>}
                    </td>
                    <td><Badge label={c.status} config={STATUS_STYLE[c.status]} /></td>
                    <td><Badge label={c.priority} config={PRIORITY_STYLE[c.priority]} /></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.category}</td>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => navigate(`/complaint/${c._id}`)}>
                        Manage →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
