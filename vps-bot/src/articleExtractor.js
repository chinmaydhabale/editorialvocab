import axios from 'axios';

const READER_ENDPOINT = 'https://r.jina.ai/';
const MIN_EXTRACTED_LENGTH = 250;

function normalizeUrl(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol).toString();
}

/**
 * Clean raw markdown/HTML text extracted from article page.
 */
function cleanExtractedText(rawText) {
  if (!rawText) return '';
  return String(rawText)
    .replace(/^Title:\s*/im, 'Headline: ')
    .replace(/^URL Source:\s*.*$/gim, '')
    .replace(/^Markdown Content:\s*/im, '')
    .replace(/\[?https?:\/\/[^\s\]]+\]?/gi, '') // Remove URLs
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts full editorial article text from a given article URL.
 */
export async function extractArticleFromUrl(rawUrl) {
  let articleUrl;

  try {
    articleUrl = normalizeUrl(rawUrl);
  } catch {
    throw new Error(`Invalid URL provided: ${rawUrl}`);
  }

  // Attempt 1: Fetch via Jina Reader API
  try {
    const res = await axios.get(`${READER_ENDPOINT}${articleUrl}`, {
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EditorialBot/1.0'
      },
      timeout: 15000
    });

    const cleaned = cleanExtractedText(res.data);
    if (cleaned.length >= MIN_EXTRACTED_LENGTH) {
      return `ARTICLE URL: ${articleUrl}\n\n${cleaned}`;
    }
  } catch (err) {
    console.warn(`⚠️ Jina Reader fetch failed for ${articleUrl} (${err.message}), trying direct fallback...`);
  }

  // Attempt 2: Direct HTTP GET fallback
  try {
    const res = await axios.get(articleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000
    });

    const html = String(res.data || '');
    // Strip tags and script/style elements
    const plainText = html
      .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const cleaned = cleanExtractedText(plainText);
    if (cleaned.length >= MIN_EXTRACTED_LENGTH) {
      return `ARTICLE URL: ${articleUrl}\n\n${cleaned}`;
    }
  } catch (err) {
    console.error(`❌ Direct fetch fallback failed for ${articleUrl}:`, err.message);
  }

  throw new Error(`Could not extract sufficient article text from URL (${articleUrl}). Minimum text length of ${MIN_EXTRACTED_LENGTH} chars required.`);
}
