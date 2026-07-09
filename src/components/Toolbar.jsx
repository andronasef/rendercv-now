import DownloadMenu from "./DownloadMenu.jsx";

export default function Toolbar({ onToggleSidebar, zoom, onZoom, busy, canDownload, onExport }) {
  return (
    <div className="toolbar">
      <button className="tbtn" onClick={onToggleSidebar} title="Toggle sidebar" aria-label="Toggle sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16" />
        </svg>
      </button>
      <span className="badge">YAML</span>

      <span className="grow" />

      <div className="zoom" role="group" aria-label="Zoom">
        <button onClick={() => onZoom(zoom - 0.1)} title="Zoom out" aria-label="Zoom out">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14" />
          </svg>
        </button>
        <button className="zoom-val" onClick={() => onZoom(1)} title="Reset zoom">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={() => onZoom(zoom + 0.1)} title="Zoom in" aria-label="Zoom in">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <span className="tsep" />

      <span className="status-dot" data-state={busy ? "busy" : "idle"} title="Render status" />

      <DownloadMenu disabled={!canDownload} onExport={onExport} />
    </div>
  );
}
