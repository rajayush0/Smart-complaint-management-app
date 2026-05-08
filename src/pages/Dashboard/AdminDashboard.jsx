import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/apiClient';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

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
const PRIORITY_BORDER = { Low: '#059669', Medium: '#d97706', High: '#dc2626', Critical: '#9333ea' };
const ROLE_STYLE = {
  admin: { bg: '#ecfdf5', color: '#059669' },
  staff: { bg: '#fffbeb', color: '#d97706' },
  user:  { bg: '#eff6ff', color: '#3b82f6' },
};
const CHART_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];
const CATEGORY_GROUP = { Network: 'Network', Hardware: 'Hardware', Software: 'Software', Maintenance: 'Maintenance' };

function Badge({ label, config }) {
  if (!config) return null;
  return (
    <span className="badge" style={{ background: config.bg, color: config.color, borderColor: config.border }}>
      {label}
    </span>
  );
}

const TOOLTIP_STYLE = { background: 'white', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 };

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab is driven by ?tab= URL param so Sidebar links work automatically
  const VALID_TABS = ['overview', 'complaints', 'analytics', 'users'];
  const tabParam   = searchParams.get('tab') || 'overview';
  const activeTab  = VALID_TABS.includes(tabParam) ? tabParam : 'overview';
  const setTab     = (t) => setSearchParams(t === 'overview' ? {} : { tab: t });

  const [complaints,        setComplaints]        = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [statusFilter,      setStatusFilter]      = useState('All');
  const [search,            setSearch]            = useState('');

  const [users,         setUsers]         = useState([]);
  const [loadingUsers,  setLoadingUsers]  = useState(false);
  const [usersFetched,  setUsersFetched]  = useState(false);

  const [assigningTo,   setAssigningTo]   = useState(null);
  const [staffList,     setStaffList]     = useState([]);
  const [loadingStaff,  setLoadingStaff]  = useState(false);
  const [assigning,     setAssigning]     = useState(false);

  useEffect(() => { fetchComplaints(); }, []);

  useEffect(() => {
    if (activeTab === 'users' && !usersFetched) fetchUsers();
  }, [activeTab]);

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/api/complaints');
      setComplaints(data.complaints || []);
    } catch { /* silent */ } finally { setLoadingComplaints(false); }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/api/users');
      setUsers(data.users || []);
      setUsersFetched(true);
    } catch { /* silent */ } finally { setLoadingUsers(false); }
  };

  const openAssignModal = async (complaint) => {
    setAssigningTo(complaint);
    setLoadingStaff(true);
    try {
      const group = CATEGORY_GROUP[complaint.category];
      const { data } = await api.get(group ? `/api/users/staff/${group}` : '/api/users/staff/all');
      setStaffList(data.staff || []);
    } catch { /* silent */ } finally { setLoadingStaff(false); }
  };

  const assignComplaint = async (staffId) => {
    setAssigning(true);
    try {
      await api.patch(`/api/complaints/${assigningTo._id}/assign`, { staffId });
      setComplaints(prev =>
        prev.map(c => c._id === assigningTo._id ? { ...c, status: 'In Progress', assignedTo: staffId } : c)
      );
      setAssigningTo(null);
    } catch { /* silent */ } finally { setAssigning(false); }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch { /* silent */ }
  };

  const stats = {
    total:      complaints.length,
    open:       complaints.filter(c => c.status === 'Open').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved:   complaints.filter(c => c.status === 'Resolved').length,
  };

  const categoryData = ['Hardware', 'Software', 'Network', 'Maintenance', 'Other']
    .map(cat => ({ name: cat, value: complaints.filter(c => c.category === cat).length }))
    .filter(d => d.value > 0);

  const priorityData = ['Low', 'Medium', 'High', 'Critical']
    .map(p => ({ name: p, value: complaints.filter(c => c.priority === p).length }));

  const filtered = complaints
    .filter(c => statusFilter === 'All' || c.status === statusFilter)
    .filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.title.toLowerCase().includes(q) || (c.submittedBy?.name || '').toLowerCase().includes(q);
    });

  return (
    <DashboardLayout title="Admin Dashboard">

      {/* Tab bar — synced with URL */}
      <div className="tab-group fade-up" style={{ marginBottom: 24 }}>
        {[
          { key: 'overview',   label: 'Overview' },
          { key: 'complaints', label: 'Complaints' },
          { key: 'analytics',  label: 'Analytics' },
          { key: 'users',      label: 'Users' },
        ].map(t => (
          <button key={t.key} className={`tab-btn${activeTab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Stat cards — visible on all tabs, clicking jumps to complaints tab */}
      <div className="fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total',       value: stats.total,      f: 'All' },
          { label: 'Open',        value: stats.open,       f: 'Open' },
          { label: 'In Progress', value: stats.inProgress, f: 'In Progress' },
          { label: 'Resolved',    value: stats.resolved,   f: 'Resolved' },
        ].map(s => (
          <div
            key={s.label}
            className={`stat-card${statusFilter === s.f && activeTab === 'complaints' ? ' active' : ''}`}
            onClick={() => { setStatusFilter(s.f); setTab('complaints'); }}
          >
            <p className="stat-card__label">{s.label}</p>
            <p className="stat-card__value">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="card fade-up delay-2" style={{ padding: 28 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
            Here's a live snapshot of the system.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
            {[
              {
                label: 'Unassigned',
                value: complaints.filter(c => !c.assignedTo && c.status === 'Open').length,
                desc:  'open complaints need assignment',
                color: 'var(--pri-high-text)',
                bg:    'var(--pri-high-bg)',
                bd:    'var(--pri-high-bd)',
              },
              {
                label: 'Critical',
                value: complaints.filter(c => c.priority === 'Critical' && c.status !== 'Resolved').length,
                desc:  'critical-priority issues open',
                color: 'var(--pri-crit-text)',
                bg:    'var(--pri-crit-bg)',
                bd:    'var(--pri-crit-bd)',
              },
              {
                label: 'Resolved',
                value: stats.resolved,
                desc:  'complaints resolved so far',
                color: 'var(--status-res-text)',
                bg:    'var(--status-res-bg)',
                bd:    'var(--status-res-bd)',
              },
              {
                label: 'Total Users',
                value: usersFetched ? users.length : '—',
                desc:  'registered accounts',
                color: 'var(--accent)',
                bg:    'var(--accent-light)',
                bd:    'var(--accent-border)',
              },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.bd}`, borderRadius: 'var(--radius-sm)', padding: '18px 20px' }}>
                <p style={{ color: item.color, fontSize: '2rem', fontWeight: 800, margin: '0 0 4px', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
                  {item.value}
                </p>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 3px' }}>{item.label}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── COMPLAINTS ───────────────────────────────────────────── */}
      {activeTab === 'complaints' && (
        <div className="fade-up delay-2">
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by title or submitter…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
                <button key={s} className={`filter-pill${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {statusFilter === 'All' ? 'All Complaints' : `${statusFilter} Complaints`}
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>({filtered.length})</span>
              </span>
            </div>

            {loadingComplaints ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, gap: 14 }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading complaints…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">📭</div>
                <h3>No complaints found</h3>
                <p>Try adjusting your search or filter.</p>
              </div>
            ) : (
              filtered.map(c => (
                <div
                  key={c._id}
                  className="complaint-row"
                  style={{ borderLeft: `3px solid ${PRIORITY_BORDER[c.priority] || 'transparent'}` }}
                >
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/complaint/${c._id}`)}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 5, color: 'var(--text-primary)' }}>{c.title}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
                      <Badge label={c.status}   config={STATUS_STYLE[c.status]} />
                      <Badge label={c.priority} config={PRIORITY_STYLE[c.priority]} />
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.category}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>
                      By {c.submittedBy?.name || 'Unknown'} · {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {c.assignedTo ? (
                      <span className="badge" style={{ background: 'var(--status-res-bg)', color: 'var(--status-res-text)', borderColor: 'var(--status-res-bd)' }}>
                        ✓ Assigned
                      </span>
                    ) : (
                      <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '7px 14px' }} onClick={() => openAssignModal(c)}>
                        Assign →
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── ANALYTICS ───────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="fade-up delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 20 }}>Complaints by Category</h3>
            {categoryData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 20 }}>Complaints by Priority</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={priorityData} barSize={36}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── USERS ───────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="fade-up delay-2">
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                All Users
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>({users.length})</span>
              </span>
            </div>

            {loadingUsers ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, gap: 14 }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading users…</p>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">👤</div>
                <h3>No users found</h3>
              </div>
            ) : (
              users.map(u => {
                const rc = ROLE_STYLE[u.role] || ROLE_STYLE.user;
                return (
                  <div key={u._id} className="complaint-row">
                    <img
                      src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=10b981&color=fff`}
                      alt={u.name}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-border)', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2, color: 'var(--text-primary)' }}>{u.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                        {u.email}{u.specialization && ` · ${u.specialization}`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span className="badge" style={{ background: rc.bg, color: rc.color, borderColor: 'transparent' }}>
                        {u.role}
                      </span>
                      <select
                        value={u.role}
                        onChange={e => changeUserRole(u._id, e.target.value)}
                        className="styled-select"
                        style={{ fontSize: '0.78rem', padding: '5px 8px' }}
                      >
                        {['user', 'staff', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── ASSIGN MODAL ────────────────────────────────────────── */}
      {assigningTo && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setAssigningTo(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: 480, maxHeight: '80vh', overflowY: 'auto', padding: 28, boxShadow: 'var(--shadow-lg)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>Assign Complaint</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 6 }}>{assigningTo.title}</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              <Badge label={assigningTo.status}   config={STATUS_STYLE[assigningTo.status]} />
              <Badge label={assigningTo.priority} config={PRIORITY_STYLE[assigningTo.priority]} />
            </div>

            <p style={{ color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
              {CATEGORY_GROUP[assigningTo.category] || 'All'} Specialists
            </p>

            {loadingStaff ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 12 }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Finding best match…</p>
              </div>
            ) : staffList.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px 0' }}>
                <div className="empty-state__icon">🔍</div>
                <h3>No staff available</h3>
                <p>No active staff found for this category.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {staffList.map((staff, i) => {
                  const workloadColor =
                    staff.activeComplaints > 5 ? '#dc2626' :
                    staff.activeComplaints > 2 ? '#d97706' : '#059669';
                  return (
                    <div
                      key={staff._id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${i === 0 ? 'var(--accent-border)' : 'var(--border)'}`,
                        background: i === 0 ? 'var(--bg-active)' : 'var(--bg-card)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                          background: i === 0 ? 'var(--accent-light)' : 'var(--bg-page)',
                          color: i === 0 ? 'var(--accent)' : 'var(--text-muted)',
                          border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.68rem', fontWeight: 700,
                        }}>
                          #{i + 1}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: '0 0 2px', color: 'var(--text-primary)' }}>
                            {staff.name}
                            {i === 0 && <span style={{ marginLeft: 6, fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700 }}>BEST MATCH</span>}
                          </p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>
                            {staff.specialization} · {staff.experienceYears} yrs exp ·{' '}
                            <span style={{ color: workloadColor, fontWeight: 600 }}>
                              {staff.activeComplaints} active
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                        onClick={() => assignComplaint(staff._id)}
                        disabled={assigning}
                      >
                        {assigning ? '…' : 'Assign'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <button className="btn-ghost" style={{ width: '100%' }} onClick={() => setAssigningTo(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
