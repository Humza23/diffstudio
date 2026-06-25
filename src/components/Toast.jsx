import { useEffect, useState } from 'react';

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 200);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const borderColor =
    toast.type === 'success' ? 'border-l-green-500' :
    toast.type === 'error'   ? 'border-l-red-500'   :
    'border-l-amber-400';

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 bg-white border border-slate-200 border-l-4 ${borderColor} rounded-lg shadow-md px-4 py-3 min-w-72 max-w-sm ${exiting ? 'toast-exit' : 'toast-enter'}`}
    >
      <div className="flex-1 text-sm text-slate-700">{toast.message}</div>
      <button
        aria-label="Dismiss notification"
        onClick={() => { setExiting(true); setTimeout(() => onRemove(toast.id), 200); }}
        className="text-slate-400 hover:text-slate-600 mt-0.5 flex-shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M1.4 1.4a.8.8 0 0 1 1.1 0L7 5.9l4.5-4.5a.8.8 0 1 1 1.1 1.1L8.1 7l4.5 4.5a.8.8 0 1 1-1.1 1.1L7 8.1l-4.5 4.5a.8.8 0 1 1-1.1-1.1L5.9 7 1.4 2.5a.8.8 0 0 1 0-1.1z" />
        </svg>
      </button>
    </div>
  );
}

export default function Toast({ toasts, removeToast }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}
