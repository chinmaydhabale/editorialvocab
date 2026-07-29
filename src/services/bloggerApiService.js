/**
 * Service to publish posts directly to Google Blogger via Blogger API v3.
 * Supports automatic token refresh using Refresh Token (Permanent No-Expiry Publishing).
 */

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
    if (data.error === "invalid_client" || (data.error_description && data.error_description.includes("client_secret"))) {
      throw new Error("Client Secret Required: Please paste your Google Cloud Client ID and Client Secret in the modal boxes below.");
    }
    throw new Error(data.error_description || data.error || "Failed to refresh OAuth token. Please check your Refresh Token & Credentials.");
  }

  return data.access_token;
}

/**
 * Publishes post directly to Blogger API.
 */
export async function publishToBlogger({ 
  blogId, 
  accessToken, 
  refreshToken, 
  clientId, 
  clientSecret, 
  title, 
  htmlContent, 
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
    throw new Error("Google OAuth Access Token or Refresh Token is required.");
  }

  const cleanBlogId = blogId.trim();
  const url = `https://www.googleapis.com/blogger/v3/blogs/${cleanBlogId}/posts/?isDraft=${isDraft}`;

  const payload = {
    kind: "blogger#post",
    title: title,
    content: htmlContent
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
      
      if (response.status === 401 || detailedReason === "unauthorized" || detailedMessage.includes("Unauthorized")) {
        throw new Error(`Unauthorized (401): Please ensure Blogger API is enabled in Google Cloud Console AND test with "Access Token (1 Hour)" mode first.`);
      }

      throw new Error(`${detailedMessage} ${detailedReason ? `(${detailedReason})` : ''}`);
    }

    return {
      success: true,
      postId: data.id,
      url: data.url,
      publishedDate: data.published,
      title: data.title,
      status: isDraft ? 'DRAFT' : 'PUBLISHED'
    };
  } catch (error) {
    console.error("Blogger Auto-Publish Error:", error);
    throw new Error(error.message || "Failed to publish post to Blogger.");
  }
}
