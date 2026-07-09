import { useEffect, useRef } from "react";

// The status line is written imperatively (by app.py in Python and by the
// renderer via setBootStatus), so React must NOT own its text — hence a ref and
// no JSX child. `done` fades the overlay out once the first render lands.
export default function Boot({ done }) {
  const statusRef = useRef(null);

  useEffect(() => {
    if (statusRef.current && !statusRef.current.textContent) {
      statusRef.current.textContent =
        "Installing Python & RenderCV… (first load ~20–40s)";
    }
  }, []);

  return (
    <div id="boot" className={"boot" + (done ? " done" : "")}>
      <div className="boot-mark" aria-hidden="true">
        <img src="/icon.webp" alt="" width="80" height="80" />
      </div>
      <div className="boot-title">Starting RenderCV</div>
      <div id="boot-status" className="boot-status" ref={statusRef} />
      <div className="boot-bar" role="progressbar" aria-label="Loading" />
    </div>
  );
}
