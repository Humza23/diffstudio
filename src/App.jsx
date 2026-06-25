import { useCallback, useEffect, useState } from 'react';
import Nav from './components/Nav.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import TeacherProfile from './components/TeacherProfile.jsx';
import InputPanel from './components/InputPanel.jsx';
import ArtifactPanel from './components/ArtifactPanel.jsx';
import Sidebar from './components/Sidebar.jsx';
import StudentAnalyzer from './components/StudentAnalyzer.jsx';
import Toast from './components/Toast.jsx';
import { useStream } from './hooks/useStream.js';
import { useHistory } from './hooks/useHistory.js';

const INITIAL_PROFILE = {
  grade: '',
  classSize: '',
  schoolYear: '',
  ellPercent: 0,
  iepPercent: 0,
  scaffoldingStyle: 'flexible',
  standingAccommodations: '',
};

function profileIsActive(profile) {
  const signals = [
    profile.grade,
    profile.classSize,
    profile.schoolYear,
    profile.scaffoldingStyle !== 'flexible' ? profile.scaffoldingStyle : '',
    profile.standingAccommodations,
    profile.ellPercent > 0 ? 'ell' : '',
    profile.iepPercent > 0 ? 'iep' : '',
  ];
  return signals.filter(Boolean).length >= 3;
}

export default function App() {
  const [apiKey, setApiKey]             = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab]       = useState('studio');
  const [profileOpen, setProfileOpen]   = useState(false);
  const [profile, setProfile]           = useState(INITIAL_PROFILE);
  const [toasts, setToasts]             = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentParams, setCurrentParams] = useState(null);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  const hasProxy = import.meta.env.VITE_USE_PROXY === 'true';

  // Auto-open settings on first load when no key is available at all
  useEffect(() => {
    if (!hasProxy && !apiKey) setSettingsOpen(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { generate, isStreaming, rawText, error: streamError, reset } = useStream(apiKey, profile);
  const {
    history, addEntry, removeEntry, clearHistory,
    addTag, removeTag, togglePin,
  } = useHistory();

  const addToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  function handleSaveProfile(newProfile) {
    setProfile(newProfile);
    addToast('Profile saved — all generations will be personalized', 'success');
  }

  function handleSaveApiKey(key) {
    setApiKey(key);
    if (key) addToast('API key saved', 'success');
  }

  async function handleGenerate(params) {
    setCurrentParams(params);
    // Clear active history selection when generating fresh
    setActiveHistoryId(null);
    const text = await generate(params);
    if (!text) {
      if (streamError) addToast(streamError, 'error');
      return;
    }
    const newId = addEntry(params, text);
    setActiveHistoryId(newId);
  }

  function handleRegenerate() {
    if (currentParams) handleGenerate(currentParams);
  }

  function handleSelectHistory(id) {
    setActiveHistoryId((prev) => (prev === id ? null : id));
  }

  function handleClearHistory() {
    clearHistory();
    setActiveHistoryId(null);
  }

  // Dev helper
  if (typeof window !== 'undefined') {
    window.testToast = (msg, type) => addToast(msg ?? 'Test toast!', type ?? 'info');
  }

  const activeHistoryItem = history.find((h) => h.id === activeHistoryId) ?? null;
  const displayText   = activeHistoryItem?.content ?? rawText;
  const displayParams = activeHistoryItem
    ? { grade: activeHistoryItem.grade, topic: activeHistoryItem.topic, mode: activeHistoryItem.mode }
    : currentParams;
  const isReadOnly        = !!activeHistoryItem && !isStreaming;
  const readOnlyTimestamp = isReadOnly ? activeHistoryItem.timestamp : null;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F8F7F4' }}>
      <Nav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSettingsOpen={() => setSettingsOpen(true)}
        onProfileOpen={() => setProfileOpen(true)}
        profileActive={profileIsActive(profile)}
        sidebarHidden={!mobileSidebarOpen}
        onSidebarToggle={() => setMobileSidebarOpen((v) => !v)}
      />

      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: '48px', height: '100vh' }}>
        {activeTab === 'studio' ? (
          <StudioLayout
            apiKey={apiKey}
            addToast={addToast}
            onGenerate={handleGenerate}
            onRegenerate={handleRegenerate}
            isStreaming={isStreaming}
            streamError={streamError}
            reset={reset}
            displayText={displayText}
            displayParams={displayParams}
            isReadOnly={isReadOnly}
            readOnlyTimestamp={readOnlyTimestamp}
            history={history}
            activeHistoryId={activeHistoryId}
            onSelectHistory={handleSelectHistory}
            onPin={togglePin}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            onDeleteHistory={removeEntry}
            onClearHistory={handleClearHistory}
            mobileSidebarOpen={mobileSidebarOpen}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        ) : (
          <StudentAnalyzer
            apiKey={apiKey}
            addToast={addToast}
            onAddHistoryEntry={addEntry}
          />
        )}
      </div>

      {settingsOpen && (
        <SettingsModal
          apiKey={apiKey}
          hasProxy={hasProxy}
          onSave={handleSaveApiKey}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {profileOpen && (
        <TeacherProfile
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setProfileOpen(false)}
        />
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function StudioLayout({
  apiKey, addToast,
  onGenerate, onRegenerate, isStreaming, streamError, reset,
  displayText, displayParams, isReadOnly, readOnlyTimestamp,
  history, activeHistoryId, onSelectHistory,
  onPin, onAddTag, onRemoveTag, onDeleteHistory, onClearHistory,
  mobileSidebarOpen, onOpenSettings,
}) {
  return (
    <div className="flex flex-1 overflow-hidden w-full h-full">
      {/* Left sidebar */}
      <div className={`${mobileSidebarOpen ? 'flex' : 'hidden'} lg:flex flex-shrink-0 h-full relative`}>
        <Sidebar
          history={history}
          activeId={activeHistoryId}
          onSelect={onSelectHistory}
          onPin={onPin}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          onDelete={onDeleteHistory}
          onClear={onClearHistory}
        />
      </div>

      {/* Center panel */}
      <div className="flex-1 overflow-y-auto h-full">
        <InputPanel
          apiKey={apiKey}
          addToast={addToast}
          onGenerate={onGenerate}
          isStreaming={isStreaming}
          streamError={streamError}
          reset={reset}
          onOpenSettings={onOpenSettings}
        />
      </div>

      {/* Right artifact panel — hidden below 768px */}
      <div
        className="artifact-panel-col flex-shrink-0 h-full overflow-y-auto border-l border-slate-200"
        style={{ width: '420px' }}
      >
        <ArtifactPanel
          rawText={displayText}
          isStreaming={isStreaming}
          grade={displayParams?.grade}
          topic={displayParams?.topic}
          mode={displayParams?.mode}
          isReadOnly={isReadOnly}
          readOnlyTimestamp={readOnlyTimestamp}
          onRegenerate={onRegenerate}
          addToast={addToast}
        />
      </div>
    </div>
  );
}
