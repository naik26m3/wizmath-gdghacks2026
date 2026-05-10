// The hero crest — bespoke SVG sigil. Gold double-frame, teal core gem,
// and the WIZMATH wordmark engraved across the panel. Standalone art —
// no Tailwind classes; everything is in-SVG.
export default function Crest({ width = 320, className = '' }) {
  return (
    <div
      className={className}
      style={{
        width, maxWidth: '80%', margin: '0 auto 12px',
        filter: 'drop-shadow(0 18px 40px rgba(0,0,0,.7)) drop-shadow(0 0 30px rgba(67,226,210,.15))',
      }}
    >
      <svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="hxGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffdea4"/><stop offset="0.45" stopColor="#f0bf5c"/>
            <stop offset="0.7" stopColor="#c89b3c"/><stop offset="1" stopColor="#5d4200"/>
          </linearGradient>
          <linearGradient id="hxGoldH" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5d4200"/><stop offset="0.15" stopColor="#c89b3c"/>
            <stop offset="0.5" stopColor="#ffdea4"/><stop offset="0.85" stopColor="#c89b3c"/>
            <stop offset="1" stopColor="#5d4200"/>
          </linearGradient>
          <linearGradient id="hxPanel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a1825"/><stop offset="1" stopColor="#010A13"/>
          </linearGradient>
          <radialGradient id="hxGem" cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#dffaf5"/><stop offset="0.25" stopColor="#43e2d2"/>
            <stop offset="0.6" stopColor="#00c6b7"/><stop offset="1" stopColor="#003732"/>
          </radialGradient>
          <linearGradient id="hxText" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3c8"/><stop offset="0.45" stopColor="#f0bf5c"/>
            <stop offset="1" stopColor="#8a6418"/>
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

        <g filter="url(#hxShadow)">
          <path fillRule="evenodd"
            d="M40,30 L100,30 L120,10 L400,10 L420,30 L480,30 L480,170 L420,170 L400,190 L120,190 L100,170 L40,170 Z M52,42 L102,42 L122,22 L398,22 L418,42 L468,42 L468,158 L418,158 L398,178 L122,178 L102,158 L52,158 Z"
            fill="url(#hxGold)"/>
        </g>
        <path d="M52,42 L102,42 L122,22 L398,22 L418,42 L468,42 L468,158 L418,158 L398,178 L122,178 L102,158 L52,158 Z" fill="url(#hxPanel)"/>
        <path d="M58,48 L104,48 L124,28 L396,28 L416,48 L462,48 L462,152 L416,152 L396,172 L124,172 L104,152 L58,152 Z" fill="none" stroke="url(#hxGoldH)" strokeWidth="0.8" opacity="0.55"/>

        {[[58,48,1,1],[462,48,-1,1],[58,152,1,-1],[462,152,-1,-1]].map(([x,y,dx,dy],i)=>(
          <g key={i} stroke="#f0bf5c" strokeWidth="1.5" fill="none" opacity="0.9">
            <line x1={x} y1={y} x2={x+dx*16} y2={y}/><line x1={x} y1={y} x2={x} y2={y+dy*16}/>
          </g>
        ))}

        <g transform="translate(260, 22)">
          <polygon points="-14,0 0,-14 14,0 0,14" fill="#0a1825" stroke="#f0bf5c" strokeWidth="1.5"/>
          <polygon points="-9,0 0,-9 9,0 0,9" fill="url(#hxGem)" filter="url(#hxGlow)"/>
          <polygon points="-3,-2 0,-7 3,-2 0,2" fill="rgba(255,255,255,.7)"/>
        </g>
        <polygon points="44,100 50,94 56,100 50,106" fill="#f0bf5c"/>
        <polygon points="464,100 470,94 476,100 470,106" fill="#f0bf5c"/>

        <g transform="translate(260, 110)">
          <text x="0" y="3" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="62" letterSpacing="6" fill="#000" opacity="0.6">WIZMATH</text>
          <text x="0" y="0" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="62" letterSpacing="6" fill="url(#hxText)" filter="url(#hxText3D)">WIZMATH</text>
        </g>
        <text x="260" y="148" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="11" letterSpacing="6" fontWeight="600" fill="#43e2d2" opacity="0.9">THE   ARCANUM   OF   NUMBERS</text>
      </svg>
    </div>
  );
}
