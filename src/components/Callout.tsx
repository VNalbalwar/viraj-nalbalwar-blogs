export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: "note" | "warn" | "tip";
  title?: string;
  children: React.ReactNode;
}) {
  const label = title ?? { note: "Note", warn: "Careful", tip: "Tip" }[type];
  return (
    <aside className="callout" data-tone={type}>
      <p className="callout-title">
        <i aria-hidden />
        {label}
      </p>
      {children}
    </aside>
  );
}
