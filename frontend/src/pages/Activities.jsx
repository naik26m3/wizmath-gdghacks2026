import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BG = 'rgb(43,42,42)';
const BG2 = 'rgb(35,34,34)';
const BG3 = 'rgb(28,27,27)';
const BORDER = 'rgba(180,160,100,.22)';

const ACTIVITIES = [
  {
    id: 1,
    title: 'Exploring Slope and y-Intercept',
    tags: [{ label: 'Exploration', type: 'exp' }, { label: 'Grades 9–12', type: 'grade' }],
    href: '/slope',
    thumb: (
      <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill={BG3}/>
        <g stroke="rgba(255,255,255,.07)" strokeWidth="0.6">
          <path d="M0 100 H320"/><path d="M160 0 V200"/>
          <path d="M0 20 H320"/><path d="M0 60 H320"/><path d="M0 140 H320"/><path d="M0 180 H320"/>
          <path d="M40 0 V200"/><path d="M80 0 V200"/><path d="M120 0 V200"/>
          <path d="M200 0 V200"/><path d="M240 0 V200"/><path d="M280 0 V200"/>
        </g>
        <line x1="0" y1="100" x2="320" y2="100" stroke="rgba(240,191,92,.3)" strokeWidth="1"/>
        <line x1="160" y1="0" x2="160" y2="200" stroke="rgba(240,191,92,.3)" strokeWidth="1"/>
        <line x1="40" y1="160" x2="280" y2="40" stroke="#f0bf5c" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="200" y1="80" x2="200" y2="120" stroke="#e25c7a" strokeWidth="3" strokeLinecap="round"/>
        <line x1="160" y1="120" x2="200" y2="120" stroke="#43e2d2" strokeWidth="3" strokeLinecap="round"/>
        <g fontFamily="Space Grotesk, sans-serif" fontSize="9" fill="#d2c5b1">
          <text x="234" y="58">Slope</text>
          <circle cx="285" cy="70" r="3.5" fill="#e25c7a"/>
          <text x="234" y="80">Run</text>
          <circle cx="270" cy="88" r="3.5" fill="#43e2d2"/>
          <text x="234" y="108" fill="#5fc28a">y-intercept</text>
        </g>
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Exploring Slopes in Graphs and Functions',
    tags: [{ label: 'Exploration', type: 'exp' }, { label: 'Grades 9–12', type: 'grade' }],
    href: '/slope',
    thumb: (
      <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill={BG3}/>
        <g stroke="rgba(255,255,255,.07)" strokeWidth="0.6">
          <path d="M0 100 H320"/><path d="M160 0 V200"/>
          <path d="M40 0 V200"/><path d="M80 0 V200"/><path d="M120 0 V200"/>
          <path d="M200 0 V200"/><path d="M240 0 V200"/><path d="M280 0 V200"/>
          <path d="M0 40 H320"/><path d="M0 60 H320"/><path d="M0 140 H320"/><path d="M0 160 H320"/>
        </g>
        <line x1="0" y1="100" x2="320" y2="100" stroke="rgba(240,191,92,.3)" strokeWidth="1"/>
        <line x1="160" y1="0" x2="160" y2="200" stroke="rgba(240,191,92,.3)" strokeWidth="1"/>
        <line x1="40" y1="40" x2="280" y2="160" stroke="#43e2d2" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="40" y1="160" x2="280" y2="40" stroke="#f0bf5c" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="180" y1="100" x2="180" y2="120" stroke="#e25c7a" strokeWidth="3" strokeLinecap="round"/>
        <line x1="160" y1="100" x2="180" y2="100" stroke="#43e2d2" strokeWidth="3" strokeLinecap="round"/>
        <g fontFamily="Space Grotesk, sans-serif" fontSize="9" fill="#d2c5b1">
          <text x="234" y="50" fontStyle="italic" fill="#43e2d2">g(x) = x</text>
          <text x="234" y="68" fontWeight="600">Slope</text>
          <text x="234" y="84">Rise</text>
          <circle cx="262" cy="92" r="3.5" fill="#e25c7a"/>
          <text x="234" y="108">Run</text>
          <circle cx="290" cy="116" r="3.5" fill="#43e2d2"/>
          <text x="234" y="150" fontStyle="italic" fill="#f0bf5c">f(x) = −x</text>
        </g>
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Changing the Slope',
    tags: [{ label: 'Practice', type: 'prac' }, { label: 'Grades 9–12', type: 'grade' }],
    href: '/slope',
    thumb: (
      <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill={BG3}/>
        <text x="14" y="22" fontFamily="Space Grotesk, sans-serif" fontSize="9" fill="#aaa">Watch the animation, then complete the sentence.</text>
        <polygon points="14,32 14,52 30,42" fill="#f0bf5c"/>
        <g fontFamily="Space Grotesk, sans-serif" fontSize="9" fill="#d2c5b1">
          <text x="14" y="68">The line gets closer to the</text>
          <rect x="116" y="58" width="48" height="13" fill="rgba(240,191,92,.08)" stroke="rgba(240,191,92,.3)" strokeWidth="0.8" rx="2"/>
          <text x="120" y="68" fill="#f0bf5c" fontStyle="italic">x − axis</text>
          <text x="14" y="84">and the slope gets</text>
          <rect x="80" y="74" width="42" height="13" fill="rgba(240,191,92,.08)" stroke="rgba(240,191,92,.3)" strokeWidth="0.8" rx="2"/>
          <text x="84" y="84" fill="#f0bf5c">closer to</text>
          <text x="128" y="84">0.</text>
          <text x="14" y="106" fill="#5fc28a">✓ Correct</text>
        </g>
        <g transform="translate(180, 30)">
          <g stroke="rgba(255,255,255,.07)" strokeWidth="0.5">
            <path d="M0 60 H130"/><path d="M65 0 V120"/>
          </g>
          <line x1="0" y1="60" x2="130" y2="60" stroke="rgba(240,191,92,.3)" strokeWidth="0.8"/>
          <line x1="65" y1="0" x2="65" y2="120" stroke="rgba(240,191,92,.3)" strokeWidth="0.8"/>
          <line x1="6" y1="20" x2="124" y2="100" stroke="#aaa" strokeWidth="1" strokeDasharray="3 3"/>
          <line x1="6" y1="50" x2="124" y2="70" stroke="#43e2d2" strokeWidth="2" strokeLinecap="round"/>
        </g>
        <rect x="240" y="170" width="68" height="18" fill="rgba(240,191,92,.15)" stroke="rgba(240,191,92,.4)" strokeWidth="1" rx="3"/>
        <text x="274" y="183" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="8" fontWeight="700" fill="#f0bf5c" letterSpacing="0.5">NEW PROBLEM</text>
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Exploring y-Intercepts in Graphs and Functions',
    tags: [{ label: 'Exploration', type: 'exp' }, { label: 'Grades 9–12', type: 'grade' }],
    href: '/slope',
    thumb: (
      <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill={BG3}/>
        <text x="14" y="22" fontFamily="Space Grotesk, sans-serif" fontSize="9" fill="#aaa">Use the slider to explore the y-intercept.</text>
        <g stroke="rgba(255,255,255,.07)" strokeWidth="0.6">
          <path d="M0 110 H320"/><path d="M120 0 V200"/>
          <path d="M0 50 H320"/><path d="M0 80 H320"/><path d="M0 140 H320"/><path d="M0 170 H320"/>
          <path d="M40 0 V200"/><path d="M80 0 V200"/>
          <path d="M160 0 V200"/><path d="M200 0 V200"/><path d="M240 0 V200"/>
        </g>
        <line x1="0" y1="110" x2="320" y2="110" stroke="rgba(240,191,92,.3)" strokeWidth="1"/>
        <line x1="120" y1="0" x2="120" y2="200" stroke="rgba(240,191,92,.3)" strokeWidth="1"/>
        <line x1="40" y1="140" x2="240" y2="20" stroke="#f0bf5c" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="120" cy="80" r="4" fill="#5fc28a"/>
        <g fontFamily="Space Grotesk, sans-serif" fontSize="9" fill="#d2c5b1">
          <text x="138" y="14" fontStyle="italic" fill="#f0bf5c">y = x</text>
          <text x="246" y="50" fill="#aaa">y-intercept</text>
          <line x1="270" y1="65" x2="270" y2="135" stroke="rgba(95,194,138,.4)" strokeWidth="2.5"/>
          <circle cx="270" cy="100" r="4" fill="#5fc28a"/>
          <text x="262" y="110" fontWeight="700" fill="#5fc28a">2</text>
          <text x="170" y="158" fontStyle="italic" fill="#43e2d2">y = x + 2</text>
        </g>
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Changing the y-Intercept',
    tags: [{ label: 'Practice', type: 'prac' }, { label: 'Grades 9–12', type: 'grade' }],
    href: '/slope',
    thumb: (
      <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill={BG3}/>
        <text x="14" y="22" fontFamily="Space Grotesk, sans-serif" fontSize="9" fill="#aaa">Watch the animation, then complete the sentence.</text>
        <polygon points="14,32 14,52 30,42" fill="#f0bf5c"/>
        <g fontFamily="Space Grotesk, sans-serif" fontSize="9" fill="#d2c5b1">
          <text x="14" y="68">The line moves</text>
          <rect x="78" y="58" width="48" height="13" fill="rgba(240,191,92,.08)" stroke="rgba(240,191,92,.3)" strokeWidth="0.8" rx="2"/>
          <text x="14" y="84">and the y-intercept</text>
          <rect x="86" y="74" width="48" height="13" fill="rgba(240,191,92,.08)" stroke="rgba(240,191,92,.3)" strokeWidth="0.8" rx="2"/>
          <rect x="14" y="96" width="56" height="14" fill="rgba(240,191,92,.08)" stroke="rgba(240,191,92,.4)" strokeWidth="0.8" rx="3"/>
          <text x="42" y="106" textAnchor="middle" fontWeight="600" fill="#f0bf5c">CHECK (3)</text>
        </g>
        <g transform="translate(170, 30)">
          <g stroke="rgba(255,255,255,.07)" strokeWidth="0.5">
            <path d="M0 60 H140"/><path d="M70 0 V120"/>
          </g>
          <line x1="0" y1="60" x2="140" y2="60" stroke="rgba(240,191,92,.3)" strokeWidth="0.8"/>
          <line x1="70" y1="0" x2="70" y2="120" stroke="rgba(240,191,92,.3)" strokeWidth="0.8"/>
          <line x1="6" y1="40" x2="134" y2="100" stroke="#aaa" strokeWidth="1" strokeDasharray="3 3"/>
          <line x1="6" y1="68" x2="134" y2="78" stroke="#43e2d2" strokeWidth="2" strokeLinecap="round"/>
        </g>
      </svg>
    ),
  },
];

const TAG_STYLES = {
  exp:   { background: 'rgba(67,226,210,.1)',  color: '#43e2d2', border: '1px solid rgba(67,226,210,.3)' },
  prac:  { background: 'rgba(226,92,122,.1)',  color: '#e25c7a', border: '1px solid rgba(226,92,122,.3)' },
  grade: { background: 'rgba(255,255,255,.05)', color: '#aaa',   border: '1px solid rgba(255,255,255,.1)' },
};

export default function Activities() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#d7e4f1', fontFamily: 'Manrope,sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .wiz-font-bebas { font-family:'Bebas Neue',sans-serif; }
        .wiz-font-space { font-family:'Space Grotesk',sans-serif; }
        .wiz-brand-mark { width:34px;height:34px;position:relative;background:conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);box-shadow:0 0 16px rgba(240,191,92,.25); }
        .wiz-brand-mark::after { content:'';position:absolute;inset:4px;background:${BG};clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .wiz-brand-mark::before { content:'';position:absolute;inset:0;z-index:1;background:radial-gradient(circle at 50% 50%,#43e2d2 0 20%,transparent 22%);filter:drop-shadow(0 0 5px #43e2d2); }
        .act-card { background:${BG2}; border:1px solid ${BORDER}; border-radius:10px; cursor:pointer; transition:transform .15s,border-color .2s,box-shadow .2s; overflow:hidden; }
        .act-card:hover { transform:translateY(-3px); border-color:rgba(240,191,92,.45); box-shadow:0 8px 32px rgba(0,0,0,.4),0 0 24px rgba(67,226,210,.06); }
        .act-thumb { width:100%; aspect-ratio:16/10; overflow:hidden; background:${BG3}; }
        .act-thumb svg { width:100%; height:100%; display:block; }
        .act-tag { display:inline-flex; align-items:center; padding:4px 10px; border-radius:5px; font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; }
        .nav-link { background:none;border:0;cursor:pointer;color:#aaa;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;padding:10px 14px;border-bottom:2px solid transparent;transition:color .2s,border-color .2s; }
        .nav-link:hover { color:#d7e4f1; }
        .nav-link.active { color:#f0bf5c; border-bottom-color:rgba(240,191,92,.5); }
      `}</style>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', gap:20, padding:'16px 32px', borderBottom:`1px solid ${BORDER}`, background:BG2 }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
          <div className="wiz-brand-mark"/>
          <span className="wiz-font-bebas" style={{ fontSize:20, letterSpacing:'.18em', color:'#d7e4f1' }}>WIZMATH<span style={{ color:'#f0bf5c' }}>.</span>DEV</span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', marginLeft:16 }}>
          <button className="nav-link active">Charts</button>
          <Link to="/calculator" style={{ textDecoration:'none' }}><button className="nav-link">Create</button></Link>

        </div>
        <div style={{ flex:1, maxWidth:380, marginLeft:12, display:'flex', alignItems:'center', gap:10, padding:'9px 14px', background:BG3, border:`1px solid ${BORDER}`, borderRadius:7 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="16" y1="16" x2="21" y2="21"/></svg>
          <input placeholder="Search activities…" style={{ flex:1, background:'transparent', border:0, outline:0, color:'#d7e4f1', fontFamily:'Manrope,sans-serif', fontSize:13 }}/>
        </div>
        <button style={{ marginLeft:'auto', background:'transparent', border:`1px solid ${BORDER}`, borderRadius:7, color:'#f0bf5c', padding:'9px 18px', cursor:'pointer', fontFamily:'Space Grotesk,sans-serif', fontSize:12, fontWeight:600, letterSpacing:'.16em', textTransform:'uppercase' }}>Sign in</button>
      </nav>

      {/* Header */}
      <div style={{ padding:'48px 40px 28px', maxWidth:1240, margin:'0 auto' }}>
        <h1 className="wiz-font-bebas" style={{ fontSize:48, letterSpacing:'.06em', color:'#d7e4f1', margin:'0 0 6px' }}>
          Math <span style={{ color:'#f0bf5c' }}>Activities</span>
        </h1>
        <p style={{ color:'#888', fontFamily:'Manrope,sans-serif', fontSize:15, margin:0 }}>Interactive explorations for grades 9–12</p>
      </div>

      {/* Grid */}
      <div style={{ maxWidth:1240, margin:'0 auto', padding:'0 40px 80px', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
        {ACTIVITIES.map((act) => (
          <article key={act.id} className="act-card" onClick={() => navigate(act.href)}>
            <div className="act-thumb">{act.thumb}</div>
            <div style={{ padding:'16px 18px 20px' }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
                {act.tags.map((t) => (
                  <span key={t.type} className="act-tag" style={TAG_STYLES[t.type]}>{t.label}</span>
                ))}
              </div>
              <h3 style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:16, lineHeight:'24px', color:'#d7e4f1', margin:0 }}>{act.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}