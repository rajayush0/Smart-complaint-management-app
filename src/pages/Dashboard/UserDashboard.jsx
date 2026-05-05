import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/apiClient';
import { analyzeComplaintAI } from '../../utils/aiClient';

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
  return (
    <span className="badge" style={{ background: config.bg, color: config.color, borderColor: config.border }}>
      {label}
    </span>
  );
}

const STAT_FILTERS = ['All', 'Open', 'In Progress', 'Resolved'];

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(searchParams.get('new') === '1');
  const [filter, setFilter] = useState('All');
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Other', priority: 'Low' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/api/complaints');
      setComplaints(data.complaints || []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const handleAIAnalyze = async () => {
    if (!aiPrompt.trim()) return;
    setIsAnalyzing(true); setAiError(null);
    try {
      const result = await analyzeComplaintAI(aiPrompt);
      setFormData(prev => ({ ...prev, ...result }));
    } catch { setAiError('AI analysis failed. Please fill the form manually.'); }
    finally { setIsAnalyzing(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      await api.post('/api/complaints', formData);
      setSuccessMsg('Complaint submitted successfully!');
      setFormData({ title: '', description: '', category: 'Other', priority: 'Low' });
      setAiPrompt(''); setShowForm(false); fetchComplaints();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch { /* silent */ } finally { setIsSubmitting(false); }
  };

  const filteredComplaints = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <DashboardLayout
      title="My Complaints"
      actions={
        <button className={showForm ? 'btn-ghost' : 'btn-primary'} onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ New Complaint'}
        </button>
      }
    >
      {/* Success toast */}
      {successMsg && (
        <div className="fade-up" style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', color: '#059669', padding: '12px 18px', borderRadius: 'var(--radius-sm)', marginBottom: 20, fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✅ {successMsg}
        </div>
      )}

      {/* New Complaint Form */}
      {showForm && (
        <div className="card fade-up" style={{ padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 22 }}>Submit New Complaint</h2>

          {/* AI block */}
          <div style={{ background: '#f0fdf4', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '18px', marginBottom: 22 }}>
            <label className="form-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✨</span> AI Auto-Fill
            </label>
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="Describe your issue in plain English and let AI fill the form..."
              className="form-input"
              style={{ minHeight: 80, resize: 'vertical', marginBottom: 10 }}
            />
            <button type="button" onClick={handleAIAnalyze} disabled={isAnalyzing || !aiPrompt.trim()} className="btn-primary" style={{ fontSize: '0.82rem', padding: '7px 16px' }}>
              {isAnalyzing ? '⏳ Analyzing...' : '✨ Auto-fill'}
            </button>
            {aiError && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: 8 }}>{aiError}</p>}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Brief title of the issue" className="form-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label className="form-label">Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="form-input styled-select" style={{ width: '100%' }}>
                  {['Hardware', 'Software', 'Network', 'Maintenance', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Priority</label>
                <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="form-input styled-select" style={{ width: '100%' }}>
                  {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the issue in detail..." className="form-input" style={{ minHeight: 100, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Submitting...' : 'Submit Complaint'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Stat filter cards */}
      <div className="fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 22 }}>
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

      {/* Complaints list */}
      <div className="card fade-up delay-2" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {filter === 'All' ? 'All Complaints' : `${filter} Complaints`}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>({filteredComplaints.length})</span>
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {STAT_FILTERS.map(s => (
              <button key={s} className={`filter-pill${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', gap: 14 }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading complaints…</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <h3>{filter === 'All' ? 'No complaints yet' : `No ${filter} complaints`}</h3>
            <p>{filter === 'All' ? "You haven't submitted any complaints yet." : `No complaints with "${filter}" status.`}</p>
            {filter === 'All' && <button className="btn-primary" onClick={() => setShowForm(true)}>Submit your first complaint</button>}
          </div>
        ) : (
          filteredComplaints.map(c => (
            <div key={c._id} className="complaint-row" onClick={() => navigate(`/complaint/${c._id}`)}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6, color: 'var(--text-primary)' }}>{c.title}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Badge label={c.status} config={STATUS_STYLE[c.status]} />
                  <Badge label={c.priority} config={PRIORITY_STYLE[c.priority]} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.category}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 6 }}>
                  {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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