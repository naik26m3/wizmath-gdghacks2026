import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AskAISidebar from '@/components/wizmath/AskAISidebar';
import StarButton from '@/components/wizmath/StarButton';
import { getActivity, toggleStar, updateActivity, deleteActivity, recordActivityView } from '@/lib/activities';
import { useAuth } from '@/lib/AuthContext';
import { awardXp } from '@/lib/userProfile';

const BACKEND_URL_DESCRIBE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000') + '/api/describe';

// ─── Edit Activity Modal ─────────────────────────────────────────────────────
function EditActivityModal({ activity, onClose, onSave, isSaving }) {
  const [title, setTitle] = useState(activity?.title || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setError('');
    try {
      await onSave({ title: title.trim(), description: description.trim() });
    } catch (e) {
      setError(e.message || 'Failed to save.');
    }
  };

  const handleAutoGenerate = async () => {
    if (!title.trim()) {
      setError('Enter a title first.');
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const res = await fetch(BACKEND_URL_DESCRIBE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), commands: activity?.commands || [], userHint: description.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Backend ${res.status}`);
      }
      const data = await res.json();
      if (data.description) setDescription(data.description);
    } catch (e) {
      setError(`Auto-generate failed: ${e.message || 'try again'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(6px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'rgb(35,34,34)', border: '1px solid rgba(180,160,100,.22)', borderRadius: 12, padding: 28, width: 'min(440px, 90vw)', boxShadow: '0 30px 60px rgba(0,0,0,.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f0bf5c', boxShadow: '0 0 6px #f0bf5c' }}/>
          <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: '.18em', color: '#d7e4f1' }}>
            EDIT <span style={{ color: '#f0bf5c' }}>ACTIVITY</span>
          </span>
        </div>

        <label style={{ display: 'block', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Title *</label>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={80}
          style={{ width: '100%', background: 'rgb(28,27,27)', border: '1px solid rgba(180,160,100,.22)', borderRadius: 7, color: '#d7e4f1', padding: '10px 12px', fontFamily: 'Manrope,sans-serif', fontSize: 14, outline: 0, marginBottom: 16, boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#888' }}>Description</label>
          <button
            type="button"
            onClick={handleAutoGenerate}
            disabled={isGenerating || isSaving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: isGenerating ? 'rgba(67,226,210,.06)' : 'transparent',
              border: '1px solid rgba(67,226,210,.35)', borderRadius: 6, color: '#43e2d2',
              padding: '4px 10px', cursor: (isGenerating || isSaving) ? 'not-allowed' : 'pointer',
              fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
              opacity: (isGenerating || isSaving) ? 0.6 : 1,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z"/></svg>
            {isGenerating ? 'Generating…' : 'Auto-Generate'}
          </button>
        </div>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={300}
          rows={4}
          style={{ width: '100%', background: 'rgb(28,27,27)', border: '1px solid rgba(180,160,100,.22)', borderRadius: 7, color: '#d7e4f1', padding: '10px 12px', fontFamily: 'Manrope,sans-serif', fontSize: 13, outline: 0, marginBottom: 8, boxSizing: 'border-box', resize: 'vertical' }}
        />

        {error && (
          <div style={{ color: '#e25c7a', fontSize: 12, fontFamily: 'Manrope,sans-serif', margin: '8px 0' }}>⚠ {error}</div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} disabled={isSaving} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(180,160,100,.22)', borderRadius: 7, color: '#aaa', padding: '10px', cursor: isSaving ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', opacity: isSaving ? 0.5 : 1 }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSaving} style={{ flex: 1, background: 'linear-gradient(180deg,#f0bf5c,#c89b3c)', border: 0, borderRadius: 7, color: '#1a1a1a', padding: '10px', cursor: isSaving ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', opacity: isSaving ? 0.7 : 1 }}>
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ──────────────────────────────────────────────
function DeleteConfirmModal({ title, onCancel, onConfirm, isDeleting }) {
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(6px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'rgb(35,34,34)', border: '1px solid rgba(226,92,122,.4)', borderRadius: 12, padding: 28, width: 'min(420px, 90vw)', boxShadow: '0 30px 60px rgba(0,0,0,.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e25c7a', boxShadow: '0 0 6px #e25c7a' }}/>
          <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: '.18em', color: '#e25c7a' }}>
            DELETE ACTIVITY?
          </span>
        </div>
        <p style={{ color: '#d7e4f1', fontSize: 14, fontFamily: 'Manrope,sans-serif', margin: '0 0 8px', lineHeight: '22px' }}>
          You're about to delete <strong style={{ color: '#f0bf5c' }}>"{title}"</strong>. This action cannot be undone.
        </p>
        <p style={{ color: '#888', fontSize: 12, fontFamily: 'Manrope,sans-serif', margin: '0 0 22px', lineHeight: '18px' }}>
          The activity, its star count, and any references to it will be permanently removed.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} disabled={isDeleting} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(180,160,100,.22)', borderRadius: 7, color: '#aaa', padding: '10px', cursor: isDeleting ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', opacity: isDeleting ? 0.5 : 1 }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting} style={{ flex: 1, background: 'linear-gradient(180deg,#e25c7a,#a83456)', border: 0, borderRadius: 7, color: '#fff', padding: '10px', cursor: isDeleting ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', opacity: isDeleting ? 0.7 : 1 }}>
            {isDeleting ? 'Deleting…' : 'Delete Forever'}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, openSignInModal } = useAuth();
  const navigate = useNavigate();
  const isAuthor = !!user && !!activity?.authorUid && activity.authorUid === user.uid;

  const handleSaveEdit = async ({ title, description }) => {
    if (!activity?.id) return;
    setIsSaving(true);
    try {
      await updateActivity(activity.id, { title, description });
      setActivity((a) => ({ ...a, title, description }));
      setShowEditModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activity?.id) return;
    setIsDeleting(true);
    try {
      await deleteActivity(activity.id);
      navigate('/activities', { replace: true });
    } catch (e) {
      console.error('Delete failed:', e);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getActivity(id)
      .then((data) => { if (!cancelled && data) setActivity(data); })
      .catch(() => { /* keep default */ });
    return () => { cancelled = true; };
  }, [id]);

  // Record view + award 1 XP to student on first view (skip if user is the author)
  useEffect(() => {
    if (!id || !user || !activity?.id) return;
    if (activity.authorUid && activity.authorUid === user.uid) return;
    if ((activity.viewedBy || []).includes(user.uid)) return; // already counted
    let cancelled = false;
    (async () => {
      try {
        const { firstView } = await recordActivityView(id, user.uid);
        if (cancelled) return;
        if (firstView) {
          // Optimistically bump the view count in local state
          setActivity((a) => ({
            ...a,
            views: (a.views || 0) + 1,
            viewedBy: [...(a.viewedBy || []), user.uid],
          }));
          try { await awardXp(user.uid, 1); } catch (e) { console.warn('awardXp failed:', e); }
        }
      } catch (e) {
        console.warn('recordActivityView failed:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [id, user, activity?.id, activity?.authorUid]);

  const handleToggleStar = async () => {
    if (!user) {
      openSignInModal();
      return;
    }
    if (!activity?.id) return; // mock activity, no Firestore doc
    const wasStarred = (activity.starredBy || []).includes(user.uid);
    const prev = activity;
    setActivity((a) => ({
      ...a,
      starredBy: wasStarred ? (a.starredBy || []).filter((u) => u !== user.uid) : [...(a.starredBy || []), user.uid],
      stars: Math.max(0, (a.stars || 0) + (wasStarred ? -1 : 1)),
    }));
    try {
      await toggleStar(activity.id, user.uid);
    } catch (err) {
      console.error('Star failed, rolling back:', err);
      setActivity(prev);
    }
  };

  const isStarred = !!user && (activity.starredBy || []).includes(user.uid);
  const starCount = activity.stars || 0;
  const viewCount = activity.views || 0;

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
          <Link to="/activities" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div className="wiz-brand-mark"/>
            <span className="wiz-font-bebas" style={{ fontSize: 18, letterSpacing: '.18em', color: '#d7e4f1' }}>WIZMATH<span style={{ color: '#f0bf5c' }}>.</span>DEV</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 12 }}>
            <Link to="/activities" style={{ textDecoration: 'none' }}><button className="nav-link" style={{ color: '#f0bf5c', borderBottomColor: 'rgba(240,191,92,.5)' }}>Activities</button></Link>
            <Link to="/create" style={{ textDecoration: 'none' }}><button className="nav-link">Create</button></Link>
            <Link to="/leaderboard" style={{ textDecoration: 'none' }}><button className="nav-link">Leaderboard</button></Link>
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
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 12 }}>
            <h1 className="wiz-font-bebas" style={{ fontSize: 56, lineHeight: 1, letterSpacing: '.06em', color: '#d7e4f1', margin: 0, flex: 1, minWidth: 0 }}>
              {activity.title}
            </h1>
            <div style={{ flexShrink: 0, paddingTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div title={`${viewCount} ${viewCount === 1 ? 'view' : 'views'}`}
                style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.12)', borderRadius:7, color:'#aaa', padding:'7px 12px', fontFamily:'Space Grotesk,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'.04em' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {viewCount}
              </div>
              <Link to={`/activity/${id}/play`} style={{ textDecoration: 'none' }}>
                <button title="Test your understanding"
                  style={{ display:'inline-flex', alignItems:'center', gap:8, background: 'linear-gradient(180deg,#43e2d2,#005049)', border: 0, borderRadius: 7, color: '#002a26', padding:'8px 16px', cursor:'pointer', fontFamily:'Space Grotesk,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', boxShadow: '0 0 14px rgba(67,226,210,.25)', transition: 'transform .12s, filter .15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none'; }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Play
                </button>
              </Link>
              {isAuthor && (
                <>
                  <button onClick={() => setShowEditModal(true)} title="Edit title and description"
                    style={{ display:'inline-flex', alignItems:'center', gap:6, background:'transparent', border:'1px solid rgba(180,160,100,.35)', borderRadius:7, color:'#d2c5b1', padding:'7px 12px', cursor:'pointer', fontFamily:'Space Grotesk,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', transition:'border-color .15s, color .15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor='rgba(240,191,92,.6)'; e.currentTarget.style.color='#f0bf5c'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor='rgba(180,160,100,.35)'; e.currentTarget.style.color='#d2c5b1'; }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button onClick={() => setShowDeleteModal(true)} title="Delete this activity"
                    style={{ display:'inline-flex', alignItems:'center', gap:6, background:'transparent', border:'1px solid rgba(226,92,122,.35)', borderRadius:7, color:'#e25c7a', padding:'7px 12px', cursor:'pointer', fontFamily:'Space Grotesk,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', transition:'background .15s, border-color .15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background='rgba(226,92,122,.08)'; e.currentTarget.style.borderColor='rgba(226,92,122,.6)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(226,92,122,.35)'; }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                    Delete
                  </button>
                </>
              )}
              <StarButton isStarred={isStarred} count={starCount} onClick={handleToggleStar} />
            </div>
          </div>

          {showEditModal && (
            <EditActivityModal
              activity={activity}
              onClose={() => setShowEditModal(false)}
              onSave={handleSaveEdit}
              isSaving={isSaving}
            />
          )}
          {showDeleteModal && (
            <DeleteConfirmModal
              title={activity.title}
              onCancel={() => setShowDeleteModal(false)}
              onConfirm={handleDelete}
              isDeleting={isDeleting}
            />
          )}
          {activity.authorName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              {activity.authorPhotoURL ? (
                <img src={activity.authorPhotoURL} alt={activity.authorName} referrerPolicy="no-referrer" style={{ width: 26, height: 26, borderRadius: '50%', display: 'block', border: `1px solid ${BORDER}` }}/>
              ) : (
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#43e2d2,#005049)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#002a26', fontFamily: 'Bebas Neue,sans-serif' }}>
                  {activity.authorName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, color: '#888', letterSpacing: '.04em' }}>
                created by <span style={{ color: '#43e2d2', fontWeight: 500 }}>{activity.authorName}</span>
              </span>
            </div>
          )}

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
