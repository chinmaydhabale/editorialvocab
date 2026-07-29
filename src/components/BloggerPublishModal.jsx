import React, { useState } from 'react';
import { Globe, Send, CheckCircle2, AlertCircle, HelpCircle, ExternalLink, RefreshCw, Key, ShieldCheck } from 'lucide-react';
import { publishToBlogger } from '../services/bloggerApiService';

export default function BloggerPublishModal({ isOpen, onClose, postTitle, postHtml }) {
  const [blogId, setBlogId] = useState(() => localStorage.getItem('blogger_blog_id') || '');
  const [tokenMode, setTokenMode] = useState(() => localStorage.getItem('blogger_token_mode') || 'permanent'); // 'permanent' or 'temporary'
  
  // Permanent credentials
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('blogger_refresh_token') || '');
  const [clientId, setClientId] = useState(() => localStorage.getItem('blogger_client_id') || '');
  const [clientSecret, setClientSecret] = useState(() => localStorage.getItem('blogger_client_secret') || '');
  
  // Temporary access token
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

    if (tokenMode === 'permanent' && !refreshToken.trim()) {
      setErrorMsg("Please enter your Permanent Refresh Token (from OAuth Playground).");
      return;
    }

    if (tokenMode === 'temporary' && !accessToken.trim()) {
      setErrorMsg("Please enter your Google OAuth Access Token.");
      return;
    }

    setErrorMsg(null);
    setIsPublishing(true);

    // Save configuration
    localStorage.setItem('blogger_blog_id', blogId.trim());
    localStorage.setItem('blogger_token_mode', tokenMode);
    localStorage.setItem('blogger_refresh_token', refreshToken.trim());
    localStorage.setItem('blogger_client_id', clientId.trim());
    localStorage.setItem('blogger_client_secret', clientSecret.trim());
    localStorage.setItem('blogger_access_token', accessToken.trim());

    try {
      const res = await publishToBlogger({
        blogId,
        accessToken,
        refreshToken,
        clientId,
        clientSecret,
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
      <div className="modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        
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
                Connect your Blogger.com blog for 1-click publishing.
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
              </div>

              {/* TOKEN MODE SELECTOR */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', backgroundColor: '#090d16', padding: '4px', borderRadius: '8px', border: '1px solid #1f2937' }}>
                <button 
                  onClick={() => setTokenMode('permanent')}
                  style={{ flex: 1, border: 'none', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', backgroundColor: tokenMode === 'permanent' ? '#10b981' : 'transparent', color: tokenMode === 'permanent' ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Permanent Refresh Token (No Expiry)</span>
                </button>

                <button 
                  onClick={() => setTokenMode('temporary')}
                  style={{ flex: 1, border: 'none', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', backgroundColor: tokenMode === 'temporary' ? '#6366f1' : 'transparent', color: tokenMode === 'temporary' ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Access Token (1 Hour)</span>
                </button>
              </div>

              {tokenMode === 'permanent' ? (
                /* PERMANENT REFRESH TOKEN MODE */
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px stroke rgba(16, 185, 129, 0.2)', padding: '14px', borderRadius: '10px', marginBottom: '14px' }}>
                  <div className="input-group mb-2">
                    <label className="text-emerald-400 font-semibold">Permanent Refresh Token (Never Expires!)</label>
                    <input 
                      type="password" 
                      placeholder="Paste refresh_token from OAuth Playground Step 2..." 
                      value={refreshToken}
                      onChange={(e) => setRefreshToken(e.target.value)}
                      className="modal-input"
                    />
                  </div>

                  <div className="grid-2" style={{ gap: '10px', marginTop: '10px' }}>
                    <div className="input-group">
                      <label className="text-xs text-slate-400">Client ID (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="Google Cloud Client ID" 
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="modal-input"
                        style={{ fontSize: '12px', padding: '8px' }}
                      />
                    </div>
                    <div className="input-group">
                      <label className="text-xs text-slate-400">Client Secret (Optional)</label>
                      <input 
                        type="password" 
                        placeholder="Google Cloud Client Secret" 
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        className="modal-input"
                        style={{ fontSize: '12px', padding: '8px' }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-emerald-400" style={{ marginTop: '10px', fontSize: '11.5px' }}>
                    💡 <b>Permanent Mode:</b> In OAuth Playground Step 2, copy <code>refresh_token</code>. The app will auto-refresh access tokens in the background forever without asking again!
                  </p>
                </div>
              ) : (
                /* TEMPORARY ACCESS TOKEN MODE */
                <div className="input-group mb-3" style={{ marginBottom: '14px' }}>
                  <label>Google OAuth Access Token (Expires in 60 mins)</label>
                  <input 
                    type="password" 
                    placeholder="ya29.a0A..." 
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="modal-input"
                  />
                </div>
              )}

              {/* Publish Mode Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
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
