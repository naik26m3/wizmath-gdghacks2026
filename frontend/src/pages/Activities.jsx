import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { listActivities, toggleStar } from '@/lib/activities';
import AuthButton from '@/components/wizmath/AuthButton';
import StarButton from '@/components/wizmath/StarButton';
import { useAuth } from '@/lib/AuthContext';

const BG = '#010A13';
const BG2 = '#111d26';
const BG3 = '#091428';
const BORDER = 'rgba(200,155,60,.25)';

const TAG_STYLES = {
  exp:   { background: 'rgba(67,226,210,.1)',  color: '#43e2d2', border: '1px solid rgba(67,226,210,.3)' },
  prac:  { background: 'rgba(226,92,122,.1)',  color: '#e25c7a', border: '1px solid rgba(226,92,122,.3)' },
  grade: { background: 'rgba(255,255,255,.05)', color: '#aaa',   border: '1px solid rgba(255,255,255,.1)' },
};

export default function Activities() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const justPublishedId = searchParams.get('published');

  const [published, setPublished] = useState(/** @type {any[]} */ ([]));
  const [pubStatus, setPubStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    listActivities()
      .then((rows) => {
        if (cancelled) return;
        setPublished(rows);
        setPubStatus('ok');
      })
      .catch((err) => {
        console.warn('Failed to load published activities:', err);
        if (cancelled) return;
        setPubStatus('error');
      });
    return () => { cancelled = true; };
  }, []);

  // Auto-dismiss the "just published" banner after 5s
  useEffect(() => {
    if (!justPublishedId) return;
    const t = setTimeout(() => {
      setSearchParams({}, { replace: true });
    }, 5000);
    return () => clearTimeout(t);
  }, [justPublishedId, setSearchParams]);

  const { user, openSignInModal } = useAuth();

  const handleToggleStar = async (activity) => {
    if (!user) {
      openSignInModal();
      return;
    }
    const wasStarred = (activity.starredBy || []).includes(user.uid);
    // Optimistic UI: update local state first
    setPublished((prev) => prev.map((a) => a.id === activity.id ? {
      ...a,
      starredBy: wasStarred ? (a.starredBy || []).filter((u) => u !== user.uid) : [...(a.starredBy || []), user.uid],
      stars: Math.max(0, (a.stars || 0) + (wasStarred ? -1 : 1)),
    } : a));
    try {
      await toggleStar(activity.id, user.uid);
    } catch (err) {
      console.error('Star failed, rolling back:', err);
      // Rollback
      setPublished((prev) => prev.map((a) => a.id === activity.id ? activity : a));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#d7e4f1', fontFamily: 'Manrope,sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .wiz-font-bebas { font-family:'Bebas Neue',sans-serif; }
        .wiz-font-space { font-family:'Space Grotesk',sans-serif; }
        .wiz-brand-mark { width:34px;height:34px;position:relative;background:conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);box-shadow:0 0 16px rgba(240,191,92,.25); }
        .wiz-brand-mark::after { content:'';position:absolute;inset:4px;background:${BG};clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .wiz-brand-mark::before { content:'';position:absolute;inset:0;z-index:1;background:radial-gradient(circle at 50% 50%,#43e2d2 0 20%,transparent 22%);filter:drop-shadow(0 0 5px #43e2d2); }
        .act-card { background:${BG2}; border:1px solid ${BORDER}; border-radius: 0; cursor:pointer; transition:transform .15s,border-color .2s,box-shadow .2s; overflow:hidden; }
        .act-card:hover { transform:translateY(-3px); border-color:rgba(240,191,92,.45); box-shadow:0 8px 32px rgba(0,0,0,.4),0 0 24px rgba(67,226,210,.06); }
        .act-thumb { width:100%; aspect-ratio:16/10; overflow:hidden; background:${BG3}; }
        .act-thumb svg { width:100%; height:100%; display:block; }
        .act-tag { display:inline-flex; align-items:center; padding:4px 10px; border-radius: 0; font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; }
        .nav-link { background:none;border:0;cursor:pointer;color:#aaa;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;padding:10px 14px;border-bottom:2px solid transparent;transition:color .2s,border-color .2s; }
        .nav-link:hover { color:#d7e4f1; }
        .nav-link.active { color:#f0bf5c; border-bottom-color:rgba(240,191,92,.5); }
      `}</style>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', gap:20, padding:'16px 32px', borderBottom:`1px solid ${BORDER}`, background:BG2 }}>
        <Link to="/activities" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
          <div className="wiz-brand-mark"/>
          <span className="wiz-font-bebas" style={{ fontSize:20, letterSpacing:'.18em', color:'#d7e4f1' }}>ARCANEMATH<span style={{ color:'#f0bf5c' }}>.</span>DEV</span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', marginLeft:16 }}>
          <button className="nav-link active">Activities</button>
          <Link to="/create" style={{ textDecoration:'none' }}><button className="nav-link">Create</button></Link>
          <Link to="/leaderboard" style={{ textDecoration:'none' }}><button className="nav-link">Leaderboard</button></Link>
        </div>
        <div style={{ flex:1, maxWidth:380, marginLeft:12, display:'flex', alignItems:'center', gap:10, padding:'9px 14px', background:BG3, border:`1px solid ${BORDER}`, borderRadius: 0}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="16" y1="16" x2="21" y2="21"/></svg>
          <input placeholder="Search activities…" style={{ flex:1, background:'transparent', border:0, outline:0, color:'#d7e4f1', fontFamily:'Manrope,sans-serif', fontSize:13 }}/>
        </div>
        <div style={{ marginLeft:'auto' }}>
          <AuthButton />
        </div>
      </nav>

      {/* Just-published banner */}
      {justPublishedId && (
        <div style={{ maxWidth:1240, margin:'24px auto 0', padding:'12px 20px', background:'rgba(67,226,210,.08)', border:`1px solid rgba(67,226,210,.3)`, borderRadius: 0, color:'#43e2d2', fontFamily:'Space Grotesk,sans-serif', fontSize:13, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:8, height:8, borderRadius: 0, background:'#43e2d2', boxShadow:'0 0 6px #43e2d2' }}/>
          Activity published! Scroll down to find it under <strong style={{ marginLeft:4 }}>Community Creations</strong>.
        </div>
      )}

      {/* Header */}
      <div className="wiz-rise" style={{ padding:'48px 40px 28px', maxWidth:1240, margin:'0 auto' }}>
        <h1 className="wiz-font-bebas" style={{ fontSize:48, letterSpacing:'.06em', color:'#d7e4f1', margin:'0 0 6px' }}>
          Math <span style={{ color:'#f0bf5c' }}>Activities</span>
        </h1>
      </div>

      {/* Community Creations (from Firestore) */}
      <div className="wiz-rise wiz-rise-d1" style={{ maxWidth:1240, margin:'24px auto 0', padding:'0 40px 12px', display:'flex', alignItems:'baseline', gap:14 }}>
        <h2 className="wiz-font-bebas" style={{ fontSize:28, letterSpacing:'.08em', color:'#d7e4f1', margin:0 }}>
          Community <span style={{ color:'#43e2d2' }}>Creations</span>
        </h2>
        <span style={{ color:'#666', fontSize:12, fontFamily:'Space Grotesk,sans-serif', letterSpacing:'.12em', textTransform:'uppercase' }}>
          {pubStatus === 'loading' ? 'Loading…' : pubStatus === 'error' ? 'Could not load (Firebase not configured?)' : `${published.length} published`}
        </span>
      </div>

      <div style={{ maxWidth:1240, margin:'0 auto', padding:'0 40px 80px', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
        {published.length === 0 && pubStatus === 'ok' && (
          <div style={{ gridColumn:'1 / -1', padding:'40px', textAlign:'center', color:'#555', fontFamily:'Manrope,sans-serif', fontSize:14, border:`1px dashed ${BORDER}`, borderRadius: 0}}>
            No community activities yet. <Link to="/create" style={{ color:'#f0bf5c', textDecoration:'none', fontWeight:600 }}>Create the first one →</Link>
          </div>
        )}
        {published.map((act, i) => (
          <article key={act.id} className="act-card wiz-rise" style={{ animationDelay: `${180 + i * 60}ms`, outline: act.id === justPublishedId ? '2px solid #43e2d2' : 'none', outlineOffset: -1 }} onClick={() => navigate(`/activity/${act.id}`)}>
            <div className="act-thumb" style={{ display:'flex', alignItems:'center', justifyContent:'center', background: act.thumbnail ? '#fff' : `linear-gradient(135deg, ${BG3}, ${BG2})` }}>
              {act.thumbnail ? (
                <img src={act.thumbnail} alt={act.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              ) : (
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:42, letterSpacing:'.08em', color:'rgba(67,226,210,.4)' }}>
                  {act.title?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div style={{ padding:'16px 18px 20px' }}>
              <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:8, marginBottom:12 }}>
                <span className="act-tag" style={TAG_STYLES.exp}>Community</span>
                <span className="act-tag" style={TAG_STYLES.grade}>{act.commands?.length || 0} cmds</span>
                <div style={{ marginLeft:'auto' }}>
                  <StarButton
                    isStarred={!!user && (act.starredBy || []).includes(user.uid)}
                    count={act.stars || 0}
                    onClick={() => handleToggleStar(act)}
                    size="sm"
                    stopPropagation
                  />
                </div>
              </div>
              <h3 style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:16, lineHeight:'24px', color:'#d7e4f1', margin:'0 0 6px' }}>{act.title}</h3>
              {act.description && (
                <p style={{ fontFamily:'Manrope,sans-serif', fontSize:13, color:'#888', margin:'0 0 10px', lineHeight:'18px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{act.description}</p>
              )}
              {act.authorName && (
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10, paddingTop:10, borderTop:`1px solid ${BORDER}` }}>
                  {act.authorPhotoURL ? (
                    <img src={act.authorPhotoURL} alt={act.authorName} referrerPolicy="no-referrer" style={{ width:20, height:20, borderRadius: 0, display:'block' }}/>
                  ) : (
                    <div style={{ width:20, height:20, borderRadius: 0, background:'linear-gradient(135deg,#43e2d2,#005049)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>
                      {act.authorName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:11, color:'#888', letterSpacing:'.04em' }}>
                    by <span style={{ color:'#d7e4f1', fontWeight:500 }}>{act.authorName}</span>
                  </span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}