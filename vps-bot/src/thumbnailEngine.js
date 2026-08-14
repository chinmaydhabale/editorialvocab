/**
 * Generates dynamic SVG data-URL cover thumbnail for blog post.
 */
function escapeSvgText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
function truncateTitle(str, max = 52) {
  const text = String(str || '').trim();
  if (text.length <= max) return text;
  const sliced = text.slice(0, max);
  const lastSpace = sliced.lastIndexOf(' ');
  return (lastSpace > 25 ? sliced.slice(0, lastSpace) : sliced) + '...';
}

export function generateAiThumbnail({ title, sourceName, date, topic = "Daily Editorial Vocabulary" }) {
  const cleanTitle = escapeSvgText(truncateTitle(title || "Daily Editorial Vocabulary", 52));
  const cleanSource = escapeSvgText((sourceName || "The Hindu & Indian Express").toUpperCase());
  const cleanDate = escapeSvgText(date || new Date().toISOString().split('T')[0]);
  const cleanTopic = escapeSvgText((topic || "Daily Editorial Vocabulary").slice(0, 64).toUpperCase());

  const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#311042"/>
    </linearGradient>

    <!-- Accent Glowing Orbs -->
    <linearGradient id="orb1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#a855f7" stop-opacity="0.2"/>
    </linearGradient>

    <linearGradient id="orb2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.1"/>
    </linearGradient>

    <!-- Badge Gradient -->
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>

    <!-- Glassmorphic Card Overlay -->
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02"/>
    </linearGradient>

    <!-- Drop Shadows -->
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="15" stdDeviation="20" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background Layer -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- Decorative Glowing Circles -->
  <circle cx="150" cy="120" r="300" fill="url(#orb1)" filter="blur(50px)"/>
  <circle cx="1050" cy="500" r="280" fill="url(#orb2)" filter="blur(60px)"/>

  <!-- Grid Pattern Overlay -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
    <path d="M0,100 H1200 M0,200 H1200 M0,300 H1200 M0,400 H1200 M0,500 H1200"/>
    <path d="M200,0 V630 M400,0 V630 M600,0 V630 M800,0 V630 M1000,0 V630"/>
  </g>

  <!-- Main Glassmorphic Container Box -->
  <rect x="80" y="70" width="1040" height="490" rx="28" fill="url(#glassGrad)" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1.5" filter="url(#shadow)"/>

  <!-- Top Source Tag Badge -->
  <rect x="130" y="120" width="420" height="42" rx="21" fill="url(#badgeGrad)"/>
  <text x="150" y="147" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff" letter-spacing="1.5">
    📰 ${cleanSource}
  </text>

  <!-- Date Tag Right Aligned -->
  <text x="990" y="147" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="700" fill="#a5f3fc" text-anchor="end">
    🗓️ ${cleanDate}
  </text>

  <!-- Main Title Text -->
  <text x="130" y="240" font-family="'Hind', 'Plus Jakarta Sans', sans-serif" font-size="44" font-weight="800" fill="#ffffff" width="940">
    ${cleanTitle}
  </text>

  <!-- Subtitle Feature Tagline -->
  <text x="130" y="300" font-family="'Hind', sans-serif" font-size="24" font-weight="600" fill="#cbd5e1">
    Daily Tricky Words • Meaning in English &amp; 🇮🇳 हिंदी • Memory Tricks (Mnemonics)
  </text>

  <!-- Bottom Key Badges Grid -->
  <g transform="translate(130, 370)">
    <rect x="0" y="0" width="220" height="54" rx="14" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="20" y="33" font-family="'Hind', sans-serif" font-size="16" font-weight="700" fill="#34d399">✓ Synonyms List</text>

    <rect x="240" y="0" width="220" height="54" rx="14" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="260" y="33" font-family="'Hind', sans-serif" font-size="16" font-weight="700" fill="#f87171">✗ Antonyms List</text>

    <rect x="480" y="0" width="230" height="54" rx="14" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="500" y="33" font-family="'Hind', sans-serif" font-size="16" font-weight="700" fill="#fcd34d">💡 Memory Tricks</text>

    <rect x="730" y="0" width="200" height="54" rx="14" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="750" y="33" font-family="'Hind', sans-serif" font-size="16" font-weight="700" fill="#c084fc">🌱 Root Words</text>
  </g>

  <!-- Clean Footer Line -->
  <line x1="130" y1="480" x2="1030" y2="480" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
  <text x="130" y="515" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#818cf8">
    ${cleanTopic} • COMPETITIVE EXAM PREP
  </text>
</svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}
