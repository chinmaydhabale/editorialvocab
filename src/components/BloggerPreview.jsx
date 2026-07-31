import React, { useState, useEffect, useRef } from 'react';
import { Eye, Code, Copy, Check, Download } from 'lucide-react';
import { generateBloggerHtml } from '../services/bloggerTemplateService';
import { copyTextToClipboard } from '../services/clipboardService';

export default function BloggerPreview({ postData, currentTheme }) {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);

  const fullHtml = generateBloggerHtml(postData, currentTheme);
  const previewRef = useRef(null);

  useEffect(() => {
    if (viewMode === 'preview' && previewRef.current) {
      const scripts = previewRef.current.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        newScript.text = oldScript.text;
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  }, [fullHtml, viewMode]);

  const handleCopyCode = async () => {
    try {
      await copyTextToClipboard(fullHtml);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCopyTitle = async () => {
    const formattedTitle = postData.title || 'Daily Editorial Vocabulary Today';
    try {
      await copyTextToClipboard(formattedTitle);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `editorial-vocab-${postData.date || 'post'}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel animate-fade-slide-in flex flex-col h-[85vh] overflow-hidden max-w-[1400px] mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-indigo-400" />
            Blogger Post Live Preview
          </h3>
          <span className="text-xs font-bold px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full uppercase tracking-wider shadow-inner">
            Theme: {currentTheme.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle View Mode */}
          <div className="flex bg-slate-900/50 p-1.5 rounded-xl border border-slate-700 shadow-inner">
            <button 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 active:scale-95 ${viewMode === 'preview' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              onClick={() => setViewMode('preview')}
            >
              <Eye className="w-4 h-4" />
              <span>Visual Render</span>
            </button>
            <button 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 active:scale-95 ${viewMode === 'code' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              onClick={() => setViewMode('code')}
            >
              <Code className="w-4 h-4" />
              <span>HTML Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Copy / Export Quick Buttons Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5 bg-slate-900/40 border-b border-slate-800">
        <button 
          onClick={handleCopyTitle} 
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border shadow-sm w-full sm:w-auto bg-slate-800 hover:bg-slate-700 active:scale-95 border-slate-700 text-slate-200"
        >
          {copiedTitle ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span className={copiedTitle ? 'text-emerald-400' : ''}>{copiedTitle ? 'SEO Title Copied!' : 'Copy SEO Blog Title'}</span>
        </button>

        <button 
          onClick={handleCopyCode} 
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border shadow-lg w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 border-transparent text-white"
        >
          {copiedCode ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          <span>{copiedCode ? 'Blogger HTML Copied!' : 'Copy Blogger HTML Code'}</span>
        </button>

        <button 
          onClick={handleDownloadHtml} 
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border shadow-sm w-full sm:w-auto bg-slate-800 hover:bg-slate-700 active:scale-95 border-slate-700 text-slate-200"
        >
          <Download className="w-4 h-4" />
          <span>Download .html File</span>
        </button>
      </div>

      {/* Main Content Area */}
      {viewMode === 'preview' ? (
        <div className="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-10 shadow-inner custom-scrollbar relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
          <div 
            ref={previewRef}
            className="w-full max-w-4xl mx-auto bg-white rounded-lg overflow-hidden shadow-2xl min-h-[60vh] relative z-10 p-6"
            dangerouslySetInnerHTML={{ __html: fullHtml }}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-[#0a0c10] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-slate-800 shadow-sm">
            <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
              <Code className="w-4 h-4" /> Blogger HTML Code (Ready to Paste)
            </span>
            <button 
              onClick={handleCopyCode} 
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied!' : 'Copy All Code'}</span>
            </button>
          </div>
          <div className="flex-1 overflow-auto p-6 bg-[#0d1117] custom-scrollbar">
            <pre className="text-sm text-emerald-400/90 font-mono leading-relaxed whitespace-pre-wrap">
              <code>{fullHtml}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
