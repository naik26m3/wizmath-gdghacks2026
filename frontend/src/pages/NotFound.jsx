import { Link, useLocation } from 'react-router-dom';
import AuthButton from '@/components/wizmath/AuthButton';
import {
  Backdrop, ParticleField, TopNav, Sigil, EyebrowDivider, GoldButton, color,
} from '@/components/wizmath/hextech';

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <div className="font-body bg-hextech-void text-hextech-text min-h-screen flex flex-col">
      <Backdrop />
      <ParticleField />

      <div className="relative z-[2] flex flex-col min-h-screen">
        <TopNav
          links={[
            { to: '/activities', label: 'Activities' },
            { to: '/leaderboard', label: 'Charts' },
            { to: '/create', label: 'Create' },
          ]}
          right={<AuthButton />}
        />

        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
          <div className="wiz-rise">
            <Sigil glyph="danger" size={88} />
          </div>

          <h1
            className="wiz-rise wiz-rise-d1 font-heading uppercase leading-none m-0 mt-6"
            style={{ fontSize: 'clamp(64px, 12vw, 132px)', letterSpacing: '.08em', color: color.text }}
          >
            4<span style={{ color: color.gold }}>0</span>4
          </h1>

          <div className="wiz-rise wiz-rise-d2 mt-2 mb-4">
            <EyebrowDivider tone="teal">This path leads nowhere</EyebrowDivider>
          </div>

          <p className="wiz-rise wiz-rise-d3 font-body text-sm leading-6 max-w-[460px] mx-auto mb-8"
             style={{ color: color.textMuted }}>
            Nothing is bound to{' '}
            <code style={{ color: color.gold, fontFamily: "'Space Grotesk', monospace" }}>
              {pathname}
            </code>
            . It may have been moved, unpublished, or never existed at all.
          </p>

          <div className="wiz-rise wiz-rise-d4 flex flex-col items-center gap-4">
            <Link to="/activities" style={{ textDecoration: 'none' }}>
              <GoldButton>Back to Activities</GoldButton>
            </Link>
            <Link
              to="/"
              className="font-mono text-[12px] tracking-wide-5 uppercase no-underline"
              style={{ color: color.textMuted }}
            >
              or return to the home page
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
