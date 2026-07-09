// typst.ts WASM (compiler + renderer) — loaded from CDN at runtime.
export const COMPILER_WASM =
  "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@0.7.0/pkg/typst_ts_web_compiler_bg.wasm";
export const RENDERER_WASM =
  "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer@0.7.0/pkg/typst_ts_renderer_bg.wasm";

// RenderCV themes (matches the example CVs shipped by rendercv).
export const THEMES = [
  { value: "classic", label: "Classic" },
  { value: "sb2nov", label: "sb2nov" },
  { value: "engineeringclassic", label: "Engineering Classic" },
  { value: "engineeringresumes", label: "Engineering Résumés" },
  { value: "moderncv", label: "Modern CV" },
  { value: "ember", label: "Ember" },
  { value: "harvard", label: "Harvard" },
  { value: "ink", label: "Ink" },
  { value: "opal", label: "Opal" },
];
