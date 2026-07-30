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
    <div className="html-exporter-card">
      <h2 className="section-title">
        <Globe className="title-icon text-indigo-400" />
        Blogger Publish & Export Center
      </h2>
      <p className="section-desc">
        Use <strong>Auto-Publish</strong> to send your post directly to Blogger.com in 1-click, or copy the SEO HTML code manually.
      </p>

      {/* AUTO PUBLISH HERO BANNER */}
      <div className="auto-publish-panel">
        <div>
          <span className="auto-publish-badge">
            Direct Integration
          </span>
          <h3>
            Auto-Publish Directly to Blogger.com
          </h3>
          <p>
            Publish this editorial vocab post to your blog with 1 click without manually copying HTML!
          </p>
        </div>

        <button 
          onClick={() => setShowAutoPublishModal(true)} 
          className="auto-publish-button"
        >
          <Send className="w-4 h-4" />
          <span>Auto-Publish Now</span>
        </button>
      </div>

      {/* Step Guide Grid */}
      <div className="blogger-steps-grid">
        
        {/* STEP 1 */}
        <div className="step-card">
          <div className="step-badge">STEP 1</div>
          <h4>Copy SEO Blog Post Title</h4>
          <p className="step-text">High-ranking headline with Newspaper Name, Date & Topic.</p>
          <div className="title-preview-box">
            <span>{formattedTitle}</span>
          </div>
          <button onClick={handleCopyTitle} className={`btn-step-action ${copiedTitle ? 'copied' : ''}`}>
            {copiedTitle ? <Check className="btn-icon" /> : <Copy className="btn-icon" />}
            <span>{copiedTitle ? 'SEO Title Copied!' : 'Copy SEO Title'}</span>
          </button>
        </div>

        {/* STEP 2 */}
        <div className="step-card highlight">
          <div className="step-badge primary">STEP 2</div>
          <h4>Copy Blogger HTML Body</h4>
          <p className="step-text">Includes inline CSS, responsive design & thumbnail image.</p>
          <button onClick={handleCopyHtml} className={`btn-step-action primary ${copiedHtml ? 'copied' : ''}`}>
            {copiedHtml ? <Check className="btn-icon" /> : <Sparkles className="btn-icon" />}
            <span>{copiedHtml ? 'HTML Code Copied!' : 'Copy Blogger HTML Code'}</span>
          </button>
        </div>

        {/* STEP 3 */}
        <div className="step-card">
          <div className="step-badge">STEP 3</div>
          <h4>Paste in Blogger Post Editor</h4>
          <p className="step-text">
            1. Open <a href="https://www.blogger.com" target="_blank" rel="noreferrer">Blogger.com</a><br/>
            2. Click <strong>New Post</strong><br/>
            3. Switch view from Compose to <strong>HTML view (&lt;&gt;)</strong><br/>
            4. Paste HTML code and click <strong>Publish</strong>!
          </p>
          <a 
            href="https://www.blogger.com" 
            target="_blank" 
            rel="noreferrer" 
            className="btn-step-action outline"
          >
            <span>Open Blogger.com</span>
            <ExternalLink className="btn-icon" />
          </a>
        </div>

      </div>

      {/* Backup Download Box */}
      <div className="export-download-footer">
        <div>
          <h4>Download HTML File Backup</h4>
          <p>Save a copy of this blog post locally as an `.html` file.</p>
        </div>
        <button onClick={handleDownload} className="btn-secondary">
          <Download className="btn-icon" />
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
