import { useState } from 'react';
import styles from './Register.module.css';
import { analyzeComplaintAI } from '../utils/aiClient';

export default function Register() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    priority: 'Low'
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting complaint:", formData);
    // Add logic to submit to backend later
    alert("Complaint submitted successfully!");
    setFormData({ title: '', description: '', category: 'Other', priority: 'Low' });
    setAiPrompt('');
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAIAnalyze = async () => {
    if (!aiPrompt.trim()) return;

    setIsAnalyzing(true);
    setAiError(null);

    try {
      const result = await analyzeComplaintAI(aiPrompt);
      setFormData(prev => ({
        ...prev,
        title: result.title || prev.title,
        description: result.description || prev.description,
        category: result.category || prev.category,
        priority: result.priority || prev.priority
      }));
    } catch (err) {
      setAiError(err.message || 'Failed to analyze complaint with AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Submit Complaint</h1>
        <p className={styles.subtitle}>Let us know what's wrong and we'll fix it.</p>

        {/* AI Assistant Section */}
        <div className={styles.formGroup} style={{ backgroundColor: '#f8fafd', padding: '15px', borderRadius: '10px', border: '1px solid #d9e2ec', marginBottom: '30px' }}>
          <label className={styles.label}>
            <span role="img" aria-label="sparkles">✨</span> Describe your issue naturally, and AI will fill the form
          </label>
          <textarea
            className={styles.textarea}
            placeholder="e.g., 'wifi is completely down in the boy's hostel, need it fixed urgently'"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            style={{ minHeight: '80px', marginBottom: '10px' }}
          />
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleAIAnalyze}
            disabled={isAnalyzing || !aiPrompt.trim()}
            style={{ background: isAnalyzing ? '#9fb3c8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', marginTop: '0', padding: '10px 15px' }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Auto-fill with AI ✨'}
          </button>
          {aiError && <p style={{ color: '#e53e3e', fontSize: '14px', marginTop: '10px' }}>{aiError}</p>}
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              name="title"
              className={styles.input}
              placeholder="Brief title of the issue"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Category</label>
            <select name="category" className={styles.select} value={formData.category} onChange={handleChange} required>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Network">Network</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Priority</label>
            <select name="priority" className={styles.select} value={formData.priority} onChange={handleChange} required>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Detailed Description</label>
            <textarea
              name="description"
              className={styles.textarea}
              placeholder="Please provide specifics about the issue..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
}