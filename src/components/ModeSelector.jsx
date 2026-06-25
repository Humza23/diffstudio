import { MODES } from '../data/modes.js';

export default function ModeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3" role="listbox" aria-label="Choose a differentiation mode">
      {MODES.map((mode, idx) => {
        const active = value?.id === mode.id;
        const isLast = idx === MODES.length - 1;
        return (
          <button
            key={mode.id}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onChange(active ? null : mode)}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            className={`
              text-left p-4 rounded-xl border transition-all duration-150
              ${isLast ? 'col-span-2' : ''}
              ${active
                ? 'border-amber-400 bg-amber-50 shadow-sm'
                : 'border-slate-200 bg-white hover:shadow-md hover:border-slate-300'
              }
            `}
            style={{
              borderLeftWidth: active ? '4px' : '1px',
              borderLeftColor: active ? '#F59E0B' : undefined,
            }}
          >
            <span className="text-2xl leading-none block mb-2" aria-hidden="true">
              {mode.icon}
            </span>
            <span
              className={`block text-sm font-semibold mb-0.5 ${active ? 'text-amber-700' : 'text-slate-800'}`}
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              {mode.title}
            </span>
            <span className="block text-xs text-slate-500 leading-snug">
              {mode.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
