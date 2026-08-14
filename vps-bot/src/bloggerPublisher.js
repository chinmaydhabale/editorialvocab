import axios from 'axios';

export const MONTHS_ARRAY = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const NEWSPAPERS_ARRAY = [
  'The Hindu',
  'Indian Express',
  'LiveMint',
  'Business Standard',
  'Times of India',
  'Custom Editorial'
];

/**
 * Extracts Month Name Tag from a date string.
 */
export function getMonthTagFromDate(dateStr) {
  let d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) {
    d = new Date();
  }
  const monthIndex = d.getMonth();
  return MONTHS_ARRAY[monthIndex] || MONTHS_ARRAY[new Date().getMonth()];
}

/**
 * Extracts Clean Newspaper Tag from a source name.
 */
export function getNewspaperTagFromName(sourceName) {
  if (!sourceName) return 'The Hindu';
  const clean = sourceName.replace(' Editorial', '').trim();
  const matched = NEWSPAPERS_ARRAY.find(n => n.toLowerCase() === clean.toLowerCase());
  return matched || clean || 'The Hindu';
}

export function getAutomationLabels({ postDate, sourceName, hasIdioms = false }) {
  const labels = [
    'Vocabulary',
    getMonthTagFromDate(postDate),
    getNewspaperTagFromName(sourceName)
  ];

  if (hasIdioms) {
    labels.push('Idioms');
  }

  return labels.filter((label, index, allLabels) => label && allLabels.indexOf(label) === index);
}

/**
 * Exchanges Google OAuth Refresh Token for a fresh Access Token.
 * Allows 24/7 background publishing on VPS without token expiration.
 */
export async function refreshGoogleAccessToken({ clientId, clientSecret, refreshToken }) {
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google OAuth credentials (CLIENT_ID, CLIENT_SECRET, or REFRESH_TOKEN).");
  }

  try {
    const res = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: clientId.trim(),
      client_secret: clientSecret.trim(),
      refresh_token: refreshToken.trim(),
      grant_type: 'refresh_token'
    });

    if (res.data && res.data.access_token) {
      return res.data.access_token;
    }

    throw new Error('OAuth token endpoint did not return an access_token.');
  } catch (err) {
    const detail = err.response?.data?.error_description || err.message;
    throw new Error(`Failed to refresh Google Access Token: ${detail}`);
  }
}

/**
 * Publishes post directly to Blogger API v3 with automatic theme labels.
 */
export async function publishToBlogger({
  blogId,
  accessToken,
  clientId,
  clientSecret,
  refreshToken,
  title,
  htmlContent,
  postDate,
  sourceName,
  hasIdioms = false,
  isDraft = false
}) {
  if (!blogId || !blogId.trim()) {
    throw new Error("Blogger Blog ID is required. Set BLOGGER_BLOG_ID in .env or config.");
  }

  let token = accessToken ? accessToken.trim() : '';

  // Auto refresh token if refresh credentials are present
  if (refreshToken && clientId && clientSecret) {
    try {
      token = await refreshGoogleAccessToken({ clientId, clientSecret, refreshToken });
    } catch (refreshErr) {
      if (!token) {
        throw refreshErr;
      }
      console.warn("⚠️ Token refresh warning, attempting with provided access token:", refreshErr.message);
    }
  }

  if (!token) {
    throw new Error("No valid Google OAuth Access Token available. Run `npm run get-token` to set up 24/7 VPS authentication.");
  }

  const cleanBlogId = blogId.trim();
  const url = `https://www.googleapis.com/blogger/v3/blogs/${cleanBlogId}/posts/?isDraft=${isDraft}`;
  const labels = getAutomationLabels({ postDate, sourceName, hasIdioms });

  const payload = {
    kind: "blogger#post",
    title: title,
    content: htmlContent,
    labels
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = response.data;
    return {
      success: true,
      postId: data.id,
      url: data.url,
      publishedDate: data.published,
      title: data.title,
      labels: data.labels || labels,
      status: isDraft ? 'DRAFT' : 'PUBLISHED'
    };
  } catch (error) {
    const detailedMessage = error.response?.data?.error?.message || error.message || "Failed to publish post to Blogger.";
    console.error("❌ Blogger Auto-Publish Error:", detailedMessage);
    throw new Error(detailedMessage);
  }
}
