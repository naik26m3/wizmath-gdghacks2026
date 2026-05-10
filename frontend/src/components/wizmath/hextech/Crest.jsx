export default function Crest({ width = 320, className = '' }) {
  return (
    <div
      className={className}
      style={{
        width, maxWidth: '80%', margin: '0 auto 12px',
        filter: 'drop-shadow(0 18px 40px rgba(0,0,0,.7)) drop-shadow(0 0 30px rgba(67,226,210,.15))',
      }}
    >
      <svg viewBox="0 0 520 160" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="hxText" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3c8"/>
            <stop offset="0.45" stopColor="#f0bf5c"/>
            <stop offset="1" stopColor="#8a6418"/>
          </linearGradient>
          <filter id="hxShadow" x="-10%" y="-15%" width="120%" height="145%">
            <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity="0.8"/>
          </filter>
        </defs>

        <g filter="url(#hxShadow)">
          <polygon
            points="60,20 460,20 500,80 460,140 60,140 20,80"
            fill="none" stroke="#f0bf5c" strokeWidth="2"/>
        </g>

        <circle cx="260" cy="20" r="6" fill="#43e2d2" stroke="#010A13" strokeWidth="2"/>

        <text x="260" y="100" textAnchor="middle"
          fontFamily="Bebas Neue, sans-serif" fontSize="72"
          letterSpacing="6" fill="url(#hxText)">ARCANEMATH</text>
      </svg>
    </div>
  );
}
