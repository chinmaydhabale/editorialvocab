/**
 * Blogger Template Compiler Service
 * Generates self-contained, beautifully styled HTML for Blogger's HTML View.
 * Includes interactive Vocabulary Practice Quiz section at the end.
 */

export function generateBloggerHtml(postData, theme = 'slate') {
  const { title, date, sourceName, mainImageUrl, words = [], idiomsAndPhrases = [], quizQuestions = [] } = postData;
  const cleanTitle = title || "Daily Editorial Vocabulary & Tricky Words";
  const cleanDate = date || new Date().toISOString().split('T')[0];
  const cleanSource = sourceName || "The Hindu Editorial";

  // Theme Color Configurations
  const themes = {
    slate: {
      bgMain: '#0f172a',
      cardBg: '#1e293b',
      textMain: '#f8fafc',
      textMuted: '#94a3b8',
      accentIndigo: '#6366f1',
      accentEmerald: '#10b981',
      accentAmber: '#f59e0b',
      accentRose: '#f43f5e',
      border: '#334155',
      badgeBg: '#312e81',
      badgeText: '#a5f3fc'
    },
    warm: {
      bgMain: '#fefce8',
      cardBg: '#ffffff',
      textMain: '#1c1917',
      textMuted: '#78716c',
      accentIndigo: '#4338ca',
      accentEmerald: '#047857',
      accentAmber: '#d97706',
      accentRose: '#e11d48',
      border: '#e7e5e4',
      badgeBg: '#e0e7ff',
      badgeText: '#3730a3'
    },
    cyber: {
      bgMain: '#080e1a',
      cardBg: '#0f172a',
      textMain: '#f1f5f9',
      textMuted: '#64748b',
      accentIndigo: '#06b6d4',
      accentEmerald: '#10b981',
      accentAmber: '#fbbf24',
      accentRose: '#f43f5e',
      border: '#1e293b',
      badgeBg: '#164e63',
      badgeText: '#67e8f9'
    }
  };

  const t = themes[theme] || themes.slate;

  return `
<!-- EditorialVocab Blogger Container -->
<div style="font-family: 'Plus Jakarta Sans', 'Hind', sans-serif; background-color: ${t.bgMain}; color: ${t.textMain}; padding: 20px 12px; border-radius: 16px; max-width: 900px; margin: 0 auto; line-height: 1.6;">

  <!-- Featured AI Cover Banner -->
  ${mainImageUrl ? `
  <div style="margin-bottom: 24px; text-align: center; border-radius: 16px; overflow: hidden; border: 1px solid ${t.border}; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
    <img src="${mainImageUrl}" alt="${cleanTitle}" style="width: 100%; height: auto; display: block;" />
  </div>
  ` : ''}

  <!-- Header Section -->
  <div style="background-color: ${t.cardBg}; border: 1px solid ${t.border}; padding: 24px; border-radius: 16px; margin-bottom: 24px; text-align: center;">
    <div style="display: inline-block; background-color: ${t.badgeBg}; color: ${t.badgeText}; font-size: 13px; font-weight: 800; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
      📰 ${cleanSource} • ${cleanDate}
    </div>
    <h1 style="font-size: 26px; font-weight: 800; color: ${t.textMain}; margin: 0 0 10px 0; line-height: 1.35;">
      ${cleanTitle}
    </h1>
    <p style="font-size: 14px; color: ${t.textMuted}; margin: 0; font-family: 'Hind', sans-serif;">
      📌 Competitive Exam Prep (UPSC, Banking, SSC, CLAT): आज के एडिटोरियल से चुने गए मुख्य Tricky Words, उनके Hindi Meaning, Synonyms, Antonyms, याद रखने की धांसू Tricks और Idioms &amp; Phrases (मुहावरे) का संग्रह।
    </p>
  </div>

  <!-- Words List Section -->
  <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px;">
    ${words.map((item, index) => `
    <div style="background-color: ${t.cardBg}; border: 1px solid ${t.border}; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
      
      <!-- Word Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${t.border}; padding-bottom: 12px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="background-color: ${t.accentIndigo}; color: #ffffff; font-size: 13px; font-weight: 800; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
            ${index + 1}
          </span>
          <h2 style="font-size: 22px; font-weight: 800; color: ${t.textMain}; margin: 0;">
            ${item.word}
          </h2>
          ${item.pos ? `<span style="font-size: 12px; font-style: italic; color: ${t.textMuted}; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 6px;">(${item.pos})</span>` : ''}
        </div>

        ${item.pronunciation ? `
        <div style="font-size: 13px; font-weight: 600; color: ${t.badgeText}; background-color: ${t.badgeBg}; padding: 4px 12px; border-radius: 10px; font-family: 'Hind', sans-serif;">
          🗣️ ${item.pronunciation}
        </div>
        ` : ''}
      </div>

      <!-- English & Hindi Meaning Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-bottom: 14px;">
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; border-left: 3px solid ${t.accentIndigo};">
          <div style="font-size: 11px; font-weight: 800; color: ${t.textMuted}; text-transform: uppercase; margin-bottom: 4px;">English Definition</div>
          <div style="font-size: 14px; color: ${t.textMain};">${item.meaningEn || item.meaning}</div>
        </div>

        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; border-left: 3px solid ${t.accentEmerald}; font-family: 'Hind', sans-serif;">
          <div style="font-size: 11px; font-weight: 800; color: ${t.accentEmerald}; text-transform: uppercase; margin-bottom: 4px;">हिंदी अर्थ</div>
          <div style="font-size: 16px; font-weight: 700; color: ${t.textMain};">${item.meaningHi || item.hindiMeaning || '—'}</div>
        </div>
      </div>

      <!-- Context Sentence -->
      ${item.context ? `
      <div style="background: rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 10px; font-size: 13.5px; color: ${t.textMuted}; margin-bottom: 12px; font-style: italic; border: 1px dashed ${t.border};">
        📝 <strong>Editorial Context:</strong> "${item.context}"
      </div>
      ` : ''}

      <!-- Synonyms & Antonyms Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin-bottom: 12px;">
        <div style="font-size: 13px;">
          <strong style="color: ${t.accentEmerald};">✓ Synonyms:</strong> ${(item.synonyms || []).join(', ') || 'N/A'}
        </div>
        <div style="font-size: 13px;">
          <strong style="color: ${t.accentRose};">✗ Antonyms:</strong> ${(item.antonyms || []).join(', ') || 'N/A'}
        </div>
      </div>

      <!-- Memory Trick (Mnemonic) -->
      ${item.memoryTrick ? `
      <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 12px; border-radius: 10px; font-family: 'Hind', sans-serif; margin-bottom: 8px;">
        <div style="font-size: 13px; font-weight: 800; color: ${t.accentAmber}; margin-bottom: 2px;">
          💡 याद रखने की Mnemonic Trick:
        </div>
        <div style="font-size: 14.5px; color: ${t.textMain}; font-weight: 600;">
          ${item.memoryTrick}
        </div>
      </div>
      ` : ''}

      <!-- Root Word Breakdown -->
      ${item.rootWord ? `
      <div style="font-size: 12.5px; color: ${t.textMuted}; background: rgba(0,0,0,0.15); padding: 8px 12px; border-radius: 8px;">
        🌱 <strong>Root Word Breakdown:</strong> ${item.rootWord}
      </div>
      ` : ''}

    </div>
    `).join('')}
  </div>

  <!-- Dedicated Idioms & Phrases Section -->
  ${idiomsAndPhrases.length > 0 ? `
  <div style="background-color: ${t.cardBg}; border: 1px solid ${t.border}; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <div style="display: flex; align-items: center; gap: 10px; border-bottom: 2px solid ${t.accentAmber}; padding-bottom: 10px; margin-bottom: 16px;">
      <span style="font-size: 24px;">🔥</span>
      <h2 style="font-size: 20px; font-weight: 800; color: ${t.textMain}; margin: 0; text-transform: uppercase;">
        Editorial Idioms &amp; Phrases (आज के मुहावरे)
      </h2>
    </div>

    <div style="display: flex; flex-direction: column; gap: 14px;">
      ${idiomsAndPhrases.map((ph, idx) => `
      <div style="background: rgba(0,0,0,0.25); border: 1px solid ${t.border}; padding: 14px; border-radius: 12px;">
        <div style="font-size: 16px; font-weight: 800; color: ${t.accentAmber}; margin-bottom: 6px;">
          ${idx + 1}. ${ph.phrase}
        </div>
        
        <div style="font-size: 13.5px; color: ${t.textMain}; margin-bottom: 4px;">
          <strong>Meaning (English):</strong> ${ph.meaningEn}
        </div>
        
        ${ph.meaningHi ? `
        <div style="font-size: 14.5px; font-weight: 700; color: ${t.accentEmerald}; font-family: 'Hind', sans-serif; margin-bottom: 6px;">
          <strong>अर्थ (हिंदी):</strong> ${ph.meaningHi}
        </div>
        ` : ''}

        ${ph.sentence ? `
        <div style="font-size: 13px; color: ${t.textMuted}; font-style: italic; background: rgba(255,255,255,0.03); padding: 6px 10px; border-radius: 6px;">
          💬 <strong>Example:</strong> "${ph.sentence}"
        </div>
        ` : ''}
      </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Interactive Practice Quiz Section -->
  ${quizQuestions.length > 0 ? `
  <div style="background-color: ${t.cardBg}; border: 1px solid ${t.border}; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <div style="display: flex; align-items: center; gap: 10px; border-bottom: 2px solid ${t.accentIndigo}; padding-bottom: 10px; margin-bottom: 20px;">
      <span style="font-size: 24px;">🧠</span>
      <div>
        <h2 style="font-size: 20px; font-weight: 800; color: ${t.textMain}; margin: 0; text-transform: uppercase;">
          Vocabulary &amp; Idioms Practice Quiz Test
        </h2>
        <span style="font-size: 12px; color: ${t.textMuted}; font-family: 'Hind', sans-serif;">
          आज के एडिटोरियल से खुद को टेस्ट करें (Test your learning below!)
        </span>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 20px;">
      ${quizQuestions.map((q, idx) => `
      <div style="background: rgba(0,0,0,0.25); border: 1px solid ${t.border}; padding: 18px; border-radius: 14px;">
        <div style="font-size: 16px; font-weight: 800; color: ${t.textMain}; margin-bottom: 12px; line-height: 1.4;">
          Q${idx + 1}. ${q.question}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 14px;">
          ${(q.options || []).map(opt => `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid ${t.border}; padding: 10px 14px; border-radius: 8px; font-size: 14px; color: ${t.textMain}; font-weight: 600;">
            ${opt}
          </div>
          `).join('')}
        </div>

        <details style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 10px 14px; cursor: pointer;">
          <summary style="font-size: 13.5px; font-weight: 800; color: ${t.accentEmerald}; outline: none; user-select: none;">
            💡 Show Correct Answer &amp; Explanation
          </summary>
          <div style="margin-top: 10px; font-size: 14px; color: ${t.textMain}; font-family: 'Hind', sans-serif; border-top: 1px dashed rgba(16, 185, 129, 0.3); padding-top: 8px;">
            <strong style="color: ${t.accentEmerald}; font-size: 15px;">Correct Answer: Option ${q.correctOption}</strong>
            <p style="margin: 4px 0 0 0; color: ${t.textMuted}; font-size: 13.5px; line-height: 1.5;">
              ${q.explanation}
            </p>
          </div>
        </details>
      </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

</div>
  `.trim();
}
