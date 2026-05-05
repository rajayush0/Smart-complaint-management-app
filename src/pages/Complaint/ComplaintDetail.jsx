import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [cRes, cmRes] = await Promise.all([api.get(`/api/complaints/${id}`), api.get(`/api/complaints/${id}/comments`)]);
      setComplaint(cRes.data.complaint);
      setComments(cmRes.data.comments || []);
    } catch { navigate('/dashboard'); } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const { data } = await api.patch(`/api/complaints/${id}/status`, { status: newStatus });
      setComplaint(data.complaint);
    } catch { alert('Failed to update status'); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/complaints/${id}/comments`, { text: commentText, isInternal });
      setComments(prev => [...prev, data.comment]);
      setCommentText(''); setIsInternal(false);
    } catch (err) { alert(err?.response?.data?.message || 'Failed to post comment'); }
    finally { setSubmitting(false); }
  };

  const canManage = user?.role === 'admin' || user?.role === 'staff';

  if (loading) {
    return (
      <DashboardLayout title="Complaint Detail">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80, gap: 14 }}>
          <div className="spinner" /><p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
        </div>
      </DashboardLayout>
    );
  }
  if (!complaint) return null;

  return (
    <DashboardLayout
      title="Complaint Detail"
      actions={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-ghost" onClick={() => navigate(-1)} style={{ gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          {canManage && (
            <select value={complaint.status} onChange={e => handleStatusUpdate(e.target.value)} className="styled-select" style={{ fontWeight: 600 }}>
              {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s}>{s}</option>)}
            </select>
          )}
        </div>
      }
    >
      <div style={{ maxWidth: 800 }}>

        {/* Main card */}
        <div className="card fade-up delay-1" style={{ padding: '28px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', flex: 1 }}>{complaint.title}</h1>
            <div style={{ display: 'flex', gap: 6 }}>
              <Badge label={complaint.status} config={STATUS_STYLE[complaint.status]} />
              <Badge label={complaint.priority} config={PRIORITY_STYLE[complaint.priority]} />
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', paddingBottom: 18, borderBottom: '1px solid var(--border)', marginBottom: 18 }}>
            {[
              { label: 'Category', value: complaint.category },
              { label: 'Reported by', value: complaint.submittedBy?.name || 'Unknown' },
              { label: 'Date', value: new Date(complaint.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
              ...(canManage && complaint.assignedTo ? [{ label: 'Assigned to', value: complaint.assignedTo.name }] : []),
            ].map(m => (
              <div key={m.label}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>{m.label}</p>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{m.value}</p>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)', padding: '16px', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.875rem', whiteSpace: 'pre-wrap', margin: 0 }}>{complaint.description}</p>
          </div>
        </div>

        {/* Discussion */}
        <div className="fade-up delay-2">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
            Discussion
            {comments.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8, fontSize: '0.875rem' }}>({comments.length})</span>}
          </h2>

          {/* Comments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', background: 'white', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No comments yet. Be the first to add one.
              </div>
            ) : comments.map(comment => {
              if (comment.isInternal && user?.role === 'user') return null;
              const author = comment.author;
              const isOwn = author?._id === user?._id;
              return (
                <div key={comment._id} style={{
                  background: comment.isInternal ? '#fffbeb' : 'white',
                  border: `1px solid ${comment.isInternal ? '#fde68a' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', padding: '14px 18px',
                  marginLeft: isOwn ? 40 : 0,
                  marginRight: isOwn ? 0 : 40,
                  position: 'relative',
                }}>
                  {comment.isInternal && (
                    <span style={{ position: 'absolute', top: 12, right: 12, background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Internal
                    </span>
                  )}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <img src={author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.name || 'U')}&background=10b981&color=fff`}
                      alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {author?.name}
                        {author?.role && author.role !== 'user' && (
                          <span style={{ color: 'var(--accent)', marginLeft: 6, fontSize: '0.72rem', fontWeight: 500 }}>[{author.role}]</span>
                        )}
                      </p>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                        {new Date(comment.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{comment.text}</p>
                </div>
              );
            })}
          </div>

          {/* Add comment */}
          <form onSubmit={handleAddComment} className="card" style={{ padding: '18px' }}>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment…" required
              className="form-input" style={{ minHeight: 80, resize: 'vertical', marginBottom: 12, display: 'block' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              {canManage ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#d97706', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} style={{ accentColor: '#d97706', width: 14, height: 14 }} />
                  Mark as internal note
                </label>
              ) : <div />}
              <button type="submit" disabled={submitting || !commentText.trim()} className="btn-primary">
                {submitting ? 'Posting…' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
