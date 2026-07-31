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
    <div className="vocab-editor-container">
      
      {/* Blog Post Metadata Header Editor */}
      <div className="editor-card mb-6">
        <h3 className="editor-section-title">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>SEO Blog Post Title &amp; AI Cover Banner Settings</span>
        </h3>
        
        <div className="input-group mb-4">
          <label>High-Ranking SEO Blog Post Title</label>
          <input 
            type="text" 
            value={postData.title}
            onChange={(e) => setPostData({ ...postData, title: e.target.value })}
            className="text-input font-bold"
          />
        </div>

        <div className="edit-grid-3 mb-4">
          <div className="input-group">
            <label>Publication Date</label>
            <input 
              type="date" 
              value={postData.date}
              onChange={(e) => setPostData({ ...postData, date: e.target.value })}
              className="text-input"
            />
          </div>

          <div className="input-group">
            <label>Newspaper Source</label>
            <input 
              type="text" 
              value={postData.sourceName}
              onChange={(e) => setPostData({ ...postData, sourceName: e.target.value })}
              className="text-input"
            />
          </div>

          <div className="input-group">
            <label>Specific Editorial Topic</label>
            <input 
              type="text" 
              value={postData.bannerTopic || ''}
              onChange={(e) => setPostData({ ...postData, bannerTopic: e.target.value })}
              className="text-input"
            />
          </div>
        </div>

        {/* AI BANNER RE-GENERATE CONTROLS */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>Blog Post Cover Thumbnail Banner</span>
            </div>

            <button 
              onClick={handleGenerateAiBanner}
              disabled={isGeneratingAiBanner}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '13px' }}
            >
              {isGeneratingAiBanner ? <div className="spinner" /> : <Sparkles className="w-4 h-4" />}
              <span>Re-Generate AI Cover Banner</span>
            </button>
          </div>

          {postData.mainImageUrl && (
            <div className="relative rounded-lg overflow-hidden border border-slate-700 max-h-48 flex items-center justify-center bg-slate-950">
              <img src={postData.mainImageUrl} alt="Post Cover Preview" className="max-h-48 w-auto object-contain" />
            </div>
          )}
        </div>
      </div>

      {/* Words List Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">
          <span>Words List ({postData.words.length})</span>
        </h3>
        <button onClick={handleAddWord} className="btn-secondary text-sm">
          <Plus className="w-4 h-4" />
          <span>Add Word</span>
        </button>
      </div>

      {/* Words Cards List */}
      <div className="words-cards-list">
        {postData.words.map((item, index) => {
          const isEditing = editingIndex === index;

          return (
            <div key={index} className={`word-editor-card ${isEditing ? 'editing' : ''}`}>
              <div className="word-card-header">
                <div className="word-title-group">
                  <span className="word-number">{index + 1}</span>
                  <span className="word-title-text">{item.word}</span>
                  {item.pos && <span className="word-pos">({item.pos})</span>}
                </div>

                <div className="word-card-actions">
                  <button 
                    onClick={() => setEditingIndex(isEditing ? null : index)}
                    className={`btn-icon-action ${isEditing ? 'active' : ''}`}
                  >
                    {isEditing ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteWord(index)}
                    className="btn-icon-action delete"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>

              {!isEditing && (
                <div className="word-summary-view">
                  <div className="summary-line"><strong>Eng:</strong> {item.meaningEn || item.meaning}</div>
                  <div className="summary-line text-emerald-400 font-hindi">🇮🇳 <strong>Hindi:</strong> {item.meaningHi || item.hindiMeaning || '—'}</div>
                  {item.context && <div className="summary-line italic text-slate-400">"{item.context}"</div>}
                </div>
              )}

              {isEditing && (
                <div className="word-edit-form">
                  <div className="edit-grid-3 mb-2">
                    <div className="input-group">
                      <label>Word</label>
                      <input type="text" value={item.word} onChange={(e) => handleUpdateWord(index, 'word', e.target.value)} className="text-input font-bold" />
                    </div>
                    <div className="input-group">
                      <label>Part of Speech</label>
                      <input type="text" value={item.pos || ''} onChange={(e) => handleUpdateWord(index, 'pos', e.target.value)} className="text-input" />
                    </div>
                    <div className="input-group">
                      <label>Pronunciation (Phonetic / Hindi)</label>
                      <input type="text" value={item.pronunciation || ''} onChange={(e) => handleUpdateWord(index, 'pronunciation', e.target.value)} className="text-input" />
                    </div>
                  </div>

                  <div className="edit-grid-2 mb-2">
                    <div className="input-group">
                      <label>English Definition</label>
                      <textarea rows={2} value={item.meaningEn || item.meaning || ''} onChange={(e) => handleUpdateWord(index, 'meaningEn', e.target.value)} className="text-input" />
                    </div>
                    <div className="input-group">
                      <label>Hindi Meaning (हिंदी अर्थ)</label>
                      <textarea rows={2} value={item.meaningHi || item.hindiMeaning || ''} onChange={(e) => handleUpdateWord(index, 'meaningHi', e.target.value)} className="text-input font-hindi" />
                    </div>
                  </div>

                  <div className="input-group mb-2">
                    <label>Editorial Context Sentence</label>
                    <input type="text" value={item.context || ''} onChange={(e) => handleUpdateWord(index, 'context', e.target.value)} className="text-input" />
                  </div>

                  <div className="edit-grid-2 mb-2">
                    <div className="input-group">
                      <label>Synonyms (Comma separated)</label>
                      <input type="text" value={(item.synonyms || []).join(', ')} onChange={(e) => handleArrayUpdate(index, 'synonyms', e.target.value)} className="text-input" />
                    </div>
                    <div className="input-group">
                      <label>Antonyms (Comma separated)</label>
                      <input type="text" value={(item.antonyms || []).join(', ')} onChange={(e) => handleArrayUpdate(index, 'antonyms', e.target.value)} className="text-input" />
                    </div>
                  </div>

                  <div className="edit-grid-2">
                    <div className="input-group">
                      <label className="text-amber-400">💡 Mnemonic Trick (याद रखने की ट्रिक)</label>
                      <textarea rows={2} value={item.memoryTrick || ''} onChange={(e) => handleUpdateWord(index, 'memoryTrick', e.target.value)} className="text-input font-hindi" />
                    </div>
                    <div className="input-group">
                      <label>🌱 Root Word Breakdown</label>
                      <textarea rows={2} value={item.rootWord || ''} onChange={(e) => handleUpdateWord(index, 'rootWord', e.target.value)} className="text-input" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* IDIOMS & PHRASES SECTION */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <h3 className="section-title text-amber-400">
          <span>Idioms &amp; Phrases ({(postData.idiomsAndPhrases || []).length})</span>
        </h3>
        <button onClick={handleAddIdiom} className="btn-secondary text-sm">
          <Plus className="w-4 h-4" />
          <span>Add Idiom</span>
        </button>
      </div>

      <div className="words-cards-list mb-8">
        {(postData.idiomsAndPhrases || []).map((item, index) => {
          const isEditing = editingIdiomIndex === index;

          return (
            <div key={index} className={`word-editor-card ${isEditing ? 'editing' : ''}`}>
              <div className="word-card-header">
                <div className="word-title-group">
                  <span className="word-number" style={{ backgroundColor: '#f59e0b', color: '#000' }}>
                    Phrase #{index + 1}
                  </span>
                  <span className="word-title-text text-emerald-400">"{item.phrase}"</span>
                </div>

                <div className="word-card-actions">
                  <button 
                    onClick={() => setEditingIdiomIndex(isEditing ? null : index)}
                    className={`btn-icon-action ${isEditing ? 'active' : ''}`}
                  >
                    {isEditing ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteIdiom(index)}
                    className="btn-icon-action delete"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>

              {!isEditing && (
                <div className="word-summary-view">
                  <div className="summary-line"><strong>Eng:</strong> {item.meaningEn}</div>
                  <div className="summary-line text-emerald-400 font-hindi">🇮🇳 <strong>Hindi:</strong> {item.meaningHi}</div>
                  {item.sentence && <div className="summary-line italic text-slate-400">"{item.sentence}"</div>}
                </div>
              )}

              {isEditing && (
                <div className="word-edit-form">
                  <div className="input-group mb-2">
                    <label>Idiom / Phrase</label>
                    <input type="text" value={item.phrase} onChange={(e) => handleUpdateIdiom(index, 'phrase', e.target.value)} className="text-input" />
                  </div>
                  <div className="edit-grid-2 mb-2">
                    <div className="input-group">
                      <label>English Meaning</label>
                      <input type="text" value={item.meaningEn} onChange={(e) => handleUpdateIdiom(index, 'meaningEn', e.target.value)} className="text-input" />
                    </div>
                    <div className="input-group">
                      <label>Hindi Meaning (हिंदी अर्थ)</label>
                      <input type="text" value={item.meaningHi} onChange={(e) => handleUpdateIdiom(index, 'meaningHi', e.target.value)} className="text-input font-hindi" />
                    </div>
                  </div>
                  <div className="input-group mb-2">
                    <label>Context Sentence from Editorial</label>
                    <input type="text" value={item.sentence || ''} onChange={(e) => handleUpdateIdiom(index, 'sentence', e.target.value)} className="text-input" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PRACTICE QUIZ SECTION */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <h3 className="section-title text-indigo-400 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <span>Interactive Practice Quiz Questions ({(postData.quizQuestions || []).length})</span>
        </h3>
        <button onClick={handleAddQuiz} className="btn-secondary text-sm">
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      <div className="words-cards-list">
        {(postData.quizQuestions || []).map((q, index) => {
          const isEditing = editingQuizIndex === index;

          return (
            <div key={index} className={`word-editor-card ${isEditing ? 'editing' : ''}`}>
              <div className="word-card-header">
                <div className="word-title-group">
                  <span className="word-number" style={{ backgroundColor: '#6366f1', color: '#fff' }}>
                    Q{index + 1}
                  </span>
                  <span className="word-title-text text-indigo-300">{q.question}</span>
                </div>

                <div className="word-card-actions">
                  <button 
                    onClick={() => setEditingQuizIndex(isEditing ? null : index)}
                    className={`btn-icon-action ${isEditing ? 'active' : ''}`}
                  >
                    {isEditing ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteQuiz(index)}
                    className="btn-icon-action delete"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>

              {!isEditing && (
                <div className="word-summary-view">
                  <div className="summary-line"><strong>Options:</strong> {(q.options || []).join(' | ')}</div>
                  <div className="summary-line text-emerald-400"><strong>Correct Answer:</strong> Option {q.correctOption}</div>
                  <div className="summary-line text-slate-400 font-hindi">💡 <strong>Explanation:</strong> {q.explanation}</div>
                </div>
              )}

              {isEditing && (
                <div className="word-edit-form">
                  <div className="input-group mb-2">
                    <label>Quiz Question Text</label>
                    <input type="text" value={q.question} onChange={(e) => handleUpdateQuiz(index, 'question', e.target.value)} className="text-input font-bold" />
                  </div>

                  <div className="edit-grid-2 mb-2">
                    <div className="input-group">
                      <label>Option A</label>
                      <input type="text" value={(q.options && q.options[0]) || ''} onChange={(e) => {
                        const opts = [...(q.options || [])];
                        opts[0] = e.target.value;
                        handleUpdateQuiz(index, 'options', opts);
                      }} className="text-input" />
                    </div>
                    <div className="input-group">
                      <label>Option B</label>
                      <input type="text" value={(q.options && q.options[1]) || ''} onChange={(e) => {
                        const opts = [...(q.options || [])];
                        opts[1] = e.target.value;
                        handleUpdateQuiz(index, 'options', opts);
                      }} className="text-input" />
                    </div>
                    <div className="input-group">
                      <label>Option C</label>
                      <input type="text" value={(q.options && q.options[2]) || ''} onChange={(e) => {
                        const opts = [...(q.options || [])];
                        opts[2] = e.target.value;
                        handleUpdateQuiz(index, 'options', opts);
                      }} className="text-input" />
                    </div>
                    <div className="input-group">
                      <label>Option D</label>
                      <input type="text" value={(q.options && q.options[3]) || ''} onChange={(e) => {
                        const opts = [...(q.options || [])];
                        opts[3] = e.target.value;
                        handleUpdateQuiz(index, 'options', opts);
                      }} className="text-input" />
                    </div>
                  </div>

                  <div className="edit-grid-2">
                    <div className="input-group">
                      <label>Correct Option Choice</label>
                      <select value={q.correctOption || 'A'} onChange={(e) => handleUpdateQuiz(index, 'correctOption', e.target.value)} className="text-input">
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="text-emerald-400">💡 Explanation (व्याख्या)</label>
                      <textarea rows={2} value={q.explanation || ''} onChange={(e) => handleUpdateQuiz(index, 'explanation', e.target.value)} className="text-input font-hindi" />
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
