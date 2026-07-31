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
  <div id="evQuizContainer" style="background-color: ${t.cardBg}; border: 2px solid ${t.accentIndigo}; border-radius: 16px; padding: 24px; margin-bottom: 24px; position: relative; overflow: hidden;">
    <!-- Quiz Header -->
    <div style="display: flex; align-items: center; gap: 10px; border-bottom: 2px solid ${t.accentIndigo}; padding-bottom: 14px; margin-bottom: 20px;">
      <span style="font-size: 28px;">🧠</span>
      <div>
        <h2 style="font-size: 22px; font-weight: 800; color: ${t.textMain}; margin: 0; text-transform: uppercase;">
          Vocabulary &amp; Idioms Practice Quiz Test
        </h2>
        <span style="font-size: 13px; color: ${t.textMuted}; font-family: 'Hind', sans-serif;">
          आज के एडिटोरियल से खुद को टेस्ट करें! नीचे हर सवाल का जवाब चुनें और Submit करें।
        </span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div id="evQuizProgress" style="background: rgba(0,0,0,0.3); border-radius: 10px; height: 8px; margin-bottom: 22px; overflow: hidden;">
      <div id="evQuizProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, ${t.accentIndigo}, ${t.accentEmerald}); border-radius: 10px; transition: width 0.4s ease;"></div>
    </div>

    <!-- Questions Container -->
    <div id="evQuizQuestions" style="display: flex; flex-direction: column; gap: 20px;">
      ${quizQuestions.map((q, idx) => `
      <div class="evQuizQ" id="evQ${idx}" style="background: rgba(0,0,0,0.2); border: 1px solid ${t.border}; padding: 20px; border-radius: 14px; transition: all 0.3s ease;">
        <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px;">
          <span style="background: ${t.accentIndigo}; color: #fff; font-size: 13px; font-weight: 900; min-width: 32px; height: 32px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">Q${idx + 1}</span>
          <div style="font-size: 16px; font-weight: 700; color: ${t.textMain}; line-height: 1.5;">${q.question}</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;" id="evOpts${idx}">
          ${(q.options || []).map((opt, oi) => {
            const letter = ['A','B','C','D'][oi];
            return `
          <label id="evOpt${idx}_${letter}" onclick="evSelectOpt(${idx},'${letter}')" style="display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03); border: 2px solid ${t.border}; padding: 12px 16px; border-radius: 10px; font-size: 14px; color: ${t.textMain}; font-weight: 600; cursor: pointer; transition: all 0.25s ease; user-select: none;">
            <span id="evRadio${idx}_${letter}" style="min-width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${t.border}; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; transition: all 0.25s ease; flex-shrink: 0;"></span>
            <span>${opt}</span>
          </label>`;
          }).join('')}
        </div>

        <!-- Per-question result (hidden initially) -->
        <div id="evResult${idx}" style="display: none; margin-top: 14px; padding: 14px; border-radius: 10px; font-family: 'Hind', sans-serif;"></div>
      </div>
      `).join('')}
    </div>

    <!-- Submit Button -->
    <div id="evSubmitArea" style="text-align: center; margin-top: 28px;">
      <div id="evAnsweredCount" style="font-size: 13px; color: ${t.textMuted}; margin-bottom: 10px; font-weight: 600;">Answered: 0 / ${quizQuestions.length}</div>
      <button id="evSubmitBtn" onclick="evSubmitQuiz()" style="background: linear-gradient(135deg, ${t.accentIndigo}, #8b5cf6); color: #fff; border: none; padding: 14px 48px; font-size: 17px; font-weight: 800; border-radius: 12px; cursor: pointer; box-shadow: 0 8px 25px rgba(99,102,241,0.4); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px;">
        ✅ Submit Test
      </button>
    </div>

    <!-- Scorecard (hidden initially) -->
    <div id="evScorecard" style="display: none; margin-top: 28px; text-align: center;">
      <div style="background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15)); border: 2px solid ${t.accentIndigo}; border-radius: 16px; padding: 28px; margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 700; color: ${t.textMuted}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">YOUR SCORE</div>
        <div id="evScoreValue" style="font-size: 52px; font-weight: 900; color: ${t.accentEmerald}; line-height: 1.1;"></div>
        <div id="evScorePercent" style="font-size: 18px; font-weight: 700; color: ${t.textMuted}; margin-top: 4px;"></div>
        <div id="evScoreMsg" style="font-size: 16px; margin-top: 12px; font-family: 'Hind', sans-serif; font-weight: 700;"></div>
      </div>
      <button onclick="evRetryQuiz()" style="background: ${t.cardBg}; color: ${t.textMain}; border: 2px solid ${t.border}; padding: 12px 36px; font-size: 15px; font-weight: 700; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
        🔄 Retry Quiz
      </button>
    </div>
  </div>

  <script>
  (function(){
    var evAnswers = {};
    var evCorrect = {${quizQuestions.map((q, idx) => `${idx}:"${q.correctOption}"`).join(',')}};
    var evExplanations = {${quizQuestions.map((q, idx) => `${idx}:${JSON.stringify(q.explanation || '')}`).join(',')}};
    var evTotal = ${quizQuestions.length};
    var evSubmitted = false;
    var evColors = {accent:'${t.accentIndigo}',emerald:'${t.accentEmerald}',rose:'${t.accentRose}',border:'${t.border}',cardBg:'${t.cardBg}',textMain:'${t.textMain}',textMuted:'${t.textMuted}'};

    window.evSelectOpt = function(qIdx, letter) {
      if (evSubmitted) return;
      evAnswers[qIdx] = letter;
      // Reset all options for this question
      ['A','B','C','D'].forEach(function(l){
        var lbl = document.getElementById('evOpt'+qIdx+'_'+l);
        var rad = document.getElementById('evRadio'+qIdx+'_'+l);
        if(lbl){lbl.style.borderColor=evColors.border;lbl.style.background='rgba(255,255,255,0.03)';}
        if(rad){rad.style.borderColor=evColors.border;rad.style.background='transparent';rad.innerHTML='';}
      });
      // Highlight selected
      var selLbl = document.getElementById('evOpt'+qIdx+'_'+letter);
      var selRad = document.getElementById('evRadio'+qIdx+'_'+letter);
      if(selLbl){selLbl.style.borderColor=evColors.accent;selLbl.style.background='rgba(99,102,241,0.1)';}
      if(selRad){selRad.style.borderColor=evColors.accent;selRad.style.background=evColors.accent;selRad.innerHTML='✓';selRad.style.color='#fff';}
      // Update progress
      var answered = Object.keys(evAnswers).length;
      document.getElementById('evAnsweredCount').textContent = 'Answered: '+answered+' / '+evTotal;
      var pct = Math.round((answered/evTotal)*100);
      document.getElementById('evQuizProgressBar').style.width = pct+'%';
    };

    window.evSubmitQuiz = function() {
      var answered = Object.keys(evAnswers).length;
      if(answered < evTotal){
        alert('Please answer all '+evTotal+' questions before submitting! ('+answered+'/'+evTotal+' answered)');
        return;
      }
      evSubmitted = true;
      var score = 0;

      for(var i=0;i<evTotal;i++){
        var userAns = evAnswers[i] || '';
        var correctAns = evCorrect[i];
        var isCorrect = userAns === correctAns;
        if(isCorrect) score++;

        // Show result per question
        var resultDiv = document.getElementById('evResult'+i);
        var qDiv = document.getElementById('evQ'+i);
        if(isCorrect){
          resultDiv.style.display='block';
          resultDiv.style.background='rgba(16,185,129,0.1)';
          resultDiv.style.border='1px solid rgba(16,185,129,0.3)';
          resultDiv.innerHTML='<div style="font-size:15px;font-weight:800;color:'+evColors.emerald+';margin-bottom:6px;">✅ Correct!</div><div style="font-size:13.5px;color:'+evColors.textMuted+';line-height:1.5;">'+evExplanations[i]+'</div>';
          qDiv.style.borderColor='rgba(16,185,129,0.4)';
        } else {
          resultDiv.style.display='block';
          resultDiv.style.background='rgba(244,63,94,0.1)';
          resultDiv.style.border='1px solid rgba(244,63,94,0.3)';
          resultDiv.innerHTML='<div style="font-size:15px;font-weight:800;color:'+evColors.rose+';margin-bottom:6px;">❌ Wrong! Your answer: '+userAns+' | Correct: '+correctAns+'</div><div style="font-size:13.5px;color:'+evColors.textMuted+';line-height:1.5;">'+evExplanations[i]+'</div>';
          qDiv.style.borderColor='rgba(244,63,94,0.4)';
          // Highlight correct option green
          var corrLbl = document.getElementById('evOpt'+i+'_'+correctAns);
          if(corrLbl){corrLbl.style.borderColor=evColors.emerald;corrLbl.style.background='rgba(16,185,129,0.15)';}
          // Highlight wrong option red
          var wrongLbl = document.getElementById('evOpt'+i+'_'+userAns);
          if(wrongLbl){wrongLbl.style.borderColor=evColors.rose;wrongLbl.style.background='rgba(244,63,94,0.1)';}
        }

        // Disable all options visually
        ['A','B','C','D'].forEach(function(l){
          var lbl = document.getElementById('evOpt'+i+'_'+l);
          if(lbl) lbl.style.cursor='default';
        });
      }

      // Show scorecard
      document.getElementById('evSubmitArea').style.display='none';
      var sc = document.getElementById('evScorecard');
      sc.style.display='block';
      document.getElementById('evScoreValue').textContent = score+' / '+evTotal;
      var pct = Math.round((score/evTotal)*100);
      document.getElementById('evScorePercent').textContent = pct+'% Accuracy';
      document.getElementById('evQuizProgressBar').style.width = '100%';

      var msgEl = document.getElementById('evScoreMsg');
      if(pct===100){msgEl.textContent='🏆 Perfect Score! Outstanding!';msgEl.style.color=evColors.emerald;}
      else if(pct>=80){msgEl.textContent='🌟 Excellent! Great vocabulary skills!';msgEl.style.color=evColors.emerald;}
      else if(pct>=60){msgEl.textContent='👍 Good effort! Keep practicing!';msgEl.style.color=evColors.accent;}
      else if(pct>=40){msgEl.textContent='📚 Fair attempt. Revise the words above.';msgEl.style.color='#f59e0b';}
      else{msgEl.textContent='💪 Needs work! Re-read the editorial carefully.';msgEl.style.color=evColors.rose;}

      // Scroll to scorecard
      sc.scrollIntoView({behavior:'smooth',block:'center'});
    };

    window.evRetryQuiz = function() {
      evAnswers = {};
      evSubmitted = false;
      document.getElementById('evSubmitArea').style.display='block';
      document.getElementById('evScorecard').style.display='none';
      document.getElementById('evAnsweredCount').textContent='Answered: 0 / '+evTotal;
      document.getElementById('evQuizProgressBar').style.width='0%';
      for(var i=0;i<evTotal;i++){
        document.getElementById('evResult'+i).style.display='none';
        document.getElementById('evQ'+i).style.borderColor=evColors.border;
        ['A','B','C','D'].forEach(function(l){
          var lbl = document.getElementById('evOpt'+i+'_'+l);
          var rad = document.getElementById('evRadio'+i+'_'+l);
          if(lbl){lbl.style.borderColor=evColors.border;lbl.style.background='rgba(255,255,255,0.03)';lbl.style.cursor='pointer';}
          if(rad){rad.style.borderColor=evColors.border;rad.style.background='transparent';rad.innerHTML='';}
        });
      }
      document.getElementById('evQuizContainer').scrollIntoView({behavior:'smooth',block:'start'});
    };
  })();
  </script>
  ` : ''}

</div>
  `.trim();
}
