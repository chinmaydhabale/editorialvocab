import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE_PATH = path.join(__dirname, '..', 'data', 'history.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load database state
function loadDb() {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE_PATH)) {
    const initialData = { processedArticles: [] };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('⚠️ Failed to parse database file, resetting to clean state:', err.message);
    return { processedArticles: [] };
  }
}

// Save database state
function saveDb(data) {
  ensureDataDir();
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Normalizes URL for consistent hash/identifier comparison
 */
export function normalizeArticleUrl(url) {
  if (!url) return '';
  return String(url)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .split('?')[0];
}

/**
 * Checks whether an article URL or GUID has already been processed and published.
 */
export function isProcessed(articleUrl, guid = '') {
  const db = loadDb();
  const normUrl = normalizeArticleUrl(articleUrl);
  const cleanGuid = String(guid || '').trim();

  return db.processedArticles.some(item => {
    if (cleanGuid && item.guid === cleanGuid) return true;
    if (normUrl && item.normalizedUrl === normUrl) return true;
    if (articleUrl && item.url === articleUrl) return true;
    return false;
  });
}

/**
 * Records an article as published in the local database.
 */
export function markAsProcessed(articleData) {
  const db = loadDb();
  const normUrl = normalizeArticleUrl(articleData.url);

  const record = {
    id: `art_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    url: articleData.url,
    normalizedUrl: normUrl,
    guid: articleData.guid || articleData.url,
    title: articleData.title || '',
    sourceName: articleData.sourceName || '',
    bloggerPostId: articleData.bloggerPostId || '',
    bloggerPostUrl: articleData.bloggerPostUrl || '',
    publishedAt: new Date().toISOString()
  };

  db.processedArticles.push(record);
  saveDb(db);
  return record;
}

/**
 * Retrieves full history of processed articles.
 */
export function getHistory() {
  const db = loadDb();
  return db.processedArticles || [];
}
