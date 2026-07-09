import { useEffect, useRef, useState } from "react";

// A small popover menu positioned with `position: fixed` off the trigger's
// rect — so it escapes the sidebar's `overflow: hidden` clipping.
// `items`: [{ label, onClick, danger }] or { sep: true }.
export default function Menu({ trigger, items, ariaLabel = "More actions" }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);

  const toggle = (e) => {
    e.stopPropagation();
    if (open) return setOpen(false);
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    window.addEventListener("resize", close);
    document.addEventListener("scroll", close, true); // any scroll dismisses
    return () => {
      document.removeEventListener("click", close);
      window.removeEventListener("resize", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [open]);

  return (
    <>
      <button ref={btnRef} className="icon-btn" onClick={toggle} aria-label={ariaLabel}>
        {trigger}
      </button>
      {open && (
        <div
          className="fixed-menu"
          style={{ top: pos.top, left: pos.left }}
          onClick={(e) => e.stopPropagation()}
          role="menu"
        >
          {items.map((it, i) =>
            it.sep ? (
              <div key={i} className="menu-sep" />
            ) : (
              <button
                key={i}
                role="menuitem"
                className={it.danger ? "danger" : ""}
                onClick={() => {
                  setOpen(false);
                  it.onClick();
                }}
              >
                {it.label}
              </button>
            ),
          )}
        </div>
      )}
    </>
  );
}
