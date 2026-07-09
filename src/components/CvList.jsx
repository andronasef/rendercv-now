import { useState } from "react";
import Menu from "./Menu.jsx";

const dots = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

export default function CvList({ cvs, activeId, actions }) {
  const [renamingId, setRenamingId] = useState(null);

  const commitRename = (cv, value) => {
    actions.rename(cv.id, value.trim() || cv.name);
    setRenamingId(null);
  };

  return (
    <div className="cv-list">
      {cvs.length === 0 && <div className="cv-empty">No saved CVs yet.</div>}
      {cvs.map((cv) => (
        <div
          key={cv.id}
          className={"cv-item" + (cv.id === activeId ? " active" : "")}
          onClick={() => actions.select(cv.id)}
        >
          {renamingId === cv.id ? (
            <input
              className="cv-rename"
              autoFocus
              defaultValue={cv.name}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => commitRename(cv, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.target.blur();
                if (e.key === "Escape") setRenamingId(null);
              }}
            />
          ) : (
            <span className="cv-name" title={cv.name}>
              {cv.name}
            </span>
          )}
          <Menu
            trigger={dots}
            ariaLabel={`Actions for ${cv.name}`}
            items={[
              { label: "Rename", onClick: () => setRenamingId(cv.id) },
              { label: "Duplicate", onClick: () => actions.duplicate(cv.id) },
              { sep: true },
              { label: "Download YAML", onClick: () => actions.downloadYaml(cv.id) },
              { label: "Download PDF", onClick: () => actions.downloadPdf(cv.id) },
              { sep: true },
              { label: "Delete", danger: true, onClick: () => actions.remove(cv.id) },
            ]}
          />
        </div>
      ))}
    </div>
  );
}
