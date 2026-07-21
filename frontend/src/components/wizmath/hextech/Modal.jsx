import { useEffect, useRef } from 'react';
import Sigil from './Sigil';
import { MODAL_WIDTH, chamferTLBR, color, font } from './tokens';

// The one dialog shell. Every popup in the app is this card — the sign-in
// modal was the reference; publish, wager, edit and delete now share its
// chrome instead of each re-implementing a backdrop and a panel.
//
// Handles backdrop blur + fade, Esc, click-outside, body scroll lock, and
// focus restore. Callers supply the glyph, the title and the body.

const TONE = {
  gold: {
    border: 'rgba(240,191,92,0.28)',
    accent: 'rgba(240,191,92,.5)',
    title: '#c8b97a',
    highlight: color.gold,
  },
  danger: {
    border: 'rgba(226,92,122,0.35)',
    accent: 'rgba(226,92,122,.55)',
    title: '#c8b97a',
    highlight: color.danger,
  },
};

export default function Modal({
  open = true,
  onClose,
  glyph = 'gem',
  title,
  titleAccent,
  subtitle,
  footnote,
  tone = 'gold',
  label,
  children,
}) {
  const cardRef = useRef(null);

  // Esc to dismiss.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock the page behind the dialog and hand focus back where it came from.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = 'hidden';
    // Only pull focus if the body didn't already claim it (autoFocus inputs).
    if (!cardRef.current?.contains(document.activeElement)) {
      cardRef.current?.focus({ preventScroll: true });
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open]);

  if (!open) return null;

  const t = TONE[tone] ?? TONE.gold;

  return (
    <div
      className="hx-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(1,8,16,0.55)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        ref={cardRef}
        className="hx-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: MODAL_WIDTH,
          maxWidth: '100%', maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          background: color.card,
          border: `1px solid ${t.border}`,
          borderRadius: 4,
          padding: '36px 40px 28px',
          boxShadow: '0 0 0 1px rgba(67,226,210,0.06) inset, 0 8px 48px rgba(0,0,0,.7), 0 0 80px rgba(67,226,210,0.04)',
          fontFamily: font.body,
          color: '#c8b97a',
          outline: 'none',
        }}
      >
        {/* Corner accents */}
        <div style={{ position: 'absolute', top: -1, left: -1, width: 14, height: 14, borderTop: `1px solid ${t.accent}`, borderLeft: `1px solid ${t.accent}`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderBottom: `1px solid ${t.accent}`, borderRight: `1px solid ${t.accent}`, pointerEvents: 'none' }} />

        <button onClick={onClose} className="hx-modal-close" aria-label="Close">&times;</button>

        {/* The whole head is one block with a fixed bottom margin. Hanging that
            margin off the subtitle instead would collapse the head-to-body gap
            from 32px to 8px on any dialog without one — which is exactly what
            the wager dialog did, changing spacing based on whether the viewer
            happened to be signed in. */}
        <header style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <Sigil glyph={glyph} />
          </div>

          {title && (
            <h2 style={{
              fontFamily: font.display,
              fontSize: 26, fontWeight: 400, letterSpacing: '.12em',
              color: t.title, margin: 0, lineHeight: 1.2, textAlign: 'center',
            }}>
              {title}{titleAccent && <> <span style={{ color: t.highlight }}>{titleAccent}</span></>}
            </h2>
          )}

          {subtitle && (
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(200,185,122,.55)', margin: '8px 0 0', textAlign: 'center' }}>
              {subtitle}
            </p>
          )}
        </header>

        {children}

        {footnote && (
          <p style={{ margin: '20px 0 0', fontSize: 11, lineHeight: 1.6, color: 'rgba(200,185,122,.35)', textAlign: 'center' }}>
            {footnote}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Footer action row ──────────────────────────────────────────────────────
export function ModalActions({ children }) {
  return <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>{children}</div>;
}

const BUTTON_VARIANT = {
  primary: {
    background: 'linear-gradient(180deg,#f0bf5c,#c89b3c)',
    border: 0, color: '#1a1a1a', fontWeight: 700, letterSpacing: '.16em',
    filter: 'drop-shadow(0 0 10px rgba(240,191,92,.35))',
  },
  secondary: {
    background: 'transparent',
    border: '1px solid rgba(200,155,60,.25)', color: '#aaa',
    fontWeight: 600, letterSpacing: '.12em',
  },
  danger: {
    background: 'linear-gradient(180deg,#e25c7a,#a83456)',
    border: 0, color: '#fff', fontWeight: 700, letterSpacing: '.16em',
    filter: 'drop-shadow(0 0 10px rgba(226,92,122,.35))',
  },
  teal: {
    background: 'linear-gradient(180deg,#43e2d2,#005049)',
    border: 0, color: '#002a26', fontWeight: 700, letterSpacing: '.16em',
  },
};

export function ModalButton({
  variant = 'secondary', flex = 1, disabled, children, className = '', ...rest
}) {
  const v = BUTTON_VARIANT[variant] ?? BUTTON_VARIANT.secondary;
  return (
    <button
      disabled={disabled}
      className={`${variant === 'secondary' ? 'hx-modal-btn-ghost ' : ''}${className}`}
      style={{
        flex,
        borderRadius: 0,
        padding: '11px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: font.mono, fontSize: 12, textTransform: 'uppercase',
        clipPath: chamferTLBR(8),
        opacity: disabled ? 0.6 : 1,
        transition: 'background .15s, border-color .15s, color .15s',
        ...v,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

// ─── Form primitives ────────────────────────────────────────────────────────
export const fieldStyle = {
  width: '100%',
  background: 'rgba(6,12,20,.8)',
  border: `1px solid ${color.borderSoft}`,
  borderRadius: 0,
  color: color.text,
  padding: '10px 12px',
  fontFamily: font.body,
  fontSize: 14,
  outline: 0,
  boxSizing: 'border-box',
  clipPath: chamferTLBR(8),
};

export function FieldLabel({ children, style }) {
  return (
    <label style={{
      display: 'block',
      fontFamily: font.mono, fontSize: 11, fontWeight: 700,
      letterSpacing: '.14em', textTransform: 'uppercase',
      color: color.textMuted, marginBottom: 6,
      ...style,
    }}>
      {children}
    </label>
  );
}

export function ModalError({ children }) {
  if (!children) return null;
  return (
    <div style={{
      margin: '12px 0 0', padding: '10px 14px',
      background: 'rgba(226,92,122,.08)',
      border: '1px solid rgba(226,92,122,.3)',
      color: color.danger, fontSize: 12, lineHeight: '18px', textAlign: 'left',
      clipPath: chamferTLBR(8),
    }}>
      {children}
    </div>
  );
}
