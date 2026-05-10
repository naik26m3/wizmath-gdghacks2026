import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';
import BrandWordmark from './BrandWordmark';

// Top navigation bar — shared header across every page.
//
// Props:
//   links     : [{ to, label, active? }]    — primary nav links (rendered between brand and right slot)
//   right     : ReactNode                   — right-aligned slot (auth button, search, etc.)
//   brandTo   : string  (default '/')       — where the wordmark links to
export default function TopNav({ links = [], right, brandTo = '/' }) {
  return (
    <nav className="relative z-10 flex items-center gap-6 px-9 py-5 border-b border-[rgba(200,155,60,.10)]">
      <Link to={brandTo} className="flex items-center gap-3.5 no-underline">
        <BrandMark />
        <BrandWordmark />
      </Link>

      {links.length > 0 && (
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={
                'font-mono text-[12px] font-semibold uppercase tracking-wide-5 ' +
                'px-3.5 py-2.5 border-b transition-colors no-underline ' +
                (l.active
                  ? 'text-hextech-gold border-[rgba(240,191,92,.5)]'
                  : 'text-hextech-text-variant border-transparent hover:text-hextech-gold hover:border-[rgba(240,191,92,.5)]')
              }
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <div className="ml-auto">{right}</div>
    </nav>
  );
}
