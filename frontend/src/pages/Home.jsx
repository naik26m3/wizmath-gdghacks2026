import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Crest() {
  return (
    <div style={{ width:320, maxWidth:'80%', margin:'0 auto 12px', filter:'drop-shadow(0 18px 40px rgba(0,0,0,.7)) drop-shadow(0 0 30px rgba(67,226,210,.15))' }}>
      <svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'auto', display:'block' }}>
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

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily:'Manrope,system-ui,sans-serif', background:'#010A13', color:'#d7e4f1', minHeight:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .wiz-font-bebas { font-family:'Bebas Neue',sans-serif; }
        .wiz-font-space { font-family:'Space Grotesk',sans-serif; }
        .wiz-font-manrope { font-family:'Manrope',sans-serif; }
        .home-brand-mark { width:34px;height:34px;position:relative;background:conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);box-shadow:0 0 18px rgba(240,191,92,.25); }
        .home-brand-mark::after { content:'';position:absolute;inset:4px;background:#010A13;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .home-brand-mark::before { content:'';position:absolute;inset:0;z-index:1;background:radial-gradient(circle at 50% 50%,#43e2d2 0 20%,transparent 22%);filter:drop-shadow(0 0 6px #43e2d2); }
        .home-gbtn { --c:10px;background:transparent;border:1px solid rgba(240,191,92,.5);color:#f0bf5c;padding:10px 18px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:12px;letter-spacing:.16em;text-transform:uppercase;clip-path:polygon(var(--c) 0,100% 0,100% calc(100% - var(--c)),calc(100% - var(--c)) 100%,0 100%,0 var(--c));transition:background .2s,color .2s; }
        .home-gbtn:hover { background:#f0bf5c;color:#1a1100; }
        .home-cta { --c:16px;position:relative;display:inline-flex;align-items:center;justify-content:center;gap:14px;padding:22px 64px;min-width:380px;background:linear-gradient(180deg,#ffdea4,#f0bf5c 45%,#c89b3c);color:#1a1100;border:none;font-family:'Bebas Neue',sans-serif;font-weight:400;font-size:22px;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;clip-path:polygon(var(--c) 0,calc(100% - var(--c)) 0,100% var(--c),100% calc(100% - var(--c)),calc(100% - var(--c)) 100%,var(--c) 100%,0 calc(100% - var(--c)),0 var(--c));box-shadow:0 18px 50px -10px rgba(240,191,92,.35),0 0 60px -10px rgba(67,226,210,.25);transition:transform .15s,box-shadow .25s,filter .2s; }
        .home-cta:hover { transform:translateY(-2px);filter:brightness(1.08);box-shadow:0 24px 60px -10px rgba(240,191,92,.55),0 0 80px -10px rgba(67,226,210,.45); }
        .home-cta-frame { --c:18px;position:relative;padding:2px;background:linear-gradient(180deg,rgba(240,191,92,.6),rgba(67,226,210,.4));clip-path:polygon(var(--c) 0,calc(100% - var(--c)) 0,100% var(--c),100% calc(100% - var(--c)),calc(100% - var(--c)) 100%,var(--c) 100%,0 calc(100% - var(--c)),0 var(--c)); }
        .home-avatar { width:30px;height:30px;margin-left:-8px;border:1.5px solid #f0bf5c;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .home-avatar:first-child { margin-left:0; }
        @media (max-width:640px) { .home-cta { min-width:0;width:100%;padding:18px 24px;font-size:16px;letter-spacing:.18em; } }
      `}</style>

      {/* Backdrop */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, background:'radial-gradient(900px 540px at 50% -10%,rgba(240,191,92,.05),transparent 60%),radial-gradient(800px 600px at 100% 100%,rgba(67,226,210,.04),transparent 65%),#010A13' }}/>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1, opacity:.07, backgroundImage:'repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(0,0,0,.06) 0 1px,transparent 1px 3px)', mixBlendMode:'overlay' }}/>

      <div style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {/* Nav */}
        <nav style={{ display:'flex', alignItems:'center', gap:24, padding:'22px 36px', borderBottom:'1px solid rgba(200,155,60,.10)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div className="home-brand-mark"/>
            <span className="wiz-font-bebas" style={{ fontSize:20, letterSpacing:'.18em', color:'#d7e4f1' }}>WIZMATH<span style={{ color:'#f0bf5c' }}>.</span>DEV</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <Link to="/activities" style={{ color:'#d2c5b1', textDecoration:'none', fontFamily:'Space Grotesk,sans-serif', fontSize:12, fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase', padding:'10px 14px', borderBottom:'1px solid transparent' }}>Activities</Link>
            <Link to="/calculator" style={{ color:'#d2c5b1', textDecoration:'none', fontFamily:'Space Grotesk,sans-serif', fontSize:12, fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase', padding:'10px 14px', borderBottom:'1px solid transparent' }}>Create</Link>

          </div>
          <button className="home-gbtn" style={{ marginLeft:'auto' }}>Sign in</button>
        </nav>

        {/* Hero */}
        <section style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 24px 32px', textAlign:'center', maxWidth:1200, margin:'0 auto', width:'100%' }}>
          <Crest />

          <div style={{ display:'inline-flex', alignItems:'center', gap:14, color:'#f0bf5c', marginBottom:10, fontFamily:'Space Grotesk,sans-serif', fontSize:12, fontWeight:500, letterSpacing:'.12em', textTransform:'uppercase' }}>
            <span style={{ width:56, height:1, background:'linear-gradient(90deg,transparent,rgba(240,191,92,.5),transparent)' }}/>
            <span style={{ width:6, height:6, background:'#f0bf5c', transform:'rotate(45deg)', boxShadow:'0 0 10px #f0bf5c', display:'inline-block' }}/>
            <span>Est. MMXXVI · Apprentices Welcome</span>
            <span style={{ width:6, height:6, background:'#f0bf5c', transform:'rotate(45deg)', boxShadow:'0 0 10px #f0bf5c', display:'inline-block' }}/>
            <span style={{ width:56, height:1, background:'linear-gradient(90deg,transparent,rgba(240,191,92,.5),transparent)' }}/>
          </div>

          <h1 className="wiz-font-bebas" style={{ fontWeight:400, fontSize:'clamp(36px,5vw,72px)', lineHeight:1, letterSpacing:'.04em', margin:'0 0 10px', color:'#d7e4f1', textTransform:'uppercase' }}>
            Master Mathematics,<br/>
            <em style={{ fontStyle:'normal', background:'linear-gradient(180deg,#ffdea4 0%,#f0bf5c 50%,#c89b3c 100%)', WebkitBackgroundClip:'text', backgroundClip:'text', WebkitTextFillColor:'transparent' }}>Wield It Like Magic.</em>
          </h1>

          <p style={{ maxWidth:620, margin:'0 auto 20px', fontFamily:'Manrope,sans-serif', fontSize:16, lineHeight:'24px', color:'#d2c5b1' }}>
            A spellbound path through arithmetic, algebra, geometry and beyond — forged for curious young minds and stubborn old ones. Each problem is a riddle. Each lesson, a rite.
          </p>

          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
            <div className="home-cta-frame">
              <button className="home-cta" onClick={() => navigate('/activities')}>Begin Your Apprenticeship</button>
            </div>
            <div style={{ color:'#d2c5b1', fontFamily:'Space Grotesk,sans-serif', fontSize:12, letterSpacing:'.22em', textTransform:'uppercase' }}>~ takes about two minutes ~</div>
          </div>

          <div style={{ marginTop:24, display:'flex', alignItems:'center', justifyContent:'center', gap:18, flexWrap:'wrap', color:'#d2c5b1', fontFamily:'Space Grotesk,sans-serif', fontSize:13, letterSpacing:'.14em', textTransform:'uppercase' }}>
            <div style={{ display:'flex' }}>
              {[
                'radial-gradient(circle at 35% 35%,#ffdea4,#c89b3c)',
                'radial-gradient(circle at 35% 35%,#8ecefb,#1a3550)',
                'radial-gradient(circle at 35% 35%,#f0c2b0,#6a2a1a)',
                'radial-gradient(circle at 35% 35%,#43e2d2,#005049)',
              ].map((bg, i) => (
                <div key={i} className="home-avatar" style={{ background: bg, backgroundSize:'cover' }}/>
              ))}
            </div>
            <div><b style={{ color:'#f0bf5c', fontWeight:600 }}>873,142</b> apprentices have unsealed their first scroll</div>
          </div>
        </section>
      </div>
    </div>
  );
}