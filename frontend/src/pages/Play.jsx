import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getActivity } from '@/lib/activities';
import { useAuth } from '@/lib/AuthContext';
import { awardXp } from '@/lib/userProfile';

const BG = 'rgb(43,42,42)';
const BG2 = 'rgb(35,34,34)';
const BG3 = 'rgb(28,27,27)';
const BORDER = 'rgba(180,160,100,.22)';
const GOLD = '#f0bf5c';
const TEAL = '#43e2d2';
const RED = '#e25c7a';
const GREEN = '#5fc28a';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// ─── GeoGebra panel (interactive, classic+AG perspective) ───────────────────
function PlayGeoGebra({ commands, settings }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const initialized = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (initialized.current) return;
    const init = () => {
      if (!window.GGBApplet || !containerRef.current || initialized.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width < 100 || rect.height < 100) {
        requestAnimationFrame(init);
        return;
      }
      initialized.current = true;
      const params = {
        appName: 'classic',
        perspective: 'AG',
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        showResetIcon: true,
        showZoomButtons: true,
        showFullscreenButton: true,
        enableLabelDrags: true,
        enableShiftDragZoom: true,
        enableRightClick: false,
        showToolBarHelp: false,
        errorDialogsActive: false,
        useBrowserForJS: true,
        language: 'en',
        borderColor: 'transparent',
        appletOnLoad: (api) => {
          apiRef.current = api;
          try {
            const r = containerRef.current.getBoundingClientRect();
            const aspect = r.width / r.height;
            const yHalf = 5;
            const xHalf = yHalf * aspect;
            api.setCoordSystem(-xHalf, xHalf, -yHalf, yHalf);
          } catch {}
          setIsReady(true);
        },
      };
      const applet = new window.GGBApplet(params, '5.0');
      containerRef.current.innerHTML = '';
      applet.inject(containerRef.current);
    };
    if (window.GGBApplet) {
      init();
    } else {
      let script = document.getElementById('ggb-script');
      if (!script) {
        script = document.createElement('script');
        script.id = 'ggb-script';
        script.src = 'https://www.geogebra.org/apps/deployggb.js';
        script.onload = init;
        document.head.appendChild(script);
      } else {
        script.addEventListener('load', init);
      }
    }
  }, []);

  // Apply commands when applet ready
  useEffect(() => {
    if (!isReady || !apiRef.current) return;
    const api = apiRef.current;
    if (!Array.isArray(commands) || commands.length === 0) return;
    try { api.reset(); } catch {}
    if (Array.isArray(settings?.coordSystem) && settings.coordSystem.length === 4) {
      const [xMin, xMax, yMin, yMax] = settings.coordSystem;
      try { api.setCoordSystem(xMin, xMax, yMin, yMax); } catch {}
    }
    if (typeof settings?.showAxes === 'boolean') {
      try { api.setAxesVisible(settings.showAxes, settings.showAxes); } catch {}
    }
    if (typeof settings?.showGrid === 'boolean') {
      try { api.setGridVisible(settings.showGrid); } catch {}
    }
    for (const cmd of commands) {
      try { api.evalCommand(cmd); } catch (e) { console.warn('cmd failed', cmd, e); }
    }
  }, [commands, settings, isReady]);

  // Resize
  useEffect(() => {
    if (!isReady || !containerRef.current) return;
    const el = containerRef.current;
    let rafId = null;
    const syncSize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const api = apiRef.current;
        if (!api || typeof api.setSize !== 'function' || !el) return;
        api.setSize(Math.max(el.offsetWidth, 200), Math.max(el.offsetHeight, 200));
      });
    };
    const observer = new ResizeObserver(syncSize);
    observer.observe(el);
    window.addEventListener('resize', syncSize);
    syncSize();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncSize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isReady]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: BG3, overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {!isReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, letterSpacing: '.1em', pointerEvents: 'none' }}>
          Loading GeoGebra…
        </div>
      )}
    </div>
  );
}

// ─── Loading screen while Gemini cooks ───────────────────────────────────────
function LoadingScreen({ activity }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 24 }}>
      <style>{`
        @keyframes lb-pulse { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(67,226,210,.55)); } 50% { transform: scale(1.08); filter: drop-shadow(0 0 22px rgba(67,226,210,.95)); } }
        @keyframes lb-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .lb-hex { width: 70px; height: 70px; position: relative; background: conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c); clip-path: polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); animation: lb-pulse 2s ease-in-out infinite; }
        .lb-hex::after { content:''; position:absolute; inset:7px; background:${BG}; clip-path: polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .lb-hex::before { content:''; position:absolute; inset:0; z-index:1; background:radial-gradient(circle at 50% 50%,${TEAL} 0 22%,transparent 24%); }
        .lb-orbit { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: ${GOLD}; box-shadow: 0 0 8px ${GOLD}; }
        .lb-dot { display: inline-block; width: 6px; height: 6px; margin: 0 3px; background: ${TEAL}; border-radius: 50%; animation: lb-bounce 1s infinite; }
        @keyframes lb-bounce { 0%,100% { transform: translateY(0); opacity: .4; } 50% { transform: translateY(-6px); opacity: 1; } }
        .lb-dot:nth-child(2) { animation-delay: .15s; }
        .lb-dot:nth-child(3) { animation-delay: .3s; }
      `}</style>
      <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, animation: 'lb-orbit 4s linear infinite' }}>
          <div className="lb-orbit" style={{ left: '50%', top: 0, marginLeft: -2 }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, animation: 'lb-orbit 6s linear infinite reverse' }}>
          <div className="lb-orbit" style={{ left: 0, top: '50%', marginTop: -2, background: TEAL, boxShadow: `0 0 8px ${TEAL}` }} />
        </div>
        <div className="lb-hex" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 26, letterSpacing: '.18em', color: '#d7e4f1' }}>
          Arcane is conjuring your quest
          <span className="lb-dot"/><span className="lb-dot"/><span className="lb-dot"/>
        </div>
        {activity?.title && (
          <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 13, color: '#888', marginTop: 14, letterSpacing: '.06em' }}>
            Generating questions about <span style={{ color: GOLD, fontStyle: 'italic' }}>{activity.title}</span>…
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Question panel ──────────────────────────────────────────────────────────
function QuestionPanel({ questions, onComplete, onBack, xpAwarded = 0 }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const isCorrect = revealed && selected === q.correctIndex;

  const handlePick = (i) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    if (i === q.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      setDone(true);
      onComplete?.({ score: score + (isCorrect ? 0 : 0), total: questions.length });
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const handleRetry = () => {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const tier = pct >= 80 ? 'mastered' : pct >= 50 ? 'great' : 'keep going';
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '.32em', textTransform: 'uppercase', color: TEAL }}>
          Quest Complete
        </div>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 96, lineHeight: 1, letterSpacing: '.04em', color: GOLD, textShadow: `0 0 24px ${GOLD}33` }}>
          {score} / {questions.length}
        </div>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 22, letterSpacing: '.18em', color: '#d7e4f1', textTransform: 'uppercase' }}>
          {tier}
        </div>
        {xpAwarded > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(67,226,210,.08)', border: `1px solid rgba(67,226,210,.35)`, borderRadius: 7, color: TEAL, fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '.12em' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z"/></svg>
            +{xpAwarded} XP EARNED
          </div>
        )}
        <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 14, color: '#888', maxWidth: 400, lineHeight: '22px', marginTop: 6 }}>
          {pct >= 80 ? 'You really get this concept. Try another activity to keep building your spellbook.' : pct >= 50 ? "Solid effort. Re-explore the activity, then try the questions again." : "Take your time with the activity, then come back. The sliders teach more than the questions do."}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={handleRetry} style={btnSecondary}>Try Again</button>
          <button onClick={onBack} style={btnPrimary}>Back to Activity</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 28px 24px 28px', overflow: 'hidden' }}>
      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#888' }}>
          Question <span style={{ color: GOLD }}>{index + 1}</span> / {questions.length}
        </span>
        <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: TEAL }}>
          {score} ⭐ correct
        </span>
      </div>
      <div style={{ height: 4, background: BG3, borderRadius: 2, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${GOLD}, ${TEAL})`, transition: 'width .3s' }}/>
      </div>

      {/* Question */}
      <div style={{ flex: 1, overflow: 'auto', paddingRight: 4 }}>
        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, lineHeight: '30px', color: '#d7e4f1', margin: '0 0 22px', fontWeight: 600 }}>
          {q.question}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map((opt, i) => {
            const isPicked = selected === i;
            const isThisCorrect = revealed && i === q.correctIndex;
            const isThisWrong = revealed && isPicked && !isThisCorrect;
            const borderColor = isThisCorrect ? GREEN : isThisWrong ? RED : isPicked ? GOLD : BORDER;
            const bgColor = isThisCorrect ? 'rgba(95,194,138,.08)' : isThisWrong ? 'rgba(226,92,122,.08)' : isPicked ? 'rgba(240,191,92,.06)' : BG3;
            return (
              <button
                key={i}
                onClick={() => handlePick(i)}
                disabled={revealed}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  textAlign: 'left',
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 8,
                  color: '#d7e4f1',
                  padding: '12px 14px',
                  cursor: revealed ? 'default' : 'pointer',
                  fontFamily: 'Manrope,sans-serif',
                  fontSize: 14, lineHeight: '20px',
                  transition: 'background .15s, border-color .15s, transform .1s',
                }}
                onMouseEnter={(e) => { if (!revealed) e.currentTarget.style.borderColor = 'rgba(240,191,92,.5)'; }}
                onMouseLeave={(e) => { if (!revealed) e.currentTarget.style.borderColor = isPicked ? GOLD : BORDER; }}
              >
                <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, color: isThisCorrect ? GREEN : isThisWrong ? RED : '#888', flexShrink: 0, width: 18, textAlign: 'center' }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
                {isThisCorrect && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                )}
                {isThisWrong && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="3" style={{ flexShrink: 0 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                )}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div style={{ marginTop: 18, padding: '12px 14px', background: isCorrect ? 'rgba(95,194,138,.08)' : 'rgba(226,92,122,.06)', border: `1px solid ${isCorrect ? 'rgba(95,194,138,.3)' : 'rgba(226,92,122,.25)'}`, borderRadius: 7 }}>
            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: isCorrect ? GREEN : RED, marginBottom: 6 }}>
              {isCorrect ? 'Correct!' : 'Not quite'}
            </div>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 13, lineHeight: '20px', color: '#bbb' }}>
              {q.explanation || (isCorrect ? 'Great work.' : `The correct answer was ${String.fromCharCode(65 + q.correctIndex)}.`)}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={onBack} style={{ ...btnSecondary, flex: '0 0 auto' }}>← Activity</button>
        {revealed && (
          <button onClick={handleNext} style={{ ...btnPrimary, flex: 1 }}>
            {index + 1 >= questions.length ? 'See Results' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}

const btnPrimary = {
  background: 'linear-gradient(180deg,#f0bf5c,#c89b3c)',
  border: 0, borderRadius: 7, color: '#1a1a1a',
  padding: '11px 18px', cursor: 'pointer',
  fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
};

const btnSecondary = {
  background: 'transparent',
  border: `1px solid ${BORDER}`, borderRadius: 7, color: '#aaa',
  padding: '11px 18px', cursor: 'pointer',
  fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase',
};

// ─── Main page ──────────────────────────────────────────────────────────────
export default function Play() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState('');
  const [xpAwarded, setXpAwarded] = useState(0);

  // Load activity
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getActivity(id)
      .then((data) => { if (!cancelled) setActivity(data); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load activity'); });
    return () => { cancelled = true; };
  }, [id]);

  // Generate questions once activity is loaded
  useEffect(() => {
    if (!activity) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/challenge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: activity.title,
            description: activity.description || '',
            commands: activity.commands || [],
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Backend ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) setQuestions(data.questions);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to generate questions');
      }
    })();
    return () => { cancelled = true; };
  }, [activity]);

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', height: '100vh', width: '100vw', fontFamily: 'Manrope,sans-serif', background: BG, color: '#d7e4f1', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .play-brand-mark { width:30px; height:30px; position:relative; background:conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c); clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .play-brand-mark::after { content:''; position:absolute; inset:4px; background:${BG2}; clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .play-brand-mark::before { content:''; position:absolute; inset:0; z-index:1; background:radial-gradient(circle at 50% 50%,#43e2d2 0 20%,transparent 22%); filter:drop-shadow(0 0 5px #43e2d2); }
      `}</style>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: `1px solid ${BORDER}`, background: BG2, gap: 16 }}>
        <Link to="/activities" title="Back to Activities" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div className="play-brand-mark"/>
          <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: '.18em', color: '#d7e4f1' }}>WIZMATH<span style={{ color: GOLD }}>.</span>DEV</span>
        </Link>
        <div style={{ width: 1, height: 22, background: BORDER }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 14, fontWeight: 600, color: '#d7e4f1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activity?.title || 'Loading…'}
          </div>
          <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, color: '#666', letterSpacing: '.16em', textTransform: 'uppercase' }}>Quest Mode</div>
        </div>
        <Link to={id ? `/activity/${id}` : '/activities'} style={{ textDecoration: 'none' }}>
          <button style={btnSecondary}>← Exit</button>
        </Link>
      </header>

      {/* Body: GeoGebra | Question */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0, overflow: 'hidden' }}>
        {/* Left: GeoGebra */}
        <div style={{ position: 'relative', borderRight: `1px solid ${BORDER}`, minWidth: 0, minHeight: 0 }}>
          {activity ? (
            <PlayGeoGebra commands={activity.commands || []} settings={activity.settings} />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, letterSpacing: '.1em' }}>
              Loading activity…
            </div>
          )}
        </div>

        {/* Right: Question panel */}
        <div style={{ background: BG2, minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
          {error ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 24, letterSpacing: '.16em', color: RED }}>Quest Failed</div>
              <div style={{ color: '#bbb', fontSize: 13, fontFamily: 'Manrope,sans-serif', maxWidth: 360, lineHeight: '20px' }}>{error}</div>
              <Link to={id ? `/activity/${id}` : '/activities'} style={{ textDecoration: 'none', marginTop: 8 }}>
                <button style={btnPrimary}>Back to Activity</button>
              </Link>
            </div>
          ) : !activity || !questions ? (
            <LoadingScreen activity={activity}/>
          ) : (
            <QuestionPanel
              questions={questions}
              onComplete={async ({ score }) => {
                // Award 5 XP per correct answer (only if signed in and not already awarded)
                if (user && score > 0 && xpAwarded === 0) {
                  const xp = score * 5;
                  setXpAwarded(xp);
                  try { await awardXp(user.uid, xp); } catch (e) { console.warn('awardXp failed:', e); }
                }
              }}
              onBack={() => navigate(`/activity/${id}`)}
              xpAwarded={xpAwarded}
            />
          )}
        </div>
      </div>
    </div>
  );
}
