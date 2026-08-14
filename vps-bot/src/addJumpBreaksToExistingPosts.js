import axios from 'axios';
import dotenv from 'dotenv';

import { refreshGoogleAccessToken } from './bloggerPublisher.js';

dotenv.config();

const JUMP_BREAK = '<!--more-->';
const INSERTION_MARKERS = [
  '  <!-- Words List Section -->',
  '<!-- Words List Section -->',
  '  <!-- Dedicated Idioms & Phrases Section -->',
  '<!-- Dedicated Idioms & Phrases Section -->',
  '  <!-- Interactive Swipe Card Quiz -->',
  '<!-- Interactive Swipe Card Quiz -->'
];

function hasArg(name) {
  return process.argv.includes(name);
}

function getArgValue(name, fallback = '') {
  const prefix = `${name}=`;
  const found = process.argv.find(arg => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function insertJumpBreak(content = '') {
  if (!content || content.includes(JUMP_BREAK)) {
    return content;
  }

  for (const marker of INSERTION_MARKERS) {
    const index = content.indexOf(marker);
    if (index !== -1) {
      return `${content.slice(0, index).trimEnd()}\n\n  ${JUMP_BREAK}\n\n${content.slice(index)}`;
    }
  }

  return content;
}

async function getAccessToken() {
  const accessToken = (process.env.GOOGLE_ACCESS_TOKEN || '').trim();
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const refreshToken = (process.env.GOOGLE_REFRESH_TOKEN || '').trim();

  if (clientId && clientSecret && refreshToken) {
    return refreshGoogleAccessToken({ clientId, clientSecret, refreshToken });
  }

  if (accessToken) {
    return accessToken;
  }

  throw new Error('Missing Blogger OAuth credentials. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, or GOOGLE_ACCESS_TOKEN.');
}

async function listPosts({ blogId, token, pageToken = '' }) {
  const response = await axios.get(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      fetchBodies: true,
      maxResults: 50,
      pageToken: pageToken || undefined,
      status: 'live'
    }
  });

  return response.data || {};
}

async function updatePost({ blogId, token, post }) {
  const response = await axios.patch(
    `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${post.id}`,
    {
      content: post.content
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

async function run() {
  const blogId = (process.env.BLOGGER_BLOG_ID || '').trim();
  const shouldApply = hasArg('--apply');
  const limit = Number(getArgValue('--limit', '0')) || 0;

  if (!blogId) {
    throw new Error('Missing BLOGGER_BLOG_ID in vps-bot/.env.');
  }

  const token = await getAccessToken();
  let pageToken = '';
  let scanned = 0;
  let alreadyFixed = 0;
  let changed = 0;
  let skipped = 0;

  console.log(`\nJump break migration ${shouldApply ? '[APPLY]' : '[DRY RUN]'}\n`);

  do {
    const data = await listPosts({ blogId, token, pageToken });
    const posts = data.items || [];

    for (const originalPost of posts) {
      if (limit && scanned >= limit) {
        pageToken = '';
        break;
      }

      scanned += 1;

      if ((originalPost.content || '').includes(JUMP_BREAK)) {
        alreadyFixed += 1;
        console.log(`OK    ${originalPost.title}`);
        continue;
      }

      const nextContent = insertJumpBreak(originalPost.content || '');

      if (nextContent === originalPost.content) {
        skipped += 1;
        console.log(`SKIP  ${originalPost.title}`);
        continue;
      }

      changed += 1;
      console.log(`${shouldApply ? 'FIX  ' : 'WOULD '} ${originalPost.title}`);

      if (shouldApply) {
        await updatePost({
          blogId,
          token,
          post: {
            ...originalPost,
            content: nextContent
          }
        });
      }
    }

    pageToken = data.nextPageToken || '';
  } while (pageToken);

  console.log('\nSummary');
  console.log(`Scanned: ${scanned}`);
  console.log(`Already fixed: ${alreadyFixed}`);
  console.log(`${shouldApply ? 'Updated' : 'Would update'}: ${changed}`);
  console.log(`Skipped: ${skipped}`);

  if (!shouldApply && changed > 0) {
    console.log('\nRun with --apply to update live Blogger posts.');
  }
}

run().catch(error => {
  console.error(`\nMigration failed: ${error.response?.data?.error?.message || error.message}`);
  process.exit(1);
});
