import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const BG = 'rgb(43,42,42)';
const BG2 = 'rgb(35,34,34)';
const BG3 = 'rgb(28,27,27)';
const BORDER = 'rgba(180,160,100,.22)';
const LINE_COLORS = ['#f0bf5c', '#43e2d2', '#e25c7a', '#7c6fe0', '#5fc28a', '#e08b3a'];

// Safe math evaluator
function evalEquation(expr, x) {
  try {
    const safe = expr
      .replace(/\^/g, '**')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\blog\b/g, 'Math.log')
      .replace(/\bpi\b/gi, 'Math.PI')
      .replace(/\be\b/g, 'Math.E');
    // eslint-disable-next-line no-new-func
    return Function('x', `"use strict"; return (${safe})`)(x);
  } catch {
    return NaN;
  }
}

// ─── Graph Canvas ────────────────────────────────────────────────────────────
function GraphCanvas({ equations, zoom, pan, onZoomIn, onZoomOut, onPanChange }) {
  const svgRef = useRef(null);
  const dragging = useRef(null);
  const W = 800, H = 560;
  const cx = W / 2 + pan.x, cy = H / 2 + pan.y;
  const scale = 48 * zoom;
  const step = 2;

  const xMin = -cx / scale, xMax = (W - cx) / scale;
  const yMin = -(H - cy) / scale, yMax = cy / scale;
  const unitStep = zoom < 0.5 ? 2 : zoom > 2 ? 0.5 : 1;

  // Grid lines
  const gridLines = [];
  for (let gx = Math.ceil(xMin / unitStep) * unitStep; gx <= xMax + unitStep; gx += unitStep) {
    const sx = cx + gx * scale;
    gridLines.push(<line key={`gx${gx}`} x1={sx} y1={0} x2={sx} y2={H} stroke="rgba(255,255,255,.055)" strokeWidth="0.6"/>);
  }
  for (let gy = Math.ceil(yMin / unitStep) * unitStep; gy <= yMax + unitStep; gy += unitStep) {
    const sy = cy - gy * scale;
    gridLines.push(<line key={`gy${gy}`} x1={0} y1={sy} x2={W} y2={sy} stroke="rgba(255,255,255,.055)" strokeWidth="0.6"/>);
  }

  // Ticks
  const ticks = [];
  for (let gx = Math.ceil(xMin / unitStep) * unitStep; gx <= xMax; gx += unitStep) {
    if (Math.abs(gx) < 0.001) continue;
    const sx = cx + gx * scale;
    ticks.push(<text key={`tx${gx}`} x={sx} y={cy + 16} textAnchor="middle" fontFamily="Space Grotesk,sans-serif" fontSize="11" fill="rgba(200,190,160,.45)">{gx % 1 === 0 ? gx : gx.toFixed(1)}</text>);
  }
  for (let gy = Math.ceil(yMin / unitStep) * unitStep; gy <= yMax; gy += unitStep) {
    if (Math.abs(gy) < 0.001) continue;
    const sy = cy - gy * scale;
    ticks.push(<text key={`ty${gy}`} x={cx - 8} y={sy + 4} textAnchor="end" fontFamily="Space Grotesk,sans-serif" fontSize="11" fill="rgba(200,190,160,.45)">{gy % 1 === 0 ? gy : gy.toFixed(1)}</text>);
  }

  // Plots
  const plots = equations.filter(e => e.expr.trim()).map((eq, idx) => {
    const color = eq.color || LINE_COLORS[idx % LINE_COLORS.length];
    const points = [];
    for (let px = 0; px <= W; px += step) {
      const x = (px - cx) / scale;
      const y = evalEquation(eq.expr, x);
      if (isFinite(y) && Math.abs(y) < 1e6) {
        points.push({ px, sy: cy - y * scale });
      } else {
        if (points.length > 1) points.push(null);
      }
    }
    const segments = [];
    let cur = [];
    for (const p of points) {
      if (!p) { if (cur.length > 1) segments.push(cur); cur = []; }
      else cur.push(`${p.px},${p.sy}`);
    }
    if (cur.length > 1) segments.push(cur);
    return segments.map((seg, si) => (
      <polyline key={`${idx}-${si}`} points={seg.join(' ')} fill="none" stroke={color} strokeWidth="2.4"
        style={{ filter: `drop-shadow(0 0 5px ${color}99)` }} strokeLinecap="round" strokeLinejoin="round"/>
    ));
  });

  // Pan handlers
  const onMouseDown = (e) => {
    dragging.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.sx;
    const dy = e.clientY - dragging.current.sy;
    onPanChange({ x: dragging.current.px + dx, y: dragging.current.py + dy });
  };
  const onMouseUp = () => { dragging.current = null; };

  // Wheel zoom
  const onWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) onZoomIn(); else onZoomOut();
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: BG3, overflow: 'hidden', cursor: 'grab' }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', userSelect: 'none' }} onWheel={onWheel}>
        {gridLines}
        <line x1={cx} y1={0} x2={cx} y2={H} stroke="rgba(240,191,92,.35)" strokeWidth="1.2"/>
        <line x1={0} y1={cy} x2={W} y2={cy} stroke="rgba(240,191,92,.35)" strokeWidth="1.2"/>
        <polygon points={`${cx},4 ${cx-5},16 ${cx+5},16`} fill="rgba(240,191,92,.4)"/>
        <polygon points={`${W-4},${cy} ${W-16},${cy-5} ${W-16},${cy+5}`} fill="rgba(240,191,92,.4)"/>
        {ticks}
        {plots}
      </svg>
      {/* Zoom controls */}
      <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[{ label: '+', action: onZoomIn }, { label: '−', action: onZoomOut }].map(({ label, action }) => (
          <button key={label} onClick={action} style={{ width: 34, height: 34, background: BG2, border: `1px solid ${BORDER}`, borderRadius: 6, color: '#d7e4f1', cursor: 'pointer', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(240,191,92,.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
            {label}
          </button>
        ))}
        <button onClick={() => { onZoomIn('reset'); }} title="Reset view" style={{ width: 34, height: 34, background: BG2, border: `1px solid ${BORDER}`, borderRadius: 6, color: '#d7e4f1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(240,191,92,.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>
        </button>
      </div>
    </div>
  );
}

// ─── Equation List (Desmos-style) ─────────────────────────────────────────────
function EquationList({ equations, onChange }) {
  const addEq = () => {
    const color = LINE_COLORS[equations.length % LINE_COLORS.length];
    onChange([...equations, { id: Date.now(), expr: '', color, label: '' }]);
  };
  const updateEq = (id, patch) => onChange(equations.map(e => e.id === id ? { ...e, ...patch } : e));
  const removeEq = (id) => onChange(equations.filter(e => e.id !== id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {equations.map((eq, idx) => (
        <div key={eq.id} style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${BORDER}`, background: 'transparent', transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          {/* Color swatch / number */}
          <div style={{ width: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0', position: 'relative' }}>
            <input type="color" value={eq.color} onChange={e => updateEq(eq.id, { color: e.target.value })}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}/>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: eq.color, boxShadow: `0 0 8px ${eq.color}88`, border: '2px solid rgba(255,255,255,.15)', pointerEvents: 'none' }}/>
          </div>
          {/* Expression input */}
          <input
            value={eq.expr}
            onChange={e => updateEq(eq.id, { expr: e.target.value })}
            placeholder={`f(x) = …`}
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: '#d7e4f1', fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, padding: '12px 8px', minWidth: 0 }}
          />
          {/* Delete */}
          <button onClick={() => removeEq(eq.id)} style={{ width: 32, height: 32, marginRight: 6, background: 'transparent', border: 0, cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, transition: 'color .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e25c7a'}
            onMouseLeave={e => e.currentTarget.style.color = '#555'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      ))}
      <button onClick={addEq} style={{ margin: '10px 12px', background: 'rgba(240,191,92,.07)', border: `1px dashed rgba(240,191,92,.3)`, borderRadius: 7, color: '#f0bf5c', padding: '10px', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '.12em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,191,92,.12)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(240,191,92,.07)'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Add Expression
      </button>
    </div>
  );
}

// ─── AI Chat Panel ────────────────────────────────────────────────────────────
function AIChatPanel({ onAddEquations, onCollapse }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! Describe what you want to graph and I\'ll plot it for you. Try: "a sine wave", "parabola with vertex at (0,3)", or "two intersecting lines".' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Oracle, an AI math graphing assistant for WizMath (like Desmos but magical).
The user wants to graph: "${text}"

Return JSON with:
- "message": friendly 1-2 sentence explanation of what you're graphing
- "equations": array of objects, each with:
  - "expr": JS-evaluable expression using x (e.g. "x**2 - 3", "2*x+1", "Math.sin(x)*3")
  - "label": human-readable label like "y = x² - 3"
  - "color": a hex color that fits the WizMath dark palette (use from: #f0bf5c, #43e2d2, #e25c7a, #7c6fe0, #5fc28a, #e08b3a)`,
      response_json_schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          equations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                expr: { type: 'string' },
                label: { type: 'string' },
                color: { type: 'string' }
              }
            }
          }
        }
      }
    });
    const eqs = (result.equations || []).map(e => ({ ...e, id: Date.now() + Math.random() }));
    if (eqs.length > 0) onAddEquations(eqs);
    setMessages(prev => [...prev, { role: 'ai', text: result.message, equations: eqs }]);
    setLoading(false);
  };

  return (
    <aside style={{ background: BG2, borderLeft: `1px solid ${BORDER}`, display: 'grid', gridTemplateRows: 'auto 1fr auto', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#43e2d2', boxShadow: '0 0 6px #43e2d2' }}/>
        <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 14, letterSpacing: '.18em', color: '#d7e4f1' }}>
          AI <span style={{ color: '#43e2d2' }}>Oracle</span>
        </span>
        <span style={{ marginLeft: 4, fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: '.1em' }}>GRAPH GENERATOR</span>
        <button onClick={onCollapse} style={{ marginLeft: 'auto', background: 'transparent', border: 0, cursor: 'pointer', color: '#555', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <style>{`.ai-chat-scroll::-webkit-scrollbar{width:4px}.ai-chat-scroll::-webkit-scrollbar-thumb{background:rgba(200,155,60,.2);border-radius:2px}`}</style>
        {messages.map((msg, i) => (
          <div key={i} style={{ maxWidth: '95%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ fontSize: 10, fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 4, color: msg.role === 'user' ? '#f0bf5c' : '#43e2d2' }}>
              {msg.role === 'user' ? 'You' : 'Oracle'}
            </div>
            <div style={{ padding: '9px 12px', background: msg.role === 'user' ? 'rgba(240,191,92,.08)' : 'rgba(67,226,210,.06)', border: `1px solid ${msg.role === 'user' ? 'rgba(200,155,60,.2)' : 'rgba(67,226,210,.15)'}`, borderRadius: 8, fontSize: 13, lineHeight: '20px', color: '#d7e4f1', fontFamily: 'Manrope,sans-serif' }}>
              {msg.text}
              {msg.equations?.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {msg.equations.map((eq, j) => (
                    <span key={j} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${eq.color}15`, border: `1px solid ${eq.color}40`, borderRadius: 4, padding: '3px 8px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, color: eq.color, fontStyle: 'italic' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: eq.color, flexShrink: 0 }}/>
                      {eq.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, color: '#43e2d2', fontSize: 12, fontFamily: 'Manrope,sans-serif', opacity: 0.7 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#43e2d2', animation: `bounce 1s ${i*0.15}s infinite` }}/>
              ))}
            </div>
            Oracle is conjuring…
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Describe what to graph…"
          style={{ flex: 1, background: BG3, border: `1px solid ${BORDER}`, borderRadius: 7, color: '#d7e4f1', padding: '9px 12px', fontFamily: 'Manrope,sans-serif', fontSize: 13, outline: 0 }}
        />
        <button onClick={send} disabled={loading} style={{ width: 38, background: 'linear-gradient(180deg,#43e2d2,#005049)', border: 0, borderRadius: 7, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#002a26" strokeWidth="2.5"><path d="M4 12 L20 4 L14 20 L12 13 Z"/></svg>
        </button>
      </div>
    </aside>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Calculator() {
  const [equations, setEquations] = useState([
    { id: 1, expr: '', color: '#f0bf5c', label: '' }
  ]);
  const [aiOpen, setAiOpen] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleZoom = useCallback((action) => {
    if (action === 'reset') { setZoom(1); setPan({ x: 0, y: 0 }); return; }
    setZoom(z => action === 'in' || action === undefined ? Math.min(z * 1.35, 10) : Math.max(z / 1.35, 0.1));
  }, []);

  const handleAddEquations = (newEqs) => {
    setEquations(prev => {
      // Remove empty placeholders, add new ones
      const filled = prev.filter(e => e.expr.trim());
      return [...filled, ...newEqs];
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', height: '100vh', fontFamily: 'Manrope,sans-serif', background: BG, color: '#d7e4f1', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .wiz-rail-item { display:flex; flex-direction:column; align-items:center; gap:5px; padding:14px 4px; cursor:pointer; color:#aaa; font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; border-bottom:1px solid rgba(255,255,255,.05); transition:color .2s, background .2s; width:100%; }
        .wiz-rail-item:hover { color:#f0bf5c; background:rgba(240,191,92,.04); }
        .wiz-rail-item.active { color:#f0bf5c; background:rgba(240,191,92,.06); }
        .wiz-brand-mark { width:30px; height:30px; position:relative; background:conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c); clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .wiz-brand-mark::after { content:''; position:absolute; inset:4px; background:${BG}; clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .wiz-brand-mark::before { content:''; position:absolute; inset:0; z-index:1; background:radial-gradient(circle at 50% 50%,#43e2d2 0 20%,transparent 22%); filter:drop-shadow(0 0 5px #43e2d2); }
      `}</style>

      {/* Left Rail */}
      <aside style={{ background: BG2, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 0', textDecoration: 'none' }}>
          <div className="wiz-brand-mark"/>
        </Link>
        <div style={{ width: '100%', height: 1, background: BORDER, margin: '4px 0 8px' }}/>
        {[
          { label: 'Graph', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 18 C8 6, 16 18, 21 6"/></svg> },
        ].map((item, i) => (
          <div key={i} className="wiz-rail-item active">
            <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
            {item.label}
          </div>
        ))}
      </aside>

      {/* Main */}
      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', minHeight: 0, overflow: 'hidden' }}>
        {/* Top Bar */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 20px', borderBottom: `1px solid ${BORDER}`, background: BG2, flexShrink: 0 }}>
          <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 17, letterSpacing: '.18em', color: '#d7e4f1' }}>WIZMATH<span style={{ color: '#f0bf5c' }}>.</span>DEV</span>
          <span style={{ width: 1, height: 18, background: BORDER }}/>
          <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, color: '#666', letterSpacing: '.12em', textTransform: 'uppercase' }}>AI Graph Creator</span>
          <div style={{ flex: 1 }}/>
          {!aiOpen && (
            <button onClick={() => setAiOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(67,226,210,.08)', border: `1px solid rgba(67,226,210,.3)`, borderRadius: 7, color: '#43e2d2', padding: '7px 14px', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '.12em' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#43e2d2', boxShadow: '0 0 5px #43e2d2' }}/>
              Ask AI Oracle
            </button>
          )}
          <Link to="/activities" style={{ textDecoration: 'none' }}>
            <button style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, color: '#777', padding: '7px 14px', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase' }}>← Activities</button>
          </Link>
        </header>

        {/* Stage: Expressions | Graph | AI Chat */}
        <div style={{ display: 'grid', gridTemplateColumns: `260px 1fr${aiOpen ? ' 300px' : ''}`, height: '100%', overflow: 'hidden' }}>

          {/* Desmos-style Equation Panel */}
          <aside style={{ background: BG2, borderRight: `1px solid ${BORDER}`, display: 'grid', gridTemplateRows: 'auto 1fr', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#666' }}>Expressions</span>
              <button onClick={() => setEquations([])} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: '#444', fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' }}
                onMouseEnter={e => e.currentTarget.style.color = '#e25c7a'}
                onMouseLeave={e => e.currentTarget.style.color = '#444'}>Clear all</button>
            </div>
            <div style={{ overflowY: 'auto' }}>
              <EquationList equations={equations} onChange={setEquations} />
            </div>
          </aside>

          {/* Graph Canvas */}
          <div style={{ position: 'relative', minWidth: 0, minHeight: 0 }}>
            {equations.filter(e => e.expr.trim()).length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ textAlign: 'center', color: 'rgba(200,190,160,.25)', fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, letterSpacing: '.08em', lineHeight: '24px' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📐</div>
                  Type an expression on the left<br/>or ask the AI Oracle on the right
                </div>
              </div>
            )}
            <GraphCanvas
              equations={equations}
              zoom={zoom}
              pan={pan}
              onZoomIn={() => handleZoom('in')}
              onZoomOut={() => handleZoom('out')}
              onPanChange={setPan}
            />
          </div>

          {/* AI Oracle Panel — right side */}
          {aiOpen && (
            <AIChatPanel onAddEquations={handleAddEquations} onCollapse={() => setAiOpen(false)} />
          )}
        </div>
      </div>
    </div>
  );
}