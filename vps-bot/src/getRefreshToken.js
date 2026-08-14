import http from 'http';
import readline from 'readline';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SCOPE = 'https://www.googleapis.com/auth/blogger';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

function askQuestion(rl, query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function runWizard() {
  console.log('\n==================================================');
  console.log('🔑 Blogger API 24/7 OAuth Refresh Token Generator');
  console.log('==================================================\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const envClientId = process.env.GOOGLE_CLIENT_ID || '';
  const envClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

  const clientId = (await askQuestion(rl, `Enter Google Client ID [${envClientId ? 'Press Enter to use existing' : 'Required'}]: `)).trim() || envClientId;
  const clientSecret = (await askQuestion(rl, `Enter Google Client Secret [${envClientSecret ? 'Press Enter to use existing' : 'Required'}]: `)).trim() || envClientSecret;

  if (!clientId || !clientSecret) {
    console.error('❌ Both Client ID and Client Secret are required!');
    rl.close();
    process.exit(1);
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(SCOPE)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  console.log('\n--------------------------------------------------');
  console.log('👉 Step 1: Open this authorization URL in your browser:');
  console.log('--------------------------------------------------\n');
  console.log(authUrl);
  console.log('\n--------------------------------------------------');
  console.log('👉 Step 2: Login & authorize.');
  console.log('Google will redirect to a page starting with `http://localhost:3000/oauth2callback?code=...`');
  console.log('(If browser shows "Site cannot be reached", simply copy the whole URL or the code parameter from your browser address bar!)');
  console.log('--------------------------------------------------\n');

  let server;
  
  const exchangeCode = async (code) => {
    console.log('✅ Exchanging authorization code for 24/7 refresh token...');
    try {
      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
      });

      const { refresh_token, access_token } = tokenRes.data;

      console.log('\n==================================================');
      console.log('🎉 SUCCESS! YOUR 24/7 VPS OAUTH CREDENTIALS:');
      console.log('==================================================\n');
      console.log(`GOOGLE_CLIENT_ID=${clientId}`);
      console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`);
      console.log(`GOOGLE_REFRESH_TOKEN=${refresh_token || 'N/A'}`);
      console.log('\n📌 Copy and paste these lines into your `vps-bot/.env` file.\n');

      if (server) server.close();
      rl.close();
      process.exit(0);
    } catch (err) {
      console.error('❌ Token Exchange Failed:', err.response?.data || err.message);
      if (server) server.close();
      rl.close();
      process.exit(1);
    }
  };

  server = http.createServer(async (req, res) => {
    if (req.url && req.url.startsWith('/oauth2callback')) {
      const u = new URL(req.url, 'http://localhost:3000');
      const code = u.searchParams.get('code');
      const error = u.searchParams.get('error');

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>Authentication Failed</h1><p>${error}</p>`);
        if (server) server.close();
        rl.close();
        process.exit(1);
        return;
      }

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1 style="color: #10b981;">✅ Authorization Successful!</h1>
            <p style="font-size: 18px;">You can now close this tab and return to your terminal.</p>
          </div>
        `);

        await exchangeCode(code);
      }
    }
  });

  server.listen(3000, () => {
    console.log('🌐 Local OAuth server running on port 3000...');
  });

  const manualInput = await askQuestion(rl, '\n👉 Paste authorization CODE or redirect URL here (or press Enter if browser connected): ');
  const trimmed = manualInput.trim();
  if (trimmed) {
    let extractedCode = trimmed;
    if (trimmed.includes('code=')) {
      const match = trimmed.match(/code=([^&]+)/);
      if (match) extractedCode = decodeURIComponent(match[1]);
    }
    await exchangeCode(extractedCode);
  }
}

runWizard().catch(err => {
  console.error('❌ CLI Wizard Error:', err.message);
  process.exit(1);
});
