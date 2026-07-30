import React, { useState } from 'react';
import { FileText, Link, Image as ImageIcon, Sparkles, Zap, ArrowRight, Info, Plus, Trash2, Layers } from 'lucide-react';
import { SAMPLE_EDITORIALS } from '../services/sampleEditorials';
import { extractArticleFromUrl } from '../services/urlExtractionService';

export default function InputSection({ 
  onProcessText, 
  onSelectSample, 
  isLoading, 
  apiKey,
  wordCountTarget,
  setWordCountTarget 
}) {
  const [activeTab, setActiveTab] = useState('text');
  const [inputText, setInputText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [imageList, setImageList] = useState([]); // Array of Base64 image data URLs
  const [customTitle, setCustomTitle] = useState('');
  const [sourceName, setSourceName] = useState('The Hindu Editorial');
  const [isExtractingUrl, setIsExtractingUrl] = useState(false);

  const isBusy = isLoading || isExtractingUrl;

  const handleProcess = async () => {
    if (activeTab === 'text') {
      if (!inputText.trim()) {
        alert('Please paste or type editorial text first.');
        return;
      }
      onProcessText({
        text: inputText,
        title: customTitle || 'Daily Editorial Vocabulary Analysis',
        sourceName: sourceName,
        wordCount: wordCountTarget
      });
    } else if (activeTab === 'url') {
      if (!urlInput.trim()) {
        alert('Please enter an editorial URL.');
        return;
      }

      try {
        setIsExtractingUrl(true);
        const extractedText = await extractArticleFromUrl(urlInput);
        onProcessText({
          text: extractedText,
          title: customTitle || 'Daily Editorial Vocabulary Analysis',
          sourceName: sourceName || `Editorial (${urlInput})`,
          wordCount: wordCountTarget
        });
      } catch (err) {
        alert(err.message);
      } finally {
        setIsExtractingUrl(false);
      }
    } else if (activeTab === 'image') {
      if (imageList.length === 0) {
        alert('Please upload at least one editorial page screenshot or image.');
        return;
      }
      // Pass array of multiple base64 image data URLs to Gemini
      onProcessText({
        text: imageList.length === 1 ? imageList[0] : imageList,
        title: customTitle || 'Daily Editorial Vocabulary & Tricky Words Analysis',
        sourceName: sourceName || 'The Hindu Editorial',
        wordCount: wordCountTarget
      });
    }
  };

  const handleFilesUpload = (filesList) => {
    const files = Array.from(filesList || []).filter((file) => file.type.startsWith('image/'));
    if (files.length > 0) {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          setImageList((prev) => [...prev, evt.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleMultipleImageUpload = (e) => {
    handleFilesUpload(e.target.files);
    e.target.value = '';
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    handleFilesUpload(e.dataTransfer.files);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImageList((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="input-section-card">
      <div className="input-card-header">
        <div>
          <h2 className="section-title">
            <Sparkles className="title-icon text-indigo-400" />
            Create Daily Editorial Vocab Post
          </h2>
          <p className="section-desc">
            Provide your editorial source (Text, Link, Multiple Images/Screenshots, or Sample) to automatically extract tricky words, Hindi meanings, mnemonics, root words, and idioms.
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
      <div className="tab-content">
        {activeTab !== 'sample' && (
          <div className="input-metadata-grid">
            <div className="input-field">
              <label>Editorial Source Name</label>
              <select 
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="select-input"
              >
                <option value="The Hindu Editorial">The Hindu Editorial</option>
                <option value="Indian Express Editorial">Indian Express Editorial</option>
                <option value="Times of India Editorial">Times of India Editorial</option>
                <option value="Business Standard">Business Standard</option>
                <option value="LiveMint Editorial">LiveMint Editorial</option>
                <option value="Custom Editorial">Custom Editorial</option>
              </select>
            </div>
            <div className="input-field">
              <label>Blog Post Headline / Title (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Daily Editorial Vocab: Monetary Policy & Inflation" 
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="text-input"
              />
            </div>
          </div>
        )}

        {/* 1. TEXT TAB */}
        {activeTab === 'text' && (
          <div className="tab-pane">
            <textarea 
              rows={8}
              className="editorial-textarea"
              placeholder="Paste raw editorial article text here... (e.g. The Hindu or Indian Express article passage)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        )}

        {/* 2. URL TAB */}
        {activeTab === 'url' && (
          <div className="tab-pane">
            <div className="url-input-box">
              <Link className="url-icon" />
              <input 
                type="url" 
                placeholder="https://www.thehindu.com/opinion/editorial/..." 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="url-input"
              />
            </div>
            <p className="hint-text">
              <Info className="hint-icon" />
              Paste any article link. The bot will automatically parse the article text and extract vocabulary.
            </p>
          </div>
        )}

        {/* 3. MULTIPLE IMAGES TAB */}
        {activeTab === 'image' && (
          <div className="tab-pane">
            {imageList.length > 0 ? (
              <div className="multiple-images-container">
                <div className="image-list-header">
                  <div className="image-list-title">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>{imageList.length} Split Editorial Page Screenshots Uploaded</span>
                  </div>
                  
                  <label className="btn-secondary compact-file-btn">
                    <Plus className="w-4 h-4" />
                    <span>Add More Screenshots</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleMultipleImageUpload} 
                      className="hidden-file-input" 
                    />
                  </label>
                </div>

                {/* Uploaded Images Grid */}
                <div className="uploaded-images-grid">
                  {imageList.map((imgSrc, idx) => (
                    <div key={idx} className="uploaded-image-card">
                      <span className="uploaded-image-badge">
                        Page #{idx + 1}
                      </span>
                      
                      <button 
                        onClick={() => handleRemoveImage(idx)} 
                        title="Remove page"
                        className="uploaded-image-remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <img src={imgSrc} alt={`Editorial Page ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="image-upload-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImageDrop}
              >
                <label className="upload-label">
                  <ImageIcon className="upload-icon" />
                  <span className="upload-title">
                    Click or drag multiple editorial page screenshots here
                  </span>
                  <span className="upload-sub">
                    💡 You can select and upload multiple split images (Page 1, Page 2, Page 3) at once for large editorials!
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleMultipleImageUpload} 
                    className="hidden-file-input" 
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* 4. SAMPLE TAB */}
        {activeTab === 'sample' && (
          <div className="tab-pane">
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
                    <span>Load & Generate Blog Post</span>
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
                  <span>{isExtractingUrl ? 'Extracting article text from URL...' : `Analyzing ${activeTab === 'image' ? `${imageList.length} Editorial Pages` : 'Editorial'} & Extracting Tricky Words...`}</span>
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
