import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';
import BrandWordmark from './BrandWordmark';
import { NAV_HEIGHT, color } from './tokens';

// The shared header. Every page renders this — previously each page hand-rolled
// its own <nav>, which is how they ended up at four different heights with two
// different logo sizes.
//
// Height is fixed (NAV_HEIGHT) rather than derived from padding, so the bar
// can't grow when AuthButton swaps between its loading / signed-out /
// signed-in shapes.
//
// Slots:
//   links   : [{ to, label, active?, onClick? }] — primary nav
//   fill    : ReactNode  — stretches in the free space after the links (search)
//   center  : ReactNode  — absolutely centred *within the nav*, not the
//                          viewport, so it stays centred when a sidebar
//                          changes the column width
//   right   : ReactNode  — trailing actions (publish / exit / auth)
export default function TopNav({ links = [], fill, center, right, brandTo = '/', style }) {
  return (
    <nav
      className="hx-topnav"
      style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 24,
        height: NAV_HEIGHT, flexShrink: 0,
        padding: '0 36px',
        borderBottom: `1px solid ${color.borderFaint}`,
        background: 'transparent',
        ...style,
      }}
    >
      <Link to={brandTo} style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', flexShrink: 0 }}>
        <BrandMark />
        <BrandWordmark />
      </Link>

      {links.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {links.map((l) => (
            <Link
              key={l.to ?? l.label}
              to={l.to}
              onClick={l.onClick}
              className={`hx-nav-link${l.active ? ' is-active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}

      {fill}

      {center && (
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0,
          transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'stretch',
        }}>
          {center}
        </div>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {right}
      </div>
    </nav>
  );
}
