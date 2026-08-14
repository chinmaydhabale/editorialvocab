import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import dotenv from 'dotenv';

import { getUnprocessedArticlesFromFeeds } from './rssMonitor.js';
import { extractArticleFromUrl } from './articleExtractor.js';
import { analyzeEditorialWithGemini, generateQuizWithGemini } from './geminiEngine.js';
import { generateAiThumbnail } from './thumbnailEngine.js';
import { generateBloggerHtml } from './bloggerCompiler.js';
import { publishToBlogger } from './bloggerPublisher.js';
import { submitUrlToGoogleIndexing, logSitemapSubmissionAdvice } from './googleIndexingService.js';
import { markAsProcessed } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('⚠️ Could not load config.json, using defaults:', err.message);
    return {
      feeds: [
        { name: 'The Hindu', url: 'https://www.thehindu.com/opinion/editorial/feeder/default.rss', enabled: true },
        { name: 'Indian Express', url: 'https://indianexpress.com/section/opinion/editorials/feed/', enabled: true }
      ],
      botOptions: {
        maxArticlesPerRun: 2,
        theme: 'slate',
        wordCount: 'all',
        isDraft: false,
        titleTemplate: '{newspaper} Editorial Analysis ({date}): {title} | Daily Vocabulary & Hindi Meaning'
      }
    };
  }
}

function formatTitle(template, { newspaper, title, date }) {
  const cleanDate = date || new Date().toISOString().split('T')[0];
  return template
    .replace('{newspaper}', newspaper || 'The Hindu')
    .replace('{title}', title || 'Daily Editorial Vocabulary')
    .replace('{date}', cleanDate);
}

/**
 * Main Single-Execution Engine Cycle
 */
export async function runBotCycle(options = {}) {
  const { isDryRun = false } = options;
  const config = loadConfig();

  const apiKey = process.env.GEMINI_API_KEY;
  const blogId = process.env.BLOGGER_BLOG_ID;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const preferredModel = process.env.PREFERRED_MODEL || 'gemini-3.6-flash';
  const theme = process.env.BLOG_THEME || config.botOptions?.theme || 'warm';
  const wordCount = process.env.WORD_COUNT || config.botOptions?.wordCount || 'all';

  if (!isDryRun && (!apiKey || !blogId)) {
    console.error('❌ ERROR: GEMINI_API_KEY and BLOGGER_BLOG_ID must be configured in .env file.');
    return;
  }

  console.log('\n==================================================');
  console.log(`🤖 EditorialVocab Bot Engine Running ${isDryRun ? '[DRY-RUN MODE]' : ''}`);
  console.log(`⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log('==================================================\n');

  console.log('📡 Checking RSS feeds for newly published editorials...');
  const newArticles = await getUnprocessedArticlesFromFeeds(config.feeds || []);

  if (newArticles.length === 0) {
    console.log('✨ No new editorials found across RSS feeds. All up to date!\n');
    return;
  }

  console.log(`📰 Found ${newArticles.length} new unprocessed editorial(s). Processing up to ${config.botOptions?.maxArticlesPerRun || 2}...`);

  const articlesToProcess = newArticles.slice(0, config.botOptions?.maxArticlesPerRun || 2);

  for (let i = 0; i < articlesToProcess.length; i++) {
    const articleItem = articlesToProcess[i];
    console.log(`\n--------------------------------------------------`);
    console.log(`[${i + 1}/${articlesToProcess.length}] Processing: "${articleItem.title}" (${articleItem.sourceName})`);
    console.log(`🔗 Link: ${articleItem.link}`);
    console.log(`--------------------------------------------------`);

    try {
      // Step 1: Extract full article text
      console.log('🔍 Extracting full article content...');
      const fullText = await extractArticleFromUrl(articleItem.link);
      console.log(`✅ Extracted ${fullText.length} characters of article text.`);

      // Step 2: Gemini AI Vocabulary Analysis
      console.log('🧠 Running Gemini AI Analysis (extracting words, Hindi meanings, mnemonics & idioms)...');
      const vocabData = await analyzeEditorialWithGemini(apiKey, fullText, wordCount, preferredModel);
      console.log(`✅ AI Analysis Complete: Extracted ${vocabData.words.length} words and ${vocabData.idiomsAndPhrases.length} idioms.`);

      // Step 3: Gemini AI Practice Quiz Generation
      console.log('🎯 Generating interactive practice quiz MCQs...');
      const quizQuestions = await generateQuizWithGemini(apiKey, vocabData, preferredModel);
      console.log(`✅ Generated ${quizQuestions.length} MCQ practice questions.`);

      // Step 4: AI SVG Cover Thumbnail Banner Generation
      const todayDateStr = new Date().toISOString().split('T')[0];
      console.log('🎨 Generating AI Cover Banner SVG Thumbnail...');
      const thumbnailUrl = generateAiThumbnail({
        title: vocabData.articleTitle || articleItem.title,
        sourceName: articleItem.sourceName,
        date: todayDateStr,
        topic: vocabData.articleTopic
      });

      // Step 5: Format Final Blog Title & Compile Blogger HTML
      const titleTemplate = config.botOptions?.titleTemplate || '{newspaper} Editorial Vocabulary: {title} ({date}) | Hindi Meaning & Synonyms';
      const finalTitle = formatTitle(titleTemplate, {
        newspaper: articleItem.sourceName,
        title: vocabData.articleTitle || articleItem.title,
        date: todayDateStr
      });

      const postPayload = {
        title: finalTitle,
        date: todayDateStr,
        sourceName: articleItem.sourceName,
        mainImageUrl: thumbnailUrl,
        words: vocabData.words,
        idiomsAndPhrases: vocabData.idiomsAndPhrases,
        quizQuestions: quizQuestions
      };

      console.log('📄 Compiling self-contained Blogger HTML layout...');
      const compiledHtml = generateBloggerHtml(postPayload, theme);
      console.log(`✅ Compiled HTML document (${compiledHtml.length} bytes).`);

      if (isDryRun) {
        console.log('\n🧪 [DRY-RUN] Article processed successfully! Skipping live Blogger publishing.');
        console.log(`📌 Title: "${finalTitle}"`);
        console.log(`📝 Words: ${vocabData.words.map(w => w.word).join(', ')}`);
        console.log(`💡 Idioms: ${vocabData.idiomsAndPhrases.map(i => i.phrase).join(', ')}`);
        continue;
      }

      // Step 6: Publish to Google Blogger API v3
      console.log('🚀 Auto-publishing post to Google Blogger...');
      const publishResult = await publishToBlogger({
        blogId,
        clientId,
        clientSecret,
        refreshToken,
        title: finalTitle,
        htmlContent: compiledHtml,
        postDate: todayDateStr,
        sourceName: articleItem.sourceName,
        hasIdioms: vocabData.idiomsAndPhrases.length > 0,
        isDraft: config.botOptions?.isDraft || false
      });

      console.log(`🎉 SUCCESS! Post Published to Blogger!`);
      console.log(`🔗 Live URL: ${publishResult.url}`);
      console.log(`🆔 Post ID: ${publishResult.postId}`);

      // Step 7: Record in local database IMMEDIATELY to prevent duplicate processing
      markAsProcessed({
        url: articleItem.link,
        guid: articleItem.guid,
        title: finalTitle,
        sourceName: articleItem.sourceName,
        bloggerPostId: publishResult.postId,
        bloggerPostUrl: publishResult.url
      });
      console.log(`💾 Recorded in database to ensure zero future duplicate posts.`);

      // Step 8: Search discovery hints (isolated try-catch so indexing errors never cause duplicate runs)
      if (publishResult.url) {
        try {
          console.log('🔎 Checking Google discovery options for the published post...');
          const saKeyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || path.join(__dirname, '..', 'service_account.json');
          await submitUrlToGoogleIndexing({
            url: publishResult.url,
            serviceAccountKeyPath: saKeyPath,
            serviceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON
          });
          await logSitemapSubmissionAdvice(publishResult.url);
        } catch (idxErr) {
          console.warn('⚠️ Google Discovery warning (post already published & saved):', idxErr.message);
        }
      }

    } catch (err) {
      console.error(`❌ Error processing article "${articleItem.title}":`, err.message);
    }
  }

  console.log('\n🏁 Bot execution cycle finished.\n');
}

/**
 * Entry Point Execution Controller
 */
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isOnce = args.includes('--once');

  if (isOnce || isDryRun) {
    await runBotCycle({ isDryRun });
    process.exit(0);
  }

  // Cron Mode (24/7 VPS Daemon)
  // Runs every hour on the hour (0 * * * *) so new RSS editorials are published within 30-60 mins
  const cronSchedule = process.env.CRON_SCHEDULE || '0 * * * *';
  console.log('==================================================');
  console.log('🚀 EditorialVocab Automated VPS Bot Daemon Started');
  console.log(`⏰ Cron Schedule: "${cronSchedule}"`);
  console.log('==================================================\n');

  // Run initial cycle immediately upon starting
  await runBotCycle({ isDryRun: false });

  // Schedule recurring runs
  cron.schedule(cronSchedule, async () => {
    console.log(`\n⏰ Cron Triggered at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    await runBotCycle({ isDryRun: false });
  });
}

main().catch(err => {
  console.error('❌ Fatal Bot Error:', err);
  process.exit(1);
});
