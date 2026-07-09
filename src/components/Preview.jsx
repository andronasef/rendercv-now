// Renders the compiled SVG on a page-like canvas. `zoom` scales via CSS `zoom`
// (reflows, so scrollbars behave); `error` overlays without dropping the last
// good render underneath.
export default function Preview({ svg, zoom, stale, error }) {
  return (
    <section className="preview-col">
      <div className="preview-scroll">
        <div
          className={"page" + (stale ? " stale" : "")}
          style={{ "--zoom": zoom }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      {error && <pre className="error">{error}</pre>}
    </section>
  );
}
