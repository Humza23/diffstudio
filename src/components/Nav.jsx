export default function Nav({ activeTab, onTabChange, onSettingsOpen, onProfileOpen, profileActive, sidebarHidden, onSidebarToggle }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-4">
      {/* Hamburger for mobile sidebar */}
      {sidebarHidden && (
        <button
          aria-label="Toggle history sidebar"
          onClick={onSidebarToggle}
          className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors duration-150 mr-1"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <rect y="3" width="18" height="2" rx="1" />
            <rect y="8" width="18" height="2" rx="1" />
            <rect y="13" width="18" height="2" rx="1" />
          </svg>
        </button>
      )}

      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="w-7 h-7 rounded-md bg-amber-400 flex items-center justify-center"
          aria-hidden="true"
        >
          <span style={{ fontFamily: '"JetBrains Mono", monospace' }} className="text-white text-xs font-bold">DS</span>
        </div>
        <span
          className="font-bold text-slate-800 text-base hidden sm:block"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          DiffStudio
        </span>
      </div>

      {/* Center tabs */}
      <div className="flex-1 flex justify-center">
        <div className="flex gap-1">
          <NavTab
            label="Lesson Studio"
            active={activeTab === 'studio'}
            onClick={() => onTabChange('studio')}
          />
          <NavTab
            label="Response Analyzer"
            active={activeTab === 'analyzer'}
            onClick={() => onTabChange('analyzer')}
          />
        </div>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="relative">
          <button
            aria-label="Teacher profile"
            onClick={onProfileOpen}
            title={profileActive ? 'Profile active — generations are personalized' : 'Set up your teacher profile'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-150"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <circle cx="9" cy="6" r="3.5" />
              <path d="M2 15c0-3.3 3.1-6 7-6s7 2.7 7 6" />
            </svg>
          </button>
          {profileActive && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 border border-white"
              aria-hidden="true"
            />
          )}
        </div>

        <button
          aria-label="Open API settings"
          onClick={onSettingsOpen}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-150"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm0 1.5a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
            />
            <path
              fillRule="evenodd"
              d="M7.2 1h3.6l.5 2.1a6 6 0 0 1 1.5.9l2-.8 1.8 3.1-1.6 1.3a6 6 0 0 1 0 1.8l1.6 1.3-1.8 3.1-2-.8a6 6 0 0 1-1.5.9L10.8 17H7.2l-.5-2.1a6 6 0 0 1-1.5-.9l-2 .8L1.4 11.8l1.6-1.3a6 6 0 0 1 0-1.8L1.4 7.4l1.8-3.1 2 .8a6 6 0 0 1 1.5-.9L7.2 2v-1zm1.3 1l-.4 1.7-.5.2a4.5 4.5 0 0 0-1.2.7l-.4.3-1.7-.7-.8 1.4 1.4 1.1-.1.5a4.5 4.5 0 0 0 0 1.6l.1.5-1.4 1.1.8 1.4 1.7-.7.4.3a4.5 4.5 0 0 0 1.2.7l.5.2.4 1.7h1.6l.4-1.7.5-.2a4.5 4.5 0 0 0 1.2-.7l.4-.3 1.7.7.8-1.4-1.4-1.1.1-.5a4.5 4.5 0 0 0 0-1.6l-.1-.5 1.4-1.1-.8-1.4-1.7.7-.4-.3a4.5 4.5 0 0 0-1.2-.7l-.5-.2L9.9 2H8.5z"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}

function NavTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 h-12 text-sm font-medium transition-colors duration-150 ${
        active ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-t" />
      )}
    </button>
  );
}
