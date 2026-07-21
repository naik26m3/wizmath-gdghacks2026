import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import AskAISidebar from '@/components/wizmath/AskAISidebar';
import StarButton from '@/components/wizmath/StarButton';
import AuthButton from '@/components/wizmath/AuthButton';
import ActivityMetaFields from '@/components/wizmath/ActivityMetaFields';
import {
  TopNav, Modal, ModalActions, ModalButton, ModalError, FieldLabel,
  chamferTLBR, color, microLabel,
} from '@/components/wizmath/hextech';
import { getActivity, toggleStar, updateActivity, deleteActivity, recordActivityView } from '@/lib/activities';
import { useAuth } from '@/lib/AuthContext';
import { awardXp } from '@/lib/userProfile';

const BACKEND_URL_DESCRIBE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000') + '/api/describe';

// ─── Edit Activity Modal ─────────────────────────────────────────────────────
function EditActivityModal({ activity, onClose, onSave, isSaving }) {
  const [title, setTitle] = useState(activity?.title || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [error, setError] = useState('');

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

  const autoGenerate = async (titleArg, hintArg) => {
    const res = await fetch(BACKEND_URL_DESCRIBE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: titleArg, commands: activity?.commands || [], userHint: hintArg }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Backend ${res.status}`);
    }
    const data = await res.json();
    return data.description || '';
  };

  return (
    <Modal
      onClose={onClose}
      label="Edit activity"
      glyph="edit"
      title="EDIT"
      titleAccent="ACTIVITY"
      subtitle="Update the title and description students see on this page."
    >
      <ActivityMetaFields
        title={title} onTitleChange={setTitle}
        description={description} onDescriptionChange={setDescription}
        onAutoGenerate={autoGenerate}
        onError={setError}
        onSubmitShortcut={handleSubmit}
        disabled={isSaving}
      />

      <ModalError>{error}</ModalError>

      <ModalActions>
        <ModalButton onClick={onClose} disabled={isSaving}>Cancel</ModalButton>
        <ModalButton variant="primary" flex={1.4} onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save Changes'}
        </ModalButton>
      </ModalActions>
    </Modal>
  );
}

// ─── Delete Confirmation Modal ──────────────────────────────────────────────
function DeleteConfirmModal({ title, onCancel, onConfirm, isDeleting }) {
  return (
    <Modal
      onClose={onCancel}
      label="Delete activity"
      glyph="danger"
      tone="danger"
      title="DELETE"
      titleAccent="ACTIVITY?"
      footnote="The activity, its star count, and any references to it will be permanently removed."
    >
      <p style={{ color: '#d7e4f1', fontSize: 14, margin: '0 0 4px', lineHeight: '22px', textAlign: 'center' }}>
        You're about to delete <strong style={{ color: '#f0bf5c' }}>"{title}"</strong>.
        <br/>This action cannot be undone.
      </p>

      <ModalActions>
        <ModalButton onClick={onCancel} disabled={isDeleting}>Cancel</ModalButton>
        <ModalButton variant="danger" flex={1.4} onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Deleting…' : 'Delete Forever'}
        </ModalButton>
      </ModalActions>
    </Modal>
  );
}

const BG = '#010A13';
const BG2 = '#111d26';
const BG3 = '#091428';
const BORDER = 'rgba(200,155,60,.25)';

// ─── Wager Modal ─────────────────────────────────────────────────────────────
// Asks the student how much XP to wager before starting Play.
// Min wager: 20 XP. Each correct answer = +wager XP, each wrong = −wager XP.
const MIN_WAGER = 20;
function WagerModal({ open, onClose, onConfirm, isSignedIn, currentXp, onSignIn }) {
  const safeXp = Math.max(0, Number.isFinite(currentXp) ? Math.floor(currentXp) : 0);
  const canWager = safeXp >= MIN_WAGER;
  const initial = canWager ? MIN_WAGER : 0;
  const [wager, setWager] = useState(initial);

  // Reset wager whenever modal reopens or balance changes
  useEffect(() => {
    if (!open) return;
    setWager(safeXp >= MIN_WAGER ? MIN_WAGER : 0);
  }, [open, safeXp]);

  if (!open) return null;

  const clampedWager = Math.max(MIN_WAGER, Math.min(safeXp, Math.floor(wager / 5) * 5));
  const stepDown = () => setWager((w) => Math.max(MIN_WAGER, w - 5));
  const stepUp = () => setWager((w) => Math.min(safeXp, w + 5));
  const setMax = () => setWager(Math.floor(safeXp / 5) * 5);

  const CHAMP_SM = chamferTLBR(8);
  const stepBtn = {
    width: 36, height: 36, background: 'rgba(6,12,20,.8)',
    border: '1px solid rgba(240,191,92,.2)', borderRadius: 0, color: '#f0bf5c',
    fontFamily: 'Bebas Neue,sans-serif', fontSize: 22, clipPath: CHAMP_SM,
  };

  return (
    <Modal
      onClose={onClose}
      label="Wager your XP"
      glyph="gem"
      title="WAGER YOUR"
      titleAccent="XP"
      subtitle={
        !isSignedIn ? 'Sign in to wager XP and earn rewards from your answers.' : undefined
      }
      footnote="Each correct answer earns XP · each wrong answer costs XP"
    >
      {!isSignedIn ? (
        <ModalActions>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton variant="primary" onClick={() => { onClose(); onSignIn?.(); }}>
            Sign in to Play
          </ModalButton>
        </ModalActions>
      ) : !canWager ? (
        <>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(200,185,122,.55)', margin: '0 0 16px', textAlign: 'center' }}>
            You need at least <strong style={{ color: '#f0bf5c' }}>{MIN_WAGER} XP</strong> to wager.<br/>
            Your balance: <strong style={{ color: '#d7e4f1' }}>{safeXp} XP</strong>
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(200,185,122,.35)', margin: '0 0 8px', textAlign: 'center' }}>
            Earn XP by publishing activities, getting stars, and stacking views.
          </p>
          <ModalActions>
            <ModalButton onClick={onClose}>Cancel</ModalButton>
            <ModalButton variant="teal" onClick={() => onConfirm(0)}>Play Free</ModalButton>
          </ModalActions>
        </>
      ) : (
        <>
          {/* Balance */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 14px', background: 'rgba(67,226,210,.06)', border: '1px solid rgba(67,226,210,.2)', borderRadius: 0, marginBottom: 18, clipPath: CHAMP_SM }}>
            <span style={{ ...microLabel, letterSpacing: '.16em', color: color.textMuted }}>Your balance</span>
            <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 22, letterSpacing: '.06em', color: '#43e2d2' }}>{safeXp} XP</span>
          </div>

          {/* Wager picker */}
          <FieldLabel style={{ marginBottom: 8 }}>Wager amount</FieldLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <button onClick={stepDown} disabled={clampedWager <= MIN_WAGER}
              style={{ ...stepBtn, cursor: clampedWager <= MIN_WAGER ? 'not-allowed' : 'pointer', opacity: clampedWager <= MIN_WAGER ? 0.4 : 1 }}>−</button>
            <input
              type="number"
              value={clampedWager}
              onChange={(e) => setWager(parseInt(e.target.value, 10) || MIN_WAGER)}
              min={MIN_WAGER} max={safeXp} step={5}
              aria-label="Wager amount"
              style={{ flex: 1, textAlign: 'center', background: 'rgba(6,12,20,.8)', border: '1px solid rgba(240,191,92,.2)', borderRadius: 0, color: '#f0bf5c', padding: '8px 10px', fontFamily: 'Bebas Neue,sans-serif', fontSize: 26, letterSpacing: '.06em', outline: 0, clipPath: CHAMP_SM }}
            />
            <button onClick={stepUp} disabled={clampedWager >= safeXp}
              style={{ ...stepBtn, cursor: clampedWager >= safeXp ? 'not-allowed' : 'pointer', opacity: clampedWager >= safeXp ? 0.4 : 1 }}>+</button>
            <button onClick={setMax}
              style={{ ...microLabel, background: 'transparent', border: '1px solid rgba(240,191,92,.2)', borderRadius: 0, color: color.textMuted, padding: '8px 10px', cursor: 'pointer', clipPath: CHAMP_SM }}>
              Max
            </button>
          </div>
          <input
            type="range" min={MIN_WAGER} max={safeXp} step={5} value={clampedWager}
            onChange={(e) => setWager(parseInt(e.target.value, 10))}
            aria-label="Wager amount slider"
            style={{ width: '100%', accentColor: '#f0bf5c', marginBottom: 16 }}
          />

          {/* Payoff preview */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, padding: '10px 12px', background: 'rgba(95,194,138,.08)', border: '1px solid rgba(95,194,138,.3)', borderRadius: 0, textAlign: 'center', clipPath: CHAMP_SM }}>
              <div style={{ ...microLabel, fontSize: 10, letterSpacing: '.16em', color: '#5fc28a', marginBottom: 4 }}>Each correct</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 22, letterSpacing: '.04em', color: '#5fc28a' }}>+{clampedWager} XP</div>
            </div>
            <div style={{ flex: 1, padding: '10px 12px', background: 'rgba(226,92,122,.08)', border: '1px solid rgba(226,92,122,.3)', borderRadius: 0, textAlign: 'center', clipPath: CHAMP_SM }}>
              <div style={{ ...microLabel, fontSize: 10, letterSpacing: '.16em', color: '#e25c7a', marginBottom: 4 }}>Each wrong</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 22, letterSpacing: '.04em', color: '#e25c7a' }}>−{clampedWager} XP</div>
            </div>
          </div>

          <ModalActions>
            <ModalButton onClick={onClose}>Cancel</ModalButton>
            <ModalButton variant="primary" flex={1.4} onClick={() => onConfirm(clampedWager)}>
              Begin Quest
            </ModalButton>
          </ModalActions>
        </>
      )}
    </Modal>
  );
}

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
// `geogebraXML` (when present) is the canonical replay source — captured at
// publish time via api.getXML(). It restores objects, colors, line styles,
// captions, and view at perfect fidelity. Falls back to the legacy `commands`
// + `settings` evalCommand loop for activities published before the XML field
// was added.
function GeoGebraView({ commands, settings, geogebraXML }) {
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

  // Apply state when applet is ready or inputs change.
  //
  // Path A (preferred): if a geogebraXML snapshot exists, restore it via
  // setXML — this brings back every object, color, style, and view setting
  // exactly as they were at publish time.
  //
  // Path B (legacy): fall back to the original evalCommand loop for older
  // activities that pre-date the XML field.
  useEffect(() => {
    if (!isReady || !apiRef.current) return;
    /** @type {any} */
    const api = apiRef.current;

    if (typeof geogebraXML === 'string' && geogebraXML.length > 0) {
      try {
        api.setXML(geogebraXML);
      } catch (e) {
        console.warn('[Activity] setXML failed, falling back to commands:', e);
      }
      return;
    }

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
      try {
        const ok = api.evalCommand(cmd);
        if (ok === false) console.warn('[Activity] evalCommand returned false for:', cmd);
      } catch (e) { console.warn('[Activity] cmd threw:', cmd, e); }
    }
  }, [commands, settings, geogebraXML, isReady]);

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
  const [showWagerModal, setShowWagerModal] = useState(false);
  const { user, profile, openSignInModal } = useAuth();
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
    // Rows first, then columns — the header spans the full viewport so its
    // midpoint (and the centred Play button) can't move when the AI sidebar
    // opens. Matches the Create and Play pages.
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', height: '100vh', width: '100vw', fontFamily: 'Manrope,sans-serif', background: BG, color: '#d7e4f1', overflow: 'hidden' }}>
      <style>{`
        .wiz-font-bebas { font-family:'Bebas Neue',sans-serif; }
        .activity-scroll::-webkit-scrollbar { width:6px; }
        .activity-scroll::-webkit-scrollbar-thumb { background:rgba(180,160,100,.2); border-radius: 0; }
        .activity-panel { position:relative; background:${BG2}; border:1px solid ${BORDER}; border-radius: 0; padding:28px 32px 40px; margin-bottom:28px; }
        .activity-panel::before { content:''; position:absolute; left:0; right:0; top:0; height:1px; background:linear-gradient(90deg,transparent,rgba(240,191,92,.5),transparent); border-radius: 0; }

        /* ── Play button (gold, fills the nav height, with sheen + shimmer) ── */
        .act-play-btn { --c:20px;
          position:relative; overflow:hidden;
          display:flex; align-items:center; justify-content:center; gap:12px;
          padding:0 60px;
          background:linear-gradient(105deg,#6b4a0e 0%,#c89b3c 18%,#f0bf5c 38%,#fff4c2 50%,#f0bf5c 62%,#c89b3c 82%,#6b4a0e 100%);
          background-size:220% 100%;
          border:none;
          clip-path:polygon(var(--c) 0%,100% 0%,calc(100% - var(--c)) 100%,0% 100%);
          color:#010A13;
          font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:.26em;
          cursor:pointer; white-space:nowrap;
          filter:drop-shadow(0 0 8px rgba(240,191,92,.55)) drop-shadow(0 0 22px rgba(240,191,92,.25));
          transition:filter .3s, background-position .5s; }
        .act-play-btn::before { content:''; position:absolute; inset:0; pointer-events:none;
          background:linear-gradient(180deg,rgba(255,255,220,.28) 0%,rgba(255,255,220,.06) 50%,transparent 100%); }
        .act-play-btn::after { content:''; position:absolute; top:-10%; left:-80%; width:40%; height:120%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);
          transform:skewX(-8deg); transition:none; }
        .act-play-btn:hover { background-position:100% 0;
          filter:drop-shadow(0 0 14px rgba(240,191,92,1)) drop-shadow(0 0 36px rgba(240,191,92,.55)) drop-shadow(0 0 60px rgba(240,191,92,.2)); }
        .act-play-btn:hover::after { left:130%; transition:left .55s ease; }
        .act-play-btn:active { filter:drop-shadow(0 0 6px rgba(240,191,92,.8)); }
        .act-play-btn svg { flex-shrink:0; color:#010A13; opacity:.7; }

        /* ── Description markdown (GitHub-README style, WizMath palette) ── */
        .md-body { font-family:'Manrope',sans-serif; font-size:15px; line-height:1.7; color:#bcc8d6; }
        .md-body > *:first-child { margin-top:0; }
        .md-body > *:last-child { margin-bottom:0; }
        .md-body p { margin: 0 0 14px; color:#bcc8d6; }
        .md-body strong { color:#f0bf5c; font-weight:600; }
        .md-body em { color:#43e2d2; font-style:italic; }
        .md-body a { color:#43e2d2; text-decoration:underline; text-decoration-color:rgba(67,226,210,.45); text-underline-offset:2px; }
        .md-body a:hover { text-decoration-color:#43e2d2; }
        .md-body h1, .md-body h2, .md-body h3 {
          font-family:'Bebas Neue',sans-serif;
          color:#d7e4f1;
          letter-spacing:.08em;
          margin: 28px 0 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(200,155,60,.15);
          position: relative;
        }
        .md-body h1::before, .md-body h2::before {
          content:''; position:absolute; left:0; bottom:-1px; width:48px; height:2px;
          background: linear-gradient(90deg,#f0bf5c,transparent);
        }
        .md-body h1 { font-size: 30px; }
        .md-body h2 { font-size: 24px; }
        .md-body h3 { font-size: 19px; color:#43e2d2; border-bottom-color: rgba(67,226,210,.18); }
        .md-body h3::before { background: linear-gradient(90deg,#43e2d2,transparent); }
        .md-body ul, .md-body ol { margin: 4px 0 16px; padding-left: 8px; list-style: none; }
        .md-body li { position: relative; padding: 4px 0 4px 22px; color:#cdd6e0; }
        .md-body ul > li::before {
          content:''; position:absolute; left:2px; top:12px;
          /* 8 tall / 6.93 wide — the ratio that keeps this hexagon regular. */
          width:6.93px; height:8px;
          background: linear-gradient(135deg,#f0bf5c,#c89b3c);
          clip-path: polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);
          filter: drop-shadow(0 0 5px rgba(240,191,92,.4));
        }
        .md-body ol { counter-reset: md-ol; }
        .md-body ol > li { padding-left: 32px; counter-increment: md-ol; }
        .md-body ol > li::before {
          content: counter(md-ol); position:absolute; left:0; top:3px;
          width: 22px; height: 22px;
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(240,191,92,.08); border: 1px solid rgba(240,191,92,.4);
          color: #f0bf5c; font-family:'Bebas Neue',sans-serif; font-size: 13px; letter-spacing:.04em;
          border-radius: 0;
        }
        .md-body li > ul, .md-body li > ol { margin-top: 4px; margin-bottom: 4px; }
        .md-body code {
          font-family: 'Space Grotesk', ui-monospace, monospace;
          font-size: 13.5px;
          padding: 2px 7px;
          background: rgba(240,191,92,.08);
          border: 1px solid rgba(240,191,92,.22);
          border-radius: 0;
          color: #f0bf5c;
        }
        .md-body pre {
          margin: 0 0 16px;
          padding: 14px 16px;
          background: ${BG3};
          border: 1px solid ${BORDER};
          border-left: 3px solid #f0bf5c;
          border-radius: 0;
          clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
          overflow-x: auto;
        }
        .md-body pre code {
          padding: 0; background: transparent; border: 0; color: #d7e4f1;
          font-size: 13px; line-height: 1.6;
        }
        .md-body blockquote {
          margin: 16px 0;
          padding: 14px 18px 14px 20px;
          background: linear-gradient(180deg, rgba(240,191,92,.06), rgba(240,191,92,.02));
          border: 1px solid rgba(240,191,92,.25);
          border-left: 3px solid #f0bf5c;
          border-radius: 0;
          clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
          color: #d7e4f1;
          font-style: normal;
          position: relative;
        }
        .md-body blockquote::before {
          content:''; position:absolute; left:0; right:0; top:0; height:1px;
          background: linear-gradient(90deg,transparent,rgba(240,191,92,.4),transparent);
          border-radius: 0;
        }
        .md-body blockquote p { color: #d7e4f1; margin: 0 0 8px; }
        .md-body blockquote p:last-child { margin: 0; }
        .md-body blockquote strong { color: #ffdea4; }
        .md-body hr {
          border: 0; height: 1px; margin: 22px 0;
          background: linear-gradient(90deg, transparent, rgba(240,191,92,.4), transparent);
        }
      `}</style>

      <TopNav
        brandTo="/activities"
        links={[
          { to: '/activities', label: 'Activities' },
          { to: '/leaderboard', label: 'Charts' },
          { to: '/create', label: 'Create' },
        ]}
        center={
          <button className="act-play-btn" title="Test your understanding — wager XP to begin"
            onClick={() => setShowWagerModal(true)}>
            Play
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>
            </svg>
          </button>
        }
        right={<AuthButton />}
      />

      {/* Body: content | Ask AI */}
      <div style={{ display: 'grid', gridTemplateColumns: aiCollapsed ? '1fr 44px' : '1fr 320px', minHeight: 0, overflow: 'hidden' }}>
        <div className="activity-scroll" style={{ overflowY: 'auto', minWidth: 0, padding: '48px 64px 80px' }}>
          <div className="wiz-rise" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 12 }}>
            <h1 className="wiz-font-bebas" style={{ fontSize: 56, lineHeight: 1, letterSpacing: '.06em', color: '#d7e4f1', margin: 0, flex: 1, minWidth: 0 }}>
              {activity.title}
            </h1>
            <div style={{ flexShrink: 0, paddingTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div title={`${viewCount} ${viewCount === 1 ? 'view' : 'views'}`}
                style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.12)', borderRadius: 0, color:'#aaa', padding:'7px 12px', fontFamily:'Space Grotesk,sans-serif', fontSize:12, fontWeight:700, letterSpacing:'.04em', clipPath:'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {viewCount}
              </div>
              {isAuthor && (
                <>
                  <button onClick={() => setShowEditModal(true)} title="Edit title and description"
                    style={{ display:'inline-flex', alignItems:'center', gap:6, background:'transparent', border:'1px solid rgba(180,160,100,.35)', borderRadius: 0, color:'#d2c5b1', padding:'7px 12px', cursor:'pointer', fontFamily:'Space Grotesk,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', transition:'border-color .15s, color .15s', clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor='rgba(240,191,92,.6)'; e.currentTarget.style.color='#f0bf5c'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor='rgba(180,160,100,.35)'; e.currentTarget.style.color='#d2c5b1'; }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button onClick={() => setShowDeleteModal(true)} title="Delete this activity"
                    style={{ display:'inline-flex', alignItems:'center', gap:6, background:'transparent', border:'1px solid rgba(226,92,122,.35)', borderRadius: 0, color:'#e25c7a', padding:'7px 12px', cursor:'pointer', fontFamily:'Space Grotesk,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', transition:'background .15s, border-color .15s', clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}
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
          <WagerModal
            open={showWagerModal}
            onClose={() => setShowWagerModal(false)}
            isSignedIn={!!user}
            currentXp={profile?.xp ?? 0}
            onSignIn={openSignInModal}
            onConfirm={(wager) => {
              setShowWagerModal(false);
              navigate(`/activity/${id}/play?wager=${wager}`);
            }}
          />
          {activity.authorName && (
            <div className="wiz-rise wiz-rise-d1" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              {activity.authorPhotoURL ? (
                <img src={activity.authorPhotoURL} alt={activity.authorName} referrerPolicy="no-referrer" style={{ width: 26, height: 26, borderRadius: 0, display: 'block', border: `1px solid ${BORDER}` }}/>
              ) : (
                <div style={{ width: 26, height: 26, borderRadius: 0, background: 'linear-gradient(135deg,#43e2d2,#005049)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#002a26', fontFamily: 'Bebas Neue,sans-serif' }}>
                  {activity.authorName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, color: '#888', letterSpacing: '.04em' }}>
                created by <span style={{ color: '#43e2d2', fontWeight: 500 }}>{activity.authorName}</span>
              </span>
            </div>
          )}

          {/* Activity Panel — GeoGebra applet (graph + sliders) */}
          <section className="activity-panel wiz-rise wiz-rise-d2">
            <div style={{ background: BG3, border: `1px solid ${BORDER}`, borderRadius: 0, height: 600, overflow: 'hidden' }}>
              <GeoGebraView commands={activity.commands} settings={activity.settings} geogebraXML={activity.geogebraXML} />
            </div>
          </section>

          {/* Description (below graph) — rendered as GitHub-flavored Markdown */}
          {activity.description && (
            <div className="wiz-rise wiz-rise-d3" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, maxWidth: 900, marginTop: 24 }}>
              <div style={{ flexShrink: 0, width: 32, height: 32, background: 'linear-gradient(135deg,#43e2d2,#005049)', borderRadius: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, color: '#002a26', filter: 'drop-shadow(0 0 8px rgba(67,226,210,.35))', marginTop: 4, clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>i</div>
              <div className="md-body" style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                <ReactMarkdown
                  allowedElements={['p','strong','em','a','h1','h2','h3','ul','ol','li','code','pre','blockquote','br','hr']}
                  unwrapDisallowed
                >
                  {activity.description}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <AskAISidebar collapsed={aiCollapsed} onToggle={() => setAiCollapsed(!aiCollapsed)} activity={activity} />
      </div>
    </div>
  );
}
