import { useEffect, useRef, useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer.jsx';
import { parseMarkdown } from '../utils/markdownParser.js';
import { copyToClipboard, exportAsTxt, openInGoogleDocs } from '../utils/exportUtils.js';

export default function ArtifactCard({
  rawText,
  isStreaming,
  grade,
  topic,
  mode,
  isReadOnly,
  readOnlyTimestamp,
  onRegenerate,
  addToast,
}) {
  const sections = parseMarkdown(rawText);
  const cardRef = useRef(null);

  async function handleCopy() {
    try {
      await copyToClipboard(rawText);
      addToast('Copied to clipboard', 'success');
    } catch {
      addToast('Copy failed — check browser permissions', 'error');
    }
  }

  function handleDownload() {
    exportAsTxt(rawText, grade ?? '', topic ?? '');
    addToast('Downloaded', 'success');
  }

  async function handleGoogleDocs() {
    try {
      await openInGoogleDocs(rawText);
    } catch {
      // fell back to clipboard
      addToast('Copied to clipboard — paste into a new Google Doc', 'info');
    }
  }

  const timestamp = readOnlyTimestamp
    ? relativeTime(readOnlyTimestamp)
    : null;

  return (
    <div ref={cardRef} className="flex flex-col h-full">
      {/* Read-only banner */}
      {isReadOnly && (
        <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <p className="text-xs text-slate-500">
            Viewing saved artifact{timestamp ? ` from ${timestamp}` : ''} — Regenerate to create a new version
          </p>
        </div>
      )}

      {/* Sticky card header */}
      <div className="flex-shrink-0 sticky top-0 bg-white border-b border-slate-200 px-5 py-3 z-10">
        <div className="flex items-center gap-2 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {grade && (
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                Grade {grade}
              </span>
            )}
            <span
              className="text-sm font-semibold text-slate-800 truncate"
              style={{ fontFamily: '"DM Sans", sans-serif' }}
              title={topic}
            >
              {topic}
            </span>
            {mode && (
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {mode.title}
              </span>
            )}
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <IconButton aria-label="Copy to clipboard" onClick={handleCopy} title="Copy">
              <CopyIcon />
            </IconButton>
            <IconButton aria-label="Download as text file" onClick={handleDownload} title="Download .txt">
              <DownloadIcon />
            </IconButton>
            <IconButton aria-label="Open in Google Docs" onClick={handleGoogleDocs} title="Open in Google Docs">
              <DocsIcon />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {sections.length === 0 && isStreaming && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="streaming-cursor" aria-hidden="true" />
            <span>Generating your artifact...</span>
          </div>
        )}

        {sections.map((section, idx) => {
          const isLastSection = idx === sections.length - 1;
          const hasContent = section.content.length > 0;
          return (
            <SectionBlock
              key={section.header}
              header={section.header}
              content={section.content}
              showCursor={isStreaming && isLastSection}
              hasContent={hasContent || isStreaming}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-slate-200 bg-white">
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isStreaming}
          className="w-full h-9 rounded-lg border border-slate-200 text-sm text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Regenerate
        </button>
        <p className="text-xs text-slate-400 text-center mt-2">
          Generated with claude-sonnet-4-6 · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

/** Section with signature growing amber border animation. */
function SectionBlock({ header, content, showCursor, hasContent }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (hasContent && !mounted) {
      // Tiny delay so the transition plays vs. rendering at 100% immediately
      const t = setTimeout(() => setMounted(true), 30);
      return () => clearTimeout(t);
    }
  }, [hasContent, mounted]);

  return (
    <div className={`relative ${mounted ? 'section-fade' : 'opacity-0'}`}>
      {/* Growing amber border line */}
      <div
        className="absolute left-0 top-0 w-1 rounded-sm bg-amber-400 section-border"
        style={{
          height: mounted ? '100%' : '0%',
          transition: 'height 300ms ease',
        }}
        aria-hidden="true"
      />

      <div className="pl-4">
        {/* Section header */}
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
          {header}
        </p>

        {/* Section content */}
        <MarkdownRenderer content={content} showCursor={showCursor && content.length > 0} />

        {/* Cursor for empty-but-streaming section (header just appeared) */}
        {showCursor && content.length === 0 && (
          <span className="streaming-cursor" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

function IconButton({ children, onClick, 'aria-label': label, title }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150"
    >
      {children}
    </button>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M3 10H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 11v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="2" y="1" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 9l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function relativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}
