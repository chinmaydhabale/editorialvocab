/**
 * Service to publish posts directly to Google Blogger via Blogger API v3.
 * Endpoint: https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts/
 */

export async function publishToBlogger({ blogId, accessToken, title, htmlContent, isDraft = false }) {
  if (!blogId || blogId.trim() === "") {
    throw new Error("Blogger Blog ID is required. Find it in your Blogger dashboard URL.");
  }

  if (!accessToken || accessToken.trim() === "") {
    throw new Error("Google OAuth Access Token is required for auto-publishing.");
  }

  const cleanBlogId = blogId.trim();
  const cleanToken = accessToken.trim();

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
        "Authorization": `Bearer ${cleanToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Blogger API Error (${response.status})`);
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
