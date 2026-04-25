export const analyzeComplaintAI = async (complaintText) => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  if (!token) {
    throw new Error("GitHub token not found in .env");
  }

  if (!complaintText) {
    throw new Error("No complaint text provided");
  }

  try {
    const response = await fetch(
      "https://models.github.ai/inference/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          // openai/gpt-5 is not a valid model ID yet, using gpt-4o which GitHub Models supports
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `
Return STRICT JSON only. No extra text or markdown formatting.

{
  "title": "",
  "description": "",
  "category": "Hardware | Software | Network | Maintenance | Other",
  "priority": "Low | Medium | High | Critical"
}
              `,
            },
            {
              role: "user",
              content: complaintText,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("API Error Response:", errText);
      throw new Error(`API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid AI response format");
    }

    const text = data.choices[0].message.content;

    // Clean any markdown formatting that might still be present
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Parse Error:", cleaned);
      throw new Error("AI returned invalid JSON");
    }

    // Ensure safe fallback values
    return {
      title: result.title || "",
      description: result.description || "",
      category: result.category || "Other",
      priority: result.priority || "Low",
    };

  } catch (err) {
    console.error("AI ERROR:", err.message);
    throw err;
  }
};