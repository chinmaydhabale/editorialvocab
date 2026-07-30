const READER_ENDPOINT = 'https://r.jina.ai/';
const MIN_EXTRACTED_LENGTH = 300;

function normalizeUrl(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol).toString();
}

export async function extractArticleFromUrl(rawUrl) {
  let articleUrl;

  try {
    articleUrl = normalizeUrl(rawUrl);
  } catch {
    throw new Error('Please enter a valid article URL.');
  }

  const response = await fetch(`${READER_ENDPOINT}${articleUrl}`, {
    headers: {
      Accept: 'text/plain'
    }
  });

  if (!response.ok) {
    throw new Error(`Could not extract the article from this URL (${response.status}). Paste text or upload screenshots instead.`);
  }

  const markdown = (await response.text()).trim();
  const cleaned = markdown
    .replace(/^Title:\s*/im, 'Headline: ')
    .replace(/^URL Source:\s*.*$/gim, '')
    .replace(/^Markdown Content:\s*/im, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (cleaned.length < MIN_EXTRACTED_LENGTH) {
    throw new Error('The URL did not return enough article text. Paste the editorial text or upload screenshots instead.');
  }

  return `ARTICLE URL: ${articleUrl}\n\n${cleaned}`;
}
