import React, { useState, useEffect } from 'react';
import { Globe, Send, CheckCircle2, AlertCircle, ExternalLink, Tag } from 'lucide-react';
import { publishToBlogger, getAutomationLabels } from '../services/bloggerApiService';

export default function BloggerPublishModal({ isOpen, onClose, postTitle, postHtml, postDate, sourceName, hasIdioms }) {
  const [blogId, setBlogId] = useState(() => localStorage.getItem('blogger_blog_id') || '');
  const [clientId, setClientId] = useState(() => localStorage.getItem('blogger_client_id') || '');
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('blogger_access_token') || '');
  const [userGmail, setUserGmail] = useState(() => localStorage.getItem('blogger_user_gmail') || '');
  
  const [isDraft, setIsDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const automationLabels = getAutomationLabels({ postDate, sourceName, hasIdioms });
  const labelsPreview = automationLabels.join(', ');

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
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
    }
  }, []);

  if (!isOpen) return null;

  // Direct Google OAuth 2.0 Sign In Popup
  const handleGoogleLogin = () => {
    if (!clientId.trim()) {
      setErrorMsg("Please paste your Google Cloud Client ID below first.");
      return;
    }

    const activeClientId = clientId.trim();
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

    if (!popup) {
      setErrorMsg("Popup blocked. Please allow popups for this site and try again.");
      return;
    }

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
        blogId: blogId.trim(),
        accessToken: accessToken.trim(),
        title: postTitle,
        htmlContent: postHtml,
        postDate: postDate,
        sourceName: sourceName,
        hasIdioms,
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
      <div className="modal-card publish-modal-card" onClick={(e) => e.stopPropagation()}>
        
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
            <div className="publish-success-box">
              <div className="publish-success-icon">
                <CheckCircle2 className="publish-success-check" />
              </div>
              <h3 className="publish-success-title">
                {isDraft ? 'Post Saved as Draft on Blogger!' : 'Successfully Published to Blogger.com!'}
              </h3>
              <p className="publish-success-text">
                Your daily editorial vocabulary post is live on your blog with labels: <strong>{labelsPreview}</strong>
              </p>

              {publishResult.url && (
                <a 
                  href={publishResult.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-primary publish-live-link" 
                >
                  <span>View Live Blog Post</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button 
                onClick={() => { setPublishResult(null); onClose(); }} 
                className="btn-secondary centered-close"
              >
                Close
              </button>
            </div>
          ) : (
            /* FORM INPUT VIEW */
            <>
              <p className="modal-text">
                Connect your Google Blogger account for automatic 1-click publishing.
              </p>

              {/* Dual Tags Auto Notice */}
              <div className="status-callout tags-callout">
                <Tag className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Auto-Labels: Post will be published with <strong>{labelsPreview}</strong>.</span>
              </div>

              {errorMsg && (
                <div className="status-callout error-callout">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Client ID Input Field */}
              <div className="input-group field-spacing">
                <label className="client-id-label">
                  <span>Google Cloud Client ID</span>
                  <a href="https://console.cloud.google.com/auth/clients" target="_blank" rel="noreferrer" className="helper-link">
                    Find in Google Cloud Console ↗
                  </a>
                </label>
                <input 
                  type="text" 
                  placeholder="Paste your Client ID (e.g. 455333068454-xxx...apps.googleusercontent.com)" 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="modal-input client-id-input"
                />
              </div>

              {/* DIRECT GOOGLE LOGIN BUTTON */}
              <div className="oauth-card">
                {accessToken ? (
                  <div className="oauth-connected-card">
                    <div className="oauth-connected-label">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>{userGmail || 'Blogger Account Connected!'}</span>
                    </div>
                    <button 
                      onClick={handleGoogleLogin} 
                      className="text-link-button"
                    >
                      Reconnect
                    </button>
                  </div>
                ) : (
                  <div>
                    <button 
                      onClick={handleGoogleLogin}
                      className="google-login-button"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Continue with Google (Connect Blogger)</span>
                    </button>
                    <p className="modal-help-text">
                      Click to sign in with your Google account. Saved in your browser!
                    </p>
                  </div>
                )}
              </div>

              {/* Blog ID */}
              <div className="input-group field-spacing">
                <label>Blogger Blog ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. 3404156005712061709" 
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                  className="modal-input"
                />
              </div>

              {/* Publish Mode Toggle */}
              <div className="draft-toggle-row">
                <input 
                  type="checkbox" 
                  id="draftModeCheck" 
                  checked={isDraft} 
                  onChange={(e) => setIsDraft(e.target.checked)} 
                  className="draft-checkbox"
                />
                <label htmlFor="draftModeCheck" className="draft-toggle-label">
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
                  className="btn-primary publish-button" 
                >
                  {isPublishing ? (
                    <>
                      <div className="spinner" />
                      <span>Publishing to Blogger...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isDraft ? 'Save Draft to Blogger' : 'Publish Live with Labels'}</span>
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
