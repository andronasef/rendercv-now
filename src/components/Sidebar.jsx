import { useRef } from "react";
import CvList from "./CvList.jsx";
import Logo from "./Logo.jsx";

export default function Sidebar({ cvs, activeId, actions, onNewFromSample, onImport }) {
  const fileRef = useRef(null);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark" aria-hidden="true">
          <Logo width="20" height="20" />
        </div>
        <div>
          <div className="brand-name">RenderCV</div>
          <div className="brand-sub">Browser renderer</div>
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
