import { useEffect, useRef, useState } from 'react';

const TAG_COLORS = [
  'bg-amber-100 text-amber-800',
  'bg-green-100 text-green-800',
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-rose-100 text-rose-800',
];

function tagColor(tag) {
  let hash = 0;
  for (const ch of tag) hash = (hash * 31 + ch.charCodeAt(0)) & 0xff;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

function relativeTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default function HistoryItem({
  item,
  isActive,
  onClick,
  onPin,
  onAddTag,
  onRemoveTag,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const menuRef = useRef(null);
  const tagRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (addingTag && tagRef.current) tagRef.current.focus();
  }, [addingTag]);

  function handleTagSubmit(e) {
    e.preventDefault();
    if (tagInput.trim()) { onAddTag(item.id, tagInput.trim()); }
    setTagInput('');
    setAddingTag(false);
  }

  const shortTopic = item.topic.length > 24 ? item.topic.slice(0, 24) + '…' : item.topic;

  return (
    <div
      className={`group relative px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150 ${
        isActive
          ? 'bg-amber-50 border-l-4 border-amber-400'
          : 'bg-white hover:bg-slate-50 border-l-4 border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2 min-w-0">
        {/* Mode icon */}
        <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
          {item.mode.icon}
        </span>

        {/* Center info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {item.pinned && (
              <span aria-label="Pinned" className="text-xs">📌</span>
            )}
            <span className="text-sm font-medium text-slate-800 truncate">{shortTopic}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
              G{item.grade}
            </span>
            <span className="text-xs text-slate-500 truncate">{item.mode.title}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{relativeTime(item.timestamp)}</p>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${tagColor(tag)}`}
                >
                  {tag}
                  <button
                    aria-label={`Remove tag ${tag}`}
                    onClick={(e) => { e.stopPropagation(); onRemoveTag(item.id, tag); }}
                    className="opacity-60 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Inline tag input */}
          {addingTag && (
            <form onSubmit={handleTagSubmit} onClick={(e) => e.stopPropagation()}>
              <input
                ref={tagRef}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onBlur={() => { setAddingTag(false); setTagInput(''); }}
                onKeyDown={(e) => { if (e.key === 'Escape') { setAddingTag(false); setTagInput(''); } }}
                placeholder="Tag name…"
                className="mt-1.5 w-full text-xs px-2 py-1 border border-amber-300 rounded-md focus:outline-none"
              />
            </form>
          )}
        </div>

        {/* "…" menu button — visible on group hover */}
        <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()} ref={menuRef}>
          <button
            aria-label="Item options"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <circle cx="7" cy="2.5" r="1.2" />
              <circle cx="7" cy="7" r="1.2" />
              <circle cx="7" cy="11.5" r="1.2" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-50 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-36">
              <MenuItem onClick={() => { onPin(item.id); setMenuOpen(false); }}>
                {item.pinned ? 'Unpin' : 'Pin'}
              </MenuItem>
              <MenuItem onClick={() => { setAddingTag(true); setMenuOpen(false); }}>
                Add tag
              </MenuItem>
              <MenuItem
                onClick={() => { onDelete(item.id); setMenuOpen(false); }}
                className="text-red-500 hover:bg-red-50"
              >
                Delete
              </MenuItem>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuItem({ onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150 ${className}`}
    >
      {children}
    </button>
  );
}
