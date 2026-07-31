import React, { useState } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import VocabEditor from './components/VocabEditor';
import BloggerPreview from './components/BloggerPreview';
import HtmlExporter from './components/HtmlExporter';
import { analyzeEditorialWithGemini, generateQuizWithGemini } from './services/geminiService';
import { generateAiThumbnail } from './services/aiThumbnailService';
import { SAMPLE_EDITORIALS } from './services/sampleEditorials';
import { FileText, Edit3, Eye, Share2 } from 'lucide-react';

/**
 * Helper to construct high-ranking SEO friendly Blog Titles.
 * Example: "The Hindu Editorial Vocabulary Today (29 Jul 2026): India's Foreign Policy Must Look Seaward"
 */
function buildSeoBlogTitle({ sourceName, dateStr, headline }) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const dateFormatted = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const cleanSource = (sourceName || 'The Hindu Editorial').replace(' Editorial', '');
  const cleanHeadline = (headline || 'Daily Tricky Words & Idioms Analysis').trim();

  return `${cleanSource} Editorial Vocabulary Today (${dateFormatted}): ${cleanHeadline}`;
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('gemini_selected_model') || 'gemini-3.6-flash');
  const [currentTheme, setCurrentTheme] = useState('warm');
  const [activeTab, setActiveTab] = useState('input');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Processing article...');
  const [wordCountTarget, setWordCountTarget] = useState('all');

  const initialDate = SAMPLE_EDITORIALS[0].date;
  const initialSeoTitle = buildSeoBlogTitle({
    sourceName: SAMPLE_EDITORIALS[0].sourceName,
    dateStr: initialDate,
    headline: SAMPLE_EDITORIALS[0].title
  });

  const [postData, setPostData] = useState({
    title: initialSeoTitle,
    date: initialDate,
    sourceName: SAMPLE_EDITORIALS[0].sourceName,
    bannerTopic: SAMPLE_EDITORIALS[0].bannerTopic,
    mainImageUrl: generateAiThumbnail({
      title: initialSeoTitle,
      sourceName: SAMPLE_EDITORIALS[0].sourceName,
      date: initialDate,
      topic: SAMPLE_EDITORIALS[0].bannerTopic
    }),
    words: SAMPLE_EDITORIALS[0].words,
    idiomsAndPhrases: SAMPLE_EDITORIALS[0].idiomsAndPhrases || [],
    quizQuestions: SAMPLE_EDITORIALS[0].quizQuestions || []
  });

  const handleProcessText = async ({ text, title, sourceName, wordCount }) => {
    setIsLoading(true);
    setLoadingStep('Step 1/2: Extracting Vocabulary & Idioms...');

    try {
      let result = { articleTitle: '', articleTopic: '', words: [], idiomsAndPhrases: [] };
      let quiz = [];

      if (apiKey && apiKey.trim() !== "") {
        // API Hit #1: Exhaustive Vocabulary Extraction
        result = await analyzeEditorialWithGemini(apiKey, text, wordCount, selectedModel);

        // API Hit #2: Dedicated Quiz Generation
        setLoadingStep('Step 2/2: Building Interactive Practice Quiz Test...');
        quiz = await generateQuizWithGemini(apiKey, result, selectedModel);
      } else {
        alert('Notice: Gemini API key is missing. Loading pre-formatted sample vocabulary. To analyze custom articles, add your Gemini API key in the top right.');
        result = {
          articleTitle: SAMPLE_EDITORIALS[0].title,
          articleTopic: SAMPLE_EDITORIALS[0].bannerTopic,
          words: SAMPLE_EDITORIALS[0].words,
          idiomsAndPhrases: SAMPLE_EDITORIALS[0].idiomsAndPhrases || []
        };
        quiz = SAMPLE_EDITORIALS[0].quizQuestions || [];
      }

      const generatedSource = sourceName || 'The Hindu Editorial';
      const generatedDate = new Date().toISOString().split('T')[0];
      const extractedHeadline = result.articleTitle || 'Daily Vocabulary & Idioms';

      // Construct High-Ranking SEO Friendly Title with Newspaper Name + Date + Headline
      const seoTitle = title && title.includes('Today (') 
        ? title 
        : buildSeoBlogTitle({
            sourceName: generatedSource,
            dateStr: generatedDate,
            headline: title && !title.includes('Analysis') ? title : extractedHeadline
          });

      const finalTopic = result.articleTopic || 'Editorial Geopolitics & Analysis';

      // Generate AI thumbnail with full SEO Title
      const aiThumbnailUrl = generateAiThumbnail({
        title: seoTitle,
        sourceName: generatedSource,
        date: generatedDate,
        topic: finalTopic
      });

      setPostData({
        title: seoTitle,
        date: generatedDate,
        sourceName: generatedSource,
        bannerTopic: finalTopic,
        mainImageUrl: aiThumbnailUrl,
        words: result.words || [],
        idiomsAndPhrases: result.idiomsAndPhrases || [],
        quizQuestions: quiz || []
      });

      setActiveTab('preview');
    } catch (err) {
      alert(`Error analyzing article: ${err.message}`);
    } finally {
      setIsLoading(false);
      setLoadingStep('Processing article...');
    }
  };

  const handleSelectSample = (sample) => {
    const seoTitle = buildSeoBlogTitle({
      sourceName: sample.sourceName,
      dateStr: sample.date,
      headline: sample.title
    });

    const aiThumbnailUrl = generateAiThumbnail({
      title: seoTitle,
      sourceName: sample.sourceName,
      date: sample.date,
      topic: sample.bannerTopic
    });

    setPostData({
      title: seoTitle,
      date: sample.date,
      sourceName: sample.sourceName,
      bannerTopic: sample.bannerTopic,
      mainImageUrl: aiThumbnailUrl,
      words: sample.words,
      idiomsAndPhrases: sample.idiomsAndPhrases || [],
      quizQuestions: sample.quizQuestions || []
    });
    setActiveTab('preview');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header 
        apiKey={apiKey} 
        setApiKey={setApiKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex gap-1.5 p-1.5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl mb-8 overflow-x-auto no-scrollbar w-full shadow-inner">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 min-w-[140px] px-4 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'input' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Upload Screenshot / Text</span>
          </button>
          
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 min-w-[140px] px-4 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'edit' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
          >
            <Edit3 className="w-4 h-4" />
            <span>2. Edit Vocabulary &amp; Quiz ({postData.words.length} Words)</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 min-w-[140px] px-4 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'preview' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
          >
            <Eye className="w-4 h-4" />
            <span>3. Blogger Theme Live Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 min-w-[140px] px-4 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'export' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
          >
            <Share2 className="w-4 h-4" />
            <span>4. Auto-Publish to Blogger</span>
          </button>
        </div>

        {/* Dynamic Tab Views */}
        <div className="w-full relative" key={activeTab}>
          {activeTab === 'input' && (
            <div className="animate-fade-slide-in">
            <InputSection
              onProcessText={handleProcessText}
              isLoading={isLoading}
              loadingStep={loadingStep}
              onSelectSample={handleSelectSample}
              wordCountTarget={wordCountTarget}
              setWordCountTarget={setWordCountTarget}
            />
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="animate-fade-slide-in">
            <VocabEditor 
              postData={postData} 
              setPostData={setPostData} 
            />
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="animate-fade-slide-in">
            <BloggerPreview 
              postData={postData} 
              currentTheme={currentTheme} 
            />
            </div>
          )}

          {activeTab === 'export' && (
            <div className="animate-fade-slide-in">
            <HtmlExporter 
              postData={postData} 
              currentTheme={currentTheme} 
            />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

// Trigger Vercel rebuild for stable quiz release
