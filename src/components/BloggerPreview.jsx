import React, { useState } from 'react';
import { Eye, Code, Copy, Check, Download } from 'lucide-react';
import { generateBloggerHtml } from '../services/bloggerTemplateService';
import { copyTextToClipboard } from '../services/clipboardService';

export default function BloggerPreview({ postData, currentTheme }) {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);

  const fullHtml = generateBloggerHtml(postData, currentTheme);

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
    <div className="blogger-preview-card">
      {/* Top Header Bar */}
      <div className="preview-top-bar">
        <div className="preview-title-box">
          <h3>Blogger Post Live Preview</h3>
          <span className="theme-tag">Theme: {currentTheme.toUpperCase()}</span>
        </div>

        <div className="preview-actions">
          {/* Toggle View Mode */}
          <div className="view-toggle-group">
            <button 
              className={`toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
            >
              <Eye className="w-4 h-4" />
              <span>Visual Render</span>
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'code' ? 'active' : ''}`}
              onClick={() => setViewMode('code')}
            >
              <Code className="w-4 h-4" />
              <span>HTML Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Copy / Export Quick Buttons Bar */}
      <div className="quick-export-bar">
        <button onClick={handleCopyTitle} className="btn-quick-export">
          {copiedTitle ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copiedTitle ? 'SEO Title Copied!' : 'Copy SEO Blog Title'}</span>
        </button>

        <button onClick={handleCopyCode} className="btn-quick-export primary">
          {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copiedCode ? 'Blogger HTML Copied!' : 'Copy Blogger HTML Code'}</span>
        </button>

        <button onClick={handleDownloadHtml} className="btn-quick-export">
          <Download className="w-4 h-4" />
          <span>Download .html File</span>
        </button>
      </div>

      {/* Main Content Area */}
      {viewMode === 'preview' ? (
        <div className="rendered-preview-container">
          <div 
            className="rendered-blogger-post"
            dangerouslySetInnerHTML={{ __html: fullHtml }}
          />
        </div>
      ) : (
        <div className="html-code-container">
          <div className="code-header">
            <span>Blogger HTML Code (Ready for Blogger HTML View)</span>
            <button onClick={handleCopyCode} className="btn-code-copy">
              {copiedCode ? 'Copied!' : 'Copy All Code'}
            </button>
          </div>
          <pre className="code-block">
            <code>{fullHtml}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
