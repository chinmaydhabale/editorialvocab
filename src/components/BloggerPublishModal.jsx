import React, { useState } from 'react';
import { Globe, Send, CheckCircle2, AlertCircle, HelpCircle, ExternalLink, Sparkles } from 'lucide-react';
import { publishToBlogger } from '../services/bloggerApiService';

export default function BloggerPublishModal({ isOpen, onClose, postTitle, postHtml }) {
  const [blogId, setBlogId] = useState(() => localStorage.getItem('blogger_blog_id') || '');
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('blogger_access_token') || '');
  const [isDraft, setIsDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handlePublish = async () => {
    if (!blogId.trim()) {
      setErrorMsg("Please enter your Blogger Blog ID.");
      return;
    }

    if (!accessToken.trim()) {
      setErrorMsg("Please enter your Google OAuth Access Token.");
      return;
    }

    setErrorMsg(null);
    setIsPublishing(true);

    // Save settings locally
    localStorage.setItem('blogger_blog_id', blogId.trim());
    localStorage.setItem('blogger_access_token', accessToken.trim());

    try {
      const res = await publishToBlogger({
        blogId,
        accessToken,
        title: postTitle,
        htmlContent: postHtml,
        isDraft
      });

      setPublishResult(res);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2 text-emerald-400">
            <Globe className="w-5 h-5" />
            <h3>Auto-Publish directly to Blogger.com</h3>
          </div>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        <div className="modal-body">
          {publishResult ? (
            /* SUCCESS PUBLISHED VIEW */
            <div className="publish-success-box" style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 style={{ width: '36px', height: '36px' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#f8fafc' }}>
                {isDraft ? 'Post Saved as Draft on Blogger!' : 'Successfully Published to Blogger.com!'}
              </h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
                Your daily editorial vocabulary post is live on your blog.
              </p>

              {publishResult.url && (
                <a 
                  href={publishResult.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-primary" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', backgroundColor: '#10b981', padding: '10px 20px', borderRadius: '8px', margin: '0 auto' }}
                >
                  <span>View Live Blog Post</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button 
                onClick={() => { setPublishResult(null); onClose(); }} 
                className="btn-secondary"
                style={{ display: 'block', margin: '16px auto 0' }}
              >
                Close
              </button>
            </div>
          ) : (
            /* FORM INPUT VIEW */
            <>
              <p className="modal-text">
                Connect your Blogger.com blog to publish posts with 1 click directly from this app.
              </p>

              {errorMsg && (
                <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', color: '#fda4af', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Blog ID */}
              <div className="input-group mb-3" style={{ marginBottom: '14px' }}>
                <label>Blogger Blog ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. 84920491820491829" 
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                  className="modal-input"
                />
                <span className="text-xs text-slate-400" style={{ display: 'block', marginTop: '4px' }}>
                  💡 Found in your Blogger URL: <code>blogger.com/blog/posts/<b>YOUR_BLOG_ID</b></code>
                </span>
              </div>

              {/* OAuth Access Token */}
              <div className="input-group mb-3" style={{ marginBottom: '14px' }}>
                <label>Google OAuth Access Token</label>
                <input 
                  type="password" 
                  placeholder="ya29.a0A..." 
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="modal-input"
                />
                <div className="api-help-box" style={{ marginTop: '6px' }}>
                  <HelpCircle className="help-icon" />
                  <span>
                    Get a quick 1-minute test token from{' '}
                    <a href="https://developers.google.com/oauthplayground/" target="_blank" rel="noreferrer">
                      Google OAuth Playground
                    </a> (Select Blogger API v3 scope).
                  </span>
                </div>
              </div>

              {/* Publish Mode Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
                <input 
                  type="checkbox" 
                  id="draftModeCheck" 
                  checked={isDraft} 
                  onChange={(e) => setIsDraft(e.target.checked)} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="draftModeCheck" style={{ fontSize: '14px', color: '#cbd5e1', cursor: 'pointer', margin: 0 }}>
                  Save as Draft (Don't publish live immediately)
                </label>
              </div>

              <div className="modal-footer">
                <button onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button 
                  onClick={handlePublish} 
                  disabled={isPublishing} 
                  className="btn-primary" 
                  style={{ backgroundColor: '#10b981' }}
                >
                  {isPublishing ? (
                    <>
                      <div className="spinner" />
                      <span>Publishing to Blogger...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isDraft ? 'Save Draft to Blogger' : 'Publish Live Now'}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
