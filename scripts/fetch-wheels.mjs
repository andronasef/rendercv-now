// Vendor the runtime's Python packages so micropip never resolves against PyPI
// at runtime (the "Installing… forever" hang):
//   - PyPI wheels        -> public/wheels/  (listed in public/pyscript.toml)
//   - rendercv-fonts     -> extracted to public/fonts/<version>/ + manifest.json
//     (the wheel is 33MB — over Cloudflare Pages' 25MiB file limit — and JS only
//     needs the raw .ttf/.otf bytes for typst.ts, so it never goes to Python)
// Wheels from Pyodide's "default channel" (jinja2, pydantic, pydantic_core, …)
// are left to PyScript's own version-matched CDN, cached by sw.js.
//
// Usage: node scripts/fetch-wheels.mjs
// Then update public/pyscript.toml with the printed packages list.

import { loadPyodide } from "pyodide";
import { mkdirSync, writeFileSync, rmSync, readdirSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const pyodide = await loadPyodide();
await pyodide.loadPackage("micropip");

const frozen = JSON.parse(
  await pyodide.runPythonAsync(`
import micropip
await micropip.install(["rendercv", "rendercv-fonts", "email-validator"])
micropip.freeze()
`),
);

// Clear contents (not the dirs themselves — Windows EBUSY if a shell sits in one).
for (const dir of ["public/wheels", "public/fonts"]) {
  mkdirSync(dir, { recursive: true });
  for (const e of readdirSync(dir)) rmSync(path.join(dir, e), { recursive: true, force: true });
}

const local = [];
for (const [name, info] of Object.entries(frozen.packages)) {
  const url = info.file_name ?? "";
  if (!url.startsWith("https://files.pythonhosted.org/")) continue; // default channel
  const file = url.split("/").pop();
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`${resp.status} downloading ${url}`);
  const bytes = Buffer.from(await resp.arrayBuffer());

  if (name === "rendercv-fonts") {
    // Extract fonts as static files; JS fetches them straight into typst.ts.
    const version = info.version;
    const tmpWheel = `public/fonts/${file}`;
    const outDir = `public/fonts/${version}`;
    writeFileSync(tmpWheel, bytes);
    mkdirSync(outDir, { recursive: true });
    execFileSync("unzip", ["-q", "-o", tmpWheel, "-d", outDir]);
    rmSync(tmpWheel);
    // Collect every .ttf/.otf path (relative), drop everything else.
    const fonts = [];
    const walk = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(ttf|otf)$/i.test(e.name)) fonts.push(p);
        else rmSync(p);
      }
    };
    walk(outDir);
    // Drop dirs emptied by walk (dist-info etc.).
    for (const e of readdirSync(outDir, { withFileTypes: true, recursive: true }))
      if (e.isDirectory()) {
        const p = path.join(e.parentPath, e.name);
        if (readdirSync(p).length === 0) rmSync(p, { recursive: true });
      }
    const rel = fonts.map((p) => "/" + path.relative("public", p).replaceAll("\\", "/")).sort();
    writeFileSync("public/fonts/manifest.json", JSON.stringify(rel, null, 1));
    console.log(`${name.padEnd(24)} ${rel.length} fonts -> ${outDir}`);
    continue;
  }

  writeFileSync(`public/wheels/${file}`, bytes);
  local.push(file);
  console.log(`${name.padEnd(24)} ${file}`);
}

console.log("\npackages for pyscript.toml:\n");
console.log(JSON.stringify(local.sort().map((f) => `/wheels/${f}`), null, 2));
