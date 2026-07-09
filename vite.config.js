import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static assets in public/ (app.py, pyscript.toml, sample_cv.yaml) are copied
// to dist/ verbatim. React (src/) is bundled; the Typst compiler + fonts are
// loaded at runtime from a CDN / from Pyodide.
export default defineConfig({
  plugins: [react()],
  build: { target: "esnext", outDir: "dist" },
});
