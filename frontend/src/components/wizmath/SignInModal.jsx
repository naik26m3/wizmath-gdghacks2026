import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

const BG2 = 'rgb(35,34,34)';
const BORDER = 'rgba(180,160,100,.22)';

export default function SignInModal() {
  const { user, isSignInModalOpen, closeSignInModal, signIn, isLoadingAuth, authError } = useAuth();

  // Auto-close once authenticated
  useEffect(() => {
    if (user && isSignInModalOpen) closeSignInModal();
  }, [user, isSignInModalOpen, closeSignInModal]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isSignInModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isSignInModalOpen]);

  // Esc to close
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
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.62)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'wiz-signin-fade .18s ease',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes wiz-signin-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes wiz-signin-pop { from { opacity: 0; transform: translateY(8px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes wiz-signin-pulse { 0%,100% { filter: drop-shadow(0 0 10px rgba(67,226,210,.55)); } 50% { filter: drop-shadow(0 0 22px rgba(67,226,210,.95)); } }
        .wiz-signin-card { animation: wiz-signin-pop .22s cubic-bezier(.2,.8,.3,1.2); }
        .wiz-signin-pulse { animation: wiz-signin-pulse 2.4s ease-in-out infinite; }
      `}</style>

      <div
        className="wiz-signin-card"
        role="dialog"
        aria-modal="true"
        aria-label="Sign in to WizMath"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(420px, 100%)',
          background: BG2,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: '48px 40px',
          textAlign: 'center',
          position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,.55)',
          fontFamily: 'Manrope,sans-serif',
          color: '#d7e4f1',
        }}
      >
        {/* Close (X) */}
        <button
          onClick={closeSignInModal}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,.06)', border: `1px solid ${BORDER}`,
            color: '#d7e4f1', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s, border-color .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; e.currentTarget.style.borderColor = 'rgba(240,191,92,.45)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.borderColor = BORDER; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Top accent line */}
        <div style={{ position: 'absolute', left: 24, right: 24, top: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(240,191,92,.6),transparent)' }} />

        {/* Brand mark */}
        <div
          className="wiz-signin-pulse"
          style={{
            width: 64, height: 64, position: 'relative', margin: '0 auto 28px',
            background: 'conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c)',
            clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
            boxShadow: '0 0 32px rgba(240,191,92,.25)',
          }}
        >
          <div style={{ position: 'absolute', inset: 7, background: BG2, clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(circle at 50% 50%,#43e2d2 0 22%,transparent 24%)', filter: 'drop-shadow(0 0 10px #43e2d2)' }} />
        </div>

        <h1 style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 36, letterSpacing: '.08em', color: '#d7e4f1', margin: '0 0 10px' }}>
          Welcome to <span style={{ color: '#f0bf5c' }}>WizMath</span>
        </h1>
        <p style={{ fontSize: 14, lineHeight: '22px', color: '#999', margin: '0 0 32px' }}>
          Sign in to publish your own activities and explore creations from the community.
        </p>

        <button
          onClick={signIn}
          disabled={isLoadingAuth}
          style={{
            width: '100%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '12px 18px',
            background: '#fff',
            border: 0,
            borderRadius: 8,
            color: '#1f1f1f',
            fontFamily: 'Manrope,sans-serif', fontSize: 14, fontWeight: 600,
            cursor: isLoadingAuth ? 'not-allowed' : 'pointer',
            opacity: isLoadingAuth ? 0.6 : 1,
            boxShadow: '0 6px 18px rgba(0,0,0,.35)',
            transition: 'transform .15s, box-shadow .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,.35)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Sign in with Google
        </button>

        {authError && (
          <div style={{ marginTop: 18, padding: '10px 14px', background: 'rgba(226,92,122,.08)', border: '1px solid rgba(226,92,122,.3)', borderRadius: 7, color: '#e25c7a', fontSize: 12, lineHeight: '18px', textAlign: 'left' }}>
            {typeof authError === 'string' ? authError : (authError?.message || 'Sign in failed')}
          </div>
        )}

        <p style={{ marginTop: 28, fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, color: '#666', letterSpacing: '.08em' }}>
          By continuing, you agree to use WizMath for educational purposes.
        </p>
      </div>
    </div>
  );
}
