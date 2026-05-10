import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AskAISidebar from '@/components/wizmath/AskAISidebar';

const BG = 'rgb(43,42,42)';
const BG2 = 'rgb(35,34,34)';
const BG3 = 'rgb(28,27,27)';
const BORDER = 'rgba(180,160,100,.22)';

export default function Slope() {
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [rise, setRise] = useState(1);
  const [run, setRun] = useState(1);
  const [yInt, setYInt] = useState(0);

  const W = 600, H = 480;
  const cx = 300, cy = 240;
  const scale = 48;
  const slope = run !== 0 ? rise / run : 0;

  const lineX1 = 20, lineX2 = W - 20;
  const toSVG = (x, y) => ({ x: cx + x * scale, y: cy - y * scale });
  const lineY1 = slope * ((lineX1 - cx) / scale) + yInt;
  const lineY2 = slope * ((lineX2 - cx) / scale) + yInt;
  const p1 = toSVG((lineX1 - cx) / scale, lineY1);
  const p2 = toSVG((lineX2 - cx) / scale, lineY2);

  const rp  = toSVG(1, slope * 1 + yInt);
  const rp2 = toSVG(2, slope * 1 + yInt);
  const rp3 = toSVG(2, slope * 2 + yInt);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: aiCollapsed ? '1fr 44px' : '1fr 320px', height: '100vh', fontFamily: 'Manrope,sans-serif', background: BG, color: '#d7e4f1', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .wiz-font-bebas { font-family:'Bebas Neue',sans-serif; }
        .wiz-font-space { font-family:'Space Grotesk',sans-serif; }
        .slope-content::-webkit-scrollbar { width:6px; }
        .slope-content::-webkit-scrollbar-thumb { background:rgba(180,160,100,.2); border-radius:3px; }
        .slope-panel { position:relative; background:${BG2}; border:1px solid ${BORDER}; border-radius:10px; padding:28px 32px 40px; margin-bottom:28px; }
        .slope-panel::before { content:''; position:absolute; left:0; right:0; top:0; height:1px; background:linear-gradient(90deg,transparent,rgba(240,191,92,.5),transparent); border-radius:10px 10px 0 0; }
        .wiz-brand-mark { width:32px; height:32px; position:relative; background:conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c); clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .wiz-brand-mark::after { content:''; position:absolute; inset:4px; background:${BG}; clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .wiz-brand-mark::before { content:''; position:absolute; inset:0; z-index:1; background:radial-gradient(circle at 50% 50%,#43e2d2 0 20%,transparent 22%); filter:drop-shadow(0 0 5px #43e2d2); }
        .slope-range { appearance:none; -webkit-appearance:none; width:100%; height:6px; border-radius:3px; outline:none; cursor:pointer; background:transparent; }
        .slope-range::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; background:#d7e4f1; border-radius:5px; box-shadow:0 2px 6px rgba(0,0,0,.5); cursor:grab; }
        .slope-range::-webkit-slider-thumb:active { cursor:grabbing; transform:scale(1.15); }
        .slope-range::-moz-range-thumb { width:18px; height:18px; background:#d7e4f1; border-radius:5px; border:none; box-shadow:0 2px 6px rgba(0,0,0,.5); cursor:grab; }
        .nav-link { background:none;border:0;cursor:pointer;color:#aaa;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;padding:10px 14px;border-bottom:2px solid transparent;transition:color .2s; }
        .nav-link:hover { color:#d7e4f1; }
      `}</style>

      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', minWidth: 0, minHeight: 0 }}>
        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 28px', borderBottom: `1px solid ${BORDER}`, background: BG2, flexShrink: 0 }}>
          <Link to="/activities" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div className="wiz-brand-mark"/>
            <span className="wiz-font-bebas" style={{ fontSize: 18, letterSpacing: '.18em', color: '#d7e4f1' }}>WIZMATH<span style={{ color: '#f0bf5c' }}>.</span>DEV</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 12 }}>
            <Link to="/activities" style={{ textDecoration: 'none' }}><button className="nav-link" style={{ color: '#f0bf5c', borderBottomColor: 'rgba(240,191,92,.5)' }}>Activities</button></Link>
            <Link to="/create" style={{ textDecoration: 'none' }}><button className="nav-link">Create</button></Link>
          </div>
          <Link to="/activities" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 7, color: '#aaa', padding: '8px 14px', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', transition: 'border-color .2s, color .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(240,191,92,.45)'; e.currentTarget.style.color = '#d7e4f1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = '#aaa'; }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Back to Activities
            </button>
          </Link>
        </nav>

        {/* Content */}
        <div className="slope-content" style={{ overflowY: 'auto', padding: '48px 64px 80px' }}>
          <h1 className="wiz-font-bebas" style={{ fontSize: 56, lineHeight: 1, letterSpacing: '.06em', color: '#d7e4f1', margin: '0 0 18px' }}>
            Exploring Slope and <span style={{ color: '#f0bf5c' }}>y</span>-Intercept
          </h1>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24, maxWidth: 900 }}>
            <div style={{ flexShrink: 0, width: 32, height: 32, background: 'linear-gradient(135deg,#43e2d2,#005049)', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, color: '#002a26', boxShadow: '0 0 12px rgba(67,226,210,.35)' }}>i</div>
            <p style={{ fontFamily: 'Manrope,sans-serif', fontSize: 15, lineHeight: '25px', color: '#bbb', paddingTop: 4, margin: 0 }}>
              Adjust the slope and y-intercept to see how the line changes. Discover how rise and run affect direction and steepness.
            </p>
          </div>

          {/* Activity Panel */}
          <section className="slope-panel">
            <p style={{ fontFamily: 'Manrope,sans-serif', fontSize: 15, color: '#999', margin: '0 0 28px' }}>
              Use the sliders to explore the slope and the <em style={{ color: '#f0bf5c' }}>y</em>-intercept.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48, alignItems: 'stretch' }}>
              {/* Graph */}
              <div style={{ background: BG3, border: `1px solid ${BORDER}`, borderRadius: 8, minHeight: 420, overflow: 'hidden' }}>
                <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                  <defs>
                    <pattern id="slope-grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
                      <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="0.5"/>
                    </pattern>
                    <marker id="arr-line-s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="rgba(240,191,92,.6)"/></marker>
                    <marker id="arr-rev-s"  viewBox="0 0 10 10" refX="1" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M10,0 L0,5 L10,10 z" fill="rgba(240,191,92,.6)"/></marker>
                    <marker id="arr-rise-s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#e25c7a"/></marker>
                    <marker id="arr-run-s"  viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#43e2d2"/></marker>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#slope-grid)"/>
                  <line x1={cx} y1={20} x2={cx} y2={H-20} stroke="rgba(240,191,92,.35)" strokeWidth="1"/>
                  <line x1={20} y1={cy} x2={W-20} y2={cy} stroke="rgba(240,191,92,.35)" strokeWidth="1"/>
                  <polygon points={`${cx},12 ${cx-5},22 ${cx+5},22`} fill="rgba(240,191,92,.45)"/>
                  <polygon points={`${W-12},${cy} ${W-22},${cy-5} ${W-22},${cy+5}`} fill="rgba(240,191,92,.45)"/>
                  <text x={cx+14} y={22} fontFamily="Space Grotesk,sans-serif" fontSize="13" fill="#888" fontStyle="italic">y</text>
                  <text x={W-10} y={cy+16} fontFamily="Space Grotesk,sans-serif" fontSize="13" fill="#888" fontStyle="italic">x</text>
                  {[-5,-4,-3,-2,-1,1,2,3,4,5].map(n=>(
                    <text key={n} x={cx+n*scale} y={cy+16} fontFamily="Space Grotesk,sans-serif" fontSize="10" fill="rgba(200,190,160,.4)" textAnchor="middle">{n<0?`−${Math.abs(n)}`:n}</text>
                  ))}
                  {[-5,-4,-3,-2,-1,1,2,3,4,5].map(n=>(
                    <text key={n} x={cx-6} y={cy-n*scale+4} fontFamily="Space Grotesk,sans-serif" fontSize="10" fill="rgba(200,190,160,.4)" textAnchor="end">{n<0?`−${Math.abs(n)}`:n}</text>
                  ))}
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#f0bf5c" strokeWidth="2.2"
                    markerStart="url(#arr-rev-s)" markerEnd="url(#arr-line-s)"
                    style={{ filter: 'drop-shadow(0 0 5px rgba(240,191,92,.4))' }}/>
                  {run !== 0 && (
                    <>
                      <line x1={rp.x} y1={rp.y} x2={rp2.x} y2={rp.y} stroke="#43e2d2" strokeWidth="2.5" markerEnd="url(#arr-run-s)"/>
                      <line x1={rp2.x} y1={rp.y} x2={rp3.x} y2={rp3.y} stroke="#e25c7a" strokeWidth="2.5" markerEnd="url(#arr-rise-s)"/>
                    </>
                  )}
                  <circle cx={cx} cy={cy - yInt * scale} r={5} fill="#5fc28a" stroke={BG3} strokeWidth="2"/>
                </svg>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingTop: 8 }}>
                {/* Slope */}
                <div>
                  <h3 className="wiz-font-bebas" style={{ fontSize: 18, letterSpacing: '.18em', textTransform: 'uppercase', color: '#d7e4f1', margin: '0 0 14px' }}>Slope</h3>
                  {[
                    { label: 'Rise', color: '#e25c7a', val: rise, set: setRise },
                    { label: 'Run',  color: '#43e2d2', val: run,  set: setRun  },
                  ].map(({ label, color, val, set }) => (
                    <div key={label} style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, color }}>{label}</span>
                        <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 700, color, minWidth: 32, textAlign: 'right' }}>{val}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button onClick={() => set(v => Math.max(-10, v-1))} style={{ width: 28, height: 28, background: BG3, border: `1px solid ${BORDER}`, borderRadius: 6, color: '#aaa', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
                        <div style={{ position: 'relative', flex: 1, height: 6, background: BG3, borderRadius: 3 }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${((val+10)/20)*100}%`, background: `linear-gradient(90deg,${color}55,${color})`, borderRadius: 3, pointerEvents: 'none' }}/>
                          <input type="range" className="slope-range" min={-10} max={10} value={val} onChange={e => set(Number(e.target.value))}
                            style={{ position: 'absolute', inset: '-6px 0', width: '100%', height: 'calc(100% + 12px)' }}/>
                        </div>
                        <button onClick={() => set(v => Math.min(10, v+1))} style={{ width: 28, height: 28, background: BG3, border: `1px solid ${BORDER}`, borderRadius: 6, color: '#aaa', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 6, fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, color: '#777' }}>
                    Slope = <span style={{ color: '#f0bf5c', fontWeight: 600 }}>{run !== 0 ? (rise/run).toFixed(2) : '∞'}</span>
                    <span style={{ marginLeft: 14, fontStyle: 'italic', color: '#999' }}>y = {run !== 0 ? (rise/run).toFixed(2) : '∞'}x {yInt >= 0 ? '+' : ''}{yInt}</span>
                  </div>
                </div>

                {/* y-intercept */}
                <div>
                  <h3 className="wiz-font-bebas" style={{ fontSize: 18, letterSpacing: '.18em', textTransform: 'uppercase', color: '#5fc28a', margin: '0 0 14px' }}>
                    <em style={{ fontFamily: 'Space Grotesk,sans-serif', color: '#f0bf5c' }}>y</em>-intercept
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 700, color: '#5fc28a' }}>Value</span>
                    <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, color: '#5fc28a' }}>{yInt}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => setYInt(v => Math.max(-10, v-1))} style={{ width: 28, height: 28, background: BG3, border: `1px solid ${BORDER}`, borderRadius: 6, color: '#aaa', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
                    <div style={{ position: 'relative', flex: 1, height: 6, background: BG3, borderRadius: 3 }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${((yInt+10)/20)*100}%`, background: 'linear-gradient(90deg,#5fc28a55,#5fc28a)', borderRadius: 3, pointerEvents: 'none' }}/>
                      <input type="range" className="slope-range" min={-10} max={10} value={yInt} onChange={e => setYInt(Number(e.target.value))}
                        style={{ position: 'absolute', inset: '-6px 0', width: '100%', height: 'calc(100% + 12px)' }}/>
                    </div>
                    <button onClick={() => setYInt(v => Math.min(10, v+1))} style={{ width: 28, height: 28, background: BG3, border: `1px solid ${BORDER}`, borderRadius: 6, color: '#aaa', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, maxWidth: 900 }}>
            <div style={{ flexShrink: 0, width: 32, height: 32, background: 'linear-gradient(135deg,#43e2d2,#005049)', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, color: '#002a26' }}>i</div>
            <h2 className="wiz-font-bebas" style={{ fontSize: 28, letterSpacing: '.06em', textTransform: 'uppercase', color: '#d7e4f1', margin: 0 }}>Putting it all together</h2>
          </div>
        </div>
      </div>

      {/* Ask AI */}
      <AskAISidebar collapsed={aiCollapsed} onToggle={() => setAiCollapsed(!aiCollapsed)} />
    </div>
  );
}