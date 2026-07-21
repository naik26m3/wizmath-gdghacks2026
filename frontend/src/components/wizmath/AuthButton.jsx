import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import GoogleIcon from './GoogleIcon';
import { chamferTLBR, color, font } from './hextech/tokens';

/**
 * Drop-in sign-in / user-menu button.
 * - Logged out: shows "Sign in" pill that opens the sign-in modal.
 * - Logged in: shows avatar + name; click opens a tiny menu with Sign out.
 *
 * All three states are pinned to CONTROL_HEIGHT. They used to be 32 / 36 / 40px,
 * so the whole header grew by 8px as auth resolved.
 */
const CONTROL_HEIGHT = 40;

export default function AuthButton() {
  const { user, profile, isLoadingAuth, logout, authError, openSignInModal } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Esc closes the user menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (isLoadingAuth) {
    return (
      <div
        style={{ width: 108, height: CONTROL_HEIGHT, background: 'rgba(255,255,255,.04)', clipPath: chamferTLBR(10), opacity: .5 }}
        aria-hidden="true"
      />
    );
  }

  if (!user) {
    return (
      <button
        onClick={openSignInModal}
        title={authError || 'Sign in'}
        className="hx-authbtn-signin"
        style={{ height: CONTROL_HEIGHT }}
      >
        <GoogleIcon size={14} />
        Sign in
      </button>
    );
  }

  const name = profile?.displayName || user.displayName || user.email || 'You';
  const photo = profile?.photoURL || user.photoURL || null;
  const emoji = profile?.avatarEmoji || '🦊';

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          height: CONTROL_HEIGHT,
          background: 'rgba(67,226,210,.06)', border: '1px solid rgba(67,226,210,.25)', borderRadius: 0,
          color: color.text, padding: '0 12px 0 6px', cursor: 'pointer',
          fontFamily: font.body, fontSize: 13, fontWeight: 500,
          clipPath: chamferTLBR(10),
        }}
      >
        {photo ? (
          <img src={photo} alt="" referrerPolicy="no-referrer" style={{ width: 26, height: 26, borderRadius: 0, display: 'block', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 26, height: 26, borderRadius: 0, background: 'linear-gradient(135deg,#43e2d2,#005049)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            {emoji}
          </div>
        )}
        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
          <div
            role="menu"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: color.surface2, border: '1px solid rgba(200,155,60,.25)', borderRadius: 0,
              minWidth: 200, padding: 6, zIndex: 51,
              clipPath: chamferTLBR(12),
            }}
          >
            <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid rgba(180,160,100,.15)' }}>
              <div style={{ fontFamily: font.body, fontSize: 13, color: color.text, fontWeight: 600 }}>{name}</div>
              <div style={{ fontFamily: font.body, fontSize: 11, color: color.textMuted, marginTop: 2 }}>{user.email}</div>
            </div>
            <button
              role="menuitem"
              onClick={() => { setOpen(false); logout(); }}
              className="hx-authbtn-signout"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
