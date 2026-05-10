// "WIZMATH.DEV" wordmark with the gold dot, in the Hextech display font.
export default function BrandWordmark({ size = 20, className = '' }) {
  return (
    <span
      className={`font-heading uppercase text-hextech-text ${className}`}
      style={{ fontSize: size, letterSpacing: '.18em' }}
    >
      WIZMATH<span className="text-hextech-gold">.</span>DEV
    </span>
  );
}
