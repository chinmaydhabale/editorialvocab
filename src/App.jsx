import React, { useState } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import VocabEditor from './components/VocabEditor';
import BloggerPreview from './components/BloggerPreview';
import HtmlExporter from './components/HtmlExporter';
import { analyzeEditorialWithGemini } from './services/geminiService';
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
  const [currentTheme, setCurrentTheme] = useState('slate');
  const [activeTab, setActiveTab] = useState('input');
  const [isLoading, setIsLoading] = useState(false);
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
    idiomsAndPhrases: SAMPLE_EDITORIALS[0].idiomsAndPhrases || []
  });

  const handleProcessText = async ({ text, title, sourceName, wordCount }) => {
    setIsLoading(true);

    try {
      let result = { articleTitle: '', articleTopic: '', words: [], idiomsAndPhrases: [] };

      if (apiKey && apiKey.trim() !== "") {
        result = await analyzeEditorialWithGemini(apiKey, text, wordCount, selectedModel);
      } else {
        alert('Notice: Gemini API key is missing. Loading pre-formatted sample vocabulary. To analyze custom articles, add your Gemini API key in the top right.');
        result = {
          articleTitle: SAMPLE_EDITORIALS[0].title,
          articleTopic: SAMPLE_EDITORIALS[0].bannerTopic,
          words: SAMPLE_EDITORIALS[0].words,
          idiomsAndPhrases: SAMPLE_EDITORIALS[0].idiomsAndPhrases || []
        };
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
        idiomsAndPhrases: result.idiomsAndPhrases || []
      });

      setActiveTab('preview');
    } catch (err) {
      alert(`Error analyzing article: ${err.message}`);
    } finally {
      setIsLoading(false);
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
      idiomsAndPhrases: sample.idiomsAndPhrases || []
    });
    setActiveTab('preview');
  };

  return (
    <div className="app-container">
      {/* Header & API Configuration */}
      <Header 
        apiKey={apiKey} 
        setApiKey={setApiKey} 
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

      {/* Main Navigation Tabs */}
      <nav className="main-app-nav">
        <button 
          className={`nav-tab-btn ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          <FileText className="w-4 h-4" />
          <span>1. Input Article</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          <Edit3 className="w-4 h-4" />
          <span>2. Edit Vocab & Title ({(postData.words || []).length} Words, {(postData.idiomsAndPhrases || []).length} Idioms)</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <Eye className="w-4 h-4" />
          <span>3. Live Preview</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          <Share2 className="w-4 h-4" />
          <span>4. Copy & Export Blogger Code</span>
        </button>
      </nav>

      {/* Main Active Tab Content */}
      <main>
        {activeTab === 'input' && (
          <InputSection 
            onProcessText={handleProcessText}
            onSelectSample={handleSelectSample}
            isLoading={isLoading}
            apiKey={apiKey}
            wordCountTarget={wordCountTarget}
            setWordCountTarget={setWordCountTarget}
          />
        )}

        {activeTab === 'editor' && (
          <VocabEditor 
            postData={postData}
            setPostData={setPostData}
          />
        )}

        {activeTab === 'preview' && (
          <BloggerPreview 
            postData={postData}
            currentTheme={currentTheme}
          />
        )}

        {activeTab === 'export' && (
          <HtmlExporter 
            postData={postData}
            currentTheme={currentTheme}
          />
        )}
      </main>
    </div>
  );
}
