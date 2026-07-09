// The boot status line is uncontrolled (see Boot.jsx); write to it by id.
export function setBootStatus(msg) {
  const el = document.getElementById("boot-status");
  if (el) el.textContent = msg;
}
