/**
 * A heading whose words rise out of a mask, one after another. Pure CSS (see .kt-word), so the
 * title is real, visible text in the first paint and never waits for JavaScript.
 */
export function KineticTitle({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h1 className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-top" style={{ paddingBottom: "0.14em", marginBottom: "-0.14em" }}>
          <span className="kt-word" style={{ animationDelay: `${0.05 + i * 0.045}s` }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </h1>
  );
}
