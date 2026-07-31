import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink, Globe, Sparkles, Send } from 'lucide-react';
import { generateBloggerHtml } from '../services/bloggerTemplateService';
import BloggerPublishModal from './BloggerPublishModal';
import { copyTextToClipboard } from '../services/clipboardService';

export default function HtmlExporter({ postData, currentTheme }) {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [showAutoPublishModal, setShowAutoPublishModal] = useState(false);

  const fullHtml = generateBloggerHtml(postData, currentTheme);
  const formattedTitle = postData.title || 'Daily Editorial Vocabulary Today';
  const hasIdioms = (postData.idiomsAndPhrases || []).length > 0;

  const handleCopyTitle = async () => {
    try {
      await copyTextToClipboard(formattedTitle);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCopyHtml = async () => {
    try {
      await copyTextToClipboard(fullHtml);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownload = () => {
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
    <div className="glass-panel p-6 sm:p-10 max-w-5xl mx-auto space-y-10">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3 text-white mb-2">
          <Globe className="w-8 h-8 text-indigo-400" />
          Blogger Publish & Export Center
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Use <strong className="text-indigo-300">Auto-Publish</strong> to send your post directly to Blogger.com in 1-click, or copy the SEO HTML code manually.
        </p>
      </div>

      {/* AUTO PUBLISH HERO BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-colors duration-700 pointer-events-none" />
        
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-500/30 mb-3 shadow-inner">
            Direct Integration
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Auto-Publish Directly to Blogger.com
          </h3>
          <p className="text-indigo-200/80 text-sm sm:text-base max-w-xl">
            Publish this editorial vocab post to your blog with 1 click without manually copying HTML!
          </p>
        </div>

        <button 
          onClick={() => setShowAutoPublishModal(true)} 
          className="relative z-10 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-extrabold rounded-xl shadow-[0_10px_30px_-10px_rgba(99,102,241,0.6)] hover:shadow-[0_15px_40px_-10px_rgba(99,102,241,0.8)] transition-all transform hover:-translate-y-1 w-full md:w-auto flex-shrink-0"
        >
          <Send className="w-5 h-5" />
          <span className="text-lg tracking-wide">Auto-Publish Now</span>
        </button>
      </div>

      {/* Step Guide Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* STEP 1 */}
        <div className="flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative shadow-lg hover:border-slate-700 transition-colors">
          <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 font-black flex items-center justify-center border border-slate-700 shadow-xl text-sm">1</div>
          <h4 className="text-lg font-bold text-white mb-2 ml-4">Copy SEO Title</h4>
          <p className="text-slate-400 text-sm mb-6 flex-1">High-ranking headline with Newspaper Name, Date & Topic.</p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 text-sm mb-4 line-clamp-2 shadow-inner h-16">
            {formattedTitle}
          </div>
          <button onClick={handleCopyTitle} className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all ${copiedTitle ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-transparent'}`}>
            {copiedTitle ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedTitle ? 'SEO Title Copied!' : 'Copy SEO Title'}</span>
          </button>
        </div>

        {/* STEP 2 */}
        <div className="flex flex-col bg-indigo-950/30 border-2 border-indigo-500/30 rounded-2xl p-6 relative shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:border-indigo-500/50 transition-colors transform hover:-translate-y-1 duration-300">
          <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-indigo-500 text-white font-black flex items-center justify-center shadow-lg shadow-indigo-500/30 text-sm">2</div>
          <h4 className="text-lg font-bold text-white mb-2 ml-4">Copy Blogger HTML</h4>
          <p className="text-slate-300 text-sm mb-6 flex-1">Includes inline CSS, responsive design & thumbnail image.</p>
          <div className="flex-1" />
          <button onClick={handleCopyHtml} className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold transition-all ${copiedHtml ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'}`}>
            {copiedHtml ? <Check className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            <span className="text-base">{copiedHtml ? 'HTML Copied!' : 'Copy HTML Code'}</span>
          </button>
        </div>

        {/* STEP 3 */}
        <div className="flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative shadow-lg hover:border-slate-700 transition-colors">
          <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 font-black flex items-center justify-center border border-slate-700 shadow-xl text-sm">3</div>
          <h4 className="text-lg font-bold text-white mb-2 ml-4">Paste in Blogger</h4>
          <div className="text-slate-400 text-sm mb-6 flex-1 space-y-2">
            <p>1. Open <a href="https://www.blogger.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Blogger.com</a></p>
            <p>2. Click <strong>New Post</strong></p>
            <p>3. Switch to <strong>HTML view (&lt;&gt;)</strong></p>
            <p>4. Paste HTML code and click <strong>Publish</strong>!</p>
          </div>
          <a 
            href="https://www.blogger.com" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-bold rounded-xl transition-all"
          >
            <span>Open Blogger.com</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>

      {/* Backup Download Box */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
        <div>
          <h4 className="text-lg font-bold text-white mb-1">Download HTML File Backup</h4>
          <p className="text-sm text-slate-400">Save a copy of this blog post locally as an <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">.html</code> file.</p>
        </div>
        <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-bold rounded-xl transition-colors shrink-0">
          <Download className="w-4 h-4" />
          <span>Download HTML File</span>
        </button>
      </div>

      {/* AUTO PUBLISH MODAL */}
      <BloggerPublishModal 
        isOpen={showAutoPublishModal}
        onClose={() => setShowAutoPublishModal(false)}
        postTitle={formattedTitle}
        postHtml={fullHtml}
        postDate={postData.date}
        sourceName={postData.sourceName}
        hasIdioms={hasIdioms}
      />
    </div>
  );
}
