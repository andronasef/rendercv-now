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
// scripts/fetch-wheels.mjs). Start downloading them at app start too — they
// arrive while Pyodide installs, instead of serially after Python is ready.
export const fontsPromise = (async () => {
  const files = await (await fetch("/fonts/manifest.json")).json();
  return Promise.all(
    files.map(async (f) => {
      const r = await fetch(encodeURI(f));
      if (!r.ok) throw new Error(`font ${f}: HTTP ${r.status}`);
      return new Uint8Array(await r.arrayBuffer());
    }),
  );
})();

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
