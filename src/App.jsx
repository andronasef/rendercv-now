import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Toolbar from "./components/Toolbar.jsx";
import ThemeSelector from "./components/ThemeSelector.jsx";
import Editor from "./components/Editor.jsx";
import Preview from "./components/Preview.jsx";
import Boot from "./components/Boot.jsx";
import { THEMES } from "./lib/constants.js";
import { initTypst, compileSvg, compilePdf, fontsFor, needsCjkReload } from "./lib/typst.js";
import { onPythonReady, buildTypst } from "./lib/pybridge.js";
import { syncThemeIntoYaml, themeFromYaml, nameFromYaml } from "./lib/yaml.js";
import { setBootStatus } from "./lib/boot.js";
import { save } from "./lib/download.js";
import {
  loadCvs,
  saveCvs,
  getLastOpenedId,
  setLastOpenedId,
  newId,
} from "./lib/store.js";

const FALLBACK_YAML = "cv:\n  name: Your Name\ndesign:\n  theme: classic\n";

export default function App() {
  // Saved documents (localStorage) + which one is open.
  const [cvs, setCvs] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Live editing state for the open document.
  const [yaml, setYaml] = useState("");
  const [theme, setTheme] = useState("classic");

  const [zoom, setZoom] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ready, setReady] = useState(false);
  const [booted, setBooted] = useState(false);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const tokenRef = useRef(0);
  const firstRenderRef = useRef(true);
  const lastTypstRef = useRef("");
  const sampleRef = useRef(null);
  const yamlRef = useRef("");
  yamlRef.current = yaml; // latest yaml for the one-shot boot effect

  const fetchSample = useCallback(async () => {
    if (sampleRef.current != null) return sampleRef.current;
    try {
      sampleRef.current = await (await fetch("/sample_cv.yaml")).text();
    } catch {
      sampleRef.current = FALLBACK_YAML;
    }
    return sampleRef.current;
  }, []);

  const openCv = useCallback((cv) => {
    setActiveId(cv.id);
    setYaml(cv.yaml);
    setTheme(themeFromYaml(cv.yaml) || "classic");
    setLastOpenedId(cv.id);
  }, []);

  const createCv = useCallback(
    (name, yamlText) => {
      const cv = { id: newId(), name: name || "Untitled CV", yaml: yamlText, updatedAt: Date.now() };
      setCvs((prev) => {
        const next = [cv, ...prev];
        saveCvs(next);
        return next;
      });
      openCv(cv);
      return cv;
    },
    [openCv],
  );

  const newFromSample = useCallback(async () => {
    const text = await fetchSample();
    createCv(nameFromYaml(text) || "Untitled CV", text);
  }, [fetchSample, createCv]);

  // --- Initial load: restore the last opened CV, else seed a sample --------
  useEffect(() => {
    (async () => {
      const stored = loadCvs();
      if (stored.length) {
        setCvs(stored);
        const last = getLastOpenedId();
        openCv(stored.find((c) => c.id === last) || stored[0]);
      } else {
        const text = await fetchSample();
        createCv(nameFromYaml(text) || "Sample CV", text);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Autosave the open document into its store entry ---------------------
  useEffect(() => {
    if (!activeId) return;
    const t = setTimeout(() => {
      setCvs((prev) => {
        const next = prev.map((c) =>
          c.id === activeId ? { ...c, yaml, updatedAt: Date.now() } : c,
        );
        saveCvs(next);
        return next;
      });
    }, 500);
    return () => clearTimeout(t);
  }, [yaml, activeId]);

  // --- Wait for Python, then initialize the Typst compiler -----------------
  useEffect(() => {
    onPythonReady(async () => {
      console.log(`[perf] python ready (pyodide+install+import): ${performance.now().toFixed(0)}ms`);
      setBootStatus("Loading fonts…");
      const t = performance.now();
      // Core fonts are usually already downloaded in parallel with Pyodide;
      // the CJK set is added only when the opened CV contains CJK text.
      initTypst(await fontsFor(yamlRef.current));
      console.log(`[perf] fonts ready + typst init: +${(performance.now() - t).toFixed(0)}ms`);
      setBootStatus("Compiling your CV…");
      setReady(true);
    });
  }, []);

  // --- Render: YAML (+ theme) → Typst source → SVG -------------------------
  const doRender = useCallback(async (source, activeTheme) => {
    if (!window.rcvBuildTypst) return;
    // typst.ts only takes fonts at init — if CJK text just appeared and the
    // CJK fonts aren't loaded, reload once (the CV is autosaved; boot then
    // loads the CJK set). Session guard prevents a loop if fonts 404.
    if (needsCjkReload(source) && !sessionStorage.getItem("cjk-reload")) {
      sessionStorage.setItem("cjk-reload", "1");
      location.reload();
      return;
    }
    const token = ++tokenRef.current;
    setBusy(true);
    const result = buildTypst(source, activeTheme);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    setError(null);
    lastTypstRef.current = result.typst;
    try {
      const out = await compileSvg(result.typst);
      if (token !== tokenRef.current) return; // superseded
      setSvg(out);
    } catch (err) {
      if (token === tokenRef.current) setError("Typst compile error:\n" + err);
    } finally {
      if (token === tokenRef.current) setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const delay = firstRenderRef.current ? 0 : 300;
    const timer = setTimeout(async () => {
      await doRender(yaml, theme);
      if (firstRenderRef.current) {
        firstRenderRef.current = false;
        setBooted(true);
        console.log(`[perf] first render complete: ${performance.now().toFixed(0)}ms`);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [yaml, theme, ready, doRender]);

  // --- Theme / zoom / import ----------------------------------------------
  const changeTheme = (next) => {
    setTheme(next);
    setYaml((y) => syncThemeIntoYaml(y, next));
  };
  const stepTheme = (delta) => {
    const i = THEMES.findIndex((t) => t.value === theme);
    const n = THEMES.length;
    changeTheme(THEMES[(i + delta + n) % n].value);
  };
  const importFile = async (file) => {
    const text = await file.text();
    const name = file.name.replace(/\.(ya?ml|txt)$/i, "") || nameFromYaml(text) || "Imported CV";
    createCv(name, text);
  };
  const changeZoom = (z) => setZoom(Math.min(2, Math.max(0.5, Math.round(z * 100) / 100)));

  // --- CV list actions -----------------------------------------------------
  const buildPdf = async (source, thm) => {
    const result = buildTypst(source, thm);
    if (!result.ok) throw new Error(result.error);
    return compilePdf(result.typst);
  };

  const cvActions = {
    select: (id) => {
      const cv = cvs.find((c) => c.id === id);
      if (cv && cv.id !== activeId) openCv(cv);
    },
    rename: (id, name) =>
      setCvs((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, name } : c));
        saveCvs(next);
        return next;
      }),
    duplicate: (id) => {
      const src = cvs.find((c) => c.id === id);
      if (src) createCv(src.name + " copy", src.yaml);
    },
    remove: (id) => {
      const cv = cvs.find((c) => c.id === id);
      if (!cv || !window.confirm(`Delete “${cv.name}”? This cannot be undone.`)) return;
      const next = cvs.filter((c) => c.id !== id);
      saveCvs(next);
      setCvs(next);
      if (id === activeId) {
        if (next.length) openCv(next[0]);
        else newFromSample();
      }
    },
    downloadYaml: (id) => {
      const cv = cvs.find((c) => c.id === id);
      if (cv) save(new Blob([cv.yaml], { type: "text/yaml" }), `${cv.name}.yaml`);
    },
    downloadPdf: async (id) => {
      const cv = cvs.find((c) => c.id === id);
      if (!cv) return;
      try {
        const pdf = await buildPdf(cv.yaml, themeFromYaml(cv.yaml) || theme);
        save(new Blob([pdf], { type: "application/pdf" }), `${cv.name}.pdf`);
      } catch (err) {
        setError("PDF export failed:\n" + err.message);
      }
    },
  };

  // --- Toolbar export (the currently open document) ------------------------
  const onExport = async (fmt) => {
    const name = cvs.find((c) => c.id === activeId)?.name || "CV";
    try {
      if (fmt === "typ") {
        save(new Blob([lastTypstRef.current], { type: "text/plain" }), `${name}.typ`);
      } else if (fmt === "svg") {
        save(new Blob([svg], { type: "image/svg+xml" }), `${name}.svg`);
      } else {
        const pdf = await compilePdf(lastTypstRef.current);
        save(new Blob([pdf], { type: "application/pdf" }), `${name}.pdf`);
      }
    } catch (err) {
      setError("Export failed:\n" + err);
    }
  };

  return (
    <>
      <div className={"app" + (sidebarOpen ? "" : " nosidebar")}>
        <Sidebar
          cvs={cvs}
          activeId={activeId}
          actions={cvActions}
          onNewFromSample={newFromSample}
          onImport={importFile}
        />

        <section className="editor-col">
          <Toolbar
            onToggleSidebar={() => setSidebarOpen((s) => !s)}
            zoom={zoom}
            onZoom={changeZoom}
            busy={busy}
            canDownload={!!svg && !error}
            onExport={onExport}
          />
          <ThemeSelector value={theme} onChange={changeTheme} onStep={stepTheme} />
          <div className="editor-wrap">
            <Editor value={yaml} onChange={setYaml} />
          </div>
        </section>

        <Preview svg={svg} zoom={zoom} stale={!!error} error={error} />
      </div>

      <Boot done={booted} />
    </>
  );
}
