// Typst compiler (WebAssembly). The all-in-one-lite bundle is self-contained
// (no bare-specifier sub-imports) and pulls the compiler/renderer WASM from CDN.
import {
  $typst,
  preloadRemoteFonts,
} from "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst.ts@0.7.0/dist/esm/contrib/all-in-one-lite.bundle.js";
import { COMPILER_WASM, RENDERER_WASM } from "./constants.js";

// Warm the compiler/renderer WASM download NOW, in parallel with Pyodide boot.
// This module is imported at app start, so these fire long before Python is
// ready; $typst's own fetch (and the service worker) then serve them from
// cache instead of starting a fresh ~MB download at the very end of boot.
fetch(COMPILER_WASM).catch(() => {});
fetch(RENDERER_WASM).catch(() => {});

// Fonts are static files (extracted from the rendercv-fonts wheel by
// scripts/fetch-wheels.mjs), split into core (~13MB) and CJK (~45MB — only
// loaded when the CV actually contains CJK text). Core starts downloading at
// app start, in parallel with the Pyodide boot.
const fetchFont = async (f) => {
  const r = await fetch(encodeURI(f));
  if (!r.ok) throw new Error(`font ${f}: HTTP ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
};
const manifestPromise = fetch("/fonts/manifest.json").then((r) => r.json());
const coreFontsPromise = manifestPromise.then((m) => Promise.all(m.core.map(fetchFont)));

const CJK_RE = /[　-ヿ㐀-䶿一-鿿가-힯豈-﫿]/;
let cjkLoaded = false;

// All fonts the given document needs (core + CJK only when the text uses it).
export async function fontsFor(yamlText) {
  const fonts = [...(await coreFontsPromise)];
  if (CJK_RE.test(yamlText)) {
    const m = await manifestPromise;
    fonts.push(...(await Promise.all(m.cjk.map(fetchFont))));
    cjkLoaded = true;
  }
  return fonts;
}

// typst.ts only accepts fonts at init. If CJK text appears mid-session and the
// CJK set wasn't loaded, the caller must reload the page (CVs are autosaved).
export const needsCjkReload = (yamlText) => CJK_RE.test(yamlText) && !cjkLoaded;

// fonts: Array<Uint8Array>.
export function initTypst(fonts) {
  $typst.setCompilerInitOptions({
    getModule: () => COMPILER_WASM,
    beforeBuild: [preloadRemoteFonts(fonts)],
  });
  $typst.setRendererInitOptions({ getModule: () => RENDERER_WASM });
}

export const compileSvg = (source) => $typst.svg({ mainContent: source });
export const compilePdf = (source) => $typst.pdf({ mainContent: source });
