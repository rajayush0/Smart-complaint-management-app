import api from './apiClient';

export const analyzeComplaintAI = async (complaintText) => {
  if (!complaintText?.trim()) throw new Error('No complaint text provided');

  const { data } = await api.post('/api/ai/analyze', { text: complaintText });
  return {
    title:       data.title       || '',
    description: data.description || '',
    category:    data.category    || 'Other',
    priority:    data.priority    || 'Low',
  };
};
