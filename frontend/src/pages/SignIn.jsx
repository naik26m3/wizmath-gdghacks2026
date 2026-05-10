import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const BG = 'rgb(43,42,42)';
const BG2 = 'rgb(35,34,34)';
const BG3 = 'rgb(28,27,27)';
const BORDER = 'rgba(180,160,100,.22)';

export default function SignIn() {
  const { user, isLoadingAuth, signIn, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/activities';

  // Redirect away once signed in
  useEffect(() => {
    if (!isLoadingAuth && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, isLoadingAuth, navigate, redirectTo]);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#d7e4f1', fontFamily: 'Manrope,sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .wiz-font-bebas { font-family:'Bebas Neue',sans-serif; }
        .wiz-brand-mark { width:64px; height:64px; position:relative; background:conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c); clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); box-shadow: 0 0 32px rgba(240,191,92,.25); }
        .wiz-brand-mark::after { content:''; position:absolute; inset:7px; background:${BG}; clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .wiz-brand-mark::before { content:''; position:absolute; inset:0; z-index:1; background:radial-gradient(circle at 50% 50%,#43e2d2 0 22%,transparent 24%); filter:drop-shadow(0 0 10px #43e2d2); }
        @keyframes pulse-glow { 0%,100% { filter: drop-shadow(0 0 10px rgba(67,226,210,.55)); } 50% { filter: drop-shadow(0 0 22px rgba(67,226,210,.95)); } }
        .pulse { animation: pulse-glow 2.4s ease-in-out infinite; }
      `}</style>

      {/* Top bar — minimal, just a way back home */}
      <header style={{ display: 'flex', alignItems: 'center', padding: '18px 28px', borderBottom: `1px solid ${BORDER}`, background: BG2 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, position: 'relative', background: 'conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c)', clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)' }}>
            <div style={{ position: 'absolute', inset: 4, background: BG2, clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)' }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(circle at 50% 50%,#43e2d2 0 20%,transparent 22%)', filter: 'drop-shadow(0 0 5px #43e2d2)' }} />
          </div>
          <span className="wiz-font-bebas" style={{ fontSize: 20, letterSpacing: '.18em', color: '#d7e4f1' }}>
            WIZMATH<span style={{ color: '#f0bf5c' }}>.</span>DEV
          </span>
        </Link>
      </header>

      {/* Center stage */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{
          width: 'min(420px, 100%)',
          background: BG2,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: '48px 40px',
          textAlign: 'center',
          position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,.4)',
        }}>
          {/* Top accent line */}
          <div style={{ position: 'absolute', left: 24, right: 24, top: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(240,191,92,.6),transparent)' }} />

          {/* Brand */}
          <div className="wiz-brand-mark pulse" style={{ margin: '0 auto 28px' }} />

          <h1 className="wiz-font-bebas" style={{ fontSize: 36, letterSpacing: '.08em', color: '#d7e4f1', margin: '0 0 10px' }}>
            Welcome to <span style={{ color: '#f0bf5c' }}>WizMath</span>
          </h1>
          <p style={{ fontFamily: 'Manrope,sans-serif', fontSize: 14, lineHeight: '22px', color: '#999', margin: '0 0 32px' }}>
            Sign in to publish your own activities and explore creations from the community.
          </p>

          {/* Google button */}
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
              {authError}
            </div>
          )}

          <p style={{ marginTop: 28, fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, color: '#666', letterSpacing: '.08em' }}>
            By continuing, you agree to use WizMath for educational purposes.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '20px 28px', borderTop: `1px solid ${BORDER}`, background: BG3, color: '#666', fontSize: 11, fontFamily: 'Space Grotesk,sans-serif', letterSpacing: '.12em', textAlign: 'center', textTransform: 'uppercase' }}>
        WizMath.dev — Math, made magical
      </footer>
    </div>
  );
}
