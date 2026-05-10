import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import api from '../../utils/apiClient';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setDeleting(true);
    try {
      await api.delete('/api/users/me');
      // Clear token and redirect to home
      localStorage.removeItem('token');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'staff') return '/staff';
    return '/dashboard';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <Navbar />

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>

        {/* Back Button */}
        <button
          onClick={() => navigate(getDashboardLink())}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '14px',
            padding: 0,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Back to Dashboard
        </button>

        <h1 style={{
          color: 'white',
          fontSize: '28px',
          margin: '0 0 32px',
        }}>
          My Profile
        </h1>

        {/* Profile Card */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '20px',
        }}>
          {/* Avatar + Name */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '28px',
          }}>
            <img
              src={user?.avatar ||
                `https://ui-avatars.com/api/?name=${user?.name}`}
              alt={user?.name}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                border: '3px solid #6366f1',
              }}
            />
            <div>
              <h2 style={{
                color: 'white',
                margin: '0 0 4px',
                fontSize: '20px',
              }}>
                {user?.name}
              </h2>
              <span style={{
                background: user?.role === 'admin' ? '#f59e0b20' :
                            user?.role === 'staff' ? '#10b98120' : '#6366f120',
                color: user?.role === 'admin' ? '#f59e0b' :
                       user?.role === 'staff' ? '#10b981' : '#6366f1',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}>
                {user?.role}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            {[
              { label: 'Email', value: user?.email },
              { label: 'Phone', value: user?.phone || 'Not set' },
              { label: 'Gender', value: user?.gender || 'Not set',
                capitalize: true },
              { label: 'Age', value: user?.age || 'Not set' },
              user?.specialization && {
                label: 'Specialization',
                value: user.specialization,
              },
              user?.specializationGroup && {
                label: 'Group',
                value: user.specializationGroup,
              },
              user?.experienceYears > 0 && {
                label: 'Experience',
                value: `${user.experienceYears} years`,
              },
            ].filter(Boolean).map(item => (
              <div key={item.label}>
                <p style={{
                  color: '#555',
                  fontSize: '12px',
                  margin: '0 0 4px',
                }}>
                  {item.label}
                </p>
                <p style={{
                  color: 'white',
                  fontSize: '14px',
                  margin: 0,
                  textTransform: item.capitalize ? 'capitalize' : 'none',
                }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #ef444440',
          borderRadius: '16px',
          padding: '28px',
        }}>
          <h3 style={{
            color: '#ef4444',
            margin: '0 0 8px',
            fontSize: '16px',
          }}>
            ⚠️ Danger Zone
          </h3>
          <p style={{
            color: '#888',
            fontSize: '14px',
            margin: '0 0 20px',
            lineHeight: 1.5,
          }}>
            Permanently delete your account and all associated data including
            complaints, comments, and notifications. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                background: '#ef444420',
                color: '#ef4444',
                border: '1px solid #ef444440',
                padding: '12px 24px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Delete My Account
            </button>
          ) : (
            <div>
              <p style={{
                color: '#ef4444',
                fontSize: '14px',
                margin: '0 0 12px',
                fontWeight: 600,
              }}>
                Type DELETE to confirm:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="Type DELETE here"
                style={{
                  width: '100%',
                  background: '#252525',
                  border: '1px solid #ef444440',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '12px',
                  fontSize: '14px',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              {error && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '13px',
                  margin: '0 0 12px',
                }}>
                  {error}
                </p>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput('');
                    setError(null);
                  }}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid #333',
                    color: '#888',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteInput !== 'DELETE'}
                  style={{
                    flex: 1,
                    background: deleteInput === 'DELETE'
                      ? '#ef4444' : '#333',
                    color: deleteInput === 'DELETE' ? 'white' : '#555',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: deleteInput === 'DELETE'
                      ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}