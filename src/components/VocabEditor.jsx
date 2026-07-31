import React, { useState } from 'react';
import { Edit2, Plus, Trash2, Check, ImageIcon, BookOpen, Link as LinkIcon, Sparkles, HelpCircle } from 'lucide-react';
import { generateAiThumbnail } from '../services/aiThumbnailService';

const THUMBNAIL_PRESETS = [
  { name: "Newspaper & Coffee", url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80" },
  { name: "Books & Glasses", url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80" },
  { name: "Global Economy", url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80" }
];

export default function VocabEditor({ postData, setPostData }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingIdiomIndex, setEditingIdiomIndex] = useState(null);
  const [editingQuizIndex, setEditingQuizIndex] = useState(null);
  const [isGeneratingAiBanner, setIsGeneratingAiBanner] = useState(false);

  const handleGenerateAiBanner = () => {
    setIsGeneratingAiBanner(true);
    setTimeout(() => {
      const generatedBannerUrl = generateAiThumbnail({
        title: postData.title,
        sourceName: postData.sourceName,
        date: postData.date,
        topic: postData.bannerTopic
      });
      setPostData({
        ...postData,
        mainImageUrl: generatedBannerUrl
      });
      setIsGeneratingAiBanner(false);
    }, 600);
  };

  const handleUpdateWord = (index, field, value) => {
    const updatedWords = [...(postData.words || [])];
    updatedWords[index] = {
      ...updatedWords[index],
      [field]: value
    };
    setPostData({
      ...postData,
      words: updatedWords
    });
  };

  const handleArrayUpdate = (index, field, valueString) => {
    const arr = valueString.split(',').map(s => s.trim()).filter(Boolean);
    handleUpdateWord(index, field, arr);
  };

  const handleAddWord = () => {
    const newWordObj = {
      word: "New Word",
      pos: "adjective",
      pronunciation: "/pronunciation/",
      meaningEn: "Definition of the new word.",
      meaningHi: "नये शब्द का हिंदी अर्थ",
      context: "Example sentence from editorial...",
      synonyms: ["Synonym1", "Synonym2"],
      antonyms: ["Antonym1", "Antonym2"],
      memoryTrick: "याद रखने की धांसू ट्रिक...",
      rootWord: "Root word origin"
    };

    setPostData({
      ...postData,
      words: [...(postData.words || []), newWordObj]
    });
    setEditingIndex((postData.words || []).length);
  };

  const handleDeleteWord = (index) => {
    if (window.confirm(`Delete "${postData.words[index].word}" from this blog post?`)) {
      const updatedWords = postData.words.filter((_, i) => i !== index);
      setPostData({
        ...postData,
        words: updatedWords
      });
      if (editingIndex === index) setEditingIndex(null);
    }
  };

  /* Idioms & Phrases Handlers */
  const handleUpdateIdiom = (index, field, value) => {
    const updatedIdioms = [...(postData.idiomsAndPhrases || [])];
    updatedIdioms[index] = {
      ...updatedIdioms[index],
      [field]: value
    };
    setPostData({
      ...postData,
      idiomsAndPhrases: updatedIdioms
    });
  };

  const handleAddIdiom = () => {
    const newIdiomObj = {
      phrase: "New Idiom / Phrase",
      meaningEn: "Meaning in English",
      meaningHi: "हिंदी में अर्थ",
      sentence: "Example sentence from editorial context...",
      memoryTrick: "याद रखने की ट्रिक..."
    };

    setPostData({
      ...postData,
      idiomsAndPhrases: [...(postData.idiomsAndPhrases || []), newIdiomObj]
    });
    setEditingIdiomIndex((postData.idiomsAndPhrases || []).length);
  };

  const handleDeleteIdiom = (index) => {
    if (window.confirm(`Delete phrase #${index + 1}?`)) {
      const updatedIdioms = (postData.idiomsAndPhrases || []).filter((_, i) => i !== index);
      setPostData({
        ...postData,
        idiomsAndPhrases: updatedIdioms
      });
      if (editingIdiomIndex === index) setEditingIdiomIndex(null);
    }
  };

  /* Quiz Handlers */
  const handleUpdateQuiz = (index, field, value) => {
    const updatedQuiz = [...(postData.quizQuestions || [])];
    updatedQuiz[index] = {
      ...updatedQuiz[index],
      [field]: value
    };
    setPostData({
      ...postData,
      quizQuestions: updatedQuiz
    });
  };

  const handleAddQuiz = () => {
    const newQuizObj = {
      id: (postData.quizQuestions || []).length + 1,
      question: "Sample Vocabulary Question?",
      options: ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      correctOption: "A",
      explanation: "Explanation for why option A is correct."
    };

    setPostData({
      ...postData,
      quizQuestions: [...(postData.quizQuestions || []), newQuizObj]
    });
    setEditingQuizIndex((postData.quizQuestions || []).length);
  };

  const handleDeleteQuiz = (index) => {
    if (window.confirm(`Delete Quiz Question #${index + 1}?`)) {
      const updatedQuiz = (postData.quizQuestions || []).filter((_, i) => i !== index);
      setPostData({
        ...postData,
        quizQuestions: updatedQuiz
      });
      if (editingQuizIndex === index) setEditingQuizIndex(null);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      
      {/* Blog Post Metadata Header Editor */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <h3 className="text-xl sm:text-2xl font-extrabold flex items-center gap-3 mb-6 text-white border-b border-slate-800 pb-4">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <span>SEO Blog Post Title &amp; AI Cover Banner Settings</span>
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="input-label">High-Ranking SEO Blog Post Title</label>
            <input 
              type="text" 
              value={postData.title}
              onChange={(e) => setPostData({ ...postData, title: e.target.value })}
              className="input-field font-bold text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="input-label">Publication Date</label>
              <input 
                type="date" 
                value={postData.date}
                onChange={(e) => setPostData({ ...postData, date: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Newspaper Source</label>
              <input 
                type="text" 
                value={postData.sourceName}
                onChange={(e) => setPostData({ ...postData, sourceName: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Specific Editorial Topic</label>
              <input 
                type="text" 
                value={postData.bannerTopic || ''}
                onChange={(e) => setPostData({ ...postData, bannerTopic: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* AI BANNER RE-GENERATE CONTROLS */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <div className="p-2 bg-indigo-500/10 rounded-lg"><ImageIcon className="w-4 h-4 text-indigo-400" /></div>
                <span>Blog Post Cover Thumbnail Banner</span>
              </div>

              <button 
                onClick={handleGenerateAiBanner}
                disabled={isGeneratingAiBanner}
                className="btn-primary py-2 px-4 text-sm"
              >
                {isGeneratingAiBanner ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Re-Generate AI Cover Banner</span>
              </button>
            </div>

            {postData.mainImageUrl && (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center p-2 group">
                <img src={postData.mainImageUrl} alt="Post Cover Preview" className="max-h-64 w-auto object-contain rounded-lg group-hover:scale-[1.02] transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded backdrop-blur-md">Preview</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Words List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <div className="w-2 h-8 bg-indigo-500 rounded-full" />
          Words List <span className="text-slate-500 text-lg">({postData.words.length})</span>
        </h3>
        <button onClick={handleAddWord} className="btn-secondary">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Word</span>
        </button>
      </div>

      {/* Words Cards List */}
      <div className="flex flex-col gap-4">
        {postData.words.map((item, index) => {
          const isEditing = editingIndex === index;

          return (
            <div key={index} className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${isEditing ? 'border-indigo-500/50 shadow-indigo-500/10' : 'border-slate-800 hover:border-indigo-500/30'}`}>
              <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-900/80 border-b border-slate-800">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-sm shadow-inner">{index + 1}</span>
                  <span className="text-lg sm:text-xl font-bold text-white">{item.word}</span>
                  {item.pos && <span className="text-xs font-bold text-slate-400 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-md uppercase tracking-wider">{item.pos}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingIndex(isEditing ? null : index)}
                    className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                  >
                    {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteWord(index)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:text-rose-200 hover:bg-rose-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!isEditing && (
                <div className="p-4 sm:p-5 space-y-3 bg-slate-950/30">
                  <div className="text-sm sm:text-base text-slate-300 leading-relaxed"><strong className="text-slate-500 mr-2">Eng:</strong> {item.meaningEn || item.meaning}</div>
                  <div className="text-sm sm:text-base text-emerald-400 leading-relaxed font-hindi"><strong className="text-slate-500 mr-2">🇮🇳 Hindi:</strong> {item.meaningHi || item.hindiMeaning || '—'}</div>
                  {item.context && <div className="text-sm sm:text-base italic text-slate-400 border-l-2 border-slate-700 pl-3">"{item.context}"</div>}
                </div>
              )}

              {isEditing && (
                <div className="p-5 sm:p-6 space-y-6 bg-slate-900/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="input-label">Word</label>
                      <input type="text" value={item.word} onChange={(e) => handleUpdateWord(index, 'word', e.target.value)} className="input-field font-bold text-lg text-indigo-100" />
                    </div>
                    <div>
                      <label className="input-label">Part of Speech</label>
                      <input type="text" value={item.pos || ''} onChange={(e) => handleUpdateWord(index, 'pos', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="input-label">Pronunciation</label>
                      <input type="text" value={item.pronunciation || ''} onChange={(e) => handleUpdateWord(index, 'pronunciation', e.target.value)} className="input-field" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="input-label">English Definition</label>
                      <textarea rows={2} value={item.meaningEn || item.meaning || ''} onChange={(e) => handleUpdateWord(index, 'meaningEn', e.target.value)} className="input-field resize-y" />
                    </div>
                    <div>
                      <label className="input-label text-emerald-400">Hindi Meaning (हिंदी अर्थ)</label>
                      <textarea rows={2} value={item.meaningHi || item.hindiMeaning || ''} onChange={(e) => handleUpdateWord(index, 'meaningHi', e.target.value)} className="input-field resize-y font-hindi text-emerald-100 border-emerald-900/50 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Editorial Context Sentence</label>
                    <textarea rows={2} value={item.context || ''} onChange={(e) => handleUpdateWord(index, 'context', e.target.value)} className="input-field resize-y text-slate-300 italic" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="input-label">Synonyms (Comma separated)</label>
                      <input type="text" value={(item.synonyms || []).join(', ')} onChange={(e) => handleArrayUpdate(index, 'synonyms', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="input-label">Antonyms (Comma separated)</label>
                      <input type="text" value={(item.antonyms || []).join(', ')} onChange={(e) => handleArrayUpdate(index, 'antonyms', e.target.value)} className="input-field" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                    <div>
                      <label className="input-label flex items-center gap-2 text-amber-400"><Sparkles className="w-4 h-4" /> Mnemonic Trick</label>
                      <textarea rows={2} value={item.memoryTrick || ''} onChange={(e) => handleUpdateWord(index, 'memoryTrick', e.target.value)} className="input-field resize-y font-hindi text-amber-100 border-amber-900/50 focus:border-amber-500 focus:ring-amber-500" placeholder="याद रखने की ट्रिक..." />
                    </div>
                    <div>
                      <label className="input-label flex items-center gap-2 text-cyan-400">🌱 Root Word</label>
                      <textarea rows={2} value={item.rootWord || ''} onChange={(e) => handleUpdateWord(index, 'rootWord', e.target.value)} className="input-field resize-y text-cyan-100 border-cyan-900/50 focus:border-cyan-500 focus:ring-cyan-500" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* IDIOMS & PHRASES SECTION */}
      <div className="flex items-center justify-between mt-12 mb-6 pt-6 border-t border-slate-800">
        <h3 className="text-2xl font-extrabold text-amber-400 flex items-center gap-3">
          <div className="w-2 h-8 bg-amber-500 rounded-full" />
          Idioms &amp; Phrases <span className="text-slate-500 text-lg">({(postData.idiomsAndPhrases || []).length})</span>
        </h3>
        <button onClick={handleAddIdiom} className="btn-secondary border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-300">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Idiom</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {(postData.idiomsAndPhrases || []).map((item, index) => {
          const isEditing = editingIdiomIndex === index;

          return (
            <div key={index} className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${isEditing ? 'border-amber-500/50 shadow-amber-500/10' : 'border-slate-800 hover:border-amber-500/30'}`}>
              <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-900/80 border-b border-slate-800">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center font-black text-sm shadow-inner">{index + 1}</span>
                  <span className="text-lg sm:text-xl font-bold text-amber-100">"{item.phrase}"</span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingIdiomIndex(isEditing ? null : index)}
                    className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-amber-500 text-black shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                  >
                    {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteIdiom(index)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:text-rose-200 hover:bg-rose-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!isEditing && (
                <div className="p-4 sm:p-5 space-y-3 bg-slate-950/30">
                  <div className="text-sm sm:text-base text-slate-300 leading-relaxed"><strong className="text-slate-500 mr-2">Eng:</strong> {item.meaningEn}</div>
                  <div className="text-sm sm:text-base text-amber-400 leading-relaxed font-hindi"><strong className="text-slate-500 mr-2">🇮🇳 Hindi:</strong> {item.meaningHi}</div>
                  {item.sentence && <div className="text-sm sm:text-base italic text-slate-400 border-l-2 border-slate-700 pl-3">"{item.sentence}"</div>}
                </div>
              )}

              {isEditing && (
                <div className="p-5 sm:p-6 space-y-6 bg-slate-900/50">
                  <div>
                    <label className="input-label text-amber-400">Idiom / Phrase</label>
                    <input type="text" value={item.phrase} onChange={(e) => handleUpdateIdiom(index, 'phrase', e.target.value)} className="input-field font-bold text-lg text-amber-100 border-amber-900/50 focus:border-amber-500 focus:ring-amber-500" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="input-label">English Meaning</label>
                      <input type="text" value={item.meaningEn} onChange={(e) => handleUpdateIdiom(index, 'meaningEn', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="input-label text-amber-400">Hindi Meaning (हिंदी अर्थ)</label>
                      <input type="text" value={item.meaningHi} onChange={(e) => handleUpdateIdiom(index, 'meaningHi', e.target.value)} className="input-field font-hindi" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Context Sentence from Editorial</label>
                    <textarea rows={2} value={item.sentence || ''} onChange={(e) => handleUpdateIdiom(index, 'sentence', e.target.value)} className="input-field resize-y italic text-slate-300" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PRACTICE QUIZ SECTION */}
      <div className="flex items-center justify-between mt-12 mb-6 pt-6 border-t border-slate-800">
        <h3 className="text-2xl font-extrabold text-cyan-400 flex items-center gap-3">
          <div className="w-2 h-8 bg-cyan-500 rounded-full" />
          Practice Quiz Questions <span className="text-slate-500 text-lg">({(postData.quizQuestions || []).length})</span>
        </h3>
        <button onClick={handleAddQuiz} className="btn-secondary border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Question</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {(postData.quizQuestions || []).map((q, index) => {
          const isEditing = editingQuizIndex === index;

          return (
            <div key={index} className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${isEditing ? 'border-cyan-500/50 shadow-cyan-500/10' : 'border-slate-800 hover:border-cyan-500/30'}`}>
              <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-900/80 border-b border-slate-800">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="w-8 h-8 rounded-lg bg-cyan-500 text-black flex items-center justify-center font-black text-sm shadow-inner">Q{index + 1}</span>
                  <span className="text-lg sm:text-xl font-bold text-cyan-100">{q.question}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingQuizIndex(isEditing ? null : index)}
                    className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-cyan-500 text-black shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                  >
                    {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteQuiz(index)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:text-rose-200 hover:bg-rose-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!isEditing && (
                <div className="p-4 sm:p-5 space-y-3 bg-slate-950/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base text-slate-300">
                    {(q.options || []).map((opt, i) => (
                      <div key={i} className={`p-2 rounded-lg border ${['A', 'B', 'C', 'D'][i] === q.correctOption ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800/50 border-slate-700'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm sm:text-base text-cyan-400 leading-relaxed font-hindi bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10 mt-3">
                    <strong className="text-slate-500 mr-2">💡 Explanation:</strong> {q.explanation}
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="p-5 sm:p-6 space-y-6 bg-slate-900/50">
                  <div>
                    <label className="input-label text-cyan-400">Quiz Question</label>
                    <input type="text" value={q.question} onChange={(e) => handleUpdateQuiz(index, 'question', e.target.value)} className="input-field font-bold text-lg text-cyan-100 border-cyan-900/50 focus:border-cyan-500 focus:ring-cyan-500" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {['A', 'B', 'C', 'D'].map((letter, i) => (
                      <div key={i}>
                        <label className="input-label">Option {letter}</label>
                        <input type="text" value={(q.options && q.options[i]) || ''} onChange={(e) => {
                          const opts = [...(q.options || [])];
                          opts[i] = e.target.value;
                          handleUpdateQuiz(index, 'options', opts);
                        }} className="input-field" />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                    <div>
                      <label className="input-label text-emerald-400">Correct Option Choice</label>
                      <select value={q.correctOption || 'A'} onChange={(e) => handleUpdateQuiz(index, 'correctOption', e.target.value)} className="input-field border-emerald-900/50 focus:border-emerald-500 focus:ring-emerald-500 cursor-pointer">
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                    <div>
                      <label className="input-label flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /> Explanation (व्याख्या)</label>
                      <textarea rows={2} value={q.explanation || ''} onChange={(e) => handleUpdateQuiz(index, 'explanation', e.target.value)} className="input-field resize-y font-hindi" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
