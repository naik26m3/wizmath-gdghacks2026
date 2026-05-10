// Ghost gold-bordered button — used in the top nav and as a secondary action.
// Hover fills with gold + flips text dark.
export default function GhostButton({
  children, type = 'button', className = '', onClick, ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`hx-gbtn ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
