// 30px hex avatar with thin gold border. Accepts either a `src` (image) or a
// `gradient` (CSS background string). Falls back to a teal/gold gradient.
export default function HexAvatar({
  src, alt = '', gradient, size = 30, border = true, className = '', style = {},
}) {
  const fallback = 'radial-gradient(circle at 35% 35%, #43e2d2, #005049)';
  const bg = src ? undefined : (gradient || fallback);
  return (
    <span
      className={`hx-hex inline-block ${className}`}
      style={{
        width: size, height: size,
        background: bg, backgroundSize: 'cover', backgroundPosition: 'center',
        border: border ? '1.5px solid #f0bf5c' : 'none',
        ...style,
      }}
      role={src ? 'img' : 'presentation'}
      aria-label={src ? alt : undefined}
    >
      {src && (
        <img
          src={src} alt={alt} referrerPolicy="no-referrer"
          className="hx-hex block w-full h-full object-cover"
        />
      )}
    </span>
  );
}
