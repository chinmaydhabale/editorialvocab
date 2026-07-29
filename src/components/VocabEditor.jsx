import React, { useState } from 'react';
import { Edit2, Plus, Trash2, Check, ImageIcon, BookOpen, Link as LinkIcon, Sparkles } from 'lucide-react';
import { generateAiThumbnail } from '../services/aiThumbnailService';

const THUMBNAIL_PRESETS = [
  { name: "Newspaper & Coffee", url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80" },
  { name: "Books & Glasses", url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80" },
  { name: "Global Economy", url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80" }
];

export default function VocabEditor({ postData, setPostData }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingIdiomIndex, setEditingIdiomIndex] = useState(null);
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
    const updatedIdioms = (postData.idiomsAndPhrases || []).filter((_, i) => i !== index);
    setPostData({
      ...postData,
      idiomsAndPhrases: updatedIdioms
    });
  };

  return (
    <div className="vocab-editor-card">
      <div className="editor-card-header">
        <div>
          <h2 className="section-title">
            <Edit2 className="title-icon text-indigo-400" />
            Vocabulary & Idioms Editor
          </h2>
          <p className="section-desc">
            Edit post details, words, idioms, or generate an AI blog cover thumbnail.
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={handleAddWord} className="btn-add-word">
            <Plus className="btn-icon" />
            <span>Add Word</span>
          </button>
          <button onClick={handleAddIdiom} className="btn-add-word" style={{ backgroundColor: '#10b981' }}>
            <Plus className="btn-icon" />
            <span>Add Idiom</span>
          </button>
        </div>
      </div>

      {/* Post Metadata Header & AI THUMBNAIL GENERATOR */}
      <div className="post-metadata-editor">
        <div className="input-group">
          <label>Blog Post Title</label>
          <input 
            type="text" 
            value={postData.title}
            onChange={(e) => setPostData({ ...postData, title: e.target.value })}
            className="text-input"
          />
        </div>
        <div className="input-group">
          <label>Editorial Source & Date</label>
          <div className="grid-2">
            <input 
              type="text" 
              value={postData.sourceName}
              onChange={(e) => setPostData({ ...postData, sourceName: e.target.value })}
              className="text-input"
            />
            <input 
              type="date" 
              value={postData.date}
              onChange={(e) => setPostData({ ...postData, date: e.target.value })}
              className="text-input"
            />
          </div>
        </div>

        {/* AI THUMBNAIL GENERATOR BOX */}
        <div className="main-thumbnail-setting" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="text-amber-400 font-semibold flex items-center gap-2" style={{ margin: 0 }}>
              <ImageIcon className="w-4 h-4" />
              Main Blog Thumbnail Image Banner
            </label>

            {/* AI Banner Generator Button */}
            <button 
              onClick={handleGenerateAiBanner}
              disabled={isGeneratingAiBanner}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAiBanner ? 'Generating AI Banner...' : '✨ Generate AI Thumbnail Banner'}</span>
            </button>
          </div>
          
          <div className="grid-2" style={{ marginBottom: '10px' }}>
            <input 
              type="text" 
              placeholder="Paste main thumbnail image URL or click Generate AI Thumbnail..." 
              value={postData.mainImageUrl || ''}
              onChange={(e) => setPostData({ ...postData, mainImageUrl: e.target.value })}
              className="text-input"
            />
            
            {/* Quick Presets */}
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-xs text-slate-400">Presets:</span>
              {THUMBNAIL_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setPostData({ ...postData, mainImageUrl: preset.url })}
                  className="preset-img-btn"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid #334155',
                    color: '#cbd5e1',
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {postData.mainImageUrl && (
            <div style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155', maxHeight: '180px' }}>
              <img src={postData.mainImageUrl} alt="Thumbnail banner preview" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: WORDS CARDS LIST */}
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-indigo-400">
        <BookOpen className="w-5 h-5" />
        Tricky Words Cards ({(postData.words || []).length})
      </h3>

      <div className="words-editor-list mb-6">
        {(postData.words || []).map((w, index) => {
          const isEditing = editingIndex === index;

          return (
            <div key={index} className={`word-editor-card ${isEditing ? 'is-editing' : ''}`}>
              <div className="word-card-top-row">
                <div className="flex items-center gap-3">
                  <span className="word-number-badge">#{index + 1}</span>
                  <span className="word-title-text">{w.word}</span>
                  <span className="pos-badge">{w.pos}</span>
                  <span className="pronun-text">{w.pronunciation}</span>
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
                  <div className="summary-line"><strong>Eng:</strong> {w.meaningEn}</div>
                  <div className="summary-line text-emerald-400 font-hindi">🇮🇳 <strong>Hindi:</strong> {w.meaningHi}</div>
                  {w.memoryTrick && <div className="summary-trick font-hindi">💡 <strong>Trick:</strong> {w.memoryTrick}</div>}
                </div>
              )}

              {isEditing && (
                <div className="word-edit-form">
                  <div className="edit-grid-3">
                    <div className="input-group">
                      <label>Word</label>
                      <input type="text" value={w.word} onChange={(e) => handleUpdateWord(index, 'word', e.target.value)} className="text-input" />
                    </div>
                    <div className="input-group">
                      <label>Part of Speech</label>
                      <select value={w.pos} onChange={(e) => handleUpdateWord(index, 'pos', e.target.value)} className="select-input">
                        <option value="adjective">adjective</option>
                        <option value="noun">noun</option>
                        <option value="verb">verb</option>
                        <option value="adverb">adverb</option>
                        <option value="phrase">phrase</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Pronunciation (IPA)</label>
                      <input type="text" value={w.pronunciation || ''} onChange={(e) => handleUpdateWord(index, 'pronunciation', e.target.value)} className="text-input" />
                    </div>
                  </div>

                  <div className="edit-grid-2">
                    <div className="input-group">
                      <label>English Definition</label>
                      <textarea rows={2} value={w.meaningEn} onChange={(e) => handleUpdateWord(index, 'meaningEn', e.target.value)} className="text-input" />
                    </div>
                    <div className="input-group">
                      <label>Hindi Meaning (हिंदी अर्थ)</label>
                      <textarea rows={2} value={w.meaningHi} onChange={(e) => handleUpdateWord(index, 'meaningHi', e.target.value)} className="text-input font-hindi" />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Editorial Context Sentence</label>
                    <input type="text" value={w.context || ''} onChange={(e) => handleUpdateWord(index, 'context', e.target.value)} className="text-input" />
                  </div>

                  <div className="edit-grid-2">
                    <div className="input-group">
                      <label>Synonyms (Comma separated)</label>
                      <input type="text" value={(w.synonyms || []).join(', ')} onChange={(e) => handleArrayUpdate(index, 'synonyms', e.target.value)} className="text-input" />
                    </div>
                    <div className="input-group">
                      <label>Antonyms (Comma separated)</label>
                      <input type="text" value={(w.antonyms || []).join(', ')} onChange={(e) => handleArrayUpdate(index, 'antonyms', e.target.value)} className="text-input" />
                    </div>
                  </div>

                  <div className="edit-grid-2">
                    <div className="input-group">
                      <label className="text-amber-400">💡 Memory Trick (याद करने की Trick)</label>
                      <textarea rows={2} value={w.memoryTrick || ''} onChange={(e) => handleUpdateWord(index, 'memoryTrick', e.target.value)} className="text-input font-hindi" />
                    </div>
                    <div className="input-group">
                      <label className="text-purple-400">🌱 Root Word / Etymology</label>
                      <textarea rows={2} value={w.rootWord || ''} onChange={(e) => handleUpdateWord(index, 'rootWord', e.target.value)} className="text-input" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SECTION 2: DEDICATED IDIOMS & PHRASES LIST */}
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-emerald-400" style={{ marginTop: '24px' }}>
        <LinkIcon className="w-5 h-5" />
        Dedicated Idioms & Phrases Section ({(postData.idiomsAndPhrases || []).length})
      </h3>

      <div className="idioms-editor-list">
        {(postData.idiomsAndPhrases || []).map((item, index) => {
          const isEditing = editingIdiomIndex === index;

          return (
            <div key={index} className={`word-editor-card ${isEditing ? 'is-editing' : ''}`} style={{ borderColor: '#059669' }}>
              <div className="word-card-top-row">
                <div className="flex items-center gap-3">
                  <span className="word-number-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
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
                  <div className="input-group">
                    <label className="text-amber-400">💡 Memory Trick</label>
                    <input type="text" value={item.memoryTrick || ''} onChange={(e) => handleUpdateIdiom(index, 'memoryTrick', e.target.value)} className="text-input font-hindi" />
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
