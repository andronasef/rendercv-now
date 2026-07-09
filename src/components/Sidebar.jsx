import { useRef } from "react";
import CvList from "./CvList.jsx";
import Logo from "./Logo.jsx";

export default function Sidebar({ cvs, activeId, actions, onNewFromSample, onImport }) {
  const fileRef = useRef(null);

  return (
    <aside className="sidebar">
      <div>
      <div className="brand">
        <div className="mark" aria-hidden="true">
          <Logo width="24" height="24" />
        </div>
        <div>
          <div className="brand-name">RenderCV</div>
          <div className="brand-sub">Browser renderer</div>
        </div>
      </div>
      <div className="side-credit">
        Built by Andrew Nasef
        <a href="https://www.linkedin.com/in/andronasef" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="white" fill-rule="evenodd" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C20.4 8.75 22 10.9 22 14.5V21h-4v-5.7c0-1.36-.03-3.1-1.9-3.1-1.9 0-2.2 1.48-2.2 3v5.8H9z" />
          </svg>
        </a>
        <a href="https://andronasef.github.io/links/9" target="_blank" rel="noopener" aria-label="Website" title="Website">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
          </svg>
        </a>
      </div>
</div>

      <div className="side-group">
        <button className="side-item accent" onClick={onNewFromSample}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New from sample
        </button>
        <button className="side-item" onClick={() => fileRef.current?.click()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12M8 11l4 4 4-4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          Import YAML file
        </button>
        <input
          type="file"
          ref={fileRef}
          accept=".yaml,.yml,.txt"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="side-heading cv-heading">Your CVs</div>
      <CvList cvs={cvs} activeId={activeId} actions={actions} />

      <div className="side-foot">
        Saved locally in this browser.
        <br />
        <a href="https://docs.rendercv.com/" target="_blank" rel="noopener">Docs</a>
        {" · "}
        <a href="https://github.com/rendercv/rendercv" target="_blank" rel="noopener">GitHub</a>
        {" · "}
        <a href="https://pyscript.net/" target="_blank" rel="noopener">PyScript</a>
        {" + "}
        <a href="https://typst.app/" target="_blank" rel="noopener">Typst</a>
      </div>
    </aside>
  );
}
