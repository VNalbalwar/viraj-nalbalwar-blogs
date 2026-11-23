/** Re-mounts on every navigation, so each page settles in. Pure CSS (see .page-in), so content is visible without waiting for JavaScript. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
