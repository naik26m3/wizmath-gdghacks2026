import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { publishActivity, getActivity } from '@/lib/activities';

const BG = 'rgb(43,42,42)';
const BG2 = 'rgb(35,34,34)';
const BG3 = 'rgb(28,27,27)';
const BORDER = 'rgba(180,160,100,.22)';

const BACKEND_URL = 'http://localhost:3000';

// ─── GeoGebra Canvas ─────────────────────────────────────────────────────────
function GeoGebraCanvas({ onReady }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const initialized = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (initialized.current) return;

    const init = () => {
      if (!window.GGBApplet || !containerRef.current || initialized.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // If the layout isn't ready yet, retry next frame
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
        enableRightClick: true,
        showToolBarHelp: false,
        errorDialogsActive: false,
        useBrowserForJS: true,
        language: 'en',
        borderColor: 'transparent',
        appletOnLoad: (api) => {
          console.log('[GeoGebra] applet loaded');
          apiRef.current = api;
          // Set a 1:1 aspect-ratio default view based on container size
          try {
            const r = containerRef.current.getBoundingClientRect();
            const aspect = r.width / r.height;
            const yHalf = 5;
            const xHalf = yHalf * aspect;
            api.setCoordSystem(-xHalf, xHalf, -yHalf, yHalf);
          } catch (e) { console.warn(e); }
          setIsReady(true);
          onReady(api);
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
  }, [onReady]);

  // Resize the applet whenever the container or window resizes
  useEffect(() => {
    if (!isReady || !containerRef.current) return;
    const el = containerRef.current;

    let rafId = null;
    const syncSize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const api = apiRef.current;
        if (!api || typeof api.setSize !== 'function' || !el) return;
        const w = Math.max(el.offsetWidth, 200);
        const h = Math.max(el.offsetHeight, 200);
        api.setSize(w, h);
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

  const fitToView = () => {
    const api = apiRef.current;
    if (!api || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const aspect = r.width / r.height;
    const yHalf = 5;
    const xHalf = yHalf * aspect;
    try { api.setCoordSystem(-xHalf, xHalf, -yHalf, yHalf); } catch (e) { console.warn(e); }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: BG3, overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {isReady && (
        <button onClick={fitToView} title="Fit view (1:1 aspect)" style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(35,34,34,.85)', border: `1px solid ${BORDER}`, borderRadius: 6, color: '#d7e4f1', padding: '7px 12px', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', backdropFilter: 'blur(4px)', zIndex: 10 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(67,226,210,.5)'; e.currentTarget.style.color = '#43e2d2'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = '#d7e4f1'; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/></svg>
          Fit
        </button>
      )}
      {!isReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, letterSpacing: '.1em', pointerEvents: 'none' }}>
          Loading GeoGebra…
        </div>
      )}
    </div>
  );
}

// ─── AI Chat Panel ───────────────────────────────────────────────────────────
function AIChatPanel({ onCommands, getCurrentCommands, onCollapse }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! Describe what you want to graph.' }
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

    try {
      const liveCommands = getCurrentCommands();
      console.log('[Create] reading live state from GeoGebra:', liveCommands);
      const res = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, currentCommands: liveCommands }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Backend error ${res.status}`);
      }
      const data = await res.json();
      const cmds = Array.isArray(data.commands) ? data.commands : [];
      onCommands(cmds, data.settings || {});
      setMessages(prev => [...prev, { role: 'ai', text: `Applied ${cmds.length} command${cmds.length === 1 ? '' : 's'} to the canvas.`, commands: cmds }]);
    } catch (err) {
      console.error('Failed to call backend:', err);
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message}. Make sure the backend is running on ${BACKEND_URL}.`, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside style={{ background: BG2, borderLeft: `1px solid ${BORDER}`, display: 'grid', gridTemplateRows: 'auto 1fr auto', overflow: 'hidden', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#43e2d2', boxShadow: '0 0 6px #43e2d2' }}/>
        <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 14, letterSpacing: '.18em', color: '#d7e4f1' }}>
          AI <span style={{ color: '#43e2d2' }}>Arcane</span>
        </span>
        <span style={{ marginLeft: 4, fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: '.1em' }}>GEOGEBRA</span>
        <button onClick={onCollapse} style={{ marginLeft: 'auto', background: 'transparent', border: 0, cursor: 'pointer', color: '#555', fontSize: 16, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ maxWidth: '95%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ fontSize: 10, fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 4, color: msg.role === 'user' ? '#f0bf5c' : (msg.error ? '#e25c7a' : '#43e2d2') }}>
              {msg.role === 'user' ? 'You' : 'Arcane'}
            </div>
            <div style={{ padding: '9px 12px', background: msg.role === 'user' ? 'rgba(240,191,92,.08)' : (msg.error ? 'rgba(226,92,122,.06)' : 'rgba(67,226,210,.06)'), border: `1px solid ${msg.role === 'user' ? 'rgba(200,155,60,.2)' : (msg.error ? 'rgba(226,92,122,.25)' : 'rgba(67,226,210,.15)')}`, borderRadius: 8, fontSize: 13, lineHeight: '20px', color: '#d7e4f1', fontFamily: 'Manrope,sans-serif' }}>
              {msg.text}
              {msg.commands?.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3, fontFamily: 'monospace', fontSize: 10, color: '#888', borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 8 }}>
                  {msg.commands.slice(0, 4).map((c, j) => (
                    <div key={j} style={{ wordBreak: 'break-all' }}>{c}</div>
                  ))}
                  {msg.commands.length > 4 && <div style={{ color: '#555' }}>…{msg.commands.length - 4} more</div>}
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
            Arcane is conjuring…
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

// ─── Publish Modal ───────────────────────────────────────────────────────────
function PublishModal({ onClose, onPublish, isPublishing }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setError('');
    try {
      await onPublish({ title: title.trim(), description: description.trim() });
    } catch (e) {
      setError(e.message || 'Failed to publish.');
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(6px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 28, width: 'min(440px, 90vw)', boxShadow: '0 30px 60px rgba(0,0,0,.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f0bf5c', boxShadow: '0 0 6px #f0bf5c' }}/>
          <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: '.18em', color: '#d7e4f1' }}>
            PUBLISH <span style={{ color: '#f0bf5c' }}>ACTIVITY</span>
          </span>
        </div>
        <p style={{ color: '#888', fontSize: 12, fontFamily: 'Manrope,sans-serif', margin: '0 0 18px', lineHeight: '18px' }}>
          Share your interactive on the Activities page so others can explore it.
        </p>

        <label style={{ display: 'block', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Title *</label>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="e.g. Movable circle with sliders"
          maxLength={80}
          style={{ width: '100%', background: BG3, border: `1px solid ${BORDER}`, borderRadius: 7, color: '#d7e4f1', padding: '10px 12px', fontFamily: 'Manrope,sans-serif', fontSize: 14, outline: 0, marginBottom: 16, boxSizing: 'border-box' }}
        />

        <label style={{ display: 'block', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What does this activity teach?"
          maxLength={300}
          rows={3}
          style={{ width: '100%', background: BG3, border: `1px solid ${BORDER}`, borderRadius: 7, color: '#d7e4f1', padding: '10px 12px', fontFamily: 'Manrope,sans-serif', fontSize: 13, outline: 0, marginBottom: 8, boxSizing: 'border-box', resize: 'vertical' }}
        />

        {error && (
          <div style={{ color: '#e25c7a', fontSize: 12, fontFamily: 'Manrope,sans-serif', margin: '8px 0' }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} disabled={isPublishing} style={{ flex: 1, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 7, color: '#aaa', padding: '10px', cursor: isPublishing ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', opacity: isPublishing ? 0.5 : 1 }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isPublishing} style={{ flex: 1, background: 'linear-gradient(180deg,#f0bf5c,#c89b3c)', border: 0, borderRadius: 7, color: '#1a1a1a', padding: '10px', cursor: isPublishing ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', opacity: isPublishing ? 0.7 : 1 }}>
            {isPublishing ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Create() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activityIdToLoad = searchParams.get('id');

  const [aiOpen, setAiOpen] = useState(true);
  const [commands, setCommands] = useState([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [loadStatus, setLoadStatus] = useState(activityIdToLoad ? 'loading' : 'idle');
  const apiRef = useRef(null);

  const handleReady = useCallback((api) => {
    apiRef.current = api;
  }, []);

  const handleApplyCommands = (cmds, settings) => {
    const api = apiRef.current;
    console.log('[Create] applying commands. apiReady:', !!api, 'cmds:', cmds, 'settings:', settings);
    if (!api) {
      console.error('[Create] GeoGebra API not ready yet — try again in a second.');
      return;
    }

    // Gemini returns the FULL updated command list each call, so we always
    // reset and re-apply to keep the canvas and our state in perfect sync.
    try { api.reset(); } catch (e) { console.warn('reset failed', e); }

    if (Array.isArray(settings?.coordSystem) && settings.coordSystem.length === 4) {
      const [xMin, xMax, yMin, yMax] = settings.coordSystem;
      try { api.setCoordSystem(xMin, xMax, yMin, yMax); } catch (e) { console.warn('setCoordSystem failed', e); }
    }
    if (typeof settings?.showAxes === 'boolean') {
      try { api.setAxesVisible(settings.showAxes, settings.showAxes); } catch (e) { console.warn('setAxesVisible failed', e); }
    }
    if (typeof settings?.showGrid === 'boolean') {
      try { api.setGridVisible(settings.showGrid); } catch (e) { console.warn('setGridVisible failed', e); }
    }

    const applied = [];
    for (const cmd of cmds) {
      try {
        const ok = api.evalCommand(cmd);
        console.log('[GeoGebra] evalCommand', JSON.stringify(cmd), '→', ok);
        if (ok !== false) applied.push(cmd);
      } catch (e) {
        console.warn('[GeoGebra] threw on:', cmd, e);
      }
    }

    setCommands(applied);
  };

  const handleClearCommands = () => {
    const api = apiRef.current;
    if (api) try { api.reset(); } catch {}
    setCommands([]);
  };

  // Load an existing activity from Firestore when /create?id=xxx
  useEffect(() => {
    if (!activityIdToLoad) return;
    let cancelled = false;
    const tryLoad = async () => {
      // Wait for the GeoGebra api to be ready
      if (!apiRef.current) {
        setTimeout(tryLoad, 200);
        return;
      }
      try {
        const activity = await getActivity(activityIdToLoad);
        if (cancelled) return;
        if (!activity) {
          setLoadStatus('not-found');
          return;
        }
        handleApplyCommands(activity.commands || [], activity.settings || {});
        setLoadStatus('loaded');
      } catch (err) {
        console.error('Failed to load activity:', err);
        if (!cancelled) setLoadStatus('error');
      }
    };
    tryLoad();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityIdToLoad]);

  const handlePublish = async ({ title, description }) => {
    setIsPublishing(true);
    try {
      const liveCmds = getLiveCommands();
      if (liveCmds.length === 0) {
        throw new Error('Canvas is empty — create something first.');
      }
      const { id } = await publishActivity({
        title,
        description,
        commands: liveCmds,
      });
      setShowPublishModal(false);
      navigate(`/activities?published=${id}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Read GeoGebra's actual live state (handles manual edits, deletes, etc.)
  const getLiveCommands = useCallback(() => {
    const api = apiRef.current;
    if (!api) return [];
    try {
      const names = api.getAllObjectNames();
      const cmds = [];
      for (const name of names) {
        let def = '';
        try { def = api.getDefinitionString(name) || ''; } catch {}
        if (!def.trim()) {
          try { def = api.getValueString(name) || ''; } catch {}
          if (def) { cmds.push(def); continue; }
        }
        // If the definition is an equation (contains "="), use ":" as separator
        if (def.includes('=')) {
          cmds.push(`${name}: ${def}`);
        } else {
          cmds.push(`${name} = ${def}`);
        }
      }
      return cmds;
    } catch (e) {
      console.warn('Failed to read live GeoGebra state:', e);
      return [];
    }
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', height: '100vh', width: '100vw', fontFamily: 'Manrope,sans-serif', background: BG, color: '#d7e4f1', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .wiz-brand-mark { width:30px; height:30px; position:relative; background:conic-gradient(from 30deg,#c89b3c,#f0bf5c 25%,#ffdea4 50%,#f0bf5c 75%,#c89b3c); clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .wiz-brand-mark::after { content:''; position:absolute; inset:4px; background:${BG2}; clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
        .wiz-brand-mark::before { content:''; position:absolute; inset:0; z-index:1; background:radial-gradient(circle at 50% 50%,#43e2d2 0 20%,transparent 22%); filter:drop-shadow(0 0 5px #43e2d2); }
      `}</style>

      {/* Header — click the logo to go back to Activities */}
      <header style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: `1px solid ${BORDER}`, background: BG2 }}>
        <Link to="/activities" title="Back to Activities" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'background .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,191,92,.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div className="wiz-brand-mark"/>
          <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: '.18em', color: '#d7e4f1' }}>WIZMATH<span style={{ color: '#f0bf5c' }}>.</span>DEV</span>
        </Link>

        {loadStatus === 'loading' && (
          <span style={{ marginLeft: 16, color: '#888', fontSize: 11, fontFamily: 'Space Grotesk,sans-serif', letterSpacing: '.12em', textTransform: 'uppercase' }}>Loading activity…</span>
        )}
        {loadStatus === 'not-found' && (
          <span style={{ marginLeft: 16, color: '#e25c7a', fontSize: 11, fontFamily: 'Space Grotesk,sans-serif', letterSpacing: '.12em', textTransform: 'uppercase' }}>Activity not found</span>
        )}

        <button onClick={() => setShowPublishModal(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(180deg,#f0bf5c,#c89b3c)', border: 0, borderRadius: 7, color: '#1a1a1a', padding: '8px 18px', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          Publish
        </button>
      </header>

      {showPublishModal && (
        <PublishModal
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublish}
          isPublishing={isPublishing}
        />
      )}

      {/* Body: GeoGebra | Chat */}
      <div style={{ display: 'grid', gridTemplateColumns: aiOpen ? '1fr 360px' : '1fr', minHeight: 0, overflow: 'hidden' }}>
        {/* GeoGebra Canvas (with its own native algebra panel built in) */}
        <div style={{ position: 'relative', minWidth: 0, minHeight: 0 }}>
          <GeoGebraCanvas onReady={handleReady}/>

          {/* Floating button to reopen chat when closed */}
          {!aiOpen && (
            <button onClick={() => setAiOpen(true)} style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(67,226,210,.08)', border: '1px solid rgba(67,226,210,.4)', borderRadius: 7, color: '#43e2d2', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '.12em', backdropFilter: 'blur(6px)', zIndex: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#43e2d2', boxShadow: '0 0 5px #43e2d2' }}/>
              Ask AI Arcane
            </button>
          )}
        </div>

        {/* AI Chat (right side) */}
        {aiOpen && (
          <AIChatPanel
            onCommands={handleApplyCommands}
            getCurrentCommands={getLiveCommands}
            onCollapse={() => setAiOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
