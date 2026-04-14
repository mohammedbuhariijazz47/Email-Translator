# Gmail AI Translator

AI-powered multilingual email translator built with Next.js 14, Claude (Anthropic), and Gmail API.

---

## Quick Start (2 commands)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — demo emails load automatically, no Gmail OAuth needed to test.

---

## Full Setup (with real Gmail)

### 1. Clone and install
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com → API Keys |
| `GMAIL_CLIENT_ID` | Google Cloud Console → APIs → Gmail API → Credentials |
| `GMAIL_CLIENT_SECRET` | Same credentials page |
| `GMAIL_REDIRECT_URI` | Set to `http://localhost:3000/api/auth/callback` |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |

### 3. Enable Gmail API
1. Go to https://console.cloud.google.com
2. Create a project → Enable **Gmail API**
3. Create OAuth 2.0 credentials (Web Application)
4. Add `http://localhost:3000` to Authorized Origins
5. Add `http://localhost:3000/api/auth/callback` to Redirect URIs

### 4. Run
```bash
npm run dev
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/translate` | Detect language + translate email body |
| POST | `/api/reply` | Translate reply into recipient's language |
| GET  | `/api/emails` | Fetch Gmail inbox (requires Bearer token) |

### POST /api/translate
```json
// Request
{ "text": "Hola, necesitamos reunirnos mañana.", "targetLang": "English" }

// Response
{ "detectedLang": "Spanish", "confidence": "high", "translated": "Hello, we need to meet tomorrow." }
```

### POST /api/reply
```json
// Request
{ "replyText": "Sure, I'll be there.", "recipientLang": "Spanish" }

// Response
{ "translated": "Claro, estaré allí.", "sent": false }
```

---

## Project Structure

```
gmail-translator/
├── app/
│   ├── api/
│   │   ├── translate/route.js   # Language detection + translation
│   │   ├── reply/route.js       # Reply translation + send
│   │   └── emails/route.js      # Gmail inbox fetch
│   ├── layout.js
│   ├── page.jsx                 # Main inbox UI
│   └── globals.css
├── lib/
│   ├── translator.js            # Anthropic AI helpers
│   └── gmail.js                 # Gmail API helpers
├── .env.example
└── package.json
```

---

## Supported Languages & Scripts

| Script | Languages |
|--------|-----------|
| Latin | English, Spanish, French, German, Portuguese |
| Arabic | Arabic, Persian, Urdu |
| Devanagari | Hindi, Marathi |
| CJK | Chinese, Japanese, Korean |
| Tamil | Tamil |
| Cyrillic | Russian |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`)
- **Email**: Google Gmail API v1
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 18+
