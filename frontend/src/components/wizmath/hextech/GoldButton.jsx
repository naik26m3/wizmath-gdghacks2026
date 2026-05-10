// Primary CTA: gold gradient, double chamfered corners, with the
// thin gold/teal "frame" outline that makes it feel etched.
//
// `framed` (default true) wraps in the .hx-cta-frame outline used on Home.
// Set to false for inline gold buttons that don't need the magic-leaf border.
export default function GoldButton({
  children, framed = true, type = 'button', className = '', onClick, ...rest
}) {
  const btn = (
    <button
      type={type}
      onClick={onClick}
      className={`hx-cta ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
  if (!framed) return btn;
  return <div className="hx-cta-frame">{btn}</div>;
}
