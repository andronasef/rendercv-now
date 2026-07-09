// Bridge to the Python half (app.py, running under PyScript). Python attaches
// rcvBuildTypst / rcvGetFonts to window and dispatches "rcv:ready" when set up.

export function onPythonReady(cb) {
  if (window.rcvBuildTypst) cb();
  else window.addEventListener("rcv:ready", cb, { once: true });
}

// Returns { ok: true, typst } or { ok: false, error }.
export function buildTypst(yamlText, theme) {
  return JSON.parse(window.rcvBuildTypst(yamlText, theme));
}

// Python list[bytes] -> JS Array<Uint8Array>.
export function getFonts() {
  return window.rcvGetFonts().toJs();
}
