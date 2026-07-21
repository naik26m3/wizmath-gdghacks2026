// Hexagonal brand mark — conic-gradient gold rim, glowing teal core.
//
// Geometry note: the clip-path `polygon(50% 0, 100% 25%, 100% 75%, 50% 100%,
// 0 75%, 0 25%)` is only a *regular* hexagon when height = width × 2/√3.
// Rendering it in a square box (as every page used to) squashes it ~13%
// vertically, which is why the nav mark never matched the SVG Sigil in the
// modals. We size from height and derive the width so the two agree.
//
// The inner cut-out is scaled about the centre rather than inset by a uniform
// box amount — a uniform `inset` on a hexagon yields a rim that reads thicker
// on the flat left/right edges than at the top/bottom points.
import { HEX_RATIO, hexBox } from './tokens';

export default function BrandMark({ size = 38, rim = 4, className = '', style }) {
  return (
    <div
      className={`hx-brand-mark ${className}`}
      style={{
        ...hexBox(size),
        // Scaling the inner hexagon about the centre keeps the rim even:
        // insetX = rim, insetY = rim × (height / width).
        '--rim-x': `${rim}px`,
        '--rim-y': `${(rim * HEX_RATIO).toFixed(2)}px`,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
