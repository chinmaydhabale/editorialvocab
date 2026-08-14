import axios from 'axios';

function extractUrlFromGNewsPayload(gnewsUrl) {
  try {
    const match = gnewsUrl.match(/\/articles\/([^?]+)/);
    if (match && match[1]) {
      const base64Str = match[1].replace(/-/g, '+').replace(/_/g, '/');
      const buffer = Buffer.from(base64Str, 'base64');
      const rawString = buffer.toString('utf-8', 0, buffer.length);
      console.log('Decoded raw string:', JSON.stringify(rawString));

      // Match indianexpress URL
      const matchUrl = rawString.match(/(https?:\/\/[^\s"\x00-\x1F\x7F]+)/i) || rawString.match(/(indianexpress\.com[^\s"\x00-\x1F\x7F]+)/i);
      if (matchUrl) {
        let u = matchUrl[1] || matchUrl[0];
        if (!u.startsWith('http')) u = `https://${u}`;
        return u;
      }
    }
  } catch (e) {
    console.error('Extraction error:', e.message);
  }
  return null;
}

async function test() {
  const gnewsUrl = 'https://news.google.com/rss/articles/CBMiqwFBVV95cUxQcmdTNjQ2QS1ON1ZORWFfeFpHbFRCZXlXLWRJNFZaNm43MWNDbHZ3UFl4RkFjZkpJNHFiaW5yUDNCZmY3UDl3dGZDYWZJOV9tZTdEQUE4Z1dBN0VqakdvUU5vSkFjcUxmNlAydDBzaW1OT0ljOTNuck1mRXZ0REhETGV5RHF5MzFHXzh1allDTTM4QlhzNkxUNmxuRzk3a0o2eGhJcnBpZU9fOUnSAasBQVVfeXFMUHJnUzY0NkEtTjdWTkVhX3haR2xUQmV5Vy1kSTRWWjZuNzFjQ2x2d1BZeEZBY2ZKSTRxYmluclAzQmZmN1A5d3RmQ2FmSTlfbWU3REFBOGdXQTdEampHb1FOb0pBY3FMZjZQMnQwc2ltTk9JYzkzbnJNZkV2dERIRExleURxeTMxR184dWpZQ00zOEJYczZMVDZsbkc5N2tKNnhoSXJwaWVPXzlJ?oc=5';
  
  const targetUrl = extractUrlFromGNewsPayload(gnewsUrl);
  console.log('Extracted Target URL:', targetUrl);
}

test();
