export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/claude → health check (helps debug env var issues)
  if (req.method === 'GET') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    return res.status(200).json({
      status: 'ok',
      keyConfigured: !!apiKey,
      keyPrefix: apiKey ? apiKey.slice(0, 10) + '...' : 'NOT SET',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Trim to catch copy/paste whitespace issues
  const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();

  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.'
    });
  }

  if (!apiKey.startsWith('sk-ant-')) {
    return res.status(500).json({
      error: `API key format looks wrong (got prefix: "${apiKey.slice(0,7)}"). Keys should start with sk-ant-`
    });
  }

  try {
    const { system, user } = req.body;

    if (!user) {
      return res.status(400).json({ error: 'Missing user message' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: system || 'You are a helpful real estate assistant.',
        messages: [{ role: 'user', content: user }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', JSON.stringify(data));
      return res.status(response.status).json({
        error: data.error?.message || `Anthropic returned ${response.status}`
      });
    }

    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ text });

  } catch (err) {
    console.error('Claude proxy error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
