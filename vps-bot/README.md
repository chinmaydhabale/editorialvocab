# 🤖 EditorialVocab - 100% Automated VPS Bot 🚀

This is a **fully automated, 24/7 background bot** designed to run on a Virtual Private Server (VPS) or Linux/Windows server. It continuously monitors RSS feeds of top newspapers like **The Hindu**, **Indian Express**, and **LiveMint**, detects new editorials, extracts full article content, generates AI vocabulary analysis (with Hindi meanings, mnemonics, idioms & interactive practice quiz) using Gemini AI, creates dynamic SVG cover thumbnails, and automatically publishes the generated post directly to **Google Blogger** without any manual work.

---

## ✨ Core Features
- **100% Zero Manual Intervention**: Fully automatic RSS fetching -> Article extraction -> Gemini AI Analysis -> AI Banner creation -> Blogger Auto-Publishing.
- **24/7 VPS Background Authentication**: Uses Google OAuth `refresh_token` so access tokens refresh automatically in background. No login expiration ever!
- **Built-in Deduplication System**: Uses local database (`data/history.json`) to guarantee an editorial is published only ONCE.
- **Identical High Quality Output**: Same interactive features as the web application (Words, Hindi meanings, Mnemonics, Idioms, Interactive Swipe-Card Practice Quiz).
- **Configurable RSS Feeds**: Out of the box support for The Hindu Editorial RSS, Indian Express Editorial RSS, LiveMint, etc.

---

## 🛠️ Step-by-Step VPS Setup Guide

### 1. Requirements
- **Node.js**: v18.0.0 or higher
- **Gemini API Key**: Free API Key from [Google AI Studio](https://aistudio.google.com/)
- **Blogger Blog ID**: Found in your Blogger dashboard URL (`https://www.blogger.com/blog/posts/YOUR_BLOG_ID`)
- **Google OAuth Client ID & Secret**: Created in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) with Blogger API v3 enabled.

---

### 2. Installation on VPS

```bash
# Navigate to the bot directory
cd vps-bot

# Install dependencies
npm install
```

---

### 3. Generate 24/7 Google Refresh Token (One-time setup)

Run the included interactive helper CLI script:

```bash
npm run get-token
```

1. Enter your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
2. Open the printed authorization link in your browser and log in with your Blogger Google account.
3. Upon approval, your 24/7 `GOOGLE_REFRESH_TOKEN` will be generated and printed to the screen!

---

### 4. Configure Environment Variables (`.env`)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
GEMINI_API_KEY=AIzaSy...
PREFERRED_MODEL=gemini-3.6-flash

BLOGGER_BLOG_ID=1234567890123456789

GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret
GOOGLE_REFRESH_TOKEN=1//04your_refresh_token...
GOOGLE_INDEXING_API_ENABLED=false

CRON_SCHEDULE=*/30 * * * *
BLOG_THEME=slate
WORD_COUNT=all
```

Keep `GOOGLE_INDEXING_API_ENABLED=false` for normal EditorialVocab blog posts. Google's Indexing API is only meant for eligible `JobPosting` pages and livestream `BroadcastEvent` pages inside `VideoObject`; normal vocabulary articles should rely on Blogger's sitemap, internal links, and Search Console URL inspection.

---

### 5. Test Run Commands

#### Dry-Run Mode (Test RSS extraction & AI without publishing to Blogger):
```bash
npm run dry-run
```

#### Run Once Immediately:
```bash
npm run once
```

#### Patch Existing Blogger Posts With Jump Breaks:
```bash
npm run migrate-jump-breaks
npm run migrate-jump-breaks -- --apply
```

The first command is a dry run. The second command updates live posts so Blogger can server-render multiple homepage cards more reliably.

---

### 6. Production Deployment on VPS (Run 24/7 with PM2)

Install **PM2** globally on your VPS to keep the bot running 24/7 in the background and auto-restart on system reboots:

```bash
# Install PM2 globally
npm install -g pm2

# Start the bot daemon with PM2
pm2 start src/index.js --name "editorialvocab-bot"

# Save PM2 process list so it restarts on VPS server reboot
pm2 save
pm2 startup
```

#### Useful PM2 Commands:
```bash
# View live logs
pm2 logs editorialvocab-bot

# Check bot status
pm2 status

# Restart bot
pm2 restart editorialvocab-bot
```

---

## 📁 File Structure

```
vps-bot/
├── config.json              # Configurable RSS feed sources & title templates
├── .env.example             # Environment variables template
├── package.json             # Node.json dependencies & scripts
├── README.md                # Deployment instructions
├── data/
│   └── history.json         # Automatic database tracking published article URLs
└── src/
    ├── index.js             # Main bot daemon & cron orchestrator
    ├── rssMonitor.js        # RSS feed parser & deduplication checker
    ├── articleExtractor.js  # Article full text scraper (Jina Reader API)
    ├── geminiEngine.js      # Gemini AI vocabulary & MCQ quiz generator
    ├── thumbnailEngine.js   # Dynamic SVG cover banner generator
    ├── bloggerCompiler.js   # Self-contained Blogger HTML layout compiler
    ├── bloggerPublisher.js  # Blogger API v3 client with OAuth Token refresh
    ├── db.js                # Persistent JSON database manager
    └── getRefreshToken.js   # CLI setup wizard for Google OAuth Refresh Token
```

---

## ❓ FAQ & Troubleshooting

- **How often does the bot check for new editorials?**
  Default is every 30 minutes (`CRON_SCHEDULE=*/30 * * * *`). You can change this in `.env`.
- **What happens if an article is already published?**
  The bot checks `data/history.json` before processing. If the article link or GUID exists in history, it is skipped automatically.
- **Does the OAuth token expire?**
  No! The bot uses `GOOGLE_REFRESH_TOKEN` to automatically request a new 1-hour access token from Google every time it needs to publish.
