import React, { useState } from 'react';
import apiClient from '../../utils/apiClient';
import { useNavigate } from 'react-router-dom';

const ComplaintForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiClient.post('/api/complaints', { title, description });
      alert('Complaint submitted successfully!');
      navigate(`/complaint/${data?.complaintId || 'new'}`);
    } catch (error) {
      console.error(error);
      alert('Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2>File a New Complaint</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Title</label><br/>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label>Description</label><br/>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
            rows="5"
            style={{ width: '100%', padding: '8px' }}
          ></textarea>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;
