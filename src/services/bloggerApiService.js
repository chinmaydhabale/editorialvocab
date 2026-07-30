/**
 * Service to publish posts directly to Google Blogger via Blogger API v3.
 * Automatically assigns automation-friendly labels used by the Blogger theme.
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
 * Publishes post directly to Blogger API v3 with automatic theme labels.
 */
export async function publishToBlogger({ 
  blogId, 
  accessToken, 
  title, 
  htmlContent, 
  postDate,
  sourceName,
  hasIdioms = false,
  isDraft = false 
}) {
  if (!blogId || !blogId.trim()) {
    throw new Error("Blogger Blog ID is required. Find it in your Blogger dashboard URL.");
  }

  let validToken = accessToken ? accessToken.trim() : "";

  if (!validToken) {
    throw new Error("Google OAuth Access Token is required.");
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
      labels: data.labels || labels,
      status: isDraft ? 'DRAFT' : 'PUBLISHED'
    };
  } catch (error) {
    console.error("Blogger Auto-Publish Error:", error);
    throw new Error(error.message || "Failed to publish post to Blogger.");
  }
}
