// Hexagonal brand mark with conic-gradient gold rim and glowing teal core.
// Paired with BrandWordmark in the top nav across every page.
export default function BrandMark({ size = 34, className = '' }) {
  return (
    <div
      className={`hx-brand-mark ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
