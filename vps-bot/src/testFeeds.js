import axios from 'axios';

async function testJinaTranslate() {
  const gtranslateUrl = 'https://indianexpress-com.translate.goog/article/opinion/editorials/kulgam-jammu-kashmir-migrant-workers-terror-attack-10815001/?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en';
  try {
    const res = await axios.get(`https://r.jina.ai/${gtranslateUrl}`, {
      headers: { 'Accept': 'text/plain' },
      timeout: 15000
    });
    console.log(`🎉 JINA + GOOGLE TRANSLATE PROXY SUCCESS! Length: ${res.data.length}`);
    console.log('Snippet:\n', res.data.slice(0, 600));
  } catch (err) {
    console.error('❌ Jina + Google Translate Proxy Failed:', err.message);
  }
}

testJinaTranslate();
