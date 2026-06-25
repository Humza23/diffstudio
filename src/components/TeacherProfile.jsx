import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];

const SCAFFOLDING_STYLES = [
  {
    id: 'gradualRelease',
    color: '#3B82F6',
    label: 'Gradual Release',
    description: 'I do, We do, You do',
  },
  {
    id: 'inquiryFirst',
    color: '#10B981',
    label: 'Inquiry-First',
    description: 'Let students struggle productively first',
  },
  {
    id: 'flexible',
    color: '#F59E0B',
    label: 'Flexible',
    description: 'I adapt based on the activity',
  },
];

export default function TeacherProfile({ profile, onSave, onClose }) {
  const [form, setForm] = useState({ ...profile });
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef(null);

  // Trigger slide-in on first render
  useLayoutEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    setForm({ ...profile });
  }, [profile]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    onSave(form);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="My Classroom profile"
        className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-white shadow-xl flex flex-col"
        style={{
          transform: mounted ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 250ms ease',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
          <h2
            className="text-lg font-bold text-slate-800"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            My Classroom
          </h2>
          <button
            aria-label="Close profile"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.29 3.29a1 1 0 0 1 1.42 0L8 6.59l3.29-3.3a1 1 0 1 1 1.42 1.42L9.41 8l3.3 3.29a1 1 0 1 1-1.42 1.42L8 9.41l-3.29 3.3a1 1 0 1 1-1.42-1.42L6.59 8 3.29 4.71a1 1 0 0 1 0-1.42z" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Section: Class Overview */}
          <section>
            <SectionLabel>Class Overview</SectionLabel>
            <div className="space-y-4">

              <div>
                <FieldLabel>Grade I teach most</FieldLabel>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={form.grade === g}
                      onClick={() => set('grade', form.grade === g ? '' : g)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors duration-150 border ${
                        form.grade === g
                          ? 'bg-amber-400 border-amber-400 text-white font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="profile-classSize">Class size</FieldLabel>
                <input
                  id="profile-classSize"
                  type="number"
                  min={1}
                  max={40}
                  value={form.classSize}
                  onChange={(e) => set('classSize', e.target.value)}
                  placeholder="28"
                  className="mt-1.5 w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors duration-150"
                />
              </div>

              <div>
                <FieldLabel htmlFor="profile-schoolYear">School year</FieldLabel>
                <input
                  id="profile-schoolYear"
                  type="text"
                  value={form.schoolYear}
                  onChange={(e) => set('schoolYear', e.target.value)}
                  placeholder="2025–2026"
                  className="mt-1.5 w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors duration-150"
                />
              </div>
            </div>
          </section>

          {/* Section: Student Diversity */}
          <section>
            <SectionLabel>Student Diversity</SectionLabel>
            <div className="space-y-5">

              <div>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel htmlFor="profile-ell">English Language Learners</FieldLabel>
                  <span className="text-sm font-semibold text-amber-600 tabular-nums">
                    {form.ellPercent}%
                  </span>
                </div>
                <input
                  id="profile-ell"
                  type="range"
                  min={0}
                  max={100}
                  value={form.ellPercent}
                  onChange={(e) => set('ellPercent', Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                  <span>0%</span><span>100%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel htmlFor="profile-iep">Students with IEPs or 504s</FieldLabel>
                  <span className="text-sm font-semibold text-amber-600 tabular-nums">
                    {form.iepPercent}%
                  </span>
                </div>
                <input
                  id="profile-iep"
                  type="range"
                  min={0}
                  max={100}
                  value={form.iepPercent}
                  onChange={(e) => set('iepPercent', Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                  <span>0%</span><span>100%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Teaching Preferences */}
          <section>
            <SectionLabel>Teaching Preferences</SectionLabel>
            <div className="space-y-4">

              <div>
                <FieldLabel>My scaffolding style</FieldLabel>
                <div className="space-y-2 mt-1.5">
                  {SCAFFOLDING_STYLES.map((s) => {
                    const active = form.scaffoldingStyle === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => set('scaffoldingStyle', s.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-150 ${
                          active
                            ? 'border-amber-300 bg-amber-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: s.color }}
                            aria-hidden="true"
                          />
                          <span
                            className={`text-sm font-medium ${active ? 'text-amber-800' : 'text-slate-700'}`}
                          >
                            {s.label}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ml-5 ${active ? 'text-amber-600' : 'text-slate-500'}`}>
                          {s.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="profile-accommodations">Standing accommodations</FieldLabel>
                <textarea
                  id="profile-accommodations"
                  rows={4}
                  value={form.standingAccommodations}
                  onChange={(e) => set('standingAccommodations', e.target.value)}
                  placeholder={`e.g. Extended time for all assessments. Preferential seating for 3 students. One student uses AAC device.`}
                  className="mt-1.5 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors duration-150"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleSave}
            className="w-full h-11 rounded-lg bg-amber-400 hover:bg-amber-500 text-white font-semibold text-sm transition-colors duration-150"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            Save profile
          </button>
          <p className="text-xs text-slate-400 text-center mt-2">
            This profile is injected into every generation automatically.
          </p>
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
      {children}
    </p>
  );
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-slate-700"
    >
      {children}
    </label>
  );
}
