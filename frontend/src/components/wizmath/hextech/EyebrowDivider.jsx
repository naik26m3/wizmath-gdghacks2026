// Centered "— ◆ Label ◆ —" divider used above hero titles.
// `tone` controls the inner label color: 'gold' | 'teal' (default 'teal').
export default function EyebrowDivider({ children, tone = 'teal', className = '' }) {
  const labelColor = tone === 'teal' ? '#43e2d2' : '#f0bf5c';
  return (
    <div
      className={`inline-flex items-center gap-3.5 font-mono text-[12px] font-medium uppercase tracking-wide-3 text-hextech-gold ${className}`}
    >
      <span className="hx-eyebrow-rule" />
      <span className="hx-eyebrow-dia" />
      <span style={{ color: labelColor }}>{children}</span>
      <span className="hx-eyebrow-dia" />
      <span className="hx-eyebrow-rule" />
    </div>
  );
}
