import { createRoot } from "react-dom/client";
import "codemirror/lib/codemirror.css";
import "./styles.css";
import App from "./App.jsx";

// Cache the big immutable CDN assets (Pyodide, wheels, Typst WASM) so repeat
// loads serve them from Cache Storage. Registration is best-effort.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("/sw.js").catch(() => {}),
  );
}

createRoot(document.getElementById("root")).render(<App />);
