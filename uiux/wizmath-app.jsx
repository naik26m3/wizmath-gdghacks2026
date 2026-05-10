// WizMath.dev — interactive landing (Hextech Cinematic refactor)
const { useState, useEffect, useRef, useMemo } = React;

/* ============================================================
   Hextech Crest — original sigil, gold frame + teal core gem
   ============================================================ */
function Crest() {
  return (
    <div className="crest">
      <svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Gold frame gradient — top-lit */}
          <linearGradient id="hxGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0"    stopColor="#ffdea4"/>
            <stop offset="0.45" stopColor="#f0bf5c"/>
            <stop offset="0.7"  stopColor="#c89b3c"/>
            <stop offset="1"    stopColor="#5d4200"/>
          </linearGradient>
          <linearGradient id="hxGoldH" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0"    stopColor="#5d4200"/>
            <stop offset="0.15" stopColor="#c89b3c"/>
            <stop offset="0.5"  stopColor="#ffdea4"/>
            <stop offset="0.85" stopColor="#c89b3c"/>
            <stop offset="1"    stopColor="#5d4200"/>
          </linearGradient>
          {/* Inner panel — deep void */}
          <linearGradient id="hxPanel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a1825"/>
            <stop offset="1" stopColor="#010A13"/>
          </linearGradient>
          {/* Teal mana gem */}
          <radialGradient id="hxGem" cx="50%" cy="40%" r="60%">
            <stop offset="0"   stopColor="#dffaf5"/>
            <stop offset="0.25" stopColor="#43e2d2"/>
            <stop offset="0.6" stopColor="#00c6b7"/>
            <stop offset="1"   stopColor="#003732"/>
          </radialGradient>
          {/* Text — gold layered */}
          <linearGradient id="hxText" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0"    stopColor="#fff3c8"/>
            <stop offset="0.45" stopColor="#f0bf5c"/>
            <stop offset="1"    stopColor="#8a6418"/>
          </linearGradient>
          <filter id="hxGlow" x="-30%" y="-50%" width="160%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feFlood floodColor="#43e2d2" floodOpacity="0.7" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="g"/>
            <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="hxText3D" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feFlood floodColor="#f0bf5c" floodOpacity="0.35" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="g"/>
            <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="hxShadow" x="-10%" y="-15%" width="120%" height="145%">
            <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity="0.8"/>
          </filter>
        </defs>

        {/* Outer chamfered frame ring (evenodd) */}
        <g filter="url(#hxShadow)">
          <path fillRule="evenodd"
                d="M40,30 L100,30 L120,10 L400,10 L420,30 L480,30 L480,170 L420,170 L400,190 L120,190 L100,170 L40,170 Z
                   M52,42 L102,42 L122,22 L398,22 L418,42 L468,42 L468,158 L418,158 L398,178 L122,178 L102,158 L52,158 Z"
                fill="url(#hxGold)"/>
        </g>

        {/* Inner panel */}
        <path d="M52,42 L102,42 L122,22 L398,22 L418,42 L468,42 L468,158 L418,158 L398,178 L122,178 L102,158 L52,158 Z"
              fill="url(#hxPanel)"/>

        {/* Inner thin gold hairline */}
        <path d="M58,48 L104,48 L124,28 L396,28 L416,48 L462,48 L462,152 L416,152 L396,172 L124,172 L104,152 L58,152 Z"
              fill="none" stroke="url(#hxGoldH)" strokeWidth="0.8" opacity="0.55"/>

        {/* Corner caps — L-shapes in gold */}
        {[[58,48],[462,48,'r'],[58,152,'b'],[462,152,'rb']].map(([x,y,o], i) => {
          const dx = (o === 'r' || o === 'rb') ? -1 : 1;
          const dy = (o === 'b' || o === 'rb') ? -1 : 1;
          return (
            <g key={i} stroke="#f0bf5c" strokeWidth="1.5" fill="none" opacity="0.9">
              <line x1={x} y1={y} x2={x + dx*16} y2={y}/>
              <line x1={x} y1={y} x2={x} y2={y + dy*16}/>
            </g>
          );
        })}

        {/* Top center gem — rotated square */}
        <g transform="translate(260, 22)">
          <polygon points="-14,0 0,-14 14,0 0,14"
                   fill="#0a1825" stroke="#f0bf5c" strokeWidth="1.5"/>
          <polygon points="-9,0 0,-9 9,0 0,9"
                   fill="url(#hxGem)" filter="url(#hxGlow)"/>
          <polygon points="-3,-2 0,-7 3,-2 0,2" fill="rgba(255,255,255,.7)"/>
        </g>

        {/* Side ornaments — small diamonds */}
        <polygon points="44,100 50,94 56,100 50,106" fill="#f0bf5c"/>
        <polygon points="464,100 470,94 476,100 470,106" fill="#f0bf5c"/>

        {/* WIZMATH text */}
        <g transform="translate(260, 110)">
          <text x="0" y="3" textAnchor="middle"
                fontFamily="Bebas Neue, sans-serif" fontSize="62"
                letterSpacing="6" fill="#000" opacity="0.6">WIZMATH</text>
          <text x="0" y="0" textAnchor="middle"
                fontFamily="Bebas Neue, sans-serif" fontSize="62"
                letterSpacing="6" fill="url(#hxText)" filter="url(#hxText3D)">WIZMATH</text>
        </g>
        {/* .DEV subtitle */}
        <text x="260" y="148" textAnchor="middle"
              fontFamily="Space Grotesk, sans-serif" fontSize="11"
              letterSpacing="6" fontWeight="600"
              fill="#43e2d2" opacity="0.9">THE   ARCANUM   OF   NUMBERS</text>
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
        <div className="brand-name">WIZMATH<span className="dot">.</span>DEV</div>
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
        <span>Est. MMXXVI · Apprentices Welcome</span>
        <span className="dia"></span>
        <span className="ln"></span>
      </div>
      <h1 className="title">
        Master Mathematics,<br />
        <em>Wield It Like Magic.</em>
      </h1>
      <p className="subtitle">
        A spellbound path through arithmetic, algebra, geometry and beyond — forged
        for curious young minds and stubborn old ones. Each problem is a riddle.
        Each lesson, a rite.
      </p>
      <div className="cta-wrap">
        <div className="cta-frame">
          <button className="cta" onClick={() => window.location.href = 'Activities.html'}>Begin Your Apprenticeship</button>
        </div>
        <div className="cta-sub">~ takes about two minutes ~</div>
      </div>

      <div className="strip">
        <div className="avatars" aria-hidden="true">
          <span className="a1"></span><span className="a2"></span><span className="a3"></span><span className="a4"></span>
        </div>
        <div className="label">
          <b>873,142</b> apprentices have unsealed their first scroll
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
