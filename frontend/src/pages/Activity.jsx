import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import AskAISidebar from '@/components/wizmath/AskAISidebar';
import { getActivity } from '@/lib/activities';

const BG = 'rgb(43,42,42)';
const BG2 = 'rgb(35,34,34)';
const BG3 = 'rgb(28,27,27)';
const BORDER = 'rgba(180,160,100,.22)';

// Default activity shown when no real activity is loaded.
// Slope-explorer demo: rise / run / y-intercept sliders driving a line.
const DEFAULT_ACTIVITY = {
  title: 'Exploring Slope and y-Intercept',
  description: 'Adjust the slope and y-intercept to see how the line changes. Discover how rise and run affect direction and steepness.',
  commands: [
    'rise = Slider(-10, 10, 1, 1, 150, false, true, false, false)',
    'run = Slider(-10, 10, 1, 1, 150, false, true, false, false)',
    'b = Slider(-10, 10, 1, 1, 150, false, true, false, false)',
    'SetCaption(rise, "Rise")',
    'SetCaption(run, "Run")',
    'SetCaption(b, "y-intercept")',
    'f(x) = (rise / run) * x + b',
    'SetColor(f, "Orange")',
    'SetLineThickness(f, 3)',
    'P = (0, b)',
    'SetColor(P, "Green")',
    'SetPointSize(P, 6)',
  ],
  settings: {
    coordSystem: [-10, 10, -10, 10],
    showAxes: true,
    showGrid: true,
  },
};

// ─── GeoGebra Canvas (play mode) ─────────────────────────────────────────────
function GeoGebraView({ commands, settings }) {
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
        enableRightClick: true,
        showToolBarHelp: false,
        errorDialogsActive: false,
        useBrowserForJS: true,
        language: 'en',
        borderColor: 'transparent',
        appletOnLoad: (api) => {
          apiRef.current = api;
          // Set 1:1 aspect-ratio default view based on container size
          try {
            const r = containerRef.current.getBoundingClientRect();
            const aspect = r.width / r.height;
            const yHalf = 5;
            const xHalf = yHalf * aspect;
            api.setCoordSystem(-xHalf, xHalf, -yHalf, yHalf);
          } catch (e) { console.warn(e); }
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

  // Apply commands when applet is ready or commands change
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

  // Resize handling
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
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {!isReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, letterSpacing: '.1em', pointerEvents: 'none' }}>
          Loading GeoGebra…
        </div>
      )}
    </div>
  );
}

export default function Activity() {
  const { id } = useParams();
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [activity, setActivity] = useState(/** @type {any} */ (DEFAULT_ACTIVITY));

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getActivity(id)
      .then((data) => { if (!cancelled && data) setActivity(data); })
      .catch(() => { /* keep default */ });
    return () => { cancelled = true; };
  }, [id]);

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
        .nav-link { background:none;border:0;cursor:pointer;color:#aaa;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;padding:10px 14px;border-bottom:2px solid transparent;transition:color .2s; }
        .nav-link:hover { color:#d7e4f1; }
      `}</style>

      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', minWidth: 0, minHeight: 0 }}>
        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 28px', borderBottom: `1px solid ${BORDER}`, background: BG2, flexShrink: 0 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
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
          <h1 className="wiz-font-bebas" style={{ fontSize: 56, lineHeight: 1, letterSpacing: '.06em', color: '#d7e4f1', margin: '0 0 28px' }}>
            {activity.title}
          </h1>

          {/* Activity Panel — GeoGebra applet (graph + sliders) */}
          <section className="slope-panel">
            <div style={{ background: BG3, border: `1px solid ${BORDER}`, borderRadius: 8, height: 600, overflow: 'hidden' }}>
              <GeoGebraView commands={activity.commands} settings={activity.settings} />
            </div>
          </section>

          {/* Description (below graph) */}
          {activity.description && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, maxWidth: 900, marginTop: 24 }}>
              <div style={{ flexShrink: 0, width: 32, height: 32, background: 'linear-gradient(135deg,#43e2d2,#005049)', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, color: '#002a26', boxShadow: '0 0 12px rgba(67,226,210,.35)' }}>i</div>
              <p style={{ fontFamily: 'Manrope,sans-serif', fontSize: 15, lineHeight: '25px', color: '#bbb', paddingTop: 4, margin: 0 }}>
                {activity.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ask AI */}
      <AskAISidebar collapsed={aiCollapsed} onToggle={() => setAiCollapsed(!aiCollapsed)} activity={activity} />
    </div>
  );
}
