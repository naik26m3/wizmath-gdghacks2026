import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

/**
 * Drop-in sign-in / user-menu button.
 * - Logged out: shows "Sign in" pill that opens the sign-in modal.
 * - Logged in: shows avatar + name; click opens a tiny menu with Sign out.
 */
export default function AuthButton() {
  const { user, profile, isLoadingAuth, logout, authError, openSignInModal } = useAuth();
  const [open, setOpen] = useState(false);

  if (isLoadingAuth) {
    return (
      <div style={{ width: 80, height: 32, background: 'rgba(255,255,255,.04)', borderRadius: 0, opacity: .5 }} />
    );
  }

  if (!user) {
    return (
      <button
        onClick={openSignInModal}
        title={authError || 'Sign in'}
        style={{
          background: 'transparent',
          border: '1px solid rgba(240,191,92,.5)',
          borderRadius: 0,
          color: '#f0bf5c',
          padding: '10px 18px',
          cursor: 'pointer',
          fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600,
          letterSpacing: '.16em', textTransform: 'uppercase',
          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
          transition: 'background .2s, color .2s',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f0bf5c'; e.currentTarget.style.color = '#1a1100'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f0bf5c'; }}
      >
        <svg width="14" height="14" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
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
          background: 'rgba(67,226,210,.06)', border: '1px solid rgba(67,226,210,.25)', borderRadius: 0,
          color: '#d7e4f1', padding: '6px 12px 6px 6px', cursor: 'pointer',
          fontFamily: 'Manrope,sans-serif', fontSize: 13, fontWeight: 500,
          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
        }}
      >
        {photo ? (
          <img src={photo} alt={name} referrerPolicy="no-referrer" style={{ width: 26, height: 26, borderRadius: 0, display: 'block' }} />
        ) : (
          <div style={{ width: 26, height: 26, borderRadius: 0, background: 'linear-gradient(135deg,#43e2d2,#005049)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
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
            background: '#111d26', border: '1px solid rgba(200,155,60,.25)', borderRadius: 0,
            minWidth: 200, padding: 6, zIndex: 51,
            clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
          }}>
            <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid rgba(180,160,100,.15)' }}>
              <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 13, color: '#d7e4f1', fontWeight: 600 }}>{name}</div>
              <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 11, color: '#888', marginTop: 2 }}>{user.email}</div>
            </div>
            <button
              onClick={() => { setOpen(false); logout(); }}
              style={{
                width: '100%', textAlign: 'left', background: 'transparent',
                border: '1px solid rgba(226,92,122,.25)',
                color: '#e25c7a', padding: '9px 12px', cursor: 'pointer',
                fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600,
                letterSpacing: '.12em', textTransform: 'uppercase',
                borderRadius: 0,
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                transition: 'background .2s, color .2s',
                marginTop: 6,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(226,92,122,.12)'; e.currentTarget.style.borderColor = 'rgba(226,92,122,.55)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(226,92,122,.25)'; }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
