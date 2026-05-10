// ArcaneMath.dev — interactive landing (Hextech Cinematic refactor)
const { useState, useEffect, useRef, useMemo } = React;

/* ============================================================
   Hextech Crest — original sigil, gold frame + teal core gem
   ============================================================ */
function Crest() {
  return (
    <div className="crest">
      <svg viewBox="0 0 520 160" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hxText" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0"    stopColor="#fff3c8"/>
            <stop offset="0.45" stopColor="#f0bf5c"/>
            <stop offset="1"    stopColor="#8a6418"/>
          </linearGradient>
          <filter id="hxShadow" x="-10%" y="-15%" width="120%" height="145%">
            <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity="0.8"/>
          </filter>
        </defs>

        {/* Simple hex frame — mirrors the nav brand-mark */}
        <g filter="url(#hxShadow)">
          <polygon
            points="60,20 460,20 500,80 460,140 60,140 20,80"
            fill="none" stroke="#f0bf5c" strokeWidth="2"/>
        </g>

        {/* Top center gem — simple teal dot like the brand-mark core */}
        <circle cx="260" cy="20" r="6" fill="#43e2d2"
                stroke="#010A13" strokeWidth="2"/>

        {/* ARCANEMATH text */}
        <text x="260" y="100" textAnchor="middle"
              fontFamily="Bebas Neue, sans-serif" fontSize="62"
              letterSpacing="6" fill="url(#hxText)">ARCANEMATH</text>
      </svg>
    </div>
  );
}

/* ============================================================
   Top Nav
   ============================================================ */
function Nav() {
  return (
    <nav className="nav" data-screen-label="Nav">
      <div className="brand">
        <div className="brand-mark"></div>
        <div className="brand-name">ARCANEMATH<span className="dot">.</span>DEV</div>
      </div>
      <button className="gbtn">Sign in</button>
    </nav>
  );
}

/* ============================================================
   Hero
   ============================================================ */
function Hero() {
  return (
    <section className="hero" data-screen-label="Hero">
      <Crest />
      <div className="eyebrow label-sm">
        <span className="ln"></span>
        <span className="dia"></span>
        <span style={{color: '#43e2d2'}}>The Arcanum of Numbers</span>
        <span className="dia"></span>
        <span className="ln"></span>
      </div>
      <h1 className="title">
        Master Mathematics,<br />
        <em>Dominate Every Problem.</em>
      </h1>
      <p className="subtitle">
        Train across arithmetic, algebra, geometry and beyond — sharpen your mind,
        climb the ranks, and outplay every challenge. Knowledge is power.
        Power wins games.
      </p>
      <div className="cta-wrap">
        <div className="cta-frame">
          <button className="cta" onClick={() => window.location.href = 'Activities.html'}>Enter the Arena</button>
        </div>
        <div className="cta-sub">~ takes about two minutes ~</div>
      </div>

      <div className="strip">
        <div className="avatars" aria-hidden="true">
          <span className="a1"></span><span className="a2"></span><span className="a3"></span><span className="a4"></span>
        </div>
        <div className="label">
          <b>873,142</b> summoners have answered the call
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   App root
   ============================================================ */
function App() {
  return (
    <>
      <Nav />
      <Hero />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
