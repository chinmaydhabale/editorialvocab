import React, { useState, useEffect } from 'react';
import { Globe, Send, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Key, LogIn, Sparkles } from 'lucide-react';
import { publishToBlogger } from '../services/bloggerApiService';

const DEFAULT_CLIENT_ID = "455333068454-3r6vcu0m571rm2cfujt4j5.apps.googleusercontent.com";

export default function BloggerPublishModal({ isOpen, onClose, postTitle, postHtml }) {
  const [blogId, setBlogId] = useState(() => localStorage.getItem('blogger_blog_id') || '');
  const [clientId, setClientId] = useState(() => localStorage.getItem('blogger_client_id') || DEFAULT_CLIENT_ID);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('blogger_access_token') || '');
  const [userGmail, setUserGmail] = useState(() => localStorage.getItem('blogger_user_gmail') || '');
  
  const [isDraft, setIsDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Check URL hash for OAuth redirect token on mount / popup return
  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('access_token')) {
      const params = new URLSearchParams(window.location.hash.replace('#', '?'));
      const token = params.get('access_token');
      if (token) {
        setAccessToken(token);
        localStorage.setItem('blogger_access_token', token);
        setUserGmail('Google Account Connected ✓');
        localStorage.setItem('blogger_user_gmail', 'Google Account Connected ✓');
        // Clean URL hash
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  if (!isOpen) return null;

  // Direct Google OAuth 2.0 Sign In Popup
  const handleGoogleLogin = () => {
    const activeClientId = clientId.trim() || DEFAULT_CLIENT_ID;
    const redirectUri = window.location.origin;
    const scope = encodeURIComponent('https://www.googleapis.com/auth/blogger');
    
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${activeClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}&prompt=consent`;

    // Save Client ID for persistence
    localStorage.setItem('blogger_client_id', activeClientId);

    // Open Google Login Popup
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      oauthUrl,
      'GoogleBloggerLogin',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for OAuth token callback from popup
    const checkPopup = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          return;
        }
        if (popup.location && popup.location.hash && popup.location.hash.includes('access_token')) {
          const hash = popup.location.hash;
          const params = new URLSearchParams(hash.replace('#', '?'));
          const token = params.get('access_token');
          if (token) {
            setAccessToken(token);
            localStorage.setItem('blogger_access_token', token);
            setUserGmail('Connected to Google Blogger ✓');
            localStorage.setItem('blogger_user_gmail', 'Connected to Google Blogger ✓');
            setErrorMsg(null);
            popup.close();
            clearInterval(checkPopup);
          }
        }
      } catch (err) {
        // Cross-origin check while redirecting, ignore
      }
    }, 500);
  };

  const handlePublish = async () => {
    if (!blogId.trim()) {
      setErrorMsg("Please enter your Blogger Blog ID (found in your blogger.com URL).");
      return;
    }

    if (!accessToken.trim()) {
      setErrorMsg("Please click 'Continue with Google' above to authorize your Blogger account.");
      return;
    }

    setErrorMsg(null);
    setIsPublishing(true);

    // Save configuration locally
    localStorage.setItem('blogger_blog_id', blogId.trim());

    try {
      const res = await publishToBlogger({
        blogId,
        accessToken: accessToken.trim(),
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
                Connect your Google Blogger account in 1-click for automatic publishing.
              </p>

              {errorMsg && (
                <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', color: '#fda4af', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* DIRECT GOOGLE LOGIN BUTTON */}
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
                {accessToken ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '10px 16px', borderRadius: '8px', color: '#34d399' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700' }}>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>{userGmail || 'Blogger Account Connected!'}</span>
                    </div>
                    <button 
                      onClick={handleGoogleLogin} 
                      style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Reconnect
                    </button>
                  </div>
                ) : (
                  <div>
                    <button 
                      onClick={handleGoogleLogin}
                      style={{
                        width: '100%',
                        backgroundColor: '#ffffff',
                        color: '#1e293b',
                        border: '1px solid #cbd5e1',
                        padding: '12px 20px',
                        borderRadius: '10px',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Continue with Google (Connect Blogger)</span>
                    </button>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px', margin: '8px 0 0 0' }}>
                      Click to sign in with your Google account. No manual tokens or playground needed!
                    </p>
                  </div>
                )}
              </div>

              {/* Blog ID */}
              <div className="input-group mb-3" style={{ marginBottom: '14px' }}>
                <label>Blogger Blog ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. 3404156005712061709" 
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                  className="modal-input"
                />
              </div>

              {/* Optional Custom OAuth Client ID */}
              <details style={{ marginBottom: '14px', fontSize: '12px', color: '#94a3b8' }}>
                <summary style={{ cursor: 'pointer', color: '#818cf8', fontWeight: '600' }}>
                  ⚙️ Advanced OAuth Client Config (Optional)
                </summary>
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Custom Google Cloud Client ID</label>
                  <input 
                    type="text" 
                    placeholder={DEFAULT_CLIENT_ID} 
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="modal-input"
                    style={{ fontSize: '11px', padding: '6px 10px' }}
                  />
                </div>
              </details>

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
