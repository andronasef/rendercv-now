import { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/mode/yaml/yaml.js";

// Imperative CodeMirror 5 wrapped as a controlled-ish component: `value` is the
// source of truth; local edits bubble through onChange; external changes
// (sample load, import, theme sync) are pushed into the instance.
export default function Editor({ value, onChange }) {
  const hostRef = useRef(null);
  const cmRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const cm = CodeMirror(hostRef.current, {
      value,
      mode: "yaml",
      theme: "rendercv",
      lineNumbers: true,
      lineWrapping: false,
      tabSize: 2,
      indentUnit: 2,
      // Default viewportMargin (finite) so CodeMirror virtualizes and keeps its
      // OWN scrollbar inside .editor-wrap instead of growing the page.
    });
    cm.on("change", () => onChangeRef.current(cm.getValue()));
    cmRef.current = cm;
    return () => {
      cm.getWrapperElement().remove();
      cmRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cm = cmRef.current;
    if (cm && value !== cm.getValue()) {
      const cursor = cm.getCursor();
      cm.setValue(value);
      cm.setCursor(cursor);
    }
  }, [value]);

  return <div ref={hostRef} style={{ height: "100%" }} />;
}
