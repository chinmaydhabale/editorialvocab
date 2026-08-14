import crypto from 'crypto';
import fs from 'fs';
import axios from 'axios';

/**
 * Creates an RS256 signed JWT for Google Service Account authentication
 */
function createServiceAccountJwt(serviceAccount, scope) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope: scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: exp,
    iat: iat
  };

  const base64UrlEncode = (str) =>
    Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer.sign(serviceAccount.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${signature}`;
}

/**
 * Obtains an Access Token using Service Account JWT
 */
async function getServiceAccountAccessToken(serviceAccount, scope) {
  const jwt = createServiceAccountJwt(serviceAccount, scope);
  const res = await axios.post('https://oauth2.googleapis.com/token', {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt
  });
  return res.data.access_token;
}

function isEnabled(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase());
}

/**
 * Submits an eligible URL to Google's Indexing API.
 * Google limits this API to JobPosting pages and BroadcastEvent pages inside VideoObject.
 */
export async function submitUrlToGoogleIndexing({
  url,
  serviceAccountKeyPath,
  serviceAccountJson,
  accessToken,
  enabled = process.env.GOOGLE_INDEXING_API_ENABLED
}) {
  if (!url) return false;

  if (!isEnabled(enabled)) {
    console.log('ℹ️ Google Indexing API skipped. Enable only for eligible JobPosting/BroadcastEvent pages with GOOGLE_INDEXING_API_ENABLED=true.');
    return false;
  }

  let token = accessToken;

  // Attempt to use Service Account if provided
  try {
    let sa = null;
    if (serviceAccountJson) {
      sa = typeof serviceAccountJson === 'string' ? JSON.parse(serviceAccountJson) : serviceAccountJson;
    } else if (serviceAccountKeyPath && fs.existsSync(serviceAccountKeyPath)) {
      const raw = fs.readFileSync(serviceAccountKeyPath, 'utf-8');
      sa = JSON.parse(raw);
    }

    if (sa && sa.client_email && sa.private_key) {
      token = await getServiceAccountAccessToken(sa, 'https://www.googleapis.com/auth/indexing');
    }
  } catch (saErr) {
    console.warn('⚠️ Could not load Service Account for Google Indexing API:', saErr.message);
  }

  if (!token) {
    console.log('ℹ️ Google Indexing API skipped (No Service Account or Access Token available).');
    return false;
  }

  try {
    const res = await axios.post(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        url: url,
        type: 'URL_UPDATED'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (res.status === 200 || res.status === 202) {
      console.log(`✅ Google Indexing API notification accepted for eligible URL (${url})`);
      return true;
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error?.message || err.message;
    console.warn(`⚠️ Google Indexing API Warning (${url}):`, errorMsg);
  }

  return false;
}

/**
 * Logs the sitemap URL that should be submitted in Google Search Console.
 * Google deprecated the unauthenticated sitemap ping endpoint, so this avoids a useless request.
 */
export async function logSitemapSubmissionAdvice(siteUrl) {
  if (!siteUrl) return;

  try {
    const sitemapUrl = new URL('/sitemap.xml', siteUrl).href;
    console.log(`ℹ️ Submit/check this sitemap in Search Console: ${sitemapUrl}`);
  } catch (err) {
    console.warn(`⚠️ Could not build sitemap URL from "${siteUrl}":`, err.message);
  }
}
