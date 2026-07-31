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

  <!-- Interactive Swipe Card Quiz -->
  ${quizQuestions.length > 0 ? `
  <div id="evQBox" style="background-color: ${t.cardBg}; border: 2px solid ${t.accentIndigo}; border-radius: 20px; padding: 0; margin-bottom: 24px; overflow: hidden;">
    
    <!-- Quiz Header -->
    <div style="padding: 20px 24px; background: linear-gradient(135deg, ${t.accentIndigo}22, ${t.accentIndigo}08); border-bottom: 1px solid ${t.border};">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span style="font-size: 26px;">🧠</span>
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: ${t.textMain}; margin: 0;">Vocabulary Practice Quiz</h2>
          <span style="font-size: 12px; color: ${t.textMuted}; font-family: 'Hind', sans-serif;">आज के एडिटोरियल से खुद को टेस्ट करें!</span>
        </div>
      </div>
      <!-- Progress -->
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="flex: 1; background: ${t.border}; border-radius: 10px; height: 6px; overflow: hidden;">
          <div id="evBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, ${t.accentIndigo}, ${t.accentEmerald}); border-radius: 10px; transition: width 0.5s cubic-bezier(.4,0,.2,1);"></div>
        </div>
        <span id="evCount" style="font-size: 12px; font-weight: 800; color: ${t.textMuted}; white-space: nowrap;">0 / ${quizQuestions.length}</span>
      </div>
    </div>

    <!-- Card Viewport -->
    <div style="position: relative; overflow: hidden; min-height: 320px;" id="evViewport">
      ${quizQuestions.map((q, idx) => `
      <div id="evC${idx}" class="evCard" style="position: absolute; top: 0; left: 0; width: 100%; padding: 24px; box-sizing: border-box; transition: transform 0.45s cubic-bezier(.4,0,.2,1), opacity 0.45s ease; ${idx === 0 ? 'transform: translateX(0); opacity: 1;' : 'transform: translateX(105%); opacity: 0;'}">
        
        <!-- Question Number Pill -->
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="background: ${t.accentIndigo}; color: #fff; font-size: 12px; font-weight: 900; padding: 5px 14px; border-radius: 20px; letter-spacing: 1px;">QUESTION ${idx + 1} OF ${quizQuestions.length}</span>
        </div>

        <!-- Question Text -->
        <div style="font-size: 18px; font-weight: 700; color: ${t.textMain}; line-height: 1.6; margin-bottom: 20px; font-family: 'Plus Jakarta Sans', sans-serif;">${q.question}</div>

        <!-- Options -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${(q.options || []).map((opt, oi) => {
            const letter = ['A','B','C','D'][oi];
            return `
          <div id="evO${idx}_${letter}" onclick="evPick(${idx},'${letter}')" style="display: flex; align-items: center; gap: 14px; padding: 14px 18px; border: 2px solid ${t.border}; border-radius: 12px; cursor: pointer; transition: all 0.3s cubic-bezier(.4,0,.2,1); user-select: none; background: transparent;">
            <span id="evD${idx}_${letter}" style="min-width: 36px; height: 36px; border-radius: 50%; border: 2px solid ${t.border}; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${t.textMuted}; transition: all 0.3s ease; flex-shrink: 0;">${letter}</span>
            <span style="font-size: 15px; font-weight: 600; color: ${t.textMain}; line-height: 1.4;">${opt.replace(/^[A-D]\)\s*/, '')}</span>
          </div>`;
          }).join('')}
        </div>

        <!-- Per-card result -->
        <div id="evR${idx}" style="display: none; margin-top: 16px; padding: 14px 18px; border-radius: 12px; font-family: 'Hind', sans-serif;"></div>
      </div>
      `).join('')}

      <!-- Scorecard Card -->
      <div id="evScore" class="evCard" style="position: absolute; top: 0; left: 0; width: 100%; padding: 24px; box-sizing: border-box; transform: translateX(105%); opacity: 0; transition: transform 0.45s cubic-bezier(.4,0,.2,1), opacity 0.45s ease;">
        <div style="text-align: center; padding: 20px 0;">
          <div id="evEmoji" style="font-size: 56px; margin-bottom: 8px;">🏆</div>
          <div style="font-size: 12px; font-weight: 800; color: ${t.textMuted}; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 4px;">YOUR SCORE</div>
          <div id="evSV" style="font-size: 48px; font-weight: 900; color: ${t.accentEmerald}; line-height: 1.1;"></div>
          <div id="evSP" style="font-size: 16px; font-weight: 700; color: ${t.textMuted}; margin: 4px 0 8px;"></div>
          <div id="evSM" style="font-size: 15px; font-weight: 700; font-family: 'Hind', sans-serif; margin-bottom: 16px;"></div>
          
          <!-- Review all answers -->
          <div id="evReview" style="text-align: left; margin-top: 16px; border-top: 1px solid ${t.border}; padding-top: 16px;"></div>

          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
            <button onclick="evRetry()" style="background: ${t.accentIndigo}; color: #fff; border: none; padding: 12px 30px; font-size: 14px; font-weight: 800; border-radius: 10px; cursor: pointer;">🔄 Retry Quiz</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Bar -->
    <div id="evNav" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-top: 1px solid ${t.border}; background: ${t.cardBg};">
      <button id="evPrev" onclick="evGo(-1)" style="background: transparent; border: 2px solid ${t.border}; color: ${t.textMuted}; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; opacity: 0.4; pointer-events: none;">← Back</button>
      
      <!-- Dot Indicators -->
      <div id="evDots" style="display: flex; gap: 6px; align-items: center;">
        ${quizQuestions.map((_, idx) => `<span id="evDot${idx}" style="width: ${idx === 0 ? '24px' : '8px'}; height: 8px; border-radius: 4px; background: ${idx === 0 ? t.accentIndigo : t.border}; transition: all 0.4s ease; cursor: pointer;" onclick="evGoTo(${idx})"></span>`).join('')}
      </div>

      <button id="evNext" onclick="evGo(1)" style="background: ${t.accentIndigo}; border: none; color: #fff; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;">Next →</button>
    </div>
  </div>

  <script>
  (function(){
    var cur=0, total=${quizQuestions.length}, ans={}, done=false;
    var correct={${quizQuestions.map((q,i)=>`${i}:"${q.correctOption}"`).join(',')}};
    var expl={${quizQuestions.map((q,i)=>`${i}:${JSON.stringify(q.explanation||'')}`).join(',')}};
    var qTexts={${quizQuestions.map((q,i)=>`${i}:${JSON.stringify(q.question)}`).join(',')}};
    var C={a:'${t.accentIndigo}',e:'${t.accentEmerald}',r:'${t.accentRose}',am:'${t.accentAmber}',b:'${t.border}',bg:'${t.cardBg}',t:'${t.textMain}',m:'${t.textMuted}'};

    function show(idx, dir){
      // Hide current card
      var old=document.getElementById(cur<total?'evC'+cur:'evScore');
      if(old){old.style.transform='translateX('+(dir>0?'-105%':'105%')+')';old.style.opacity='0';}
      cur=idx;
      // Show new card
      setTimeout(function(){
        var nw=document.getElementById(cur<total?'evC'+cur:'evScore');
        if(nw){nw.style.transform='translateX(0)';nw.style.opacity='1';}
      },50);
      // Update dots
      for(var i=0;i<total;i++){
        var d=document.getElementById('evDot'+i);
        if(d){d.style.width=i===cur?'24px':'8px';d.style.background=ans[i]!==undefined?(i===cur?C.a:C.e):(i===cur?C.a:C.b);}
      }
      // Update buttons
      var pb=document.getElementById('evPrev'), nb=document.getElementById('evNext');
      if(cur===0){pb.style.opacity='0.4';pb.style.pointerEvents='none';}else{pb.style.opacity='1';pb.style.pointerEvents='auto';}
      if(cur>=total){
        document.getElementById('evNav').style.display='none';
      } else if(cur===total-1 && ans[cur]!==undefined){
        nb.textContent='Submit ✅';nb.style.background='linear-gradient(135deg,'+C.a+',#8b5cf6)';
      } else {
        nb.textContent='Next →';nb.style.background=C.a;
      }
      // Resize viewport
      setTimeout(function(){
        var card=document.getElementById(cur<total?'evC'+cur:'evScore');
        if(card){document.getElementById('evViewport').style.minHeight=card.scrollHeight+'px';}
      },100);
    }

    window.evGoTo=function(i){if(!done&&i<total)show(i,i>cur?1:-1);};
    window.evGo=function(dir){
      var next=cur+dir;
      if(next<0)return;
      if(cur===total-1 && dir===1 && ans[cur]!==undefined && !done){evSubmit();return;}
      if(next>=total)return;
      show(next,dir);
    };

    window.evPick=function(qi,letter){
      if(done)return;
      ans[qi]=letter;
      ['A','B','C','D'].forEach(function(l){
        var o=document.getElementById('evO'+qi+'_'+l),d=document.getElementById('evD'+qi+'_'+l);
        if(o){o.style.borderColor=C.b;o.style.background='transparent';}
        if(d){d.style.borderColor=C.b;d.style.background='transparent';d.style.color=C.m;d.textContent=l;}
      });
      var so=document.getElementById('evO'+qi+'_'+letter),sd=document.getElementById('evD'+qi+'_'+letter);
      if(so){so.style.borderColor=C.a;so.style.background=C.a+'18';}
      if(sd){sd.style.borderColor=C.a;sd.style.background=C.a;sd.style.color='#fff';sd.textContent='✓';}
      // Update count + bar
      var cnt=Object.keys(ans).length;
      document.getElementById('evCount').textContent=cnt+' / '+total;
      document.getElementById('evBar').style.width=Math.round(cnt/total*100)+'%';
      // Update dots
      var dot=document.getElementById('evDot'+qi);
      if(dot&&qi!==cur)dot.style.background=C.e;
      // Update next btn text if last Q
      if(qi===total-1){var nb=document.getElementById('evNext');nb.textContent='Submit ✅';nb.style.background='linear-gradient(135deg,'+C.a+',#8b5cf6)';}
      // Auto-advance after short delay
      if(qi<total-1){setTimeout(function(){show(qi+1,1);},400);}
    };

    function evSubmit(){
      done=true;
      var score=0;
      var reviewHtml='';
      for(var i=0;i<total;i++){
        var u=ans[i]||'',c=correct[i],ok=u===c;
        if(ok)score++;
        // Show per-card result
        var r=document.getElementById('evR'+i);
        if(ok){
          r.style.display='block';r.style.background='rgba(16,185,129,0.1)';r.style.border='1px solid rgba(16,185,129,0.3)';
          r.innerHTML='<div style="font-weight:800;color:'+C.e+';font-size:15px;margin-bottom:4px;">✅ Correct!</div><div style="font-size:13px;color:'+C.m+';line-height:1.5;">'+expl[i]+'</div>';
        }else{
          r.style.display='block';r.style.background='rgba(244,63,94,0.1)';r.style.border='1px solid rgba(244,63,94,0.3)';
          r.innerHTML='<div style="font-weight:800;color:'+C.r+';font-size:15px;margin-bottom:4px;">❌ Wrong — Correct: '+c+'</div><div style="font-size:13px;color:'+C.m+';line-height:1.5;">'+expl[i]+'</div>';
          // Highlight correct green, wrong red
          var cEl=document.getElementById('evO'+i+'_'+c);if(cEl){cEl.style.borderColor=C.e;cEl.style.background='rgba(16,185,129,0.12)';}
          var wEl=document.getElementById('evO'+i+'_'+u);if(wEl){wEl.style.borderColor=C.r;wEl.style.background='rgba(244,63,94,0.08)';}
        }
        // Disable clicks
        ['A','B','C','D'].forEach(function(l){var el=document.getElementById('evO'+i+'_'+l);if(el)el.style.cursor='default';});
        // Build review line
        reviewHtml+='<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;'+(i<total-1?'border-bottom:1px solid '+C.b+';':'')+'"><span style="font-weight:900;font-size:13px;color:'+(ok?C.e:C.r)+';min-width:24px;">Q'+(i+1)+'</span><div style="flex:1;font-size:13px;"><div style="color:'+C.t+';font-weight:600;margin-bottom:2px;">'+qTexts[i].substring(0,80)+(qTexts[i].length>80?'...':'')+'</div><div style="color:'+(ok?C.e:C.r)+';font-weight:700;">'+(ok?'✅ Correct':'❌ Your: '+u+' → Correct: '+c)+'</div></div></div>';
      }
      // Fill scorecard
      document.getElementById('evSV').textContent=score+' / '+total;
      var pct=Math.round(score/total*100);
      document.getElementById('evSP').textContent=pct+'% Accuracy';
      document.getElementById('evBar').style.width='100%';
      document.getElementById('evCount').textContent=score+' correct';
      var em=document.getElementById('evEmoji'),sm=document.getElementById('evSM');
      if(pct===100){em.textContent='🏆';sm.textContent='Perfect Score! Outstanding!';sm.style.color=C.e;}
      else if(pct>=80){em.textContent='🌟';sm.textContent='Excellent! Great vocabulary skills!';sm.style.color=C.e;}
      else if(pct>=60){em.textContent='👍';sm.textContent='Good effort! Keep practicing!';sm.style.color=C.a;}
      else if(pct>=40){em.textContent='📚';sm.textContent='Fair attempt. Revise the words above.';sm.style.color=C.am;}
      else{em.textContent='💪';sm.textContent='Needs work! Re-read the editorial carefully.';sm.style.color=C.r;}
      document.getElementById('evReview').innerHTML=reviewHtml;
      // Show scorecard
      show(total,1);
    }
    window.evSubmit=evSubmit;

    window.evRetry=function(){
      ans={};done=false;
      document.getElementById('evNav').style.display='flex';
      document.getElementById('evCount').textContent='0 / '+total;
      document.getElementById('evBar').style.width='0%';
      for(var i=0;i<total;i++){
        document.getElementById('evR'+i).style.display='none';
        ['A','B','C','D'].forEach(function(l){
          var o=document.getElementById('evO'+i+'_'+l),d=document.getElementById('evD'+i+'_'+l);
          if(o){o.style.borderColor=C.b;o.style.background='transparent';o.style.cursor='pointer';}
          if(d){d.style.borderColor=C.b;d.style.background='transparent';d.style.color=C.m;d.textContent=l;}
        });
      }
      // Reset scorecard position
      var sc=document.getElementById('evScore');sc.style.transform='translateX(105%)';sc.style.opacity='0';
      // Reset all cards
      for(var i=0;i<total;i++){
        var c=document.getElementById('evC'+i);
        c.style.transform=i===0?'translateX(0)':'translateX(105%)';
        c.style.opacity=i===0?'1':'0';
      }
      cur=0;
      // Reset dots + nav
      for(var i=0;i<total;i++){var d=document.getElementById('evDot'+i);d.style.width=i===0?'24px':'8px';d.style.background=i===0?C.a:C.b;}
      var pb=document.getElementById('evPrev'),nb=document.getElementById('evNext');
      pb.style.opacity='0.4';pb.style.pointerEvents='none';nb.textContent='Next →';nb.style.background=C.a;
      document.getElementById('evQBox').scrollIntoView({behavior:'smooth',block:'start'});
      setTimeout(function(){document.getElementById('evViewport').style.minHeight=document.getElementById('evC0').scrollHeight+'px';},100);
    };

    // Init viewport height
    setTimeout(function(){
      var c=document.getElementById('evC0');
      if(c)document.getElementById('evViewport').style.minHeight=c.scrollHeight+'px';
    },200);
  })();
  </script>
  ` : ''}

</div>
  `.trim();
}
