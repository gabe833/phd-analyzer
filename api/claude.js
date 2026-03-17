// Model options:
// 'gemini-2.0-flash'        → fast, free tier friendly (recommended)
// 'gemini-2.5-pro-preview-05-06' → most capable
// 'gemini-2.0-flash-lite'   → lightest/cheapest
const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/claude → health check
  if (req.method === 'GET') {
    const apiKey = process.env.GEMINI_API_KEY;
    return res.status(200).json({
      status: 'ok',
      keyConfigured: !!apiKey,
      keyPrefix: apiKey ? apiKey.slice(0, 8) + '...' : 'NOT SET',
      model: GEMINI_MODEL,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.'
    });
  }

  try {
    const { system, user } = req.body;

    if (!user) {
      return res.status(400).json({ error: 'Missing user message' });
    }

    // Correct Gemini REST endpoint with x-goog-api-key header
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: system || 'You are a helpful real estate assistant.' }]
        },
        contents: [
          { role: 'user', parts: [{ text: user }] }
        ],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.2,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', JSON.stringify(data));
      return res.status(response.status).json({
        error: data.error?.message || `Gemini returned ${response.status}`
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ text });

  } catch (err) {
    console.error('Gemini proxy error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
