import { useEffect, useRef, useState } from 'react';

export default function SettingsModal({ apiKey, hasProxy, onSave, onClose }) {
  const [inputValue, setInputValue] = useState(apiKey ?? '');
  const [editing, setEditing] = useState(!apiKey);
  const overlayRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  // Track saved key locally so masked view renders immediately after Save
  const [savedKey, setSavedKey] = useState(apiKey ?? '');

  function handleSave() {
    const trimmed = inputValue.trim();
    onSave(trimmed);
    setSavedKey(trimmed);
    setEditing(false);
  }

  const displayKey = savedKey || apiKey || '';
  const maskedKey = displayKey ? `sk-ant-...${displayKey.slice(-4)}` : '';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      aria-modal="true"
      role="dialog"
      aria-label="API Settings"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-xl font-bold text-slate-800"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            API Settings
          </h2>
          <button
            aria-label="Close settings"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors duration-150"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.29 4.29a1 1 0 0 1 1.42 0L10 8.59l4.29-4.3a1 1 0 1 1 1.42 1.42L11.41 10l4.3 4.29a1 1 0 1 1-1.42 1.42L10 11.41l-4.29 4.3a1 1 0 1 1-1.42-1.42L8.59 10 4.29 5.71a1 1 0 0 1 0-1.42z" />
            </svg>
          </button>
        </div>

        {/* Proxy banner — shown when server-side proxy is active and user hasn't set their own key */}
        {hasProxy && !displayKey && (
          <div className="mb-4 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Demo mode active</span> — the app works out of the box using a secure server-side key (Claude Haiku). Add your own Anthropic key below to use Claude Sonnet for higher quality.
            </p>
          </div>
        )}

        {displayKey && !editing ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
              Anthropic API Key
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm text-slate-700 font-mono flex-1">{maskedKey}</span>
              <button
                onClick={() => { setInputValue(displayKey); setEditing(true); }}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors duration-150"
              >
                Change
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Your key is stored in memory only and never sent anywhere except Anthropic's API.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors duration-150"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="api-key-input"
                className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2"
              >
                Anthropic API Key
              </label>
              <input
                id="api-key-input"
                ref={inputRef}
                type="password"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && inputValue.trim()) handleSave(); }}
                placeholder="sk-ant-..."
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors duration-150"
              />
            </div>
            <p className="text-xs text-slate-500">
              Your key is stored in memory only and never sent anywhere except Anthropic's API.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-10 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!inputValue.trim()}
                className="flex-1 h-10 rounded-lg bg-amber-400 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm transition-colors duration-150"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
