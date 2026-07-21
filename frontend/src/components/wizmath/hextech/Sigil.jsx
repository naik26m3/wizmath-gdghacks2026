import { useId } from 'react';
import { HEX_RATIO } from './BrandMark';

// The hex sigil that crowns every modal — a double hexagon frame with a
// swappable glyph at its core. Shares its geometry with BrandMark so the
// crest in a dialog and the mark in the nav are provably the same shape.
//
// `glyph` picks the core: 'gem' | 'publish' | 'edit' | 'danger'.

const GOLD = '#f0bf5c';
const TEAL = '#43e2d2';
const VOID = '#010A13';
const DANGER = '#e25c7a';

// Points for a regular pointy-top hexagon centred at (cx, cy).
function hexPoints(cx, cy, halfHeight) {
  const halfWidth = halfHeight / HEX_RATIO;
  const q = halfHeight / 2; // side vertices sit at ±25% of the height
  return [
    [cx, cy - halfHeight],
    [cx + halfWidth, cy - q],
    [cx + halfWidth, cy + q],
    [cx, cy + halfHeight],
    [cx - halfWidth, cy + q],
    [cx - halfWidth, cy - q],
  ]
    .map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`)
    .join(' ');
}

const GLYPHS = {
  gem: (glow) => (
    <>
      <circle cx="28" cy="32" r="8" fill={TEAL} filter={glow} />
      <circle cx="28" cy="32" r="4" fill={VOID} />
      <circle cx="28" cy="32" r="2" fill={TEAL} />
    </>
  ),
  publish: (glow) => (
    <path
      d="M28 24 L28 40 M20 32 L28 24 L36 32"
      stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      fill="none" filter={glow}
    />
  ),
  edit: (glow) => (
    <path
      d="M22 40 L22.8 35.6 L34.6 23.8 A2.6 2.6 0 0 1 38.2 27.4 L26.4 39.2 Z M32.4 26 L36 29.6"
      stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      fill="none" filter={glow}
    />
  ),
  danger: (glow) => (
    <>
      <path
        d="M28 23 L28 34" stroke={DANGER} strokeWidth="2.6" strokeLinecap="round" filter={glow}
      />
      <circle cx="28" cy="40" r="1.8" fill={DANGER} filter={glow} />
    </>
  ),
};

const GLOW_COLOR = {
  gem: TEAL,
  publish: GOLD,
  edit: GOLD,
  danger: DANGER,
};

export default function Sigil({ glyph = 'gem', size = 64, className = '' }) {
  const uid = useId();
  const glowId = `sigil-glow-${uid.replace(/:/g, '')}`;
  const width = size / HEX_RATIO;
  const tone = GLOW_COLOR[glyph] ?? TEAL;
  const render = GLYPHS[glyph] ?? GLYPHS.gem;

  return (
    <svg
      width={width} height={size} viewBox="0 0 56 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={tone} floodOpacity="0.6" />
        </filter>
      </defs>
      <polygon points={hexPoints(28, 32, 30)} fill="none" stroke={GOLD} strokeWidth="1.5" opacity=".8" />
      <polygon points={hexPoints(28, 32, 24)} fill="none" stroke="rgba(240,191,92,.25)" strokeWidth="1" />
      {render(`url(#${glowId})`)}
    </svg>
  );
}
