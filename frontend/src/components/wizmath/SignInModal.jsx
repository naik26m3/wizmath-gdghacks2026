import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function SignInModal() {
  const { user, isSignInModalOpen, closeSignInModal, signIn, isLoadingAuth, authError } = useAuth();

  useEffect(() => {
    if (user && isSignInModalOpen) closeSignInModal();
  }, [user, isSignInModalOpen, closeSignInModal]);

  useEffect(() => {
    if (!isSignInModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isSignInModalOpen]);

  useEffect(() => {
    if (!isSignInModalOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeSignInModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSignInModalOpen, closeSignInModal]);

  if (!isSignInModalOpen) return null;

  return (
    <div
      onClick={closeSignInModal}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(1,8,16,0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'gsiBackdropIn .22s ease',
      }}
    >
      <style>{`
        @keyframes gsiBackdropIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes gsiCardIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in to ArcaneMath"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 400, maxWidth: 'calc(100vw - 32px)',
          background: 'rgba(6,12,20,0.94)',
          border: '1px solid rgba(240,191,92,0.28)',
          borderRadius: 4,
          padding: '36px 40px 28px',
          textAlign: 'center',
          boxShadow: '0 0 0 1px rgba(67,226,210,0.06) inset, 0 8px 48px rgba(0,0,0,.7), 0 0 80px rgba(67,226,210,0.04)',
          fontFamily: 'Manrope,system-ui,sans-serif',
          color: '#c8b97a',
          animation: 'gsiCardIn .22s ease',
        }}
      >
        {/* Corner accents */}
        <div style={{ position: 'absolute', top: -1, left: -1, width: 14, height: 14, borderTop: '1px solid rgba(240,191,92,.5)', borderLeft: '1px solid rgba(240,191,92,.5)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderBottom: '1px solid rgba(240,191,92,.5)', borderRight: '1px solid rgba(240,191,92,.5)', pointerEvents: 'none' }} />

        {/* Close button */}
        <button
          onClick={closeSignInModal}
          aria-label="Close"
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 28, height: 28, borderRadius: '50%',
            background: 'transparent',
            border: '1px solid rgba(240,191,92,.15)',
            color: 'rgba(200,185,122,.5)',
            fontSize: 18, lineHeight: 1, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color .15s, color .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(240,191,92,.5)'; e.currentTarget.style.color = '#f0bf5c'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(240,191,92,.15)'; e.currentTarget.style.color = 'rgba(200,185,122,.5)'; }}
        >
          &times;
        </button>

        {/* Hex brand mark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="56" height="64" viewBox="0 0 56 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="gsiGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#43e2d2" floodOpacity="0.6"/>
              </filter>
            </defs>
            <polygon points="28,2 54,16 54,48 28,62 2,48 2,16"
              fill="none" stroke="#f0bf5c" strokeWidth="1.5" opacity=".8"/>
            <polygon points="28,8 48,19.5 48,44.5 28,56 8,44.5 8,19.5"
              fill="none" stroke="rgba(240,191,92,.25)" strokeWidth="1"/>
            <circle cx="28" cy="32" r="8" fill="#43e2d2" filter="url(#gsiGlow)"/>
            <circle cx="28" cy="32" r="4" fill="#010A13"/>
            <circle cx="28" cy="32" r="2" fill="#43e2d2"/>
          </svg>
        </div>

        <h1 style={{
          fontFamily: 'Bebas Neue,Space Grotesk,sans-serif',
          fontSize: 26, fontWeight: 400, letterSpacing: '.12em',
          color: '#c8b97a', margin: '0 0 10px', lineHeight: 1.2,
        }}>
          WELCOME TO <span style={{ color: '#f0bf5c' }}>ARCANEMATH</span>
        </h1>

        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(200,185,122,.55)', margin: '0 0 26px' }}>
          Sign in to publish your own activities and explore creations from the community.
        </p>

        <button
          onClick={signIn}
          disabled={isLoadingAuth}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '12px 20px',
            background: '#fff', color: '#3c4043',
            border: '1px solid #dadce0', borderRadius: 4,
            fontFamily: 'Manrope,sans-serif', fontSize: 15, fontWeight: 500, letterSpacing: '.01em',
            cursor: isLoadingAuth ? 'not-allowed' : 'pointer',
            opacity: isLoadingAuth ? 0.6 : 1,
            transition: 'box-shadow .15s, background .15s',
            marginBottom: 20,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <svg width="22" height="22" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        {authError && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(226,92,122,.08)', border: '1px solid rgba(226,92,122,.3)', borderRadius: 3, color: '#e25c7a', fontSize: 12, lineHeight: '18px', textAlign: 'left' }}>
            {typeof authError === 'string' ? authError : (authError?.message || 'Sign in failed')}
          </div>
        )}

        <p style={{ margin: 0, fontSize: 11, lineHeight: 1.6, color: 'rgba(200,185,122,.35)' }}>
          By continuing, you agree to use ArcaneMath for educational purposes.
        </p>
      </div>
    </div>
  );
}
