import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

/**
 * Drop-in sign-in / user-menu button.
 * - Logged out: shows "Sign in" pill that triggers Google popup.
 * - Logged in: shows avatar + name; click opens a tiny menu with Sign out.
 */
export default function AuthButton() {
  const { user, profile, isLoadingAuth, logout, authError } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const goToSignIn = () => {
    navigate('/signin', { state: { from: location.pathname + location.search } });
  };

  if (isLoadingAuth) {
    return (
      <div style={{ width: 80, height: 32, background: 'rgba(255,255,255,.04)', borderRadius: 7, opacity: .5 }} />
    );
  }

  if (!user) {
    return (
      <button
        onClick={goToSignIn}
        title={authError || 'Sign in'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'transparent', border: '1px solid rgba(180,160,100,.35)', borderRadius: 7,
          color: '#f0bf5c', padding: '8px 16px', cursor: 'pointer',
          fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase',
          transition: 'border-color .2s, background .2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(240,191,92,.7)'; e.currentTarget.style.background = 'rgba(240,191,92,.06)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(180,160,100,.35)'; e.currentTarget.style.background = 'transparent'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 11v2h5.5c-.2 1.5-1.7 4.4-5.5 4.4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 2.6 14.6 1.6 12 1.6 6.3 1.6 1.6 6.3 1.6 12s4.7 10.4 10.4 10.4c6 0 10-4.2 10-10.1 0-.7-.1-1.2-.2-1.7H12z"/></svg>
        Sign in
      </button>
    );
  }

  const name = profile?.displayName || user.displayName || user.email || 'You';
  const photo = profile?.photoURL || user.photoURL || null;
  const emoji = profile?.avatarEmoji || '🦊';

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(67,226,210,.06)', border: '1px solid rgba(67,226,210,.25)', borderRadius: 7,
          color: '#d7e4f1', padding: '6px 12px 6px 6px', cursor: 'pointer',
          fontFamily: 'Manrope,sans-serif', fontSize: 13, fontWeight: 500,
        }}
      >
        {photo ? (
          <img src={photo} alt={name} referrerPolicy="no-referrer" style={{ width: 26, height: 26, borderRadius: '50%', display: 'block' }} />
        ) : (
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#43e2d2,#005049)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            {emoji}
          </div>
        )}
        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            background: 'rgb(35,34,34)', border: '1px solid rgba(180,160,100,.22)', borderRadius: 8,
            minWidth: 200, padding: 6, zIndex: 51, boxShadow: '0 8px 24px rgba(0,0,0,.4)',
          }}>
            <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid rgba(180,160,100,.15)' }}>
              <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 13, color: '#d7e4f1', fontWeight: 600 }}>{name}</div>
              <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 11, color: '#888', marginTop: 2 }}>{user.email}</div>
            </div>
            <button
              onClick={() => { setOpen(false); logout(); }}
              style={{
                width: '100%', textAlign: 'left', background: 'transparent', border: 0,
                color: '#e25c7a', padding: '10px 12px', cursor: 'pointer',
                fontFamily: 'Manrope,sans-serif', fontSize: 13,
                borderRadius: 5,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(226,92,122,.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
