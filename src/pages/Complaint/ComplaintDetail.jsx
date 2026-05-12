import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import api from '../../utils/apiClient';

const STATUS_COLORS = {
  'Open': { bg: '#6366f120', text: '#6366f1' },
  'In Progress': { bg: '#f59e0b20', text: '#f59e0b' },
  'Resolved': { bg: '#10b98120', text: '#10b981' },
  'Closed': { bg: '#88888820', text: '#888' },
};

const PRIORITY_COLORS = {
  'Low': { bg: '#10b98120', text: '#10b981' },
  'Medium': { bg: '#f59e0b20', text: '#f59e0b' },
  'High': { bg: '#ef444420', text: '#ef4444' },
  'Critical': { bg: '#7c3aed20', text: '#7c3aed' },
};

// Progress tracker steps
const STEPS = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

const getStepIndex = (status, assignedTo) => {
  if (status === 'Resolved' || status === 'Closed') return 3;
  if (status === 'In Progress') return 2;
  if (assignedTo) return 1;
  return 0;
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchComplaint();
    fetchComments();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const { data } = await api.get(`/api/complaints/${id}`);
      setComplaint(data.complaint);
    } catch (err) {
      console.error('Failed to fetch complaint');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/api/complaints/${id}/comments`);
      setComments(data.comments);
    } catch (err) {
      console.error('Failed to fetch comments');
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/api/complaints/${id}/comments`, {
        text: commentText,
        isInternal,
      });
      setComments(prev => [...prev, data.comment]);
      setCommentText('');
      setIsInternal(false);
    } catch (err) {
      console.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const { data } = await api.patch(`/api/complaints/${id}/status`, {
        status: newStatus,
      });
      setComplaint(data.complaint);
    } catch (err) {
      console.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteComplaint = async () => {
    if (!window.confirm(
      'Are you sure you want to delete this complaint? This cannot be undone.'
    )) return;

    try {
      await api.delete(`/api/complaints/${id}`);
      navigate(-1);
    } catch (err) {
      console.error('Failed to delete complaint');
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <Navbar />
      <div style={{
        textAlign: 'center',
        color: '#888',
        padding: '80px',
      }}>
        Loading complaint...
      </div>
    </div>
  );

  if (!complaint) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <Navbar />
      <div style={{
        textAlign: 'center',
        color: '#888',
        padding: '80px',
      }}>
        Complaint not found.
      </div>
    </div>
  );

  const stepIndex = getStepIndex(complaint.status, complaint.assignedTo);
  const isStaffOrAdmin = ['staff', 'admin'].includes(user?.role);
  const isOwner = complaint.submittedBy?._id === user?._id;

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <Navbar />

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '0',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Back
        </button>

        {/* Header */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}>
            <h1 style={{
              color: 'white',
              fontSize: '22px',
              margin: 0,
              flex: 1,
              marginRight: '16px',
            }}>
              {complaint.title}
            </h1>

            {/* Delete button for admin or owner */}
            {(user?.role === 'admin' || isOwner) && (
              <button
                onClick={deleteComplaint}
                style={{
                  background: '#ef444420',
                  color: '#ef4444',
                  border: '1px solid #ef444440',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  flexShrink: 0,
                }}
              >
                🗑 Delete
              </button>
            )}
          </div>

          {/* Badges */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}>
            <span style={{
              background: STATUS_COLORS[complaint.status]?.bg,
              color: STATUS_COLORS[complaint.status]?.text,
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
            }}>
              {complaint.status}
            </span>
            <span style={{
              background: PRIORITY_COLORS[complaint.priority]?.bg,
              color: PRIORITY_COLORS[complaint.priority]?.text,
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
            }}>
              {complaint.priority}
            </span>
            <span style={{
              background: '#88888820',
              color: '#888',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '13px',
            }}>
              {complaint.category}
            </span>
          </div>

          {/* Meta info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
          }}>
            <div>
              <p style={{
                color: '#555',
                fontSize: '12px',
                margin: '0 0 4px',
              }}>
                Submitted by
              </p>
              <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>
                {complaint.submittedBy?.name || 'Unknown'}
              </p>
            </div>
            <div>
              <p style={{
                color: '#555',
                fontSize: '12px',
                margin: '0 0 4px',
              }}>
                Assigned to
              </p>
              <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>
                {complaint.assignedTo?.name || 'Not assigned yet'}
              </p>
            </div>
            <div>
              <p style={{
                color: '#555',
                fontSize: '12px',
                margin: '0 0 4px',
              }}>
                Submitted on
              </p>
              <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>
                {new Date(complaint.createdAt).toLocaleDateString()}
              </p>
            </div>
            {complaint.resolvedAt && (
              <div>
                <p style={{
                  color: '#555',
                  fontSize: '12px',
                  margin: '0 0 4px',
                }}>
                  Resolved on
                </p>
                <p style={{
                  color: '#10b981',
                  fontSize: '14px',
                  margin: 0,
                }}>
                  {new Date(complaint.resolvedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Progress Tracker */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{
              color: '#555',
              fontSize: '12px',
              margin: '0 0 12px',
            }}>
              Progress
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0',
            }}>
              {STEPS.map((step, i) => (
                <div
                  key={step}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: i < STEPS.length - 1 ? 1 : 'none',
                  }}
                >
                  {/* Step Circle */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: i <= stepIndex ? '#6366f1' : '#252525',
                    border: i <= stepIndex
                      ? '2px solid #6366f1'
                      : '2px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s',
                  }}>
                    {i < stepIndex ? (
                      <span style={{
                        color: 'white',
                        fontSize: '14px',
                      }}>✓</span>
                    ) : (
                      <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: i === stepIndex ? 'white' : '#444',
                        display: 'block',
                      }} />
                    )}
                  </div>

                  {/* Step Label */}
                  <div style={{
                    position: 'relative',
                    top: '24px',
                    left: '-16px',
                    width: '64px',
                    textAlign: 'center',
                  }}>
                    <span style={{
                      color: i <= stepIndex ? '#6366f1' : '#555',
                      fontSize: '10px',
                      fontWeight: i === stepIndex ? 600 : 400,
                      whiteSpace: 'nowrap',
                    }}>
                      {step}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {i < STEPS.length - 1 && (
                    <div style={{
                      flex: 1,
                      height: '2px',
                      background: i < stepIndex ? '#6366f1' : '#252525',
                      transition: 'background 0.3s',
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Extra space for labels */}
          <div style={{ height: '24px' }} />

          {/* Description */}
          <div style={{
            background: '#252525',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: isStaffOrAdmin ? '20px' : '0',
          }}>
            <p style={{
              color: '#555',
              fontSize: '12px',
              margin: '0 0 8px',
            }}>
              Description
            </p>
            <p style={{
              color: '#ccc',
              fontSize: '14px',
              margin: 0,
              lineHeight: 1.6,
            }}>
              {complaint.description}
            </p>
          </div>

          {/* Status Update (Staff + Admin only) */}
          {isStaffOrAdmin && (
            <div>
              <p style={{
                color: '#555',
                fontSize: '12px',
                margin: '0 0 10px',
              }}>
                Update Status
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={complaint.status === s || updatingStatus}
                    style={{
                      background: complaint.status === s
                        ? STATUS_COLORS[s]?.bg
                        : '#252525',
                      color: complaint.status === s
                        ? STATUS_COLORS[s]?.text
                        : '#888',
                      border: complaint.status === s
                        ? `1px solid ${STATUS_COLORS[s]?.text}`
                        : '1px solid #333',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: complaint.status === s
                        ? 'default'
                        : 'pointer',
                      fontSize: '13px',
                      fontWeight: complaint.status === s ? 600 : 400,
                      opacity: updatingStatus ? 0.6 : 1,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Attachments */}
        {complaint.attachments?.length > 0 && (
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
          }}>
            <h3 style={{
              color: 'white',
              margin: '0 0 16px',
              fontSize: '16px',
            }}>
              📎 Attachments
            </h3>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              {complaint.attachments.map((file, i) => (
                <a
                  key={i}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#252525',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    color: '#6366f1',
                    fontSize: '13px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  📄 {file.originalName || `File ${i + 1}`}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <h3 style={{
            color: 'white',
            margin: '0 0 20px',
            fontSize: '16px',
          }}>
            💬 Comments ({comments.length})
          </h3>

          {/* Comments List */}
          {comments.length === 0 ? (
            <p style={{
              color: '#555',
              fontSize: '14px',
              textAlign: 'center',
              padding: '20px',
            }}>
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px',
            }}>
              {comments.map(comment => (
                <div
                  key={comment._id}
                  style={{
                    background: comment.isInternal ? '#7c3aed10' : '#252525',
                    border: comment.isInternal
                      ? '1px solid #7c3aed30'
                      : '1px solid #333',
                    borderRadius: '12px',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <img
                        src={comment.author?.avatar ||
                          `https://ui-avatars.com/api/?name=${comment.author?.name}`}
                        alt={comment.author?.name}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                        }}
                      />
                      <span style={{
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}>
                        {comment.author?.name}
                      </span>
                      <span style={{
                        background: comment.author?.role === 'admin'
                          ? '#f59e0b20'
                          : comment.author?.role === 'staff'
                            ? '#10b98120'
                            : '#6366f120',
                        color: comment.author?.role === 'admin'
                          ? '#f59e0b'
                          : comment.author?.role === 'staff'
                            ? '#10b981'
                            : '#6366f1',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        textTransform: 'capitalize',
                      }}>
                        {comment.author?.role}
                      </span>
                      {comment.isInternal && (
                        <span style={{
                          background: '#7c3aed20',
                          color: '#7c3aed',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                        }}>
                          Internal
                        </span>
                      )}
                    </div>
                    <span style={{
                      color: '#555',
                      fontSize: '12px',
                    }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{
                    color: '#ccc',
                    fontSize: '14px',
                    margin: 0,
                    lineHeight: 1.5,
                  }}>
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              style={{
                width: '100%',
                minHeight: '80px',
                background: '#252525',
                border: '1px solid #333',
                borderRadius: '10px',
                color: 'white',
                padding: '12px',
                fontSize: '14px',
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: '12px',
              }}
            />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              {/* Internal toggle for staff/admin */}
              {isStaffOrAdmin && (
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: '#888',
                  fontSize: '13px',
                }}>
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={e => setIsInternal(e.target.checked)}
                  />
                  Internal note (hidden from user)
                </label>
              )}

              <button
                onClick={submitComment}
                disabled={!commentText.trim() || submittingComment}
                style={{
                  background: commentText.trim()
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : '#252525',
                  color: commentText.trim() ? 'white' : '#555',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginLeft: 'auto',
                }}
              >
                {submittingComment ? 'Sending...' : 'Send Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}