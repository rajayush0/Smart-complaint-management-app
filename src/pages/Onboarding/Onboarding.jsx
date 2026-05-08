import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/apiClient';

const SPECIALIZATIONS = {
  Network: ['WiFi', 'Broadband', 'LAN', 'Internet'],
  Maintenance: ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'All-rounder'],
  Hardware: ['Computer', 'Printer', 'Server', 'CCTV'],
  Software: ['Developer', 'IT Support', 'Database'],
};

export default function Onboarding() {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    gender: '',
    age: '',
    role: 'user',
    specialization: '',
    experienceYears: '',
  });

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setError(null);

    // Validate step 1
    if (step === 1) {
      if (!formData.name.trim()) return setError('Name is required');
      if (!formData.phone.trim()) return setError('Phone number is required');
      if (!formData.gender) return setError('Please select gender');
      if (!formData.age) return setError('Age is required');
    }

    // Validate step 2
    if (step === 2) {
      if (!formData.role) return setError('Please select a role');
    }

    // If user role → skip step 3 and submit
    if (step === 2 && formData.role === 'user') {
      handleSubmit();
      return;
    }

    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (formData.role === 'staff' && !formData.specialization) {
      return setError('Please select your specialization');
    }

    setLoading(true);
    setError(null);

    try {
      await api.patch('/api/users/onboarding', {
        ...formData,
        age: Number(formData.age),
        experienceYears: Number(formData.experienceYears) || 0,
      });

      // Refresh user data in AuthContext
      await fetchUser();

      // Redirect based on role
      if (formData.role === 'staff') navigate('/staff');
      else navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Progress percentage
  const totalSteps = formData.role === 'staff' ? 3 : 2;
  const progress = Math.round((step / totalSteps) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#1a1a1a',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid #2a2a2a',
      }}>

        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '32px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="#6366f1" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>
            ComplaintSys
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <span style={{ color: '#888', fontSize: '13px' }}>
              Step {step} of {totalSteps}
            </span>
            <span style={{ color: '#6366f1', fontSize: '13px', fontWeight: 600 }}>
              {progress}%
            </span>
          </div>
          <div style={{
            height: '4px',
            background: '#2a2a2a',
            borderRadius: '2px',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#ef444420',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '14px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        {/* STEP 1 — Personal Info */}
        {step === 1 && (
          <div>
            <h2 style={{ color: 'white', fontSize: '22px', margin: '0 0 8px' }}>
              Tell us about yourself
            </h2>
            <p style={{ color: '#888', fontSize: '14px', margin: '0 0 28px' }}>
              Help us personalize your experience
            </p>

            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Enter your full name"
                style={inputStyle}
              />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                Contact Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="Enter your phone number"
                style={inputStyle}
              />
            </div>

            {/* Gender + Age */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={e => update('gender', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                  Age *
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={e => update('age', e.target.value)}
                  placeholder="Your age"
                  min="16"
                  max="80"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Role Selection */}
        {step === 2 && (
          <div>
            <h2 style={{ color: 'white', fontSize: '22px', margin: '0 0 8px' }}>
              What is your role?
            </h2>
            <p style={{ color: '#888', fontSize: '14px', margin: '0 0 28px' }}>
              This determines what you can do in the system
            </p>

            {['user', 'staff'].map(role => (
              <div
                key={role}
                onClick={() => update('role', role)}
                style={{
                  background: formData.role === role ? '#6366f120' : '#252525',
                  border: formData.role === role ? '2px solid #6366f1' : '1px solid #333',
                  borderRadius: '14px',
                  padding: '20px',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>
                    {role === 'user' ? '👤' : '👷'}
                  </span>
                  <div>
                    <p style={{
                      color: 'white',
                      fontWeight: 600,
                      margin: '0 0 4px',
                      fontSize: '16px',
                      textTransform: 'capitalize',
                    }}>
                      {role}
                    </p>
                    <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                      {role === 'user'
                        ? 'Submit and track complaints'
                        : 'Handle and resolve assigned complaints'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3 — Specialization (Staff Only) */}
        {step === 3 && (
          <div>
            <h2 style={{ color: 'white', fontSize: '22px', margin: '0 0 8px' }}>
              Your specialization
            </h2>
            <p style={{ color: '#888', fontSize: '14px', margin: '0 0 28px' }}>
              This helps admin assign relevant tasks to you
            </p>

            {/* Specialization Groups */}
            {Object.entries(SPECIALIZATIONS).map(([group, specs]) => (
              <div key={group} style={{ marginBottom: '16px' }}>
                <p style={{
                  color: '#6366f1',
                  fontSize: '12px',
                  fontWeight: 600,
                  margin: '0 0 8px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  {group}
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  {specs.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => update('specialization', spec)}
                      style={{
                        background: formData.specialization === spec ? '#6366f1' : '#252525',
                        color: formData.specialization === spec ? 'white' : '#888',
                        border: formData.specialization === spec ? '1px solid #6366f1' : '1px solid #333',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Experience */}
            <div style={{ marginTop: '24px' }}>
              <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.experienceYears}
                onChange={e => update('experienceYears', e.target.value)}
                placeholder="e.g. 3"
                min="0"
                max="50"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '32px',
        }}>
          {step > 1 && (
            <button
              onClick={() => setStep(prev => prev - 1)}
              style={{
                flex: 1,
                padding: '14px',
                background: 'transparent',
                border: '1px solid #333',
                color: '#888',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '15px',
              }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={step === totalSteps ? handleSubmit : nextStep}
            disabled={loading}
            style={{
              flex: 2,
              padding: '14px',
              background: loading ? '#333' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              color: 'white',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            {loading ? 'Saving...' :
             step === totalSteps ? 'Complete Setup ✨' : 'Next →'}
          </button>
        </div>

      </div>
    </div>
  );
}

// Reusable input style
const inputStyle = {
  width: '100%',
  background: '#252525',
  border: '1px solid #333',
  borderRadius: '8px',
  color: 'white',
  padding: '12px',
  fontSize: '14px',
  boxSizing: 'border-box',
  outline: 'none',
};