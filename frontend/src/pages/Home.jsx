import { useNavigate } from 'react-router-dom';
import AuthButton from '@/components/wizmath/AuthButton';
import {
  Backdrop, ParticleField, TopNav, Crest,
  EyebrowDivider, GoldButton, HexAvatar,
} from '@/components/wizmath/hextech';

const APPRENTICE_AVATARS = [
  'radial-gradient(circle at 35% 35%,#ffdea4,#c89b3c)',
  'radial-gradient(circle at 35% 35%,#8ecefb,#1a3550)',
  'radial-gradient(circle at 35% 35%,#f0c2b0,#6a2a1a)',
  'radial-gradient(circle at 35% 35%,#43e2d2,#005049)',
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="font-body bg-hextech-void text-hextech-text h-screen flex flex-col overflow-hidden">
      <Backdrop />
      <ParticleField />

      <div className="relative z-[2] flex flex-col h-screen overflow-hidden">
        <TopNav
          links={[
            { to: '/activities', label: 'Activities' },
            { to: '/create',     label: 'Create' },
            { to: '/leaderboard',label: 'Leaderboard' },
          ]}
          right={<AuthButton />}
        />

        {/* Hero */}
        <section className="relative flex-1 min-h-0 flex flex-col items-center justify-center text-center w-full max-w-[1200px] mx-auto px-6 pt-3 pb-4 overflow-hidden">
          <div className="wiz-rise w-full">
            <Crest />
          </div>

          <div className="wiz-rise wiz-rise-d1 mb-2.5">
            <EyebrowDivider tone="gold">Est. MMXXVI · Apprentices Welcome</EyebrowDivider>
          </div>

          <h1 className="wiz-rise wiz-rise-d2 font-heading uppercase font-normal text-hextech-text leading-none tracking-wide-1 m-0 mb-2.5"
              style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
            Master Mathematics,<br/>
            <em
              className="not-italic bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(180deg,#ffdea4 0%,#f0bf5c 50%,#c89b3c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Wield It Like Magic.
            </em>
          </h1>

          <p className="wiz-rise wiz-rise-d3 font-body text-base leading-6 text-hextech-text-variant max-w-[620px] mx-auto mb-3.5">
            A spellbound path through arithmetic, algebra, geometry and beyond — forged for curious young minds and stubborn old ones. Each problem is a riddle. Each lesson, a rite.
          </p>

          <div className="wiz-rise wiz-rise-d4 flex flex-col items-center gap-4">
            <GoldButton onClick={() => navigate('/activities')}>
              Begin Your Apprenticeship
            </GoldButton>
            <div className="font-mono text-[12px] tracking-wide-6 uppercase text-hextech-text-variant">
              ~ takes about two minutes ~
            </div>
          </div>

          <div className="wiz-rise wiz-rise-d5 mt-3.5 flex items-center justify-center gap-4 flex-wrap font-mono text-[13px] tracking-wide-4 uppercase text-hextech-text-variant">
            <div className="flex">
              {APPRENTICE_AVATARS.map((bg, i) => (
                <HexAvatar
                  key={i}
                  gradient={bg}
                  className={i === 0 ? '' : '-ml-2'}
                />
              ))}
            </div>
            <div>
              <b className="text-hextech-gold font-semibold">873,142</b>
              {' '}apprentices have unsealed their first scroll
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
