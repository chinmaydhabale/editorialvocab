import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Parses single or multiple comma-separated Gemini API Keys from environment.
 * e.g. "KEY1,KEY2,KEY3" -> ["KEY1", "KEY2", "KEY3"]
 */
export function parseApiKeys(apiKeyInput) {
  if (!apiKeyInput) return [];
  if (Array.isArray(apiKeyInput)) return apiKeyInput.map(k => String(k).trim()).filter(Boolean);
  return String(apiKeyInput)
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);
}

/**
 * Strict Model Priority:
 * 1. gemini-3.6-flash (Default Primary)
 * 2. gemini-3.5-flash (Secondary Fallback)
 * Strictly does NOT go below gemini-3.5-flash!
 */
function getAllowedModels(preferredModel = 'gemini-3.6-flash') {
  const allowedList = ['gemini-3.6-flash', 'gemini-3.5-flash'];
  const pref = (preferredModel || '').trim();
  if (pref && allowedList.includes(pref)) {
    return [pref, ...allowedList.filter(m => m !== pref)];
  }
  return allowedList;
}

/**
 * Dynamically fetches available Gemini models for the provided API Key.
 */
export async function getAvailableGeminiModels(apiKey) {
  if (!apiKey || !apiKey.trim()) return [];

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
    const data = await res.json();
    if (data.models && Array.isArray(data.models)) {
      return data.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.replace(/^models\//, ''));
    }
  } catch (err) {
    console.warn("Could not fetch Gemini models list:", err.message);
  }
  return [];
}

function extractJsonPayload(rawText) {
  const trimmed = String(rawText || '').trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  if (withoutFence.startsWith('{') && withoutFence.endsWith('}')) return withoutFence;
  if (withoutFence.startsWith('[') && withoutFence.endsWith(']')) return withoutFence;

  const firstBrace = withoutFence.indexOf('{');
  const lastBrace = withoutFence.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) return withoutFence.slice(firstBrace, lastBrace + 1);

  const firstBracket = withoutFence.indexOf('[');
  const lastBracket = withoutFence.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) return withoutFence.slice(firstBracket, lastBracket + 1);

  return withoutFence;
}

/**
 * Analyzes editorial text using Gemini API with Strict Model Fallback:
 * Default: gemini-3.6-flash -> Fallback: gemini-3.5-flash (No lower models used).
 * Multi-Key Auto-Fallback supported if keys list has multiple keys.
 */
export async function analyzeEditorialWithGemini(apiKeyInput, editorialText, wordCount = 'all', preferredModel = 'gemini-3.6-flash') {
  const keysList = parseApiKeys(apiKeyInput);

  if (keysList.length === 0) {
    throw new Error("Gemini API Key missing in environment or config.");
  }

  const allowedModels = getAllowedModels(preferredModel);

  const wordInstruction = wordCount === 'all'
    ? "EXHAUSTIVE EXTRACTION MANDATE: Carefully scan every single paragraph across the entire text. Extract EVERY SINGLE challenging, medium, advanced, or tricky vocabulary word (aim for 12 to 25+ words depending on article length)."
    : `Extract the top ${wordCount} most important and tricky vocabulary words.`;

  const promptText = `
You are an expert English Language Professor & Competitive Exam Coach (UPSC, Banking, SSC).
Analyze the provided editorial content thoroughly.

CRITICAL TASK REQUIREMENTS:
1. "articleTitle": Extract the exact main Editorial Headline.
2. "articleTopic": Identify the specific subject matter/category of the editorial (e.g. "Maritime Diplomacy & Geopolitics", "Macroeconomic Policy", "Climate Action"). Do NOT output generic "Editorial Vocabulary".
3. ${wordInstruction}
4. Extract ALL relevant Idioms, Phrases, and Metaphors present in or closely related to the text.

PRONUNCIATION INSTRUCTION:
DO NOT output obscure IPA symbols. Output simple, easy-to-read phonetic respelling in English and Hindi script (e.g. "HAWK-ish (हॉक-इश)").

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

EDITORIAL TEXT:
"""
${editorialText}
"""
`;

  let lastError = null;

  // Multi-API-Key & Strict Model Fallback Loop
  for (let keyIdx = 0; keyIdx < keysList.length; keyIdx++) {
    const cleanKey = keysList[keyIdx];
    const genAI = new GoogleGenerativeAI(cleanKey);

    for (const modelName of allowedModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([promptText]);
        const response = await result.response;
        const parsedData = JSON.parse(extractJsonPayload(response.text()));

        if (modelName !== allowedModels[0]) {
          console.log(`🔄 Primary model quota reached. Switched to fallback model: ${modelName}`);
        }
        if (keysList.length > 1) {
          console.log(`🔑 Used Gemini API Key #${keyIdx + 1}`);
        }

        return {
          articleTitle: parsedData.articleTitle || "Daily Editorial Vocabulary & Tricky Words",
          articleTopic: parsedData.articleTopic || "Geopolitics & Editorial Analysis",
          words: parsedData.words || [],
          idiomsAndPhrases: parsedData.idiomsAndPhrases || []
        };
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ API Key #${keyIdx + 1} (${modelName}) failed: ${err.message}`);
      }
    }

    if (keyIdx < keysList.length - 1) {
      console.warn(`🔄 API Key #${keyIdx + 1} exhausted/failed. Switching to API Key #${keyIdx + 2}...`);
    }
  }

  throw new Error(`Gemini Analysis Failed (strict models ${allowedModels.join(', ')} across ${keysList.length} API keys tried): ${lastError?.message || "Failed."}`);
}

/**
 * Generates 5-8 MCQs based on extracted vocabulary and idioms with Strict Model Fallback.
 * Default: gemini-3.6-flash -> Fallback: gemini-3.5-flash.
 */
export async function generateQuizWithGemini(apiKeyInput, vocabData, preferredModel = 'gemini-3.6-flash') {
  const keysList = parseApiKeys(apiKeyInput);
  if (keysList.length === 0) return [];

  const allowedModels = getAllowedModels(preferredModel);

  const wordsList = (vocabData.words || []).map(w => `${w.word} (${w.meaningEn} - ${w.meaningHi})`).join(', ');
  const idiomsList = (vocabData.idiomsAndPhrases || []).map(i => `${i.phrase} (${i.meaningEn})`).join(', ');

  const quizPrompt = `
You are a senior Examiner and Quiz Maker for UPSC, Banking, and SSC English examinations.
Based on the following vocabulary words and idioms extracted from today's editorial:

WORDS: ${wordsList}
IDIOMS: ${idiomsList}
EDITORIAL TITLE: "${vocabData.articleTitle || 'Today Editorial'}"

TASK:
Create 5 to 8 high-yield Multiple Choice Questions (MCQs) for students to test their vocabulary and idioms knowledge.
Create a mix of question types:
- Synonym / Antonym identification
- Meaning / Contextual usage
- Idioms meaning

REQUIREMENTS:
1. Each question must have exactly 4 options ("A) ...", "B) ...", "C) ...", "D) ...").
2. "correctOption" must be one of "A", "B", "C", or "D".
3. Provide a clear, helpful "explanation" in English & Hindi for why that option is correct.

OUTPUT FORMAT (STRICT JSON ARRAY ONLY):
[
  {
    "id": 1,
    "question": "Which of the following is the closest synonym for 'Hawkish' as used in the article?",
    "options": ["A) Combative / Aggressive", "B) Peaceful", "C) Submissive", "D) Moderate"],
    "correctOption": "A",
    "explanation": "'Hawkish' implies advocating aggressive policy (सख्त या आक्रामक रुख)."
  }
]
`;

  for (let keyIdx = 0; keyIdx < keysList.length; keyIdx++) {
    const cleanKey = keysList[keyIdx];
    const genAI = new GoogleGenerativeAI(cleanKey);

    for (const modelName of allowedModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([quizPrompt]);
        const response = await result.response;
        const parsedArray = JSON.parse(extractJsonPayload(response.text()));
        if (Array.isArray(parsedArray)) {
          return parsedArray;
        }
      } catch (err) {
        console.warn(`Quiz generation key #${keyIdx + 1} (${modelName}) failed:`, err.message);
      }
    }
  }

  return [];
}
