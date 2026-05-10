export default function BrandWordmark({ size = 20, className = '' }) {
  return (
    <span
      className={`font-heading uppercase text-hextech-text ${className}`}
      style={{ fontSize: size, letterSpacing: '.18em' }}
    >
      ARCANEMATH<span className="text-hextech-gold">.</span>DEV
    </span>
  );
}
