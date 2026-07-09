# RenderCV Web

A 100% client-side [RenderCV](https://github.com/rendercv/rendercv) renderer.
Edit YAML on the left, see a typeset CV on the right. No server:

- **Python** (RenderCV) runs in the browser via [PyScript](https://pyscript.net/) —
  YAML → pydantic validation → Jinja2 generates Typst source.
- **Typst** compiles that source to SVG/PDF via WebAssembly ([typst.ts](https://github.com/Myriad-Dreamin/typst.ts)).

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # outputs static site to dist/
npm run preview    # serve the built dist/ locally
```

## Deploy to Cloudflare Pages

Push this repo to GitHub/GitLab and create a Cloudflare Pages project pointing at it.
Cloudflare auto-detects Vite:

| Setting              | Value           |
| -------------------- | --------------- |
| Build command        | `npm run build` |
| Build output directory | `dist`        |

That's it. (There's no bundling that actually matters here — if you prefer, you can
skip the build entirely and direct-upload the `public/` files plus `index.html`.)

## Structure

React (Vite) owns the UI; PyScript is the "backend" that turns YAML into Typst source.

```
index.html              thin shell: #root, PyScript <script>, font links
src/
  main.jsx              React entry (mounts App, imports CSS)
  App.jsx               controller — state + the render loop
  styles.css            all styles + the CodeMirror "rendercv" theme
  components/           Sidebar, CvList, Menu, Toolbar, ThemeSelector,
                        DownloadMenu, Editor (CodeMirror wrapper), Preview, Boot
  lib/                  imperative bridges, framework-free:
    typst.js            typst.ts (WASM) init + compile SVG/PDF
    pybridge.js         talk to the Python half (rcvBuildTypst / rcvGetFonts)
    yaml.js             theme <-> YAML sync, title from YAML
    store.js            saved-CV persistence (localStorage)
    constants.js        theme list, WASM URLs
    boot.js, download.js
public/                 copied to dist/ root verbatim
  app.py                PyScript: YAML → pydantic → Jinja2 → Typst source string
  pyscript.toml         Pyodide packages (rendercv, rendercv-fonts, email-validator)
  sample_cv.yaml        starter CV loaded into the editor
```
