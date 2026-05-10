import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit as fbLimit, getDocs } from 'firebase/firestore';
import { listActivities } from '@/lib/activities';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import AuthButton from '@/components/wizmath/AuthButton';

const BG = 'rgb(43,42,42)';
const BG2 = 'rgb(35,34,34)';
const BG3 = 'rgb(28,27,27)';
const BORDER = 'rgba(180,160,100,.22)';
const GOLD = '#f0bf5c';
const TEAL = '#43e2d2';

export default function Leaderboard() {
  const [activities, setActivities] = useState(/** @type {any[]} */ ([]));
  const [students, setStudents] = useState(/** @type {any[]} */ ([]));
  const [status, setStatus] = useState('loading');
  const [tab, setTab] = useState(/** @type {'creators' | 'students'} */ ('creators'));

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listActivities(200).catch((err) => { console.warn('listActivities failed:', err); return []; }),
      // Top students from leaderboard collection (synced via awardXp)
      (async () => {
        if (!isFirebaseConfigured() || !db) return [];
        try {
          const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), fbLimit(10));
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

  // Top Creators: aggregate XP from their activities
  // XP rule: stars × 10 + views × 5
  const creators = useMemo(() => {
    const map = new Map();
    for (const a of activities) {
      if (!a.authorUid) continue;
      const existing = map.get(a.authorUid) || {
        authorUid: a.authorUid,
        authorName: a.authorName || 'Explorer',
        authorPhotoURL: a.authorPhotoURL || null,
        totalStars: 0,
        totalViews: 0,
        totalXp: 0,
        activityCount: 0,
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
    return Array.from(map.values()).sort((a, b) => b.totalXp - a.totalXp).slice(0, 10);
  }, [activities]);

  const rows = tab === 'creators' ? creators : students;

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#d7e4f1', fontFamily: 'Manrope,sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .lb-wrap::before {
          content:""; position: fixed; inset: 0;
          background:
            radial-gradient(1200px 600px at 50% -10%, rgba(67,226,210,.05), transparent 60%),
            radial-gradient(900px 600px at 50% 110%, rgba(240,191,92,.04), transparent 60%);
          pointer-events:none; z-index: 0;
        }
        .lb-brand-mark { width:34px; height:34px; position:relative; background:conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c); clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); box-shadow:0 0 16px rgba(240,191,92,.25); }
        .lb-brand-mark::after { content:''; position:absolute; inset:4px; background:${BG}; clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .lb-brand-mark::before { content:''; position:absolute; inset:0; z-index:1; background:radial-gradient(circle at 50% 50%,#43e2d2 0 20%,transparent 22%); filter:drop-shadow(0 0 5px #43e2d2); }
        .lb-board {
          position: relative;
          background: linear-gradient(180deg, ${BG2}, ${BG3});
          border: 1px solid ${BORDER};
          padding: 8px 0 0;
          --c: 14px;
          clip-path: polygon(var(--c) 0,100% 0,100% calc(100% - var(--c)),calc(100% - var(--c)) 100%,0 100%,0 var(--c));
        }
        .lb-board::before {
          content:""; position:absolute; left:0; right:0; top:0; height:1px;
          background: linear-gradient(90deg, transparent, ${GOLD} 25%, #ffdea4 50%, ${GOLD} 75%, transparent);
        }
        .lb-row { transition: background .18s; }
        .lb-row:hover { background: rgba(240,191,92,.04); }
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
      `}</style>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', gap:20, padding:'16px 32px', borderBottom:`1px solid ${BORDER}`, background:BG2, position: 'relative', zIndex: 1 }}>
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

      <div className="lb-wrap" style={{ maxWidth: 1080, margin: '0 auto', padding: '60px 40px 80px', position: 'relative' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:12, fontWeight:700, letterSpacing:'.32em', textTransform:'uppercase', color: TEAL, marginBottom: 14 }}>
            — Hall of Honor —
          </div>
          <div className="lb-title-frame">
            <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:76, lineHeight:1, letterSpacing:'.06em', textTransform:'uppercase', color:'#d7e4f1', margin:0 }}>
              Leader<span style={{ color: GOLD }}>board</span>
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', maxWidth: 720, margin: '0 auto 26px', background: `linear-gradient(180deg, ${BG2}, ${BG3})`, border: `1px solid ${BORDER}`, borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position:'absolute', left:0, right:0, top:0, height:1, background: `linear-gradient(90deg, transparent, ${GOLD} 25%, #ffdea4 50%, ${GOLD} 75%, transparent)` }}/>
          {[
            { key: 'creators', label: 'Top Creators' },
            { key: 'students', label: 'Top Students' },
          ].map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  background: active ? 'linear-gradient(180deg, rgba(240,191,92,.12), rgba(200,155,60,.04))' : 'transparent',
                  border: 0, cursor: 'pointer', padding: '16px 20px',
                  fontFamily: 'Bebas Neue,sans-serif', fontSize: 20, letterSpacing: '.18em', textTransform: 'uppercase',
                  color: active ? GOLD : '#d2c5b1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  boxShadow: active ? `inset 0 -2px 0 ${GOLD}` : 'none',
                  transition: 'color .2s, background .2s',
                }}>
                <div className="lb-hex" style={{ width: 14, height: 14, background: active ? `linear-gradient(135deg, #ffdea4, #c89b3c)` : `linear-gradient(135deg, ${TEAL}, #005049)`, boxShadow: active ? '0 0 8px rgba(240,191,92,.6)' : 'none', opacity: active ? 1 : 0.6 }}/>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Board */}
        <section className="lb-board">
          {/* Column header */}
          <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 200px 140px', alignItems:'center', padding:'18px 32px 14px', borderBottom:`1px solid rgba(200,155,60,.10)`, fontFamily:'Space Grotesk,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'.22em', textTransform:'uppercase', color:'#9b8f7d' }}>
            <div>Rank</div>
            <div>Name</div>
            <div>{tab === 'creators' ? 'Stars · Views' : 'Level'}</div>
            <div style={{ textAlign:'right' }}>XP</div>
          </div>

          {/* Loading / empty / rows */}
          {status === 'loading' && (
            <div style={{ padding: '40px 32px', textAlign:'center', color:'#888', fontSize: 13, fontFamily:'Manrope,sans-serif' }}>Loading…</div>
          )}
          {status === 'error' && (
            <div style={{ padding: '40px 32px', textAlign:'center', color:'#e25c7a', fontSize: 13, fontFamily:'Manrope,sans-serif' }}>Failed to load. Check Firebase setup.</div>
          )}
          {status === 'ok' && rows.length === 0 && (
            <div style={{ padding: '60px 32px', textAlign:'center', color:'#666', fontSize: 14, fontFamily:'Manrope,sans-serif', lineHeight: '22px' }}>
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
          {status === 'ok' && rows.map((row, i) => {
            const rank = i + 1;
            const isTop = rank <= 3;

            // Normalize fields between creators and students
            const isCreator = tab === 'creators';
            const name = isCreator ? row.authorName : (row.displayName || 'Explorer');
            const photo = isCreator ? row.authorPhotoURL : row.photoURL;
            const xp = isCreator ? row.totalXp : (row.xp || 0);
            const initial = (name || '?')[0]?.toUpperCase() || '?';

            const crestColor = rank === 1 ? 'linear-gradient(180deg,#ffdea4,#c89b3c)'
              : rank === 2 ? 'linear-gradient(180deg,#c8d2db,#6b7682)'
              : rank === 3 ? 'linear-gradient(180deg,#c98a5d,#6b3f25)' : null;
            const crestShadow = rank === 1 ? '0 0 12px rgba(240,191,92,.4)'
              : rank === 2 ? '0 0 10px rgba(200,210,219,.3)'
              : rank === 3 ? '0 0 10px rgba(201,138,93,.35)' : 'none';

            return (
              <div key={isCreator ? row.authorUid : row.uid} className="lb-row" style={{ display:'grid', gridTemplateColumns:'80px 1fr 200px 140px', alignItems:'center', padding:'16px 32px', borderBottom:`1px solid rgba(200,155,60,.10)` }}>
                {/* Rank */}
                <div style={{ display:'flex', alignItems:'center', gap: 10, fontFamily:'Bebas Neue,sans-serif', fontSize: 30, letterSpacing:'.04em', color: isTop ? GOLD : '#9b8f7d' }}>
                  {String(rank).padStart(2, '0')}
                  {isTop && (
                    <span className="lb-hex" style={{ width: 26, height: 26, background: crestColor, boxShadow: crestShadow }}/>
                  )}
                </div>

                {/* Who */}
                <div style={{ display:'flex', alignItems:'center', gap: 16 }}>
                  {photo ? (
                    <img src={photo} alt={name} referrerPolicy="no-referrer" className="lb-hex" style={{ width: 44, height: 44, objectFit: 'cover', border: `1px solid ${BORDER}` }}/>
                  ) : (
                    <div className="lb-hex" style={{ width: 44, height: 44, background: `linear-gradient(135deg, ${BG3}, ${BG2})`, border: `1px solid ${BORDER}`, fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, color: GOLD }}>{initial}</div>
                  )}
                  <div>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize: 22, letterSpacing:'.08em', textTransform:'uppercase', color:'#d7e4f1' }}>{name}</div>
                    <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 600, letterSpacing:'.16em', color:'#9b8f7d', marginTop: 2 }}>
                      {isCreator
                        ? `${row.activityCount} ${row.activityCount === 1 ? 'activity' : 'activities'}`
                        : `Level ${(typeof row.level === 'number' ? row.level : Math.floor((row.xp || 0) / 100))}`}
                    </div>
                  </div>
                </div>

                {/* Middle col: stars · views OR level */}
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600, letterSpacing:'.12em', textTransform:'uppercase', color:'#d2c5b1' }}>
                  {isCreator ? (
                    <>
                      <span style={{ color: GOLD }}>{row.totalStars}</span> {row.totalStars === 1 ? 'star' : 'stars'}
                      <span style={{ color: '#555', margin: '0 8px' }}>·</span>
                      <span style={{ color: TEAL }}>{row.totalViews}</span> {row.totalViews === 1 ? 'view' : 'views'}
                    </>
                  ) : (
                    <>Lv. <span style={{ color: TEAL }}>{(typeof row.level === 'number' ? row.level : Math.floor((row.xp || 0) / 100))}</span></>
                  )}
                </div>

                {/* Score: XP */}
                <div style={{ textAlign:'right', fontFamily:'Bebas Neue,sans-serif', fontSize: 28, letterSpacing:'.04em', color: GOLD }}>
                  {xp.toLocaleString()}
                  <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing:'.22em', color:'#9b8f7d', marginLeft: 6 }}>
                    XP
                  </span>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
