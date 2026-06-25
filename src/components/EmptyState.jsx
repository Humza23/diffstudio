export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-8 text-center">
      {/* Pencil-on-paper SVG */}
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        aria-hidden="true"
        className="mb-5 text-slate-300"
      >
        <rect x="6" y="8" width="36" height="44" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="12" y1="18" x2="36" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="25" x2="36" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="32" x2="26" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Pencil */}
        <g transform="translate(28, 28) rotate(-35)">
          <rect x="-3" y="-14" width="6" height="18" rx="1" fill="#F59E0B" />
          <polygon points="-3,4 3,4 0,9" fill="#FDE68A" />
          <rect x="-3" y="-16" width="6" height="3" rx="0.5" fill="#94A3B8" />
        </g>
      </svg>

      <h2
        className="text-lg font-semibold text-slate-700 mb-2"
        style={{ fontFamily: '"DM Sans", sans-serif' }}
      >
        Your artifact will appear here
      </h2>
      <p className="text-sm text-slate-500 max-w-xs mb-8">
        Pick a grade below and describe your class — your artifact streams in here as it generates.
      </p>

      {/* Step indicators */}
      <div className="flex items-center gap-0">
        <StepIndicator label="Grade" />
        <StepLine />
        <StepIndicator label="Topic" />
        <StepLine />
        <StepIndicator label="Mode" />
      </div>
    </div>
  );
}

function StepIndicator({ label }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-slate-300" />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

function StepLine() {
  return <div className="w-12 h-px bg-slate-200 mb-4 mx-1" />;
}
