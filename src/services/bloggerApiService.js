/**
 * Service to publish posts directly to Google Blogger via Blogger API v3.
 * Automatically assigns Month Tag (e.g. "July") AND Newspaper Source Tag (e.g. "The Hindu") based on post metadata.
 */

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
 * e.g. "2026-07-29" -> "July"
 */
export function getMonthTagFromDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const monthIndex = d.getMonth();
  return MONTHS_ARRAY[monthIndex] || 'July';
}

/**
 * Extracts Clean Newspaper Tag from a source name.
 * e.g. "The Hindu Editorial" -> "The Hindu"
 */
export function getNewspaperTagFromName(sourceName) {
  if (!sourceName) return 'The Hindu';
  const clean = sourceName.replace(' Editorial', '').trim();
  const matched = NEWSPAPERS_ARRAY.find(n => n.toLowerCase() === clean.toLowerCase());
  return matched || clean || 'The Hindu';
}

const DEFAULT_PLAYGROUND_CLIENT_ID = "407408718192.apps.googleusercontent.com";

/**
 * Exchanges a permanent Refresh Token for a fresh temporary Access Token.
 */
export async function getFreshAccessTokenFromRefreshToken({ refreshToken, clientId, clientSecret }) {
  if (!refreshToken || !refreshToken.trim()) {
    throw new Error("Refresh token missing.");
  }

  const payload = new URLSearchParams({
    client_id: (clientId && clientId.trim()) ? clientId.trim() : DEFAULT_PLAYGROUND_CLIENT_ID,
    refresh_token: refreshToken.trim(),
    grant_type: "refresh_token"
  });

  if (clientSecret && clientSecret.trim()) {
    payload.append("client_secret", clientSecret.trim());
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: payload
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Google Token Refresh Error Response:", data);
    const errCode = data.error || "unknown";
    const errDesc = data.error_description || "Token exchange failed";
    throw new Error(`Google OAuth Token Error [${errCode}]: ${errDesc}`);
  }

  return data.access_token;
}

/**
 * Publishes post directly to Blogger API v3 with automatic Dual Tagging (Month + Newspaper).
 */
export async function publishToBlogger({ 
  blogId, 
  accessToken, 
  refreshToken, 
  clientId, 
  clientSecret, 
  title, 
  htmlContent, 
  postDate,
  sourceName,
  isDraft = false 
}) {
  if (!blogId || !blogId.trim()) {
    throw new Error("Blogger Blog ID is required. Find it in your Blogger dashboard URL.");
  }

  let validToken = accessToken ? accessToken.trim() : "";

  // If refresh token is provided, get a fresh non-expired access token automatically
  if (refreshToken && refreshToken.trim()) {
    try {
      console.log("Automatically refreshing OAuth access token via Refresh Token...");
      validToken = await getFreshAccessTokenFromRefreshToken({ refreshToken, clientId, clientSecret });
    } catch (refreshErr) {
      console.error("Refresh token error:", refreshErr);
      if (!accessToken) {
        throw new Error(refreshErr.message);
      }
    }
  }

  if (!validToken) {
    throw new Error("Google OAuth Access Token is required.");
  }

  const cleanBlogId = blogId.trim();
  const url = `https://www.googleapis.com/blogger/v3/blogs/${cleanBlogId}/posts/?isDraft=${isDraft}`;

  // Automatically calculate Month Tag (e.g., "July") and Newspaper Tag (e.g., "The Hindu")
  const monthLabel = getMonthTagFromDate(postDate);
  const newspaperLabel = getNewspaperTagFromName(sourceName);

  const payload = {
    kind: "blogger#post",
    title: title,
    content: htmlContent,
    labels: [monthLabel, newspaperLabel] // Assigns BOTH Month Tag & Newspaper Tag
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${validToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const detailedReason = data.error?.errors?.[0]?.reason || "";
      const detailedMessage = data.error?.message || `Blogger API Error (${response.status})`;
      
      throw new Error(`${detailedMessage} ${detailedReason ? `(${detailedReason})` : ''}`);
    }

    return {
      success: true,
      postId: data.id,
      url: data.url,
      publishedDate: data.published,
      title: data.title,
      labels: data.labels || [monthLabel, newspaperLabel],
      status: isDraft ? 'DRAFT' : 'PUBLISHED'
    };
  } catch (error) {
    console.error("Blogger Auto-Publish Error:", error);
    throw new Error(error.message || "Failed to publish post to Blogger.");
  }
}
