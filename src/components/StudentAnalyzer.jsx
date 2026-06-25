import { useState } from 'react';
import GradeSelector from './GradeSelector.jsx';
import ArtifactCard from './ArtifactCard.jsx';
import EmptyState from './EmptyState.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const MAX_RESPONSES = 5;

function makeSlot(letter) {
  return { id: crypto.randomUUID(), letter, text: '', correct: false };
}

function buildAnalysisPrompt(grade, topic, problem, slots) {
  const filledSlots = slots.filter((s) => s.text.trim());
  const responseLines = filledSlots.map(
    (s) => `Student ${s.letter} (${s.correct ? 'correct' : 'needs support'}): ${s.text.trim()}`
  );
  return {
    system: [
      'You are an expert K-12 math education specialist. Analyze student responses to identify misconception patterns and generate a targeted instructional response.',
      '\nRespond in exactly this structure:',
      '## 🔍 Misconception Analysis',
      '## 📊 What the Data Shows',
      '## 🎯 Recommended Mini-Lesson Focus',
      '## 📚 Mini-Lesson Plan (15–20 minutes)',
      '## 💡 What to Watch For',
    ].join('\n'),
    user: [
      `Grade: ${grade}`,
      `Topic: ${topic}`,
      `Problem: ${problem}`,
      '',
      'Student responses:',
      ...responseLines,
      '',
      'Identify the misconception pattern and generate a targeted mini-lesson.',
    ].join('\n'),
  };
}

export default function StudentAnalyzer({ apiKey, addToast, onAddHistoryEntry }) {
  const [grade, setGrade]     = useState('');
  const [topic, setTopic]     = useState('');
  const [problem, setProblem] = useState('');
  const [slots, setSlots]     = useState([makeSlot('A'), makeSlot('B'), makeSlot('C')]);
  const [rawText, setRawText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError]     = useState('');

  const filledSlots   = slots.filter((s) => s.text.trim());
  const needsSupport  = filledSlots.filter((s) => !s.correct);
  const allCorrect    = filledSlots.length > 0 && filledSlots.every((s) => s.correct);

  const hasKey = !!(apiKey || import.meta.env.VITE_USE_PROXY === 'true');

  const canAnalyze =
    hasKey &&
    !!grade &&
    problem.trim().length > 0 &&
    filledSlots.length >= 2 &&
    !isStreaming;

  function updateSlot(id, field, value) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function addSlot() {
    if (slots.length >= MAX_RESPONSES) return;
    const letter = LETTERS[slots.length];
    setSlots((prev) => [...prev, makeSlot(letter)]);
  }

  function removeSlot(id) {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleAnalyze() {
    if (!canAnalyze) return;
    setError('');
    setRawText('');
    setIsStreaming(true);

    const { system, user } = buildAnalysisPrompt(grade, topic, problem.trim(), slots);
    let accumulated = '';
    let responseStatus = 0;

    try {
      const useProxy = !apiKey && import.meta.env.VITE_USE_PROXY === 'true';
      const model = useProxy ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-6';
      const endpoint = useProxy ? '/api/chat' : 'https://api.anthropic.com/v1/messages';
      const authHeaders = useProxy
        ? {}
        : {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          stream: true,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      });

      responseStatus = response.status;
      if (!response.ok) {
        const msg =
          response.status === 401 ? 'Invalid API key. Check Settings.' :
          response.status === 429 ? 'Rate limit reached. Wait a moment and try again.' :
          response.status >= 500  ? 'Anthropic API error. Try again.' :
          `Request failed (${response.status}). Try again.`;
        throw new Error(msg);
      }

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk  = decoder.decode(value, { stream: true });
        const events = chunk.split('\n\n');
        for (const event of events) {
          if (!event.startsWith('data: ')) continue;
          const data = event.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              accumulated += parsed.delta.text;
              setRawText(accumulated);
            }
          } catch { /* ignore malformed frames */ }
        }
      }

      if (!accumulated) throw new Error('No content received. Try again.');

    } catch (err) {
      const msg = err.message ?? 'Connection failed. Check your internet connection.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsStreaming(false);
    }
  }

  function handleSaveToHistory() {
    if (!rawText || !onAddHistoryEntry) return;
    onAddHistoryEntry(
      {
        grade,
        topic: topic || 'Response Analysis',
        mode: { id: 'responseAnalysis', icon: '📊', title: 'Response Analysis' },
        context: problem.trim(),
      },
      rawText
    );
    addToast('Saved to history', 'success');
  }

  return (
    <div className="flex flex-1 overflow-hidden w-full h-full">
      {/* Left input panel */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-8 space-y-8">
          <div>
            <h1
              className="text-2xl font-bold text-slate-800"
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              Response Analyzer
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Paste student answers to identify misconceptions and get a targeted mini-lesson
            </p>
          </div>

          {/* Step 1: The problem */}
          <section>
            <SectionLabel>What problem did students work on?</SectionLabel>
            <div className="relative mt-2">
              <textarea
                rows={3}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder={`Paste or type the math problem here. Example:\n'Shade 3/4 of the rectangle. Then write an equivalent fraction.'`}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors duration-150"
              />
              <span className="absolute bottom-2 right-3 text-xs text-slate-400 tabular-nums pointer-events-none">
                {problem.length}
              </span>
            </div>
          </section>

          {/* Step 2: Grade + topic */}
          <section>
            <SectionLabel>Grade + concept</SectionLabel>
            <GradeSelector value={grade} onChange={setGrade} />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What unit or concept is this from?"
              className="mt-3 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors duration-150"
            />
          </section>

          {/* Step 3: Student responses */}
          <section>
            <SectionLabel>Student answers (add up to {MAX_RESPONSES})</SectionLabel>
            <div className="space-y-3 mt-2">
              {slots.map((slot) => (
                <ResponseSlot
                  key={slot.id}
                  slot={slot}
                  canRemove={slots.length > 1}
                  onUpdate={updateSlot}
                  onRemove={removeSlot}
                />
              ))}
            </div>

            {slots.length < MAX_RESPONSES && (
              <button
                type="button"
                onClick={addSlot}
                className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors duration-150"
              >
                + Add response
              </button>
            )}

            {/* Pre-analysis badge */}
            {needsSupport.length >= 2 && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <span>📊</span>
                <span className="text-sm text-amber-800 font-medium">
                  {needsSupport.length} students need support — ready to analyze
                </span>
              </div>
            )}
            {allCorrect && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <span>⚠️</span>
                <span className="text-sm text-amber-800">
                  All responses are correct — try adding a student who struggled
                </span>
              </div>
            )}
          </section>

          {/* Analyze button */}
          <div className="pb-8">
            <div className="relative group">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className={`w-full h-12 rounded-lg text-base font-semibold transition-colors duration-150 flex items-center justify-center gap-2 ${
                  canAnalyze
                    ? 'bg-amber-400 hover:bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                style={{ fontFamily: '"DM Sans", sans-serif' }}
              >
                {isStreaming ? (
                  <>
                    <Spinner />
                    Analyzing...
                  </>
                ) : (
                  'Analyze responses'
                )}
              </button>
              {!canAnalyze && !isStreaming && (
                <div
                  role="tooltip"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-10"
                >
                  {!hasKey             ? 'Add an API key in Settings to analyze' :
                   !grade              ? 'Pick a grade first' :
                   !problem.trim()     ? 'Add the math problem first' :
                   filledSlots.length < 2 ? 'Add at least 2 student responses' :
                   'Ready to analyze'}
                </div>
              )}
            </div>
            {error && (
              <p role="alert" className="mt-3 text-xs text-red-500 text-center">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right output panel */}
      <div
        className="flex-shrink-0 h-full overflow-y-auto border-l border-slate-200"
        style={{ width: '420px' }}
      >
        {(rawText || isStreaming) ? (
          <div className="flex flex-col h-full">
            <ArtifactCard
              rawText={rawText ?? ''}
              isStreaming={isStreaming}
              grade={grade}
              topic={topic || 'Response Analysis'}
              mode={{ id: 'responseAnalysis', icon: '📊', title: 'Response Analysis' }}
              isReadOnly={false}
              onRegenerate={handleAnalyze}
              addToast={addToast}
            />
            {rawText && !isStreaming && (
              <div className="flex-shrink-0 px-5 py-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleSaveToHistory}
                  className="w-full h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors duration-150"
                >
                  Save to History
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-16 px-8 text-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-slate-300 mb-4" aria-hidden="true">
              <rect x="4" y="4" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M14 16h20M14 24h20M14 32h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="36" cy="36" r="8" fill="white" stroke="currentColor" strokeWidth="1.5" />
              <path d="M33 36l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-semibold text-slate-600 text-sm" style={{ fontFamily: '"DM Sans", sans-serif' }}>
              Analysis will appear here
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Add the problem, grade, and at least 2 student responses to get a targeted mini-lesson.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResponseSlot({ slot, canRemove, onUpdate, onRemove }) {
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Student {slot.letter}
        </span>
        <div className="flex items-center gap-2">
          {/* Correct toggle */}
          <button
            type="button"
            onClick={() => onUpdate(slot.id, 'correct', !slot.correct)}
            className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors duration-150 ${
              slot.correct
                ? 'bg-green-100 text-green-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {slot.correct ? 'Got it right ✓' : 'Needs support ✗'}
          </button>
          {canRemove && (
            <button
              aria-label={`Remove student ${slot.letter}`}
              onClick={() => onRemove(slot.id)}
              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors duration-150"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <textarea
        rows={2}
        value={slot.text}
        onChange={(e) => onUpdate(slot.id, 'text', e.target.value)}
        placeholder={`What student ${slot.letter} wrote or drew...`}
        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors duration-150"
      />
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
      {children}
    </p>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
