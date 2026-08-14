# 📖 Complete Setup Guide: EditorialVocab 100% Automated VPS Bot

यह गाइड आपको स्टेप-बाय-स्टेप सिखाएगी कि कैसे अपने **Gemini API Key**, **Google Blogger API**, और **24/7 OAuth Refresh Token** को सेटअप करना है और बॉट को VPS पर 24 घंटे ऑटोमैटिक रन करना है।

---

## 📑 टेबल ऑफ कंटेंट्स (Table of Contents)

1. [Step 1: Gemini AI API Key कैसे प्राप्त करें (Free)](#step-1-gemini-ai-api-key-कैसे-प्राप्त-करें-free)
2. [Step 2: Blogger Blog ID कैसे निकालें](#step-2-blogger-blog-id-कैसे-निकालें)
3. [Step 3: Google Cloud Console में OAuth Credentials कैसे बनाएं](#step-3-google-cloud-console-में-oauth-credentials-कैसे-बनाएं)
4. [Step 4: 24/7 Refresh Token जनरेट करना (`npm run get-token`)](#step-4-247-refresh-token-जनरेट-करना-npm-run-get-token)
5. [Step 5: `.env` फ़ाइल तैयार करना](#step-5-env-फ़ाइल-तैयार-करना)
6. [Step 6: टेस्ट रन करना (Dry-Run Check)](#step-6-टेस्ट-रन-करना-dry-run-check)
7. [Step 7: VPS पर PM2 से 24/7 ऑटोमेशन चालू करना](#step-7-vps-पर-pm2-से-247-ऑटोमेशन-चालू-करना)

---

## Step 1: Gemini AI API Key कैसे प्राप्त करें (Free)

1. अपने ब्राउज़र में **[Google AI Studio](https://aistudio.google.com/)** पर जाएं।
2. अपने Google अकाउंट से लॉगिन करें।
3. **Get API Key** बटन पर क्लिक करें।
4. **Create API key in new project** पर क्लिक करें।
5. जनरेट हुई API Key को कॉपी कर लें। (उदाहरण: `AIzaSyD...`)

---

## Step 2: Blogger Blog ID कैसे निकालें

1. अपने **[Google Blogger Dashboard](https://www.blogger.com/)** में लॉगिन करें।
2. अपना ब्लॉग सेलेक्ट करें।
3. ब्राउज़र के एड्रेस बार (URL) को देखें:
   ```text
   https://www.blogger.com/blog/posts/8765432109876543210
   ```
4. `/posts/` के बाद वाला नंबर ही आपका **Blog ID** है (उदाहरण: `8765432109876543210`)।

---

## Step 3: Google Cloud Console में OAuth Credentials कैसे बनाएं

Blogger पर ऑटोमैटिक पोस्ट करने के लिए Google OAuth Credentials चाहिए:

1. **[Google Cloud Console](https://console.cloud.google.com/)** पर जाएं और लॉगिन करें।
2. ऊपर **Select a Project** पर क्लिक करके **New Project** बनाएं (जैसे नाम दें: `Blogger Auto Bot`)।
3. लेफ्ट मेन्यू से **APIs & Services > Library** में जाएं।
4. सर्च बार में **Blogger API v3** टाइप करें और उसे सेलेक्ट करके **ENABLE** पर क्लिक करें।
5. लेफ्ट मेन्यू में **APIs & Services > OAuth consent screen** पर जाएं:
   - User Type: **External** चुनें और Create पर क्लिक करें।
   - App Name: `Blogger Vocab Bot` दर्ज करें।
   - User Support Email & Developer Email दर्ज करें और Save & Continue करें।
   - **Scopes** में `https://www.googleapis.com/auth/blogger` ऐड करें।
   - **Test Users** में अपना वही Gmail ID ऐड करें जिससे आपका Blogger ब्लॉग बना है।
6. अब लेफ्ट मेन्यू में **APIs & Services > Credentials** पर जाएं:
   - **Create Credentials** -> **OAuth client ID** सेलेक्ट करें।
   - Application Type: **Web application** चुनें।
   - Name: `VPS Blogger Bot`
   - **Authorized redirect URIs** में यह सटीक URL ऐड करें:
     ```text
     http://localhost:3000/oauth2callback
     ```
   - **Create** पर क्लिक करें।
7. स्क्रीन पर आपको आपका **Client ID** (उदा. `123456-abc.apps.googleusercontent.com`) और **Client Secret** (उदा. `GOCSPX-xyz123...`) दिखेगा। इसे कॉपी कर लें।

---

## Step 4: 24/7 Refresh Token जनरेट करना (`npm run get-token`)

Blogger access token 1 घंटे में एक्सपायर हो जाता है। 24/7 बिना लॉगिन के ऑटोमेशन चलाने के लिए बॉट में एक 1-मिनट की हेल्पफुल कमांड दी गई है:

1. टर्मिनल में `vps-bot` फ़ोल्डर खोलें:
   ```bash
   cd vps-bot
   ```
2. यह कमांड चलाएं:
   ```bash
   npm run get-token
   ```
3. अपना **Client ID** और **Client Secret** पेस्ट करें।
4. स्क्रीन पर आया लिंक अपने ब्राउज़र में खोलें, अपने Google अकाउंट से अनुमति दें।
5. आपके स्क्रीन पर **`GOOGLE_REFRESH_TOKEN`** प्रिंट होकर आ जाएगा!

---

## Step 5: `.env` फ़ाइल तैयार करना

`vps-bot` फ़ोल्डर में एक नई फ़ाइल **`.env`** बनाएं (या `.env.example` को रिनेम करें):

```env
# 1. Gemini API Key
GEMINI_API_KEY=AIzaSy...आपकी_gemini_key

# 2. Preferred Gemini Model
PREFERRED_MODEL=gemini-3.6-flash

# 3. Blogger Blog ID
BLOGGER_BLOG_ID=8765432109876543210

# 4. Google OAuth 24/7 Credentials
GOOGLE_CLIENT_ID=123456-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx...
GOOGLE_REFRESH_TOKEN=1//04xxx...

# 5. Background Cron Frequency (हर 30 मिनट)
CRON_SCHEDULE=*/30 * * * *

# 6. Blog Theme: slate | warm | cyber
BLOG_THEME=slate

# 7. Word Count: all | 10 | 15
WORD_COUNT=all
```

---

## Step 6: टेस्ट रन करना (Dry-Run Check)

बिना Blogger पर लाइव पोस्ट किए टेस्ट करने के लिए:

```bash
npm run dry-run
```

यह RSS से नए आर्टिकल निकालेगा, Gemini AI से एनालिसिस करेगा, और सब कुछ कंसोल में दिखाएगा।

---

## Step 7: VPS पर PM2 से 24/7 ऑटोमेशन चालू करना

अपने Linux/Windows VPS पर बॉट को हमेशा बैकग्राउंड में चलाने के लिए:

```bash
# 1. PM2 ग्लोबली इंस्टॉल करें
npm install -g pm2

# 2. vps-bot फ़ोल्डर में जाकर स्टार्ट करें
cd vps-bot
pm2 start src/index.js --name "editorialvocab-bot"

# 3. PM2 रीबूट प्रोटेक्शन (VPS रीस्टार्ट होने पर भी बॉट खुद चालू हो जाएगा)
pm2 save
pm2 startup
```

### उपयोगी PM2 कमांड्स:
- लाइव लॉग्स देखें: `pm2 logs editorialvocab-bot`
- बॉट स्टेटस देखें: `pm2 status`
- बॉट रीस्टार्ट करें: `pm2 restart editorialvocab-bot`

---

## Step 8: Google Search Console Discovery Setup (Optional)

> Important: Keep this disabled for normal EditorialVocab blog posts. Google's Indexing API is only for eligible JobPosting pages and livestream BroadcastEvent pages inside VideoObject. For vocabulary articles, use the Blogger sitemap and Search Console URL Inspection instead.

Recommended workflow: submit `https://editorialvocab.in/sitemap.xml` in Search Console, then use URL Inspection for important new article URLs. Normal Blogger articles cannot be guaranteed instant indexing.

जैसे ही बॉट Blogger पर नया पोस्ट पब्लिश करेगा, वह Google Search Console Indexing API द्वारा पोस्ट का URL तुरंत गूगल इंडेक्सिंग के लिए सबमिट कर देगा।

### 🛠️ सेटअप कैसे करें (2 मिनट का काम):

1. **Google Cloud Console** में जाएं ([https://console.cloud.google.com/](https://console.cloud.google.com/)).
2. **APIs & Services > Library** में जाकर **Web Search Indexing API** सर्च करके **ENABLE** करें।
3. **APIs & Services > Credentials** -> **Create Credentials** -> **Service Account** चुनें:
   - नाम दें: `Search Console Indexer`
   - Role: **Owner** या **Editor** चुनें और **Done** करें।
4. बनी हुई Service Account ई-मेल आईडी (उदा. `indexer@your-project.iam.gserviceaccount.com`) को कॉपी कर लें।
5. Service Account पर क्लिक करके **KEYS** टैब में जाएं -> **ADD KEY** -> **Create new key (JSON)** चुनें।
6. डाउनलोड हुई JSON फ़ाइल का नाम बदलकर **`service_account.json`** रखें और उसे `vps-bot/` फ़ोल्डर के अंदर रख दें।
7. **[Google Search Console](https://search.google.com/search-console)** खोलें:
   - अपनी वेबसाइट/ब्लॉग प्रॉपर्टी चुनें (`editorialvocab.in`).
   - **Settings > Users and permissions** में जाएं।
   - **Add User** पर क्लिक करके Service Account वाला Email पेस्ट करें और Permission **Owner** सेलेक्ट करके Save करें!

इतना करते ही बॉट हर नई पब्लिश हुई पोस्ट को 1 सेकंड में Google Search Console में Instant Indexing के लिए भेज देगा! 🚀
