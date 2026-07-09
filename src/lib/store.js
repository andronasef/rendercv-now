// Local persistence for saved CVs (localStorage). Everything stays on-device.
const CVS_KEY = "rendercv.cvs.v1";
const LAST_KEY = "rendercv.lastOpenedId.v1";

export function loadCvs() {
  try {
    return JSON.parse(localStorage.getItem(CVS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCvs(cvs) {
  try {
    localStorage.setItem(CVS_KEY, JSON.stringify(cvs));
  } catch {
    /* storage full / unavailable — degrade to in-memory for this session */
  }
}

export function getLastOpenedId() {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
}

export function setLastOpenedId(id) {
  try {
    localStorage.setItem(LAST_KEY, id);
  } catch {
    /* ignore */
  }
}

export function newId() {
  return "cv_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}
