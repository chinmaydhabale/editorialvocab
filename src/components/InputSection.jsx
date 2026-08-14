import React, { useState } from 'react';
import { Sparkles, FileText, Link, Image as ImageIcon, Zap, Upload, X, Plus, AlertCircle, ArrowRight } from 'lucide-react';
import { SAMPLE_EDITORIALS } from '../services/sampleEditorials';
import { extractArticleFromUrl } from '../services/urlExtractionService';

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
      const extractedContent = await extractArticleFromUrl(targetUrl);

      // Extract headline if found in content
      const headlineMatch = extractedContent.match(/^Headline:\s*(.+)$/im);
      if (headlineMatch && headlineMatch[1]) {
        setCustomTitle(headlineMatch[1].trim());
      }

      // Detect Newspaper Source
      const lowerUrl = targetUrl.toLowerCase();
      if (lowerUrl.includes('livemint.com') || lowerUrl.includes('mint')) {
        setSourceName('LiveMint Editorial');
      } else if (lowerUrl.includes('indianexpress.com')) {
        setSourceName('Indian Express Editorial');
      } else if (lowerUrl.includes('thehindu.com')) {
        setSourceName('The Hindu Editorial');
      } else if (lowerUrl.includes('business-standard.com')) {
        setSourceName('Business Standard Editorial');
      } else if (lowerUrl.includes('timesofindia.indiatimes.com')) {
        setSourceName('Times of India Editorial');
      }

      setEditorialText(extractedContent);
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
    <div className="w-full mx-auto max-w-5xl">
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        {/* Animated Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8 relative z-10">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3 mb-2 text-white">
              <Sparkles className="w-7 h-7 text-indigo-400" />
              Create Vocabulary Post
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-medium">
              Provide your editorial source to automatically extract tricky words, Hindi meanings, mnemonics, root words, idioms, and generate an interactive Quiz Test.
            </p>
          </div>

          {/* Word count target selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-900/80 border border-slate-700/50 p-4 rounded-xl shadow-inner shrink-0 w-full lg:w-auto">
            <label className="text-sm font-bold text-slate-300 whitespace-nowrap">Extraction Mode:</label>
            <select 
              value={wordCountTarget} 
              onChange={(e) => setWordCountTarget(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-slate-950 border border-indigo-500/30 text-indigo-200 px-4 py-2 rounded-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-auto cursor-pointer"
            >
              <option value="all">⚡ Extract ALL Tricky Words</option>
              <option value={5}>Top 5 Words (Standard)</option>
              <option value={8}>Top 8 Words (Detailed)</option>
              <option value={10}>Top 10 Words</option>
              <option value={15}>Top 15 Words</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:flex bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/50 mb-8 gap-1.5 sm:overflow-x-auto no-scrollbar">
          {[
            { id: 'text', icon: FileText, label: 'Paste Text', shortLabel: 'Text' },
            { id: 'url', icon: Link, label: 'Article URL', shortLabel: 'URL' },
            { id: 'image', icon: ImageIcon, label: `Screenshots (${imageList.length})`, shortLabel: `Shots (${imageList.length})` },
            { id: 'sample', icon: Zap, label: 'Samples (1-Click)', shortLabel: 'Samples', iconClass: 'text-amber-400' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-0 sm:flex-1 sm:min-w-[130px] flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-indigo-500/20 text-indigo-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <tab.icon className={`w-4 h-4 flex-shrink-0 ${tab.iconClass || ''}`} />
              <span className="truncate sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="bg-slate-950/30 rounded-2xl p-5 sm:p-6 border border-slate-800/50 shadow-inner">
          
          {/* Text Tab */}
          {activeTab === 'text' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="input-label">Editorial Headline (Optional override)</label>
                  <input 
                    type="text" 
                    placeholder="Leave blank for AI auto-extraction" 
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Newspaper Source</label>
                  <select 
                    value={sourceName} 
                    onChange={(e) => setSourceName(e.target.value)}
                    className="input-field cursor-pointer appearance-none"
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

              <div>
                <label className="input-label">Paste Editorial Article Text</label>
                <textarea 
                  rows={8} 
                  placeholder="Paste the full editorial passage here..."
                  value={editorialText}
                  onChange={(e) => setEditorialText(e.target.value)}
                  className="input-field resize-y font-body text-[15px] leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* URL Tab */}
          {activeTab === 'url' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="input-label">Editorial Headline (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="AI will extract headline from URL if blank" 
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Newspaper Source</label>
                  <select 
                    value={sourceName} 
                    onChange={(e) => setSourceName(e.target.value)}
                    className="input-field cursor-pointer appearance-none"
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

              <div>
                <label className="input-label">Article / Editorial Web URL</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="url" 
                    placeholder="e.g. https://www.thehindu.com/opinion/editorial/..." 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="input-field flex-1"
                  />
                  <button 
                    onClick={handleExtractFromUrl} 
                    disabled={isExtractingUrl}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {isExtractingUrl ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Extracting...</>
                    ) : 'Fetch Text'}
                  </button>
                </div>
              </div>

              {urlError && (
                <div className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 font-medium animate-in fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{urlError}</span>
                </div>
              )}
            </div>
          )}

          {/* Image Tab */}
          {activeTab === 'image' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="input-label">Editorial Headline (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="AI will extract headline from image" 
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="input-label">Newspaper Source</label>
                  <select 
                    value={sourceName} 
                    onChange={(e) => setSourceName(e.target.value)}
                    className="input-field cursor-pointer appearance-none"
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

              {/* Uploader Box */}
              <div 
                className="group relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-2xl cursor-pointer transition-all duration-300"
                onClick={() => document.getElementById('multiFileInput').click()}
              >
                <input 
                  type="file" 
                  id="multiFileInput"
                  accept="image/*"
                  multiple
                  onChange={handleMultiFileUpload}
                  className="hidden"
                />
                <div className="w-16 h-16 mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <Upload className="w-8 h-8 text-indigo-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Upload Editorial Screenshots</h4>
                <p className="text-slate-400 text-sm text-center max-w-md">
                  Select <strong className="text-indigo-300">multiple screenshots</strong> at once to cover long multi-part newspaper pages.
                </p>
              </div>

              {/* Gallery */}
              {imageList.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-bold text-slate-300">Uploaded Pages ({imageList.length}):</h5>
                    <button 
                      type="button"
                      onClick={() => setImageList([])}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imageList.map((img, index) => (
                      <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 aspect-[3/4]">
                        <img src={img.base64} alt={`Page ${index + 1}`} className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" />
                        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-indigo-300 text-xs font-bold px-2 py-1 rounded-md border border-slate-700">
                          #{index + 1}
                        </div>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(img.id); }} 
                          className="absolute top-2 right-2 w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add More Button */}
                    <div 
                      className="rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 bg-slate-900/50 hover:bg-indigo-500/10 flex flex-col items-center justify-center cursor-pointer transition-all group aspect-[3/4]"
                      onClick={() => document.getElementById('multiFileInput').click()}
                    >
                      <Plus className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 mb-2 transition-colors" />
                      <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-300">Add Page</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sample Tab */}
          {activeTab === 'sample' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {SAMPLE_EDITORIALS.map((sample) => (
                <div key={sample.id} className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-xl p-5 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] group flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/20">{sample.sourceName}</span>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">{sample.words.length} Words</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-amber-300 transition-colors">{sample.title}</h4>
                  <p className="text-sm text-slate-400 mb-6 flex-1 italic">"{sample.text.slice(0, 140)}..."</p>
                  
                  <button 
                    onClick={() => onSelectSample(sample)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-400 border border-slate-700 hover:border-amber-500/30 font-bold rounded-lg transition-all"
                  >
                    Load &amp; Generate Post
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        {activeTab !== 'sample' && (
          <div className="mt-8 relative z-10">
            {!apiKey && (
              <div className="mb-4 flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200/90 text-sm font-medium">
                <span className="text-xl">⚠️</span>
                <span>Gemini API key missing. Set your key in the header, or test instantly using the <strong>Sample Editorials</strong> tab!</span>
              </div>
            )}
            <button 
              onClick={handleProcess} 
              disabled={isBusy}
              className={`w-full relative overflow-hidden flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-extrabold text-lg transition-all duration-300 ${
                isBusy 
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 text-white shadow-[0_10px_40px_-10px_rgba(99,102,241,0.6)] hover:shadow-[0_15px_50px_-10px_rgba(99,102,241,0.8)] transform hover:-translate-y-1 pulse-glow'
              }`}
            >
              {isBusy ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
                  <span>{isExtractingUrl ? 'Extracting article text from URL...' : (loadingStep || `Analyzing ${activeTab === 'image' ? `${imageList.length} Pages` : 'Editorial'}...`)}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-indigo-200" />
                  <span>
                    {wordCountTarget === 'all' 
                      ? `Extract ALL Words & Generate Post ${activeTab === 'image' && imageList.length > 0 ? `(${imageList.length} Pages)` : ''}` 
                      : `Generate Vocab Post (${wordCountTarget} Words)`}
                  </span>
                  
                  {/* Subtle shine effect */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
