import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit as fbLimit, getDocs } from 'firebase/firestore';
import { listActivities } from '@/lib/activities';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import AuthButton from '@/components/wizmath/AuthButton';
import { useAuth } from '@/lib/AuthContext';

const BG = '#010A13';
const BG2 = '#111d26';
const BG3 = '#091428';
const BORDER = 'rgba(200,155,60,.25)';
const GOLD = '#f0bf5c';
const TEAL = '#43e2d2';

// ─── useCountUp: animate a number from 0 → target over `duration` ms ────────
function useCountUp(target, duration = 1200, startKey = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const t = Number(target) || 0;
    if (t <= 0) { setValue(0); return; }
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const k = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3); // easeOutCubic
      setValue(Math.round(t * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, startKey]);
  return value;
}

// ─── Drifting hex particles in the backdrop ─────────────────────────────────
function Particles() {
  const particles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 8 + Math.random() * 14,
      duration: 16 + Math.random() * 14,
      delay: -Math.random() * 30,
      isTeal: i % 3 === 0,
    }));
  }, []);
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {particles.map((p) => (
        <div key={p.id} className="lb-particle"
          style={{
            left: `${p.left}%`,
            width: p.size, height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            background: p.isTeal ? TEAL : GOLD,
            opacity: p.isTeal ? 0.10 : 0.14,
            filter: `drop-shadow(0 0 6px ${p.isTeal ? TEAL : GOLD})`,
          }} />
      ))}
    </div>
  );
}

// ─── Podium card for ranks 1, 2, 3 ──────────────────────────────────────────
function PodiumCard({ rank, row, isCreator, isSelf, animDelay = 0 }) {
  const name = isCreator ? row.authorName : (row.displayName || 'Explorer');
  const photo = isCreator ? row.authorPhotoURL : row.photoURL;
  const xp = isCreator ? row.totalXp : (row.xp || 0);
  const initial = (name || '?')[0]?.toUpperCase() || '?';
  const animatedXp = useCountUp(xp, 1400, rank);

  // Rank-specific styling
  const config = {
    1: {
      heightPx: 230,
      avatarPx: 132,
      pillar: 'linear-gradient(180deg, rgba(240,191,92,.18), rgba(240,191,92,.06) 60%, rgba(80,55,15,.7))',
      pillarBorder: 'rgba(240,191,92,.55)',
      glow: '0 0 36px rgba(240,191,92,.45), 0 0 80px rgba(240,191,92,.18)',
      ringGrad: 'conic-gradient(from 30deg, #c89b3c, #f0bf5c 25%, #ffdea4 50%, #f0bf5c 75%, #c89b3c)',
      trophyBg: 'linear-gradient(180deg, #ffdea4, #f0bf5c 50%, #c89b3c)',
      trophyShadow: '0 0 18px rgba(240,191,92,.7)',
      xpColor: GOLD,
      labelColor: GOLD,
      labelText: 'CHAMPION',
      crown: true,
    },
    2: {
      heightPx: 170,
      avatarPx: 110,
      pillar: 'linear-gradient(180deg, rgba(200,210,219,.13), rgba(200,210,219,.04) 60%, rgba(60,68,76,.55))',
      pillarBorder: 'rgba(200,210,219,.32)',
      glow: '0 0 22px rgba(200,210,219,.28)',
      ringGrad: 'conic-gradient(from 30deg, #6b7682, #c8d2db 25%, #ffffff 50%, #c8d2db 75%, #6b7682)',
      trophyBg: 'linear-gradient(180deg, #e6ecf2, #c8d2db 50%, #6b7682)',
      trophyShadow: '0 0 14px rgba(200,210,219,.5)',
      xpColor: '#d7e4f1',
      labelColor: '#c8d2db',
      labelText: 'SILVER',
      crown: false,
    },
    3: {
      heightPx: 130,
      avatarPx: 110,
      pillar: 'linear-gradient(180deg, rgba(201,138,93,.15), rgba(201,138,93,.04) 60%, rgba(80,45,25,.6))',
      pillarBorder: 'rgba(201,138,93,.4)',
      glow: '0 0 22px rgba(201,138,93,.32)',
      ringGrad: 'conic-gradient(from 30deg, #6b3f25, #c98a5d 25%, #f0c2b0 50%, #c98a5d 75%, #6b3f25)',
      trophyBg: 'linear-gradient(180deg, #f0c2b0, #c98a5d 50%, #6b3f25)',
      trophyShadow: '0 0 14px rgba(201,138,93,.55)',
      xpColor: '#e2b598',
      labelColor: '#c98a5d',
      labelText: 'BRONZE',
      crown: false,
    },
  }[rank];

  return (
    <div className="lb-anim-rise" style={{ animationDelay: `${animDelay}ms`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 0 }}>
      {/* Crown for rank 1 */}
      {config.crown && (
        <svg width="36" height="22" viewBox="0 0 36 22" style={{ filter: `drop-shadow(0 0 8px ${GOLD})`, marginBottom: -4 }}>
          <defs>
            <linearGradient id="crown-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff4c2"/>
              <stop offset="0.5" stopColor="#f0bf5c"/>
              <stop offset="1" stopColor="#c89b3c"/>
            </linearGradient>
          </defs>
          <path d="M2 18 L4 6 L11 12 L18 2 L25 12 L32 6 L34 18 Z" fill="url(#crown-g)" stroke="#8a6418" strokeWidth="0.6"/>
          <circle cx="4" cy="6" r="1.6" fill="#fff4c2"/>
          <circle cx="18" cy="2" r="1.8" fill="#fff4c2"/>
          <circle cx="32" cy="6" r="1.6" fill="#fff4c2"/>
        </svg>
      )}

      {/* Avatar (hex) */}
      <div className={config.crown ? 'lb-pulse-glow' : ''} style={{ position: 'relative', width: config.avatarPx, height: config.avatarPx }}>
        {/* Ring */}
        <div style={{
          position: 'absolute', inset: 0,
          background: config.ringGrad,
          clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
          filter: `drop-shadow(0 0 8px ${rank === 1 ? GOLD : rank === 2 ? '#c8d2db' : '#c98a5d'}80)`,
        }}/>
        {/* Inset bg */}
        <div style={{
          position: 'absolute', inset: 4,
          background: BG2,
          clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
        }}/>
        {/* Photo or initial */}
        {photo ? (
          <img src={photo} alt={name} referrerPolicy="no-referrer"
            style={{
              position: 'absolute', inset: 6,
              width: 'calc(100% - 12px)', height: 'calc(100% - 12px)',
              objectFit: 'cover',
              clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
            }}/>
        ) : (
          <div style={{
            position: 'absolute', inset: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bebas Neue,sans-serif', fontSize: rank === 1 ? 48 : 38, color: GOLD,
            background: `linear-gradient(135deg,${BG3},${BG})`,
            clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
          }}>
            {initial}
          </div>
        )}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: 'Bebas Neue,sans-serif',
        fontSize: rank === 1 ? 28 : 22,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: '#d7e4f1',
        textAlign: 'center',
        maxWidth: 200,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {rank === 1 ? <span className="lb-shimmer-text">{name}</span> : name}
        {isSelf && (
          <span style={{ display: 'inline-block', marginLeft: 8, padding: '2px 7px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '.16em', color: TEAL, background: 'rgba(67,226,210,.1)', border: '1px solid rgba(67,226,210,.3)', borderRadius: 0, verticalAlign: 'middle' }}>YOU</span>
        )}
      </div>

      {/* Sub-line */}
      <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: config.labelColor, marginTop: -2 }}>
        {config.labelText}
      </div>

      {/* Pillar */}
      <div style={{
        position: 'relative',
        marginTop: 8,
        width: '100%',
        height: config.heightPx,
        background: config.pillar,
        border: `1px solid ${config.pillarBorder}`,
        borderTopLeftRadius: 10, borderTopRightRadius: 10,
        boxShadow: config.glow,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8,
        paddingTop: 18,
      }}>
        {/* Top accent line */}
        <div style={{ position: 'absolute', left: 14, right: 14, top: 0, height: 1, background: `linear-gradient(90deg, transparent, ${rank === 1 ? GOLD : rank === 2 ? '#c8d2db' : '#c98a5d'}, transparent)` }}/>

        {/* Big rank numeral as background watermark */}
        <div aria-hidden style={{
          position: 'absolute', bottom: -10, right: 0, left: 0,
          fontFamily: 'Bebas Neue,sans-serif',
          fontSize: rank === 1 ? 160 : 110,
          letterSpacing: 0,
          color: 'rgba(255,255,255,.025)',
          textAlign: 'center', lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          {rank}
        </div>

        {/* Trophy badge */}
        <div style={{
          width: rank === 1 ? 44 : 36, height: rank === 1 ? 44 : 36,
          background: config.trophyBg,
          borderRadius: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: config.trophyShadow,
          position: 'relative', zIndex: 1,
        }}>
          <svg width={rank === 1 ? 24 : 20} height={rank === 1 ? 24 : 20} viewBox="0 0 24 24" fill="none" stroke="#1a1100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9V4h12v5a6 6 0 0 1-12 0z"/>
            <path d="M6 4H3v3a3 3 0 0 0 3 3"/>
            <path d="M18 4h3v3a3 3 0 0 1-3 3"/>
            <path d="M9 21h6"/><path d="M12 17v4"/>
          </svg>
        </div>

        {/* XP */}
        <div style={{ position: 'relative', zIndex: 1, fontFamily: 'Bebas Neue,sans-serif', fontSize: rank === 1 ? 38 : 30, letterSpacing: '.04em', color: config.xpColor, lineHeight: 1 }}>
          {animatedXp.toLocaleString()}
          <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '.22em', color: '#9b8f7d', marginLeft: 6 }}>XP</span>
        </div>

        {/* Sub stat */}
        <div style={{ position: 'relative', zIndex: 1, fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9b8f7d', textAlign: 'center', padding: '0 12px' }}>
          {isCreator ? (
            <>
              <span style={{ color: GOLD }}>{(row.totalStars || 0).toLocaleString()}</span> stars
              <span style={{ color: '#555', margin: '0 6px' }}>·</span>
              <span style={{ color: TEAL }}>{(row.totalViews || 0).toLocaleString()}</span> views
            </>
          ) : (
            <>Level <span style={{ color: TEAL }}>{(typeof row.level === 'number' ? row.level : Math.floor((row.xp || 0) / 100))}</span></>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Podium: lays out [#2, #1, #3] with #1 in the visual middle ─────────────
function Podium({ rows, isCreator, selfUid }) {
  const [first, second, third] = [rows[0], rows[1], rows[2]];
  const slotStyle = { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minWidth: 0 };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.15fr 1fr',
      alignItems: 'end',
      gap: 18,
      maxWidth: 880,
      margin: '0 auto 32px',
    }}>
      <div style={slotStyle}>
        {second && <PodiumCard rank={2} row={second} isCreator={isCreator} isSelf={selfUid && (isCreator ? second.authorUid : second.uid) === selfUid} animDelay={120}/>}
      </div>
      <div style={slotStyle}>
        {first && <PodiumCard rank={1} row={first} isCreator={isCreator} isSelf={selfUid && (isCreator ? first.authorUid : first.uid) === selfUid} animDelay={0}/>}
      </div>
      <div style={slotStyle}>
        {third && <PodiumCard rank={3} row={third} isCreator={isCreator} isSelf={selfUid && (isCreator ? third.authorUid : third.uid) === selfUid} animDelay={240}/>}
      </div>
    </div>
  );
}

// ─── Table row for rank 4+ ──────────────────────────────────────────────────
function TableRow({ rank, row, isCreator, isSelf, animDelay }) {
  const name = isCreator ? row.authorName : (row.displayName || 'Explorer');
  const photo = isCreator ? row.authorPhotoURL : row.photoURL;
  const xp = isCreator ? row.totalXp : (row.xp || 0);
  const initial = (name || '?')[0]?.toUpperCase() || '?';
  const animatedXp = useCountUp(xp, 1100, rank);

  return (
    <div className="lb-row lb-anim-rise" style={{
      animationDelay: `${animDelay}ms`,
      display: 'grid', gridTemplateColumns: '80px 1fr 200px 140px',
      alignItems: 'center', padding: '14px 32px',
      borderBottom: '1px solid rgba(200,155,60,.10)',
      background: isSelf ? 'rgba(67,226,210,.06)' : 'transparent',
      position: 'relative',
    }}>
      {isSelf && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: TEAL, boxShadow: `0 0 10px ${TEAL}` }}/>}

      {/* Rank */}
      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 26, letterSpacing: '.04em', color: '#9b8f7d' }}>
        {String(rank).padStart(2, '0')}
      </div>

      {/* Who */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        {photo ? (
          <img src={photo} alt={name} referrerPolicy="no-referrer" className="lb-hex"
            style={{ width: 38, height: 38, objectFit: 'cover', flexShrink: 0 }}/>
        ) : (
          <div className="lb-hex" style={{ width: 38, height: 38, background: `linear-gradient(135deg,${BG3},${BG2})`, border: `1px solid ${BORDER}`, fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, color: GOLD, flexShrink: 0 }}>{initial}</div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: '.08em', textTransform: 'uppercase', color: '#d7e4f1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
            {isSelf && <span style={{ marginLeft: 8, padding: '2px 7px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '.16em', color: TEAL, background: 'rgba(67,226,210,.1)', border: '1px solid rgba(67,226,210,.3)', borderRadius: 0}}>YOU</span>}
          </div>
          <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '.16em', color: '#9b8f7d', marginTop: 2 }}>
            {isCreator
              ? `${row.activityCount} ${row.activityCount === 1 ? 'activity' : 'activities'}`
              : `Level ${(typeof row.level === 'number' ? row.level : Math.floor((row.xp || 0) / 100))}`}
          </div>
        </div>
      </div>

      {/* Middle col */}
      <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#d2c5b1' }}>
        {isCreator ? (
          <>
            <span style={{ color: GOLD }}>{row.totalStars}</span> {row.totalStars === 1 ? 'star' : 'stars'}
            <span style={{ color: '#555', margin: '0 6px' }}>·</span>
            <span style={{ color: TEAL }}>{row.totalViews}</span> {row.totalViews === 1 ? 'view' : 'views'}
          </>
        ) : (
          <>Lv. <span style={{ color: TEAL }}>{(typeof row.level === 'number' ? row.level : Math.floor((row.xp || 0) / 100))}</span></>
        )}
      </div>

      {/* XP */}
      <div style={{ textAlign: 'right', fontFamily: 'Bebas Neue,sans-serif', fontSize: 24, letterSpacing: '.04em', color: GOLD }}>
        {animatedXp.toLocaleString()}
        <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.22em', color: '#9b8f7d', marginLeft: 6 }}>XP</span>
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function Leaderboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState(/** @type {any[]} */ ([]));
  const [students, setStudents] = useState(/** @type {any[]} */ ([]));
  const [status, setStatus] = useState('loading');
  const [tab, setTab] = useState(/** @type {'creators' | 'students'} */ ('creators'));

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listActivities(200).catch((err) => { console.warn('listActivities failed:', err); return []; }),
      (async () => {
        if (!isFirebaseConfigured() || !db) return [];
        try {
          const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), fbLimit(20));
          const snap = await getDocs(q);
          return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
        } catch (e) {
          console.warn('leaderboard fetch failed:', e);
          return [];
        }
      })(),
    ])
      .then(([acts, lb]) => {
        if (cancelled) return;
        setActivities(acts);
        setStudents(lb);
        setStatus('ok');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, []);

  // Top Creators: aggregate XP from their activities (stars × 10 + views × 5)
  const creators = useMemo(() => {
    const map = new Map();
    for (const a of activities) {
      if (!a.authorUid) continue;
      const existing = map.get(a.authorUid) || {
        authorUid: a.authorUid,
        authorName: a.authorName || 'Explorer',
        authorPhotoURL: a.authorPhotoURL || null,
        totalStars: 0, totalViews: 0, totalXp: 0, activityCount: 0,
      };
      const stars = a.stars || 0;
      const views = a.views || 0;
      existing.totalStars += stars;
      existing.totalViews += views;
      existing.totalXp += (stars * 10) + (views * 5);
      existing.activityCount += 1;
      if (a.authorName) existing.authorName = a.authorName;
      if (a.authorPhotoURL) existing.authorPhotoURL = a.authorPhotoURL;
      map.set(a.authorUid, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.totalXp - a.totalXp).slice(0, 20);
  }, [activities]);

  const rows = tab === 'creators' ? creators : students;
  const isCreator = tab === 'creators';
  const selfUid = user?.uid || null;

  // Find user's own rank in current tab
  const selfRank = useMemo(() => {
    if (!selfUid) return null;
    const idx = rows.findIndex((r) => (isCreator ? r.authorUid : r.uid) === selfUid);
    return idx >= 0 ? idx + 1 : null;
  }, [rows, selfUid, isCreator]);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#d7e4f1', fontFamily: 'Manrope,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .lb-wrap::before {
          content:""; position: fixed; inset: 0;
          background:
            radial-gradient(1200px 600px at 50% -10%, rgba(67,226,210,.06), transparent 60%),
            radial-gradient(900px 600px at 50% 110%, rgba(240,191,92,.05), transparent 60%);
          pointer-events:none; z-index: 0;
        }
        .lb-brand-mark { width:34px; height:34px; position:relative; background:conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c); clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); box-shadow:0 0 16px rgba(240,191,92,.25); }
        .lb-brand-mark::after { content:''; position:absolute; inset:4px; background:${BG}; clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .lb-brand-mark::before { content:''; position:absolute; inset:0; z-index:1; background:radial-gradient(circle at 50% 50%,#43e2d2 0 20%,transparent 22%); filter:drop-shadow(0 0 5px #43e2d2); }
        .lb-board {
          position: relative;
          background: linear-gradient(180deg, ${BG2}, ${BG3});
          border: 1px solid ${BORDER};
          padding: 0;
          --c: 14px;
          clip-path: polygon(var(--c) 0,100% 0,100% calc(100% - var(--c)),calc(100% - var(--c)) 100%,0 100%,0 var(--c));
        }
        .lb-board::before {
          content:""; position:absolute; left:0; right:0; top:0; height:1px;
          background: linear-gradient(90deg, transparent, ${GOLD} 25%, #ffdea4 50%, ${GOLD} 75%, transparent);
        }
        .lb-row { transition: background .18s; }
        .lb-row:hover { background: rgba(240,191,92,.06) !important; }
        .lb-title-frame { display:inline-block; padding: 12px 48px; position: relative; }
        .lb-title-frame::before, .lb-title-frame::after { content:""; position:absolute; top:0; bottom:0; width:24px; border:1px solid ${GOLD}; }
        .lb-title-frame::before { left:0; border-right:0; }
        .lb-title-frame::after  { right:0; border-left:0; }
        .lb-hex {
          position: relative;
          clip-path: polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);
          display:inline-flex; align-items:center; justify-content:center;
        }
        .nav-link { background:none; border:0; cursor:pointer; color:#aaa; font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; padding:10px 14px; border-bottom:2px solid transparent; transition:color .2s,border-color .2s; }
        .nav-link:hover { color:#d7e4f1; }
        .nav-link.active { color:${GOLD}; border-bottom-color: rgba(240,191,92,.5); }

        /* ── Animations ── */
        @keyframes lb-rise {
          0%   { opacity: 0; transform: translateY(28px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .lb-anim-rise { animation: lb-rise .55s cubic-bezier(.2,.8,.2,1) both; }

        @keyframes lb-pulse-glow-kf {
          0%, 100% { filter: drop-shadow(0 0 14px rgba(240,191,92,.35)); }
          50%      { filter: drop-shadow(0 0 28px rgba(240,191,92,.65)); }
        }
        .lb-pulse-glow { animation: lb-pulse-glow-kf 3s ease-in-out infinite; }

        @keyframes lb-shimmer {
          0%   { background-position: -180% 0; }
          100% { background-position: 280% 0; }
        }
        .lb-shimmer-text {
          background: linear-gradient(110deg, ${GOLD} 0%, ${GOLD} 35%, #fff4c2 50%, ${GOLD} 65%, ${GOLD} 100%);
          background-size: 280% 100%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: lb-shimmer 3.4s linear infinite;
        }

        @keyframes lb-particle-drift {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          12%  { opacity: 0.7; }
          88%  { opacity: 0.6; }
          100% { transform: translateY(-110vh) rotate(180deg); opacity: 0; }
        }
        .lb-particle {
          position: fixed; bottom: -40px;
          clip-path: polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);
          animation: lb-particle-drift linear infinite;
          will-change: transform, opacity;
        }
      `}</style>

      <Particles />

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', gap:20, padding:'16px 32px', borderBottom:`1px solid ${BORDER}`, background:BG2, position: 'relative', zIndex: 2 }}>
        <Link to="/activities" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
          <div className="lb-brand-mark"/>
          <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:'.18em', color:'#d7e4f1' }}>WIZMATH<span style={{ color:GOLD }}>.</span>DEV</span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', marginLeft:16 }}>
          <Link to="/activities" style={{ textDecoration:'none' }}><button className="nav-link">Activities</button></Link>
          <Link to="/create" style={{ textDecoration:'none' }}><button className="nav-link">Create</button></Link>
          <button className="nav-link active">Leaderboard</button>
        </div>
        <div style={{ marginLeft:'auto' }}>
          <AuthButton />
        </div>
      </nav>

      <div className="lb-wrap" style={{ maxWidth: 1080, margin: '0 auto', padding: '50px 40px 80px', position: 'relative', zIndex: 1 }}>
        {/* Title */}
        <div className="lb-anim-rise" style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:12, fontWeight:700, letterSpacing:'.32em', textTransform:'uppercase', color: TEAL, marginBottom: 14 }}>
            — Hall of Honor —
          </div>
          <div className="lb-title-frame">
            <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:72, lineHeight:1, letterSpacing:'.06em', textTransform:'uppercase', color:'#d7e4f1', margin:0 }}>
              Leader<span style={{ color: GOLD }}>board</span>
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="lb-anim-rise" style={{ animationDelay: '60ms', display:'grid', gridTemplateColumns:'1fr 1fr', maxWidth: 520, margin: '0 auto 40px', background: `linear-gradient(180deg, ${BG2}, ${BG3})`, border: `1px solid ${BORDER}`, borderRadius: 0, position: 'relative', overflow: 'hidden', padding: 4 }}>
          {[
            { key: 'creators', label: 'Top Creators' },
            { key: 'students', label: 'Top Students' },
          ].map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  background: active ? 'linear-gradient(180deg, rgba(240,191,92,.18), rgba(200,155,60,.06))' : 'transparent',
                  border: 0, cursor: 'pointer', padding: '12px 20px',
                  borderRadius: 0,
                  fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase',
                  color: active ? GOLD : '#9b8f7d',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: active ? 'inset 0 0 0 1px rgba(240,191,92,.4)' : 'none',
                  transition: 'color .2s, background .2s',
                }}>
                <div className="lb-hex" style={{ width: 10, height: 10, background: active ? `linear-gradient(135deg, #ffdea4, #c89b3c)` : `linear-gradient(135deg, ${TEAL}, #005049)`, opacity: active ? 1 : 0.5 }}/>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Loading / error */}
        {status === 'loading' && (
          <div style={{ padding: '60px 32px', textAlign:'center', color:'#888', fontSize: 13, fontFamily:'Manrope,sans-serif' }}>Loading…</div>
        )}
        {status === 'error' && (
          <div style={{ padding: '60px 32px', textAlign:'center', color:'#e25c7a', fontSize: 13, fontFamily:'Manrope,sans-serif' }}>Failed to load. Check Firebase setup.</div>
        )}

        {/* Empty state */}
        {status === 'ok' && rows.length === 0 && (
          <div style={{ padding: '80px 32px', textAlign:'center', color:'#666', fontSize: 14, fontFamily:'Manrope,sans-serif', lineHeight: '22px' }}>
            {tab === 'creators' ? (
              <>No creators yet.<br/>
              <Link to="/create" style={{ color: GOLD, textDecoration:'none', fontWeight: 600, marginTop: 8, display: 'inline-block' }}>
                Be the first to publish →
              </Link></>
            ) : (
              <>No students yet.<br/>
              <Link to="/activities" style={{ color: GOLD, textDecoration:'none', fontWeight: 600, marginTop: 8, display: 'inline-block' }}>
                Explore an activity →
              </Link></>
            )}
          </div>
        )}

        {/* Podium */}
        {status === 'ok' && rows.length > 0 && (
          <Podium rows={rows} isCreator={isCreator} selfUid={selfUid} />
        )}

        {/* Your standing tagline */}
        {status === 'ok' && rows.length > 0 && (
          <div className="lb-anim-rise" style={{ animationDelay: '380ms', textAlign: 'center', margin: '0 auto 32px', maxWidth: 600 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 22px', background: 'rgba(255,255,255,.03)', border: `1px solid ${BORDER}`, borderRadius: 0, fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, color: '#9b8f7d', letterSpacing: '.06em' }}>
              {selfUid && selfRank ? (
                <>
                  You're ranked <strong style={{ color: GOLD, fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: '.06em', margin: '0 4px' }}>#{selfRank}</strong>
                  {' '}out of <strong style={{ color: '#d7e4f1' }}>{rows.length}</strong> {isCreator ? 'creators' : 'students'}
                </>
              ) : selfUid ? (
                <>You're not on the {isCreator ? 'creators' : 'students'} board yet — keep going.</>
              ) : (
                <>Sign in to see your rank among <strong style={{ color: '#d7e4f1' }}>{rows.length}</strong> {isCreator ? 'creators' : 'students'}.</>
              )}
            </div>
          </div>
        )}

        {/* Table for ranks 4+ */}
        {status === 'ok' && rows.length > 3 && (
          <section className="lb-board lb-anim-rise" style={{ animationDelay: '440ms' }}>
            {/* Column header */}
            <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 200px 140px', alignItems:'center', padding:'18px 32px 14px', borderBottom:`1px solid rgba(200,155,60,.10)`, fontFamily:'Space Grotesk,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'.22em', textTransform:'uppercase', color:'#9b8f7d' }}>
              <div>Rank</div>
              <div>Name</div>
              <div>{isCreator ? 'Stars · Views' : 'Level'}</div>
              <div style={{ textAlign:'right' }}>XP</div>
            </div>

            {rows.slice(3).map((row, i) => {
              const rank = i + 4;
              const rowUid = isCreator ? row.authorUid : row.uid;
              return (
                <TableRow
                  key={rowUid}
                  rank={rank}
                  row={row}
                  isCreator={isCreator}
                  isSelf={!!selfUid && rowUid === selfUid}
                  animDelay={500 + i * 60}
                />
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
