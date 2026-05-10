export const analyzeComplaint = async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ message: 'text is required' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(503).json({ message: 'AI service not configured' });
  }

  const response = await fetch('https://models.github.ai/inference/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Return STRICT JSON only. No extra text or markdown.
{
  "title": "",
  "description": "",
  "category": "Hardware | Software | Network | Maintenance | Other",
  "priority": "Low | Medium | High | Critical"
}`,
        },
        { role: 'user', content: text },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return res.status(502).json({ message: `GitHub AI error: ${errText}` });
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

  let result;
  try {
    result = JSON.parse(cleaned);
  } catch {
    return res.status(502).json({ message: 'AI returned invalid JSON' });
  }

  res.json({
    title:       result.title       || '',
    description: result.description || '',
    category:    result.category    || 'Other',
    priority:    result.priority    || 'Low',
  });
};
