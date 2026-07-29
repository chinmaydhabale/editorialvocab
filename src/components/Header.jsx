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
    <header className="app-header">
      <div className="header-container">
        {/* Brand */}
        <div className="brand-box">
          <div className="brand-logo">
            <BookOpen className="logo-icon" />
          </div>
          <div>
            <h1 className="brand-title">
              Editorial<span className="text-gradient">Vocab</span> Bot
            </h1>
            <p className="brand-subtitle">
              Blogger Automation for Daily Tricky Words & Memory Tricks
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="header-actions">
          {/* Theme Selector */}
          <div className="theme-selector">
            <Sliders className="action-icon" />
            <select 
              value={currentTheme} 
              onChange={(e) => setCurrentTheme(e.target.value)}
              className="theme-select"
            >
              <option value="slate">Theme: Slate Dark</option>
              <option value="warm">Theme: Warm Paper</option>
              <option value="cyber">Theme: Cyber Cyan</option>
            </select>
          </div>

          {/* API Key Modal Button */}
          <button 
            onClick={() => setShowKeyModal(true)} 
            className={`btn-api-key ${apiKey ? 'active' : ''}`}
          >
            <Key className="btn-icon" />
            <span>{apiKey ? `API (${selectedModel || '3.6 Flash'})` : 'Set Gemini API Key'}</span>
            {apiKey && <span className="key-dot" />}
          </button>
        </div>
      </div>

      {/* API Key & Model Configuration Modal */}
      {showKeyModal && (
        <div className="modal-backdrop" onClick={() => setShowKeyModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-400" />
                <h3>Gemini AI Settings</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="modal-close">&times;</button>
            </div>

            <div className="modal-body">
              <p className="modal-text">
                Enter your Google Gemini API Key and select from the latest Gemini Flash models.
              </p>
              
              <div className="input-group mb-3" style={{ marginBottom: '14px' }}>
                <label>Gemini API Key</label>
                <input 
                  type="password" 
                  placeholder="AIzaSy..." 
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div className="input-group mb-3" style={{ marginBottom: '14px' }}>
                <label className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    Gemini Model Target
                  </span>
                  {isDiscovering && <span className="text-xs text-amber-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Detecting API Key Models...</span>}
                </label>

                <select 
                  value={tempModel} 
                  onChange={(e) => setTempModel(e.target.value)} 
                  className="select-input"
                >
                  <optgroup label="Latest Gemini 3.x Models">
                    <option value="gemini-3.6-flash">⚡ Gemini 3.6 Flash (Latest Ultra Fast)</option>
                    <option value="gemini-3.5-flash">⚡ Gemini 3.5 Flash</option>
                  </optgroup>
                  <optgroup label="Gemini 2.x Models">
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                  </optgroup>
                  <optgroup label="Gemini 1.5 Models">
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </optgroup>

                  {/* Discovered Models from User's Key */}
                  {availableModels.length > 0 && (
                    <optgroup label="Unlocked Models for Your API Key">
                      {availableModels.map((m, idx) => (
                        <option key={idx} value={m}>✅ {m}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="api-help-box">
                <HelpCircle className="help-icon" />
                <span>
                  Get a free key at{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                    Google AI Studio
                  </a>.
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowKeyModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveKey} className="btn-primary">
                {savedSuccess ? (
                  <>
                    <CheckCircle className="btn-icon" />
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
