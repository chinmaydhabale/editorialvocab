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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2 text-emerald-400">
            <Globe className="w-5 h-5" />
            <h3 className="text-lg sm:text-xl font-bold">Auto-Publish directly to Blogger.com</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none transition-colors p-1">&times;</button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-10rem)]">
          {publishResult ? (
            /* SUCCESS PUBLISHED VIEW */
            <div className="flex flex-col items-center text-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {isDraft ? 'Post Saved as Draft on Blogger!' : 'Successfully Published to Blogger.com!'}
              </h3>
              <p className="text-slate-300">
                Your daily editorial vocabulary post is live on your blog with labels: <strong className="text-indigo-400">{labelsPreview}</strong>
              </p>

              {publishResult.url && (
                <a 
                  href={publishResult.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-1" 
                >
                  <span>View Live Blog Post</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button 
                onClick={() => { setPublishResult(null); onClose(); }} 
                className="mt-4 px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl transition-all border border-slate-700"
              >
                Close
              </button>
            </div>
          ) : (
            /* FORM INPUT VIEW */
            <>
              <p className="text-slate-300 mb-6 text-sm sm:text-base">
                Connect your Google Blogger account for automatic 1-click publishing.
              </p>

              {/* Dual Tags Auto Notice */}
              <div className="flex items-start gap-3 p-4 rounded-xl border mb-6 text-sm bg-indigo-500/10 border-indigo-500/20 text-indigo-200">
                <Tag className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>Auto-Labels: Post will be published with <strong>{labelsPreview}</strong>.</span>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-3 p-4 rounded-xl border mb-6 text-sm bg-rose-500/10 border-rose-500/20 text-rose-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Client ID Input Field */}
              <div className="space-y-2 mb-6">
                <label className="flex items-center justify-between text-sm font-bold text-slate-300">
                  <span>Google Cloud Client ID</span>
                  <a href="https://console.cloud.google.com/auth/clients" target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1">
                    Find in Google Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input 
                  type="text" 
                  placeholder="Paste your Client ID (e.g. 455333068454-xxx...apps.googleusercontent.com)" 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* DIRECT GOOGLE LOGIN BUTTON */}
              <div className="p-5 sm:p-6 bg-slate-950/40 border border-slate-800 rounded-xl mb-6">
                {accessToken ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20 w-full sm:w-auto overflow-hidden">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{userGmail || 'Blogger Account Connected!'}</span>
                    </div>
                    <button 
                      onClick={handleGoogleLogin} 
                      className="text-sm text-slate-400 hover:text-white underline transition-colors"
                    >
                      Reconnect
                    </button>
                  </div>
                ) : (
                  <div>
                    <button 
                      onClick={handleGoogleLogin}
                      className="flex items-center justify-center gap-3 w-full bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-3.5 rounded-xl transition-colors shadow-sm"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Continue with Google (Connect Blogger)</span>
                    </button>
                    <p className="text-xs text-slate-500 text-center mt-3">
                      Click to sign in with your Google account. Saved in your browser!
                    </p>
                  </div>
                )}
              </div>

              {/* Blog ID */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-bold text-slate-300">Blogger Blog ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. 3404156005712061709" 
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Publish Mode Toggle */}
              <div className="flex items-center gap-3 mb-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                <input 
                  type="checkbox" 
                  id="draftModeCheck" 
                  checked={isDraft} 
                  onChange={(e) => setIsDraft(e.target.checked)} 
                  className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <label htmlFor="draftModeCheck" className="text-slate-300 cursor-pointer select-none flex-1 font-medium">
                  Save as Draft (Don't publish live immediately)
                </label>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-800">
                <button onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-bold transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handlePublish} 
                  disabled={isPublishing} 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                >
                  {isPublishing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
