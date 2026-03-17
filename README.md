# PHD Properties — Investment Analyzer

AI-powered real estate investment analyzer. Enter any US property address and get a full ROI report instantly.

## Deploy to Vercel (5 minutes)

### Option A — Vercel CLI (fastest)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd phd-analyzer
   vercel
   ```
   Follow the prompts — accept all defaults.

3. **Add your Anthropic API key**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   ```
   Paste your key when prompted. Select: Production, Preview, Development.

4. **Redeploy to apply the env var**
   ```bash
   vercel --prod
   ```

Done. Your URL will be something like `https://phd-analyzer-xxx.vercel.app`

---

### Option B — GitHub + Vercel Dashboard (no CLI)

1. **Push this folder to a GitHub repo**
   - Go to github.com → New repository → name it `phd-analyzer`
   - Upload all files (or use `git push`)

2. **Import to Vercel**
   - Go to vercel.com → Add New Project
   - Connect your GitHub account
   - Select the `phd-analyzer` repo
   - Click **Deploy** (no build settings needed)

3. **Add the environment variable**
   - In Vercel dashboard → Your project → Settings → Environment Variables
   - Add: `ANTHROPIC_API_KEY` = `sk-ant-...your key...`
   - Select all environments (Production, Preview, Development)

4. **Redeploy**
   - Deployments tab → Three dots on latest → Redeploy

---

## Project Structure

```
phd-analyzer/
├── api/
│   └── claude.js        ← Serverless function (keeps API key secret)
├── public/
│   └── index.html       ← The entire frontend app
├── vercel.json          ← Routing config
├── package.json
└── .gitignore
```

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key from console.anthropic.com |

## Getting Your API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Settings → API Keys → Create Key
3. Copy the key (starts with `sk-ant-`)

## Notes

- The API key is **never** exposed to the browser — all Claude calls go through `/api/claude`
- Google Places autocomplete uses a pre-configured key for address lookup
- All property data (value, rent, etc.) is AI-estimated — verify before making offers
