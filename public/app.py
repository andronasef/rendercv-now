"""RenderCV in the browser.

Runs the entire Python half of RenderCV under Pyodide: YAML -> pydantic
validation -> Jinja2 generates a Typst source string. The native `typst`
compiler is NOT installed (it can't run in WASM); typst.ts compiles the
generated source in renderer.js. This module only produces the Typst text;
fonts are static files fetched by JS.
"""

import io
import json
import time

from pyscript import document, window


def set_status(msg: str) -> None:
    el = document.getElementById("boot-status")
    if el:
        el.textContent = msg


# rendercv (+ deps) is already installed by PyScript from the vendored wheels
# (pyscript.toml `packages`) before this file runs.
set_status("Loading libraries…")
_t_import = time.time()
from ruamel.yaml import YAML  # noqa: E402
from ruamel.yaml.error import YAMLError  # noqa: E402

from rendercv.renderer.templater.templater import render_full_template  # noqa: E402
from rendercv.schema.rendercv_model_builder import (  # noqa: E402
    build_rendercv_model_from_commented_map,
)

window.console.log(f"[perf] python imports: {(time.time() - _t_import) * 1000:.0f}ms")

_yaml = YAML()
_yaml.preserve_quotes = True


def _format_error(exc: Exception) -> str:
    """Turn validation/YAML errors into a readable multi-line message."""
    # RenderCVUserValidationError aggregates structured field errors.
    validation_errors = getattr(exc, "validation_errors", None)
    if validation_errors:
        lines = []
        for err in validation_errors:
            loc = " → ".join(str(p) for p in (err.schema_location or ())) or "(document)"
            lines.append(f"• {loc}\n    {err.message}")
        return "\n".join(lines)

    # RenderCVUserError carries a single message.
    message = getattr(exc, "message", None)
    if message:
        return str(message)

    # pydantic.ValidationError.
    errors = getattr(exc, "errors", None)
    if callable(errors):
        try:
            lines = []
            for err in exc.errors():
                loc = " → ".join(str(p) for p in err.get("loc", ())) or "(document)"
                lines.append(f"• {loc}\n    {err.get('msg', '')}")
            if lines:
                return "\n".join(lines)
        except Exception:
            pass

    return str(exc) or exc.__class__.__name__


def build_typst(yaml_text: str, theme: str | None) -> str:
    """Parse YAML → RenderCVModel → Typst source string. Raises on bad input."""
    data = _yaml.load(io.StringIO(yaml_text))
    if data is None:
        raise ValueError("The document is empty — nothing to render.")

    # ponytail: the browser has no access to local photo files, and remote
    # photo URLs need network + CORS + urllib (unavailable in Pyodide). Drop
    # the photo so a `photo:` field never breaks the render.
    cv = data.get("cv")
    if isinstance(cv, dict) and cv.get("photo"):
        cv["photo"] = None

    # The theme dropdown overrides design.theme in the parsed document.
    if theme:
        design = data.get("design")
        if not isinstance(design, dict):
            design = {}
            data["design"] = design
        design["theme"] = theme

    model = build_rendercv_model_from_commented_map(data)
    return render_full_template(model, "typst")


def js_build_typst(yaml_text: str, theme: str) -> str:
    """JS entry point. Returns a JSON string: {ok, typst} or {ok:false, error}."""
    try:
        typst = build_typst(yaml_text, str(theme) if theme else None)
        return json.dumps({"ok": True, "typst": typst})
    except (YAMLError, Exception) as exc:  # noqa: BLE001 — surface everything to UI
        return json.dumps({"ok": False, "error": _format_error(exc)})


# Fonts are fetched by JS from /fonts/ (see src/lib/typst.js) — Python never
# touches them, so the 33MB rendercv-fonts wheel is not installed at all.

# Expose to JS. experimental_create_proxy="auto" (pyscript.toml) wraps these.
window.rcvBuildTypst = js_build_typst

set_status("Loading fonts & Typst compiler…")
window.dispatchEvent(window.CustomEvent.new("rcv:ready"))
