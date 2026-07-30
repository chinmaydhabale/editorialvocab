import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Dynamically fetches the list of available Gemini models for the user's API Key.
 */
export async function getAvailableGeminiModels(apiKey) {
  if (!apiKey || !apiKey.trim()) return [];

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
    const data = await res.json();
    if (data.models && Array.isArray(data.models)) {
      const generateModels = data.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.replace(/^models\//, ''));
      return generateModels;
    }
  } catch (err) {
    console.warn("Could not list models from Google API:", err);
  }
  return [];
}

function extractJsonPayload(rawText) {
  const trimmed = String(rawText || '').trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  if (withoutFence.startsWith('{') && withoutFence.endsWith('}')) {
    return withoutFence;
  }

  const firstBrace = withoutFence.indexOf('{');
  const lastBrace = withoutFence.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return withoutFence.slice(firstBrace, lastBrace + 1);
  }

  return withoutFence;
}

/**
 * Analyzes an editorial passage or multiple image screenshots using Gemini API:
 * Exhaustive extraction mandate: Extracts ALL tricky words across all pages (15-30+ words),
 * actual article title, and specific article topic.
 */
export async function analyzeEditorialWithGemini(apiKey, textOrImages, wordCount = 'all', preferredModel = 'gemini-3.6-flash') {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Gemini API Key missing. Please provide your API key in settings or use sample editorials.");
  }

  const cleanKey = apiKey.trim();
  const genAI = new GoogleGenerativeAI(cleanKey);

  const discoveredModels = await getAvailableGeminiModels(cleanKey);

  const NEW_MODELS_PRIORITY = [
    preferredModel,
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
  ];

  const MODELS_TO_TRY = [
    ...NEW_MODELS_PRIORITY.filter(m => discoveredModels.includes(m)),
    ...NEW_MODELS_PRIORITY,
    ...discoveredModels
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  const wordInstruction = wordCount === 'all' 
    ? "EXHAUSTIVE EXTRACTION MANDATE: Carefully scan every single paragraph across ALL uploaded pages/images. Do NOT stop at 5 or 6 words. Extract EVERY SINGLE challenging, medium, advanced, or tricky vocabulary word (aim for 12 to 25+ words depending on the length of the editorial)."
    : `Extract the top ${wordCount} most important and tricky vocabulary words.`;

  const promptText = `
You are an expert English Language Professor & Competitive Exam Coach (UPSC, Banking, SSC).
Analyze the provided editorial content thoroughly (whether provided as text or multiple split page screenshot images).

CRITICAL TASK REQUIREMENTS:
1. "articleTitle": Extract the exact main Editorial Headline (e.g. "India's Foreign Policy Must Look Seaward"). Never include words like "Screenshot".
2. "articleTopic": Identify the specific subject matter/category of the editorial (e.g. "Maritime Diplomacy & Geopolitics", "Macroeconomic Policy", "Climate Action"). Do NOT output generic "Editorial Vocabulary".
3. ${wordInstruction}
4. Extract ALL relevant Idioms, Phrases, and Metaphors present in or closely related to the text/images across all pages.

PRONUNCIATION INSTRUCTION:
DO NOT output obscure IPA symbols like /ˈhɔː.kɪʃ/. Output simple, easy-to-read phonetic respelling in English and Hindi script (e.g. "HAWK-ish (हॉक-इश)").

OUTPUT REQUIREMENTS (STRICT RAW JSON ONLY):
Return ONLY a valid JSON object with four keys: "articleTitle", "articleTopic", "words", and "idiomsAndPhrases". Do NOT include markdown code blocks.

SCHEMA:
{
  "articleTitle": "Main Editorial Headline Extracted From Content",
  "articleTopic": "Specific Subject / Category of the Editorial",
  "words": [
    {
      "word": "Hawkish",
      "pos": "adjective",
      "pronunciation": "HAWK-ish (हॉक-इश)",
      "meaningEn": "Advocating aggressive policy...",
      "meaningHi": "सख्त या आक्रामक नीति का समर्थन करने वाला",
      "context": "Sentence from editorial...",
      "synonyms": ["Aggressive", "Combative"],
      "antonyms": ["Dovish", "Moderate"],
      "memoryTrick": "Hawk (बाज) जैसे ऊपर से नजर रखकर हमला करता है, वैसे ही Hawkish stance में सख्त फैसले लिए जाते हैं।",
      "rootWord": "From Middle English 'hauk'."
    }
  ],
  "idiomsAndPhrases": [
    {
      "phrase": "Double-edged sword",
      "meaningEn": "Something that has both beneficial and harmful consequences.",
      "meaningHi": "दोधारी तलवार (जिसके अच्छे और बुरे दोनों परिणाम हों)",
      "sentence": "Example sentence using the phrase...",
      "memoryTrick": "तलवार की दोनों तरफ धार = दोनों तरफ नुकसान का खतरा!"
    }
  ]
}
`;

  let contents = [promptText];

  if (Array.isArray(textOrImages)) {
    textOrImages.forEach(imgBase64 => {
      if (typeof imgBase64 === 'string' && imgBase64.startsWith('data:image/')) {
        const parts = imgBase64.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1];
        const base64Data = parts[1];
        if (mimeType && base64Data) {
          contents.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
        }
      }
    });
  } else if (typeof textOrImages === 'string' && textOrImages.startsWith('data:image/')) {
    const parts = textOrImages.split(',');
    const mimeType = parts[0].match(/:(.*?);/)?.[1];
    const base64Data = parts[1];
    if (mimeType && base64Data) {
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }
  } else {
    contents.push(`EDITORIAL TEXT:\n"""\n${textOrImages}\n"""`);
  }

  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(contents);
      const response = await result.response;
      const parsedData = JSON.parse(extractJsonPayload(response.text()));

      return {
        articleTitle: parsedData.articleTitle || "Daily Editorial Vocabulary & Tricky Words",
        articleTopic: parsedData.articleTopic || "Geopolitics & Editorial Analysis",
        words: parsedData.words || [],
        idiomsAndPhrases: parsedData.idiomsAndPhrases || []
      };
    } catch (err) {
      console.warn(`Model ${modelName} attempt failed:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`Gemini API Error: ${lastError?.message || "Failed to process request."}`);
}
