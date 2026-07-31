import React, { useState } from 'react';
import { Sparkles, FileText, Link, Image as ImageIcon, Zap, Upload, X, Plus, AlertCircle, ArrowRight } from 'lucide-react';
import { SAMPLE_EDITORIALS } from '../services/sampleEditorials';

export default function InputSection({ onProcessText, isLoading, loadingStep, onSelectSample, wordCountTarget, setWordCountTarget }) {
  const [activeTab, setActiveTab] = useState('text');
  const [editorialText, setEditorialText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [sourceName, setSourceName] = useState('The Hindu Editorial');
  const [urlInput, setUrlInput] = useState('');
  const [isExtractingUrl, setIsExtractingUrl] = useState(false);
  const [urlError, setUrlError] = useState(null);

  // Multi-image state list
  const [imageList, setImageList] = useState([]);

  const apiKey = localStorage.getItem('gemini_api_key') || '';

  const handleMultiFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setImageList(prev => [...prev, { id: Date.now() + Math.random(), name: file.name, base64 }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (id) => {
    setImageList(prev => prev.filter(img => img.id !== id));
  };

  const handleExtractFromUrl = async () => {
    if (!urlInput || !urlInput.trim()) {
      setUrlError("Please enter a valid Editorial URL.");
      return;
    }

    setUrlError(null);
    setIsExtractingUrl(true);

    try {
      const targetUrl = urlInput.trim();
      const corsProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(corsProxy);
      const data = await res.json();

      if (!data.contents) {
        throw new Error("Could not fetch page contents.");
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');

      const extractedTitle = doc.querySelector('h1')?.innerText?.trim() || doc.title || '';
      
      const paragraphs = Array.from(doc.querySelectorAll('article p, main p, p'))
        .map(p => p.innerText.trim())
        .filter(t => t.length > 30);

      const extractedText = paragraphs.slice(0, 15).join('\n\n');

      if (!extractedText || extractedText.length < 100) {
        throw new Error("Could not extract main article text. Please copy/paste the article text directly.");
      }

      setEditorialText(extractedText);
      if (extractedTitle) setCustomTitle(extractedTitle);
      
      if (targetUrl.includes('livemint.com') || targetUrl.includes('mint')) {
        setSourceName('LiveMint Editorial');
      } else if (targetUrl.includes('indianexpress.com')) {
        setSourceName('Indian Express Editorial');
      } else if (targetUrl.includes('thehindu.com')) {
        setSourceName('The Hindu Editorial');
      }

      setActiveTab('text');
    } catch (err) {
      setUrlError(err.message || "Failed to extract article from URL.");
    } finally {
      setIsExtractingUrl(false);
    }
  };

  const handleProcess = () => {
    if (activeTab === 'image') {
      if (imageList.length === 0) {
        alert("Please upload at least one editorial page screenshot.");
        return;
      }
      const base64Array = imageList.map(img => img.base64);
      onProcessText({
        text: base64Array,
        title: customTitle,
        sourceName,
        wordCount: wordCountTarget
      });
    } else {
      if (!editorialText || !editorialText.trim()) {
        alert("Please paste editorial text or extract from URL first.");
        return;
      }
      onProcessText({
        text: editorialText.trim(),
        title: customTitle,
        sourceName,
        wordCount: wordCountTarget
      });
    }
  };

  const isBusy = isLoading || isExtractingUrl;

  return (
    <div className="input-section-container">
      <div className="input-card">
        
        {/* Header */}
        <div className="input-card-header">
          <div>
            <h2 className="section-title">
              <Sparkles className="title-icon text-indigo-400" />
              Create Daily Editorial Vocab &amp; Practice Quiz Post
            </h2>
            <p className="section-desc">
              Provide your editorial source (Text, Link, Multiple Images/Screenshots, or Sample) to automatically extract tricky words, Hindi meanings, mnemonics, root words, idioms, and generate an interactive Quiz Test.
            </p>
          </div>

          {/* Word count target selector */}
          <div className="target-count-box">
            <label>Extraction Mode:</label>
            <select 
              value={wordCountTarget} 
              onChange={(e) => setWordCountTarget(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="count-select"
            >
              <option value="all">⚡ Extract ALL Tricky Words in Editorial</option>
              <option value={5}>Top 5 Words (Standard)</option>
              <option value={8}>Top 8 Words (Detailed)</option>
              <option value={10}>Top 10 Words</option>
              <option value={15}>Top 15 Words</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="input-tabs">
          <button 
            className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            <FileText className="tab-icon" />
            <span>Paste Text</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            <Link className="tab-icon" />
            <span>Article URL</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => setActiveTab('image')}
          >
            <ImageIcon className="tab-icon" />
            <span>Multiple Images / Screenshots ({imageList.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'sample' ? 'active' : ''}`}
            onClick={() => setActiveTab('sample')}
          >
            <Zap className="tab-icon text-amber-400" />
            <span>Sample Editorials (1-Click)</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'text' && (
          <div className="tab-content">
            <div className="input-grid">
              <div className="input-group">
                <label>Editorial Headline (Optional override)</label>
                <input 
                  type="text" 
                  placeholder="Leave blank for AI auto-extraction (e.g., India's Foreign Policy Must Look Seaward)" 
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label>Newspaper Source</label>
                <select 
                  value={sourceName} 
                  onChange={(e) => setSourceName(e.target.value)}
                  className="input-field select-field"
                >
                  <option value="The Hindu Editorial">The Hindu Editorial</option>
                  <option value="Indian Express Editorial">Indian Express Editorial</option>
                  <option value="LiveMint Editorial">LiveMint Editorial</option>
                  <option value="Business Standard Editorial">Business Standard Editorial</option>
                  <option value="Times of India Editorial">Times of India Editorial</option>
                  <option value="Custom Editorial">Custom Newspaper</option>
                </select>
              </div>
            </div>

            <div className="input-group mt-4">
              <label>Paste Editorial Article Text</label>
              <textarea 
                rows={9} 
                placeholder="Paste the full editorial passage here..."
                value={editorialText}
                onChange={(e) => setEditorialText(e.target.value)}
                className="input-field textarea-field"
              />
            </div>
          </div>
        )}

        {activeTab === 'url' && (
          <div className="tab-content">
            <div className="input-group">
              <label>Article / Editorial Web URL</label>
              <div className="url-input-bar">
                <input 
                  type="url" 
                  placeholder="e.g. https://www.thehindu.com/opinion/editorial/..." 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="input-field"
                />
                <button 
                  onClick={handleExtractFromUrl} 
                  disabled={isExtractingUrl}
                  className="btn-primary"
                >
                  {isExtractingUrl ? 'Extracting...' : 'Fetch Text'}
                </button>
              </div>
            </div>

            {urlError && (
              <div className="error-banner">
                <AlertCircle className="w-4 h-4" />
                <span>{urlError}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'image' && (
          <div className="tab-content">
            <div className="input-grid mb-4">
              <div className="input-group">
                <label>Editorial Headline (Optional)</label>
                <input 
                  type="text" 
                  placeholder="AI will extract article headline automatically from image" 
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label>Newspaper Source</label>
                <select 
                  value={sourceName} 
                  onChange={(e) => setSourceName(e.target.value)}
                  className="input-field select-field"
                >
                  <option value="The Hindu Editorial">The Hindu Editorial</option>
                  <option value="Indian Express Editorial">Indian Express Editorial</option>
                  <option value="LiveMint Editorial">LiveMint Editorial</option>
                  <option value="Business Standard Editorial">Business Standard Editorial</option>
                  <option value="Times of India Editorial">Times of India Editorial</option>
                  <option value="Custom Editorial">Custom Newspaper</option>
                </select>
              </div>
            </div>

            {/* MULTI-FILE UPLOADER DRAG-N-DROP BOX */}
            <div className="image-uploader-box mb-4" onClick={() => document.getElementById('multiFileInput').click()}>
              <input 
                type="file" 
                id="multiFileInput"
                accept="image/*"
                multiple
                onChange={handleMultiFileUpload}
                style={{ display: 'none' }}
              />
              <Upload className="upload-icon" />
              <div className="upload-title">Click to Upload Editorial Page Screenshots</div>
              <div className="upload-subtitle">
                You can select <strong>multiple screenshots</strong> at once to cover long multi-part newspaper pages.
              </div>
            </div>

            {/* GALLERY PREVIEW GRID */}
            {imageList.length > 0 && (
              <div>
                <div className="font-semibold text-slate-300 mb-2 flex items-center justify-between" style={{ fontSize: '13px' }}>
                  <span>Uploaded Screenshots ({imageList.length} Pages):</span>
                  <button 
                    type="button"
                    onClick={() => setImageList([])}
                    style={{ background: 'none', border: 'none', color: '#f43f5e', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                </div>
                <div className="image-preview-grid">
                  {imageList.map((img, index) => (
                    <div key={img.id} className="image-preview-card">
                      <img src={img.base64} alt={`Page ${index + 1}`} />
                      <div className="image-badge">Page #{index + 1}</div>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(img.id); }} 
                        className="image-remove-btn"
                        title="Remove page"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  {/* ADD MORE BUTTON CARD */}
                  <div className="image-preview-add-card" onClick={() => document.getElementById('multiFileInput').click()}>
                    <Plus className="w-6 h-6 text-indigo-400" />
                    <span>Add Page #{imageList.length + 1}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sample' && (
          <div className="tab-content">
            <div className="samples-grid">
              {SAMPLE_EDITORIALS.map((sample) => (
                <div key={sample.id} className="sample-card">
                  <div className="sample-card-header">
                    <span className="sample-badge">{sample.sourceName}</span>
                    <span className="sample-words-count">{sample.words.length} Tricky Words</span>
                  </div>
                  <h4 className="sample-title">{sample.title}</h4>
                  <p className="sample-snippet">
                    "{sample.text.slice(0, 140)}..."
                  </p>
                  <button 
                    onClick={() => onSelectSample(sample)}
                    className="btn-select-sample"
                  >
                    <span>Load &amp; Generate Blog Post</span>
                    <ArrowRight className="btn-icon" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {activeTab !== 'sample' && (
          <div className="input-action-bar">
            {!apiKey && (
              <div className="api-notice font-hindi">
                ⚠️ Gemini API key missing. You can set your key in header, or test instantly using the <strong>Sample Editorials</strong> tab!
              </div>
            )}
            <button 
              onClick={handleProcess} 
              disabled={isBusy}
              className="btn-generate-main"
            >
              {isBusy ? (
                <>
                  <div className="spinner" />
                  <span>{isExtractingUrl ? 'Extracting article text from URL...' : (loadingStep || `Analyzing ${activeTab === 'image' ? `${imageList.length} Editorial Pages` : 'Editorial'} & Extracting Tricky Words...`)}</span>
                </>
              ) : (
                <>
                  <Sparkles className="btn-icon" />
                  <span>
                    {wordCountTarget === 'all' 
                      ? `Extract ALL Tricky Words & Generate Post ${activeTab === 'image' && imageList.length > 0 ? `(${imageList.length} Pages)` : ''}` 
                      : `Generate Blogger Vocab Post (${wordCountTarget} Words)`}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
