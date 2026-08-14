import Parser from 'rss-parser';
import axios from 'axios';
import { isProcessed } from './db.js';

const parser = new Parser();

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

/**
 * Fetches RSS feed XML string via axios with full browser headers to bypass 403 blocks.
 */
async function fetchXmlWithAxios(url) {
  const response = await axios.get(url, {
    headers: BROWSER_HEADERS,
    timeout: 12000,
    maxRedirects: 5
  });
  return response.data;
}

/**
 * Fetches RSS feed from a given feed entry configuration.
 */
export async function fetchFeed(feedConfig) {
  const { name, url, category = 'Editorial' } = feedConfig;

  // Try fetching via axios + parseString to avoid Cloudflare/403 blocks
  try {
    const xmlData = await fetchXmlWithAxios(url);
    const feed = await parser.parseString(xmlData);
    const items = (feed.items || []).map(item => {
      const link = item.link || item.guid || '';
      let title = (item.title || '').trim();
      title = title.replace(/\s*-\s*(?:The\s+)?Indian\s+Express$/i, '').replace(/\s*-\s*(?:The\s+)?Hindu$/i, '').trim();
      const pubDate = item.pubDate || item.isoDate || new Date().toISOString();
      const guid = item.guid || link || title;

      return {
        title,
        link,
        guid,
        pubDate,
        sourceName: name,
        category,
        snippet: (item.contentSnippet || item.content || '').slice(0, 300)
      };
    });

    return items;
  } catch (axiosErr) {
    // Fallback: try standard parseURL
    try {
      const feed = await parser.parseURL(url);
      const items = (feed.items || []).map(item => {
        const link = item.link || item.guid || '';
        let title = (item.title || '').trim();
        title = title.replace(/\s*-\s*(?:The\s+)?Indian\s+Express$/i, '').replace(/\s*-\s*(?:The\s+)?Hindu$/i, '').trim();
        const pubDate = item.pubDate || item.isoDate || new Date().toISOString();
        const guid = item.guid || link || title;

        return {
          title,
          link,
          guid,
          pubDate,
          sourceName: name,
          category,
          snippet: (item.contentSnippet || item.content || '').slice(0, 300)
        };
      });

      return items;
    } catch (parseErr) {
      console.error(`⚠️ Error fetching RSS feed [${name}] (${url}):`, axiosErr.message || parseErr.message);
      return [];
    }
  }
}

/**
 * Monitors all configured enabled RSS feeds and returns newly published, unprocessed articles.
 * Enforces a strict 24-hour freshness filter so old editorials are NEVER processed.
 */
export async function getUnprocessedArticlesFromFeeds(feedsList = [], maxAgeHours = 24) {
  const newArticles = [];
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  const nowMs = Date.now();

  for (const feedConfig of feedsList) {
    if (!feedConfig.enabled || !feedConfig.url) continue;

    const items = await fetchFeed(feedConfig);
    for (const item of items) {
      if (!item.link || !item.title) continue;

      // 1. Freshness Filter: Skip articles older than maxAgeHours (24h)
      const itemTime = item.pubDate ? new Date(item.pubDate).getTime() : 0;
      if (itemTime > 0 && !isNaN(itemTime)) {
        const ageMs = nowMs - itemTime;
        if (ageMs > maxAgeMs) {
          // Skip old editorial
          continue;
        }
      }

      // 2. Deduplication check
      if (!isProcessed(item.link, item.guid)) {
        newArticles.push(item);
      }
    }
  }

  // 3. Sort by publication date descending (newest published editorial first)
  newArticles.sort((a, b) => {
    const timeA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const timeB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return timeB - timeA;
  });

  return newArticles;
}
