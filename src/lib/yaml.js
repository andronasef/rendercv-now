// Light text-level helpers so the visible YAML and the theme dropdown stay in
// sync. (Full parsing happens in Python; these only touch the design.theme line.)

const THEME_LINE = /^design:\s*[\s\S]*?^\s*theme:\s*(\S+)/m;

export function themeFromYaml(yamlText) {
  return yamlText.match(THEME_LINE)?.[1] ?? null;
}

export function syncThemeIntoYaml(yamlText, theme) {
  return yamlText.replace(/(^design:\s*[\s\S]*?^\s*theme:\s*).*$/m, `$1${theme}`);
}

// cv.name sits at exactly two-space indent under `cv:` (project/entry names are
// deeper), so match that to derive a friendly default title for a saved CV.
export function nameFromYaml(yamlText) {
  const m = yamlText.match(/^ {2}name:\s*(.+)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
}
