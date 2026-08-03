import React, { useState, useEffect } from 'react';
import { BookOpen, Key, Sparkles, Sliders, CheckCircle, HelpCircle, Cpu, RefreshCw } from 'lucide-react';
import { getAvailableGeminiModels } from '../services/geminiService';

export default function Header({ apiKey, setApiKey, currentTheme, setCurrentTheme, selectedModel, setSelectedModel }) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState(selectedModel || 'gemini-3.6-flash');
  const [availableModels, setAvailableModels] = useState([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fetch available models whenever API key is entered or modal opened
  useEffect(() => {
    if (showKeyModal && tempKey.trim()) {
      fetchModels(tempKey);
    }
  }, [showKeyModal, tempKey]);

  const fetchModels = async (key) => {
    setIsDiscovering(true);
    const discovered = await getAvailableGeminiModels(key);
    setAvailableModels(discovered);
    setIsDiscovering(false);
  };

  const handleSaveKey = () => {
    setApiKey(tempKey);
    setSelectedModel(tempModel);
    localStorage.setItem('gemini_api_key', tempKey);
    localStorage.setItem('gemini_selected_model', tempModel);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowKeyModal(false);
    }, 1200);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/70 border-b border-indigo-500/10 shadow-lg shadow-indigo-500/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Editorial<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Vocab</span> Bot
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-400">
              Blogger Automation for Daily Tricky Words & Memory Tricks
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Selector */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl">
            <Sliders className="w-4 h-4 text-slate-400" />
            <select 
              value={currentTheme} 
              onChange={(e) => setCurrentTheme(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 outline-none cursor-pointer"
            >
              <option value="slate" className="bg-slate-900">Slate Dark</option>
              <option value="warm" className="bg-slate-900">Warm Paper</option>
              <option value="cyber" className="bg-slate-900">Cyber Cyan</option>
            </select>
          </div>

          {/* API Key Modal Button */}
          <button 
            onClick={() => setShowKeyModal(true)} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
              apiKey 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 shadow-md'
            }`}
          >
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">{apiKey ? `API: ${selectedModel || '3.6 Flash'}` : 'Set API Key'}</span>
            <span className="sm:hidden whitespace-nowrap">{apiKey ? 'API Set' : 'API Key'}</span>
            {apiKey && <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] ml-1" />}
          </button>
        </div>
      </div>

      {/* API Key & Model Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowKeyModal(false)}>
          <div className="w-full max-w-lg bg-slate-900 border border-indigo-500/20 shadow-2xl rounded-2xl overflow-hidden transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Gemini AI Settings</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-sm text-slate-400">
                Enter your Google Gemini API Key and select from the latest Gemini Flash models to enable automated analysis.
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-300">Gemini API Key</label>
                <input 
                  type="password" 
                  placeholder="AIzaSy..." 
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-bold text-slate-300">
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    Model Target
                  </span>
                  {isDiscovering && <span className="text-xs text-amber-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Detecting...</span>}
                </label>

                <select 
                  value={tempModel} 
                  onChange={(e) => setTempModel(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer appearance-none"
                >
                  <optgroup label="Latest Gemini 3.x Models" className="bg-slate-900 text-slate-300">
                    <option value="gemini-3.6-flash">⚡ Gemini 3.6 Flash (Latest Ultra Fast)</option>
                    <option value="gemini-3.5-flash">⚡ Gemini 3.5 Flash</option>
                  </optgroup>
                  <optgroup label="Gemini 2.x Models" className="bg-slate-900 text-slate-300">
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                  </optgroup>
                  <optgroup label="Gemini 1.5 Models" className="bg-slate-900 text-slate-300">
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </optgroup>

                  {/* Discovered Models from User's Key */}
                  {availableModels.length > 0 && (
                    <optgroup label="Unlocked Models for Your API Key" className="bg-slate-900 text-emerald-400">
                      {availableModels.map((m, idx) => (
                        <option key={idx} value={m}>✅ {m}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm">
                <HelpCircle className="w-5 h-5 flex-shrink-0 text-indigo-400 mt-0.5" />
                <p>
                  Get a free API key instantly at{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 font-semibold">
                    Google AI Studio
                  </a>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-800 bg-slate-900/50">
              <button onClick={() => setShowKeyModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSaveKey} 
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
