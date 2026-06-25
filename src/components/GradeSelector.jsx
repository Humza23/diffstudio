const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];

export default function GradeSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select grade level">
      {GRADES.map((g) => {
        const active = value === g;
        return (
          <button
            key={g}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? '' : g)}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-150 border ${
              active
                ? 'bg-amber-400 border-amber-400 text-white font-semibold shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
            }`}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}
