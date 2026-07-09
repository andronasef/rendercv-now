import { THEMES } from "../lib/constants.js";

export default function ThemeSelector({ value, onChange, onStep }) {
  return (
    <div className="theme-row">
      <button className="arrow" onClick={() => onStep(-1)} title="Previous theme" aria-label="Previous theme">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <select className="theme-select" value={value} onChange={(e) => onChange(e.target.value)} aria-label="CV theme">
        {THEMES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <button className="arrow" onClick={() => onStep(1)} title="Next theme" aria-label="Next theme">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
