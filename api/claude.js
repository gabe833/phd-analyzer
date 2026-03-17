// Model options: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo'
// gpt-4o-mini is cheapest, gpt-4o is most capable
const OPENAI_MODEL = 'gpt-4o-mini';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/claude → health check
  if (req.method === 'GET') {
    const apiKey = process.env.OPENAI_API_KEY;
    return res.status(200).json({
      status: 'ok',
      keyConfigured: !!apiKey,
      keyPrefix: apiKey ? apiKey.slice(0, 8) + '...' : 'NOT SET',
      model: OPENAI_MODEL,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = (process.env.OPENAI_API_KEY || '').trim();

  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.'
    });
  }

  if (!apiKey.startsWith('sk-')) {
    return res.status(500).json({
      error: `API key format looks wrong (got prefix: "${apiKey.slice(0, 5)}"). Keys should start with sk-`
    });
  }

  try {
    const { system, user } = req.body;

    if (!user) {
      return res.status(400).json({ error: 'Missing user message' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_tokens: 1500,
        temperature: 0.2,
        messages: [
          { role: 'system', content: system || 'You are a helpful real estate assistant.' },
          { role: 'user', content: user },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI error:', JSON.stringify(data));
      return res.status(response.status).json({
        error: data.error?.message || `OpenAI returned ${response.status}`
      });
    }

    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text });

  } catch (err) {
    console.error('OpenAI proxy error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
