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

const TABS = ['analytics', 'complaints', 'users'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, uRes] = await Promise.all([api.get('/api/complaints'), api.get('/api/users')]);
      setComplaints(cRes.data.complaints || []);
      setUsers(uRes.data.users || []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch { alert('Failed to update role'); }
  };

  const handleAssign = async (complaintId, staffId) => {
    try {
      await api.patch(`/api/complaints/${complaintId}/assign`, { staffId: staffId || null });
      fetchData();
    } catch { alert('Failed to assign'); }
  };

  const total = complaints.length;
  const open = complaints.filter(c => c.status === 'Open').length;
  const inProg = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
  const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const staffCount = users.filter(u => u.role === 'staff').length;
  const staffUsers = users.filter(u => ['staff', 'admin'].includes(u.role));
  const filteredComplaints = statusFilter === 'All' ? complaints : complaints.filter(c => c.status === statusFilter);

  const METRICS = [
    { label: 'Total Complaints', value: total, accent: 'var(--text-primary)' },
    { label: 'Open', value: open, accent: 'var(--status-open-text)' },
    { label: 'In Progress', value: inProg, accent: 'var(--status-prog-text)' },
    { label: 'Resolved', value: resolved, accent: 'var(--status-res-text)' },
    { label: 'Resolution Rate', value: `${resRate}%`, accent: 'var(--accent)' },
    { label: 'Total Users', value: users.length, accent: 'var(--text-primary)' },
    { label: 'Active Staff', value: staffCount, accent: '#9333ea' },
  ];

  return (
    <DashboardLayout
      title="Admin Panel"
      actions={
        <button className="btn-ghost" onClick={fetchData} style={{ gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-.41-7.46" />
          </svg>
          Refresh
        </button>
      }
    >
      {/* Tab navigation */}
      <div className="tab-group fade-up delay-1" style={{ marginBottom: 24 }}>
        {TABS.map(tab => (
          <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize' }}>
            {tab === 'analytics' ? '📊 ' : tab === 'complaints' ? '📋 ' : '👥 '}
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80, gap: 14 }}>
          <div className="spinner" /><p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading data…</p>
        </div>
      ) : (
        <div className="fade-up delay-2">

          {/* ── Analytics ── */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
                {METRICS.map(m => (
                  <div key={m.label} className="card" style={{ padding: '20px 22px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>{m.label}</p>
                    <p style={{ color: m.accent, fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Status bar */}
              <div className="card" style={{ padding: '24px 28px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 18 }}>Status Breakdown</h3>
                {total === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data yet.</p> : (
                  <>
                    <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2, marginBottom: 16 }}>
                      {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => {
                        const pct = (complaints.filter(c => c.status === s).length / total) * 100;
                        if (!pct) return null;
                        const color = { Open: '#3b82f6', 'In Progress': '#d97706', Resolved: '#10b981', Closed: '#94a3b8' }[s];
                        return <div key={s} style={{ width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 1s ease' }} title={`${s}: ${Math.round(pct)}%`} />;
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                      {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => {
                        const count = complaints.filter(c => c.status === s).length;
                        const color = { Open: '#3b82f6', 'In Progress': '#d97706', Resolved: '#10b981', Closed: '#94a3b8' }[s];
                        return (
                          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{s} ({count})</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Priority bars */}
              <div className="card" style={{ padding: '24px 28px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 18 }}>Priority Distribution</h3>
                {['Critical', 'High', 'Medium', 'Low'].map(p => {
                  const count = complaints.filter(c => c.priority === p).length;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  const cfg = PRIORITY_STYLE[p];
                  return (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                      <div style={{ width: 70, flexShrink: 0 }}>
                        <Badge label={p} config={cfg} />
                      </div>
                      <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'var(--bg-page)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 4, transition: 'width 1s ease' }} />
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', width: 24, textAlign: 'right' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Complaints ── */}
          {activeTab === 'complaints' && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
                  <button key={s} className={`filter-pill${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)} style={{ fontSize: '0.75rem' }}>{s}</button>
                ))}
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{filteredComplaints.length} results</span>
              </div>
              {filteredComplaints.length === 0 ? (
                <div className="empty-state"><div className="empty-state__icon">✅</div><h3>No complaints for this filter</h3></div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Complaint</th>
                        <th>Status / Priority</th>
                        <th>Assign To</th>
                        <th>Date</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.map(c => (
                        <tr key={c._id}>
                          <td>
                            <p style={{ fontWeight: 600, margin: '0 0 3px', color: 'var(--text-primary)' }}>{c.title}</p>
                            {c.submittedBy?.name && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{c.submittedBy.name}</p>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
                              <Badge label={c.status} config={STATUS_STYLE[c.status]} />
                              <Badge label={c.priority} config={PRIORITY_STYLE[c.priority]} />
                            </div>
                          </td>
                          <td>
                            <select value={c.assignedTo?._id || ''} onChange={e => handleAssign(c._id, e.target.value)} className="styled-select" style={{ fontSize: '0.8rem' }}>
                              <option value="">Unassigned</option>
                              {staffUsers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td>
                            <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => navigate(`/complaint/${c._id}`)}>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Users ── */}
          {activeTab === 'users' && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>All Users</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{users.length} registered</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=10b981&color=fff`} alt={u.name}
                              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{u.email}</td>
                        <td>
                          <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} disabled={u._id === user._id} className="styled-select" style={{ fontSize: '0.8rem', opacity: u._id === user._id ? 0.5 : 1 }}>
                            <option value="user">User</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
