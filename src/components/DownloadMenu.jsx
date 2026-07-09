import { useEffect, useRef, useState } from "react";

const FORMATS = [
  { fmt: "pdf", label: "Download PDF", ext: ".pdf" },
  { fmt: "svg", label: "Download SVG", ext: ".svg" },
  { fmt: "typ", label: "Typst source", ext: ".typ" },
];

export default function DownloadMenu({ disabled, onExport }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const pick = (fmt) => {
    setOpen(false);
    onExport(fmt);
  };

  return (
    <div className="menu-wrap" ref={wrapRef}>
      <button className="tbtn bordered" disabled={disabled} onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12M8 11l4 4 4-4" />
          <path d="M4 19h16" />
        </svg>
        Download
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div className="menu" data-open={open} role="menu">
        {FORMATS.map(({ fmt, label, ext }) => (
          <button key={fmt} role="menuitem" onClick={() => pick(fmt)}>
            {label} <span className="k">{ext}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
