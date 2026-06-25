import { useState } from 'react';
import HistoryItem from './HistoryItem.jsx';

const MODE_FILTERS = [
  { label: 'All', id: null },
  { label: 'Scaffolding', id: 'scaffold' },
  { label: 'Mini-Lesson', id: 'miniLesson' },
  { label: 'Practice', id: 'practice' },
  { label: 'Exit Ticket', id: 'exitTicket' },
  { label: 'Internalize', id: 'internalize' },
  { label: 'Analysis', id: 'responseAnalysis' },
];

export default function Sidebar({
  history,
  activeId,
  onSelect,
  onPin,
  onAddTag,
  onRemoveTag,
  onDelete,
  onClear,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  function filtered() {
    let items = history;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (h) =>
          h.topic.toLowerCase().includes(q) ||
          h.content.toLowerCase().includes(q) ||
          h.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (modeFilter) {
      items = items.filter((h) => h.mode?.id === modeFilter);
    }
    return items;
  }

  const visible = filtered();

  return (
    <aside className="w-64 h-full flex flex-col border-r border-slate-200 bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h2
            className="font-bold text-slate-800"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            History
          </h2>
          <div className="flex items-center gap-1">
            <button
              aria-label={searchOpen ? 'Close search' : 'Search history'}
              onClick={() => { setSearchOpen((v) => !v); setSearchQuery(''); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="6" cy="6" r="4" />
                <path d="M9.5 9.5L13 13" />
              </svg>
            </button>
            <button
              aria-label="Clear all history"
              onClick={() => setConfirmClear(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1M11.5 3.5l-.7 8a1 1 0 0 1-1 .9H4.2a1 1 0 0 1-1-.9l-.7-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search input */}
        {searchOpen && (
          <div className="relative mb-2">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="w-full h-8 pl-3 pr-7 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors duration-150"
            />
            {searchQuery && (
              <button
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Mode filter pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {MODE_FILTERS.map((f) => (
            <button
              key={f.id ?? 'all'}
              onClick={() => setModeFilter(f.id)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-150 ${
                modeFilter === f.id
                  ? 'bg-amber-400 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {visible.length === 0 ? (
          <SidebarEmpty hasHistory={history.length > 0} />
        ) : (
          visible.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              onClick={() => onSelect(item.id)}
              onPin={() => onPin?.(item.id)}
              onAddTag={(id, tag) => onAddTag?.(id, tag)}
              onRemoveTag={(id, tag) => onRemoveTag?.(id, tag)}
              onDelete={(id) => onDelete?.(id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {history.length} artifact{history.length !== 1 ? 's' : ''}
        </span>
        {history.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors duration-150"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Confirm clear dialog */}
      {confirmClear && (
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="w-full bg-white border-t border-slate-200 shadow-xl p-4">
            <p className="text-sm text-slate-700 font-medium mb-1">
              Clear all {history.length} artifact{history.length !== 1 ? 's' : ''}?
            </p>
            <p className="text-xs text-slate-500 mb-3">This can't be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 h-8 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => { onClear?.(); setConfirmClear(false); }}
                className="flex-1 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors duration-150"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function SidebarEmpty({ hasHistory }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="text-slate-300 mb-3"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 10v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="font-semibold text-slate-500 text-sm" style={{ fontFamily: '"DM Sans", sans-serif' }}>
        {hasHistory ? 'No matches' : 'Nothing yet'}
      </p>
      <p className="text-xs text-slate-400 mt-1">
        {hasHistory
          ? 'Try a different search or filter.'
          : 'Your generations appear here as you work.'}
      </p>
    </div>
  );
}
