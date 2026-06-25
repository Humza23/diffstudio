import { useRef, useState } from 'react';
import GradeSelector from './GradeSelector.jsx';
import ModeSelector from './ModeSelector.jsx';
import PromptLibrary from './PromptLibrary.jsx';
import { MODES } from '../data/modes.js';

const CONTEXT_MAX = 500;

export default function InputPanel({
  apiKey,
  addToast,
  onGenerate,
  isStreaming,
  streamError,
  reset,
  onOpenSettings,
}) {
  const [grade, setGrade]     = useState('');
  const [topic, setTopic]     = useState('');
  const [context, setContext] = useState('');
  const [mode, setMode]       = useState(null);
  const [promptLibOpen, setPromptLibOpen] = useState(false);
  const topicRef = useRef(null);

  const hasKey = !!(apiKey || import.meta.env.VITE_USE_PROXY === 'true');

  const canGenerate =
    hasKey &&
    !!grade &&
    topic.trim().length > 2 &&
    !!mode &&
    !isStreaming;

  function handleGradeChange(g) {
    setGrade(g);
    reset();
  }

  function handleTopicChange(val) {
    setTopic(val);
    if (val.trim().length <= 2) reset();
  }

  function handleModeChange(m) {
    setMode(m);
    reset();
  }

  function disabledReason() {
    if (!hasKey)                    return 'Add an API key in Settings to generate';
    if (!grade)                     return 'Pick a grade to get started';
    if (topic.trim().length <= 2)   return 'Add a topic (3+ characters)';
    if (!mode)                      return 'Choose a mode to continue';
    return '';
  }

  async function handleGenerate() {
    if (!canGenerate) {
      if (!hasKey) onOpenSettings();
      return;
    }
    const text = await onGenerate({
      grade,
      topic: topic.trim(),
      mode,
      context: context.trim(),
    });
    if (!text && streamError) {
      addToast(streamError, 'error');
    }
  }

  function handleLoadPrompt({ prompt, mode: modeId, grade: promptGrade }) {
    setContext(prompt);
    const matched = MODES.find((m) => m.id === modeId);
    if (matched) setMode(matched);
    if (promptGrade) setGrade(promptGrade);
    setPromptLibOpen(false);
    addToast('Prompt loaded — edit it to fit your class, then generate', 'info');
  }

  return (
    <>
      <div className="max-w-xl mx-auto px-6 py-8 space-y-8">

        {/* Section 1 — Your lesson */}
        <section>
          <SectionLabel>Your lesson</SectionLabel>
          <div className="space-y-4">
            <div>
              <FieldLabel>Pick your grade</FieldLabel>
              <div className="mt-2">
                <GradeSelector value={grade} onChange={handleGradeChange} />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="topic-input">Math topic</FieldLabel>
              <div className="relative mt-2">
                <input
                  id="topic-input"
                  ref={topicRef}
                  type="text"
                  value={topic}
                  onChange={(e) => handleTopicChange(e.target.value)}
                  placeholder="e.g. Multiplying Fractions, Place Value, Ratios & Proportions..."
                  className="w-full h-10 px-3 pr-8 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors duration-150"
                />
                {topic && (
                  <button
                    aria-label="Clear topic"
                    onClick={() => {
                      setTopic('');
                      reset();
                      topicRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-150"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <path d="M1.4 1.4a.8.8 0 0 1 1.1 0L7 5.9l4.5-4.5a.8.8 0 1 1 1.1 1.1L8.1 7l4.5 4.5a.8.8 0 1 1-1.1 1.1L7 8.1l-4.5 4.5a.8.8 0 1 1-1.1-1.1L5.9 7 1.4 2.5a.8.8 0 0 1 0-1.1z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 — Your students */}
        <section>
          <SectionLabel>What do your students need?</SectionLabel>
          <div className="relative mt-2">
            <textarea
              id="context-input"
              rows={4}
              value={context}
              onChange={(e) => setContext(e.target.value.slice(0, CONTEXT_MAX))}
              placeholder={`Describe what you're seeing. For example:\n• Several students missed problems 2 and 4 on the pre-unit check\n• Two students have IEPs requiring visual supports\n• My ELL students need sentence frames for the discussion activity`}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors duration-150"
            />
            <span
              className="absolute bottom-2 right-3 text-xs text-slate-400 tabular-nums pointer-events-none"
              aria-live="polite"
            >
              {context.length} / {CONTEXT_MAX}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPromptLibOpen(true)}
            className="mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors duration-150"
          >
            Browse prompt library →
          </button>
        </section>

        {/* Section 3 — Choose a mode */}
        <section>
          <SectionLabel>Choose a mode</SectionLabel>
          <div className="mt-2">
            <ModeSelector value={mode} onChange={handleModeChange} />
          </div>
        </section>

        {/* Generate button */}
        <div className="pb-8">
          <div className="relative group">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              aria-disabled={!canGenerate}
              className={`w-full h-12 rounded-lg text-base font-semibold transition-colors duration-150 flex items-center justify-center gap-2 ${
                canGenerate
                  ? 'bg-amber-400 hover:bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              {isStreaming ? (
                <>
                  <Spinner />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>

            {!canGenerate && !isStreaming && (
              <div
                role="tooltip"
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-10"
              >
                {disabledReason()}
              </div>
            )}
          </div>

          {streamError && (
            <p role="alert" className="mt-3 text-xs text-red-500 text-center">
              {streamError}
            </p>
          )}
        </div>
      </div>

      {promptLibOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setPromptLibOpen(false)}
            aria-hidden="true"
          />
          <PromptLibrary
            onClose={() => setPromptLibOpen(false)}
            onLoad={handleLoadPrompt}
          />
        </>
      )}
    </>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
      {children}
    </p>
  );
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
