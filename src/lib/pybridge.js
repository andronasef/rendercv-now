// Bridge to the Python half (app.py, running under PyScript). Python attaches
// rcvBuildTypst to window and dispatches "rcv:ready" when set up.

export function onPythonReady(cb) {
  if (window.rcvBuildTypst) cb();
  else window.addEventListener("rcv:ready", cb, { once: true });
}

// Returns { ok: true, typst } or { ok: false, error }.
export function buildTypst(yamlText, theme) {
  return JSON.parse(window.rcvBuildTypst(yamlText, theme));
}
