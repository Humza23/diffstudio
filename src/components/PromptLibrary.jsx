import { useLayoutEffect, useState } from 'react';
import { PROMPT_LIBRARY, CATEGORIES, CATEGORY_COLORS } from '../data/promptLibrary.js';

export default function PromptLibrary({ onClose, onLoad }) {
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const visible = category === 'All'
    ? PROMPT_LIBRARY
    : PROMPT_LIBRARY.filter((p) => p.category === category);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Prompt Library"
      className="fixed top-0 right-0 bottom-0 z-50 w-96 bg-white shadow-xl flex flex-col"
      style={{
        transform: mounted ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 250ms ease',
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h2
              className="text-lg font-bold text-slate-800"
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              Prompt Library
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real prompts from IM teachers — click to load
            </p>
          </div>
          <button
            aria-label="Close prompt library"
            onClick={onClose}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.29 3.29a1 1 0 0 1 1.42 0L8 6.59l3.29-3.3a1 1 0 1 1 1.42 1.42L9.41 8l3.3 3.29a1 1 0 1 1-1.42 1.42L8 9.41l-3.29 3.3a1 1 0 1 1-1.42-1.42L6.59 8 3.29 4.71a1 1 0 0 1 0-1.42z" />
            </svg>
          </button>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-150 ${
                category === cat
                  ? 'bg-amber-400 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {visible.map((prompt) => {
          const isExpanded = expanded === prompt.id;
          const colorClass = CATEGORY_COLORS[prompt.category] ?? 'bg-slate-100 text-slate-600';
          return (
            <div
              key={prompt.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all duration-150"
              style={{
                borderLeftWidth: '3px',
                borderLeftColor: isExpanded ? '#F59E0B' : '#E2E8F0',
              }}
            >
              {/* Category badge */}
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${colorClass}`}>
                {prompt.category}
              </span>

              {/* Title */}
              <p className="text-sm font-medium text-slate-800 mb-1">{prompt.title}</p>

              {/* Prompt text — truncated unless expanded */}
              <p className={`text-sm text-slate-600 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                {prompt.prompt}
              </p>

              {/* See example toggle */}
              <button
                onClick={() => setExpanded(isExpanded ? null : prompt.id)}
                className="mt-2 text-xs text-slate-500 hover:text-slate-700 transition-colors duration-150"
              >
                {isExpanded ? 'Hide example ▴' : 'See example ▾'}
              </button>

              {/* Example block */}
              {isExpanded && (
                <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <p
                    className="text-xs text-slate-600 leading-relaxed"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  >
                    {prompt.example}
                  </p>
                </div>
              )}

              {/* Load button */}
              <button
                type="button"
                onClick={() => onLoad(prompt)}
                className="mt-3 w-full h-8 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors duration-150"
              >
                Load this prompt
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
