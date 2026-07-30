/**
 * Compiles Editorial Vocabulary data into self-contained, Blogger-ready HTML code.
 * Clean, un-watermarked layout for Blogger publishing.
 */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function safeUrl(value, fallback) {
  const rawValue = String(value || '').trim();

  if (!rawValue) return fallback;
  if (/^(https?:|data:image\/)/i.test(rawValue)) return escapeAttribute(rawValue);

  return fallback;
}

export function generateBloggerHtml(postData, theme = 'slate') {
  const { title, date, sourceName, bannerTopic, words = [], idiomsAndPhrases = [], mainImageUrl } = postData;

  const fallbackHeroImage = "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80";
  const heroImage = safeUrl(mainImageUrl, fallbackHeroImage);
  const safeTitle = escapeHtml(title || 'Daily Editorial Vocabulary');
  const safeDate = escapeHtml(date || new Date().toISOString().split('T')[0]);
  const safeSourceName = escapeHtml(sourceName || 'Editorial Vocabulary');
  const safeBannerTopic = escapeHtml(bannerTopic || 'Daily Editorial Vocabulary & Idioms Analysis');

  const themeStyles = {
    slate: {
      bg: '#0f172a',
      cardBg: '#1e293b',
      border: '#334155',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      accent: '#6366f1',
      synBg: 'rgba(16, 185, 129, 0.15)',
      synText: '#34d399',
      antBg: 'rgba(239, 68, 68, 0.15)',
      antText: '#f87171',
      trickBg: '#1e1b4b',
      trickBorder: '#6366f1',
      trickText: '#c7d2fe',
      rootBg: '#2e1065',
      rootBorder: '#a855f7',
      idiomBg: '#092e20',
      idiomBorder: '#10b981',
      idiomText: '#a7f3d0'
    },
    warm: {
      bg: '#fffbf5',
      cardBg: '#ffffff',
      border: '#fed7aa',
      textPrimary: '#292524',
      textSecondary: '#78716c',
      accent: '#ea580c',
      synBg: '#dcfce7',
      synText: '#15803d',
      antBg: '#fee2e2',
      antText: '#b91c1c',
      trickBg: '#fff7ed',
      trickBorder: '#ea580c',
      trickText: '#9a3412',
      rootBg: '#f3e8ff',
      rootBorder: '#9333ea',
      idiomBg: '#ecfdf5',
      idiomBorder: '#059669',
      idiomText: '#065f46'
    },
    cyber: {
      bg: '#090d16',
      cardBg: '#131b2e',
      border: '#1e293b',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      accent: '#06b6d4',
      synBg: 'rgba(52, 211, 153, 0.2)',
      synText: '#6ee7b7',
      antBg: 'rgba(248, 113, 113, 0.2)',
      antText: '#fca5a5',
      trickBg: 'rgba(6, 182, 212, 0.15)',
      trickBorder: '#06b6d4',
      trickText: '#a5f3fc',
      rootBg: 'rgba(168, 85, 247, 0.15)',
      rootBorder: '#c084fc',
      idiomBg: 'rgba(16, 185, 129, 0.15)',
      idiomBorder: '#34d399',
      idiomText: '#6ee7b7'
    }
  };

  const st = themeStyles[theme] || themeStyles.slate;

  // Words Cards HTML
  const wordsHtml = words.map((w, index) => {
    const synonymsList = (w.synonyms || []).map(s => 
      `<span style="display:inline-block; background-color:${st.synBg}; color:${st.synText}; font-size:13px; font-weight:600; padding:4px 10px; border-radius:12px; margin:2px 4px 2px 0;">✓ ${escapeHtml(s)}</span>`
    ).join('');

    const antonymsList = (w.antonyms || []).map(a => 
      `<span style="display:inline-block; background-color:${st.antBg}; color:${st.antText}; font-size:13px; font-weight:600; padding:4px 10px; border-radius:12px; margin:2px 4px 2px 0;">✗ ${escapeHtml(a)}</span>`
    ).join('');

    const cleanPronun = w.pronunciation ? escapeHtml(w.pronunciation.replace(/^\/|\/$/g, '')) : '';
    const safeWord = escapeHtml(w.word || 'Word');
    const safePos = escapeHtml(w.pos || 'word');
    const safeMeaningEn = escapeHtml(w.meaningEn || 'N/A');
    const safeMeaningHi = escapeHtml(w.meaningHi || 'N/A');
    const safeContext = escapeHtml(w.context || '');
    const safeMemoryTrick = escapeHtml(w.memoryTrick || '');
    const safeRootWord = escapeHtml(w.rootWord || '');

    return `
    <!-- VOCAB CARD ${index + 1} -->
    <div style="background-color: ${st.cardBg}; border: 1px solid ${st.border}; border-radius: 16px; padding: 24px; margin-bottom: 24px; font-family: 'Hind', 'Plus Jakarta Sans', sans-serif; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);">
      
      <!-- Word Header -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid ${st.border}; padding-bottom: 14px; margin-bottom: 16px;">
        <div>
          <span style="font-size: 26px; font-weight: 800; color: ${st.textPrimary}; letter-spacing: 0;">${index + 1}. ${safeWord}</span>
          ${cleanPronun ? `<span style="font-size: 14px; color: ${st.textSecondary}; margin-left: 10px; font-weight: 600; background-color: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 6px;">🗣️ ${cleanPronun}</span>` : ''}
        </div>
        <span style="background-color: ${st.accent}; color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.5px;">
          ${safePos}
        </span>
      </div>

      <!-- Meaning Section -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 15px; line-height: 1.6; color: ${st.textPrimary}; margin-bottom: 8px;">
          <strong>English Meaning:</strong> ${safeMeaningEn}
        </div>
        <div style="font-size: 16px; font-weight: 600; line-height: 1.6; color: ${st.accent}; background-color: rgba(99, 102, 241, 0.1); padding: 10px 14px; border-radius: 8px; border-left: 4px solid ${st.accent};">
          🇮🇳 <strong>हिंदी अर्थ:</strong> ${safeMeaningHi}
        </div>
      </div>

      <!-- Context Sentence -->
      ${safeContext ? `
      <div style="background-color: rgba(255,255,255,0.03); border-left: 3px solid ${st.textSecondary}; padding: 10px 14px; margin-bottom: 16px; border-radius: 0 8px 8px 0; font-style: italic; color: ${st.textSecondary}; font-size: 14px;">
        "${safeContext}"
      </div>` : ''}

      <!-- Synonyms & Antonyms Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 18px;">
        <div style="background: rgba(0,0,0,0.15); padding: 12px; border-radius: 10px;">
          <div style="font-size: 12px; font-weight: 700; color: ${st.synText}; text-transform: uppercase; margin-bottom: 6px;">Synonyms (समानार्थी)</div>
          <div>${synonymsList || 'N/A'}</div>
        </div>
        <div style="background: rgba(0,0,0,0.15); padding: 12px; border-radius: 10px;">
          <div style="font-size: 12px; font-weight: 700; color: ${st.antText}; text-transform: uppercase; margin-bottom: 6px;">Antonyms (विलोम शब्द)</div>
          <div>${antonymsList || 'N/A'}</div>
        </div>
      </div>

      <!-- Memory Trick (याद करने की Trick) -->
      ${safeMemoryTrick ? `
      <div style="background-color: ${st.trickBg}; border: 1px dashed ${st.trickBorder}; padding: 14px 16px; border-radius: 12px; margin-bottom: 14px;">
        <div style="font-size: 14px; font-weight: 700; color: ${st.accent}; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          💡 <span>याद करने की Trick (Mnemonic):</span>
        </div>
        <div style="font-size: 14.5px; color: ${st.trickText}; line-height: 1.5; font-weight: 500;">
          ${safeMemoryTrick}
        </div>
      </div>` : ''}

      <!-- Root Word Breakdown -->
      ${safeRootWord && safeRootWord !== 'N/A' ? `
      <div style="background-color: ${st.rootBg}; border-left: 4px solid ${st.rootBorder}; padding: 10px 14px; border-radius: 6px; font-size: 13.5px; color: ${st.textPrimary};">
        🌱 <strong>Root Word & Etymology:</strong> ${safeRootWord}
      </div>` : ''}

    </div>
    `;
  }).join('\n');

  // DEDICATED IDIOMS & PHRASES SECTION HTML
  const idiomsHtml = idiomsAndPhrases.length > 0 ? `
  <!-- DEDICATED IDIOMS & PHRASES SECTION -->
  <div style="margin-top: 40px; margin-bottom: 32px;">
    
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; padding: 18px 24px; border-radius: 14px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
      <h2 style="font-size: 22px; font-weight: 800; margin: 0;">
        🔗 Editorial Idioms & Phrases (मुहावरे एवं लोकोक्तियां)
      </h2>
      <span style="background-color: rgba(255,255,255,0.25); font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px;">
        ${idiomsAndPhrases.length} Featured
      </span>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${idiomsAndPhrases.map((item, idx) => `
        <div style="background-color: ${st.cardBg}; border: 1px solid ${st.idiomBorder}; border-radius: 14px; padding: 20px; font-family: 'Hind', sans-serif; box-shadow: 0 8px 20px -5px rgba(16, 185, 129, 0.15);">
          
          <div style="font-size: 20px; font-weight: 800; color: ${st.idiomText}; margin-bottom: 8px;">
            ${idx + 1}. "${escapeHtml(item.phrase || 'Phrase')}"
          </div>

          <div style="font-size: 14.5px; color: ${st.textPrimary}; margin-bottom: 6px;">
            <strong>English Meaning:</strong> ${escapeHtml(item.meaningEn || 'N/A')}
          </div>

          <div style="font-size: 15.5px; font-weight: 600; color: ${st.idiomText}; background-color: ${st.idiomBg}; padding: 8px 12px; border-radius: 8px; margin-bottom: 10px;">
            🇮🇳 <strong>हिंदी अर्थ:</strong> ${escapeHtml(item.meaningHi || 'N/A')}
          </div>

          ${item.sentence ? `
          <div style="font-size: 13.5px; font-style: italic; color: ${st.textSecondary}; border-left: 3px solid ${st.idiomBorder}; padding-left: 10px; margin-bottom: 8px;">
            "${escapeHtml(item.sentence)}"
          </div>` : ''}

          ${item.memoryTrick ? `
          <div style="font-size: 13px; color: #fcd34d; background: rgba(245, 158, 11, 0.12); padding: 6px 12px; border-radius: 6px; font-weight: 500;">
            💡 <strong>Trick:</strong> ${escapeHtml(item.memoryTrick)}
          </div>` : ''}

        </div>
      `).join('\n')}
    </div>

  </div>
  ` : '';

  return `
<!-- DAILY EDITORIAL VOCABULARY BLOG POST FOR BLOGGER -->
<div style="background-color: ${st.bg}; color: ${st.textPrimary}; font-family: 'Hind', 'Plus Jakarta Sans', system-ui, sans-serif; padding: 24px 16px; max-width: 800px; margin: 0 auto; line-height: 1.6;">

  <!-- SINGLE MAIN FEATURED THUMBNAIL IMAGE -->
  <div style="margin-bottom: 24px; text-align: center; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px -5px rgba(0,0,0,0.4);">
    <img src="${heroImage}" alt="${escapeAttribute(title || 'Editorial Vocabulary')} Main Featured Thumbnail" style="width: 100%; max-height: 400px; object-fit: cover; display: block;" />
  </div>

  <!-- TOP HERO TITLE BANNER -->
  <div style="background: linear-gradient(135deg, ${st.accent} 0%, #4f46e5 100%); color: #ffffff; padding: 28px 24px; border-radius: 20px; text-align: center; margin-bottom: 28px; box-shadow: 0 15px 30px -10px ${st.accent}80;">
    <span style="background-color: rgba(255,255,255,0.2); font-size: 12px; font-weight: 800; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 12px;">
      📰 ${safeSourceName} • ${safeDate}
    </span>
    <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 10px 0; line-height: 1.3; letter-spacing: 0;">
      ${safeTitle}
    </h1>
    <p style="font-size: 15px; margin: 0; opacity: 0.9; font-weight: 500;">
      Topic: ${safeBannerTopic}
    </p>
  </div>

  <!-- INTRODUCTION CALLOUT -->
  <div style="background-color: ${st.cardBg}; border-left: 5px solid ${st.accent}; padding: 16px 20px; border-radius: 10px; margin-bottom: 28px; font-size: 15px; color: ${st.textSecondary};">
    📌 <strong>Competitive Exam Prep (UPSC, Banking, SSC, CLAT):</strong> 
    आज के एडिटोरियल से चुने गए मुख्य Tricky Words, उनके Hindi Meaning, Synonyms, Antonyms, <strong>याद रखने की धांसू Tricks</strong> और <strong>Idioms & Phrases (मुहावरे)</strong> का संग्रह।
  </div>

  <!-- VOCABULARY CARDS LIST -->
  ${wordsHtml}

  <!-- DEDICATED IDIOMS & PHRASES SECTION -->
  ${idiomsHtml}

  <!-- FOOTER REVISION SUMMARY -->
  <div style="background: linear-gradient(180deg, ${st.cardBg} 0%, ${st.bg} 100%); border: 1px solid ${st.border}; padding: 24px; border-radius: 16px; text-align: center; margin-top: 36px;">
    <h3 style="margin: 0 0 10px 0; font-size: 18px; color: ${st.accent};">🎉 Quick Revision Complete!</h3>
    <p style="font-size: 14px; color: ${st.textSecondary}; margin: 0;">
      Share this daily post with fellow aspirants & bookmark our blog for daily vocabulary updates!
    </p>
  </div>

</div>
`;
}
