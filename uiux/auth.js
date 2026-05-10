(function () {
  'use strict';

  const STORAGE_KEY = 'arcanemath_user';

  const PRESET_ACCOUNTS = [
    {
      name: 'Arcane Summoner',
      email: 'summoner@arcanemath.dev',
      picture: 'https://ui-avatars.com/api/?name=Arcane+Summoner&background=43e2d2&color=003732&bold=true&size=128'
    }
  ];

  const GOOGLE_G = `<svg width="22" height="22" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>`;

  const CSS = `
    /* ── Backdrop ── */
    .gsi-backdrop {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(1, 8, 16, 0.55);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity .22s ease;
    }
    .gsi-backdrop.open { opacity: 1; pointer-events: auto; }

    /* ── Sign-in card ── */
    .gsi-card {
      position: relative;
      background: rgba(6, 12, 20, 0.94);
      border: 1px solid rgba(240, 191, 92, 0.28);
      color: #c8b97a;
      width: 400px; max-width: calc(100vw - 32px);
      border-radius: 4px;
      box-shadow: 0 0 0 1px rgba(67,226,210,0.06) inset,
                  0 8px 48px rgba(0,0,0,.7),
                  0 0 80px rgba(67,226,210,0.04);
      font-family: 'Manrope', system-ui, sans-serif;
      padding: 36px 40px 28px;
      transform: translateY(12px); transition: transform .22s ease;
      text-align: center;
    }
    .gsi-backdrop.open .gsi-card { transform: translateY(0); }

    /* corner accents */
    .gsi-card::before, .gsi-card::after {
      content: ''; position: absolute; width: 14px; height: 14px;
      border-color: rgba(240,191,92,.5); border-style: solid;
    }
    .gsi-card::before { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
    .gsi-card::after  { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }

    .gsi-close {
      position: absolute; top: 10px; right: 10px;
      width: 28px; height: 28px; border-radius: 50%;
      background: transparent; border: 1px solid rgba(240,191,92,.15); cursor: pointer;
      color: rgba(200,185,122,.5); font-size: 18px; line-height: 1;
      display: flex; align-items: center; justify-content: center;
      transition: border-color .15s, color .15s;
    }
    .gsi-close:hover { border-color: rgba(240,191,92,.5); color: #f0bf5c; }

    /* hex brand mark */
    .gsi-hex-mark {
      display: flex; justify-content: center; margin-bottom: 20px;
    }

    .gsi-title {
      font-family: 'Bebas Neue', 'Space Grotesk', sans-serif;
      font-size: 26px; font-weight: 400; letter-spacing: .12em;
      color: #c8b97a; margin: 0 0 10px; line-height: 1.2;
    }
    .gsi-title span { color: #f0bf5c; }

    .gsi-sub {
      font-size: 13px; line-height: 1.6; color: rgba(200,185,122,.55);
      margin: 0 0 26px;
    }

    /* Google sign-in button */
    .gsi-google-btn {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%; padding: 12px 20px;
      background: #fff; color: #3c4043;
      border: 1px solid #dadce0; border-radius: 4px;
      font-family: 'Roboto', 'Manrope', sans-serif;
      font-size: 15px; font-weight: 500; letter-spacing: .01em;
      cursor: pointer; transition: box-shadow .15s, background .15s;
      margin-bottom: 20px;
    }
    .gsi-google-btn:hover { background: #f8f9fa; box-shadow: 0 2px 8px rgba(0,0,0,.25); }

    /* Account picker (shown after clicking Google) */
    .gsi-picker { display: none; }
    .gsi-card.choosing .gsi-intro { display: none; }
    .gsi-card.choosing .gsi-picker { display: block; }

    .gsi-picker-head {
      font-size: 13px; line-height: 1.6; color: rgba(200,185,122,.55);
      margin: 0 -40px 4px; padding: 0 0 14px;
      border-bottom: 1px solid rgba(240,191,92,.1);
      text-align: center;
    }
    .gsi-picker-head strong {
      display: block; font-size: 16px; font-weight: 600;
      color: #c8b97a; margin-bottom: 3px; letter-spacing: .04em;
    }

    .gsi-list { margin: 0 -40px; }
    .gsi-row {
      display: flex; align-items: center; gap: 14px;
      padding: 11px 40px; cursor: pointer;
      transition: background .12s;
    }
    .gsi-row:hover { background: rgba(240,191,92,.06); }
    .gsi-row .gsi-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      flex-shrink: 0; object-fit: cover;
      border: 1px solid rgba(67,226,210,.3);
    }
    .gsi-row .gsi-icon {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(240,191,92,.08); color: rgba(200,185,122,.6);
      border: 1px solid rgba(240,191,92,.15);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .gsi-info { display: flex; flex-direction: column; min-width: 0; flex: 1; text-align: left; }
    .gsi-name { font-size: 14px; color: #c8b97a; line-height: 20px; }
    .gsi-email { font-size: 12px; color: rgba(200,185,122,.5); line-height: 16px; }

    .gsi-disc {
      font-size: 11px; line-height: 1.6; color: rgba(200,185,122,.35);
      margin: 0;
    }
    .gsi-disc a { color: rgba(200,185,122,.5); text-decoration: none; }
    .gsi-disc a:hover { color: #f0bf5c; }

    /* ── Sign-out card ── */
    .gso-card {
      position: relative;
      background: rgba(6, 12, 20, 0.94);
      border: 1px solid rgba(240, 191, 92, 0.28);
      color: #c8b97a;
      width: 340px; max-width: calc(100vw - 32px);
      border-radius: 4px;
      box-shadow: 0 0 0 1px rgba(67,226,210,0.06) inset,
                  0 8px 48px rgba(0,0,0,.7);
      font-family: 'Manrope', system-ui, sans-serif;
      padding: 0 0 16px;
      transform: translateY(12px); transition: transform .22s ease;
    }
    .gso-card::before, .gso-card::after {
      content: ''; position: absolute; width: 14px; height: 14px;
      border-color: rgba(240,191,92,.5); border-style: solid;
    }
    .gso-card::before { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
    .gso-card::after  { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }
    .gsi-backdrop.open .gso-card { transform: translateY(0); }

    .gso-top {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px 12px;
      border-bottom: 1px solid rgba(240,191,92,.1);
    }
    .gso-brand {
      display: flex; align-items: center; gap: 8px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 13px; letter-spacing: .1em; color: rgba(200,185,122,.55);
    }
    .gso-account {
      display: flex; flex-direction: column; align-items: center;
      padding: 22px 24px 20px; text-align: center;
    }
    .gso-account .gso-avatar {
      width: 68px; height: 68px; border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(67,226,210,.4);
      box-shadow: 0 0 18px rgba(67,226,210,.2);
      margin-bottom: 12px;
    }
    .gso-hello {
      font-family: 'Bebas Neue', 'Space Grotesk', sans-serif;
      font-size: 20px; letter-spacing: .08em; color: #f0bf5c;
      margin: 0 0 4px;
    }
    .gso-email { font-size: 13px; color: rgba(200,185,122,.5); margin: 0; }

    .gso-actions {
      display: flex; gap: 8px;
      padding: 12px 16px 0;
      border-top: 1px solid rgba(240,191,92,.1);
    }
    .gso-btn {
      flex: 1;
      display: inline-flex; align-items: center; justify-content: center; gap: 7px;
      padding: 9px 12px;
      font-family: 'Manrope', sans-serif;
      font-size: 13px; font-weight: 600; letter-spacing: .04em;
      border-radius: 3px; cursor: pointer;
      border: 1px solid rgba(240,191,92,.25); background: rgba(240,191,92,.06);
      color: #c8b97a;
      transition: background .12s, border-color .12s;
    }
    .gso-btn:hover { background: rgba(240,191,92,.12); border-color: rgba(240,191,92,.5); color: #f0bf5c; }
    .gso-btn svg { width: 16px; height: 16px; }

    .gso-foot {
      padding: 10px 16px 0; margin-top: 10px;
      border-top: 1px solid rgba(240,191,92,.08);
      display: flex; justify-content: center; gap: 16px;
      font-size: 11px; color: rgba(200,185,122,.3);
    }
    .gso-foot a { color: rgba(200,185,122,.3); text-decoration: none; }
    .gso-foot a:hover { color: rgba(240,191,92,.7); }

    /* ── Nav avatar ── */
    .signin.signed-in, .gbtn.signed-in {
      padding: 0 !important;
      width: 36px; height: 36px;
      border-radius: 50% !important;
      clip-path: none !important;
      border: 1px solid var(--gold-line-50) !important;
      background: transparent !important;
      display: inline-flex; align-items: center; justify-content: center;
      overflow: hidden;
      transition: border-color .2s, box-shadow .2s !important;
      letter-spacing: 0 !important;
    }
    .signin.signed-in:hover, .gbtn.signed-in:hover {
      border-color: var(--gold) !important;
      box-shadow: 0 0 14px rgba(240,191,92,.35);
      background: transparent !important;
      color: inherit !important;
    }
    .signin-avatar {
      width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
      display: block;
    }
  `;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
  }
  function setUser(u) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    renderButtons();
  }
  function clearUser() {
    localStorage.removeItem(STORAGE_KEY);
    renderButtons();
  }

  function ensureStyles() {
    if (document.getElementById('gsi-styles')) return;
    const s = document.createElement('style');
    s.id = 'gsi-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  const HEX_MARK = `<svg width="56" height="64" viewBox="0 0 56 64" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="gsi-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#43e2d2" flood-opacity="0.6"/>
      </filter>
    </defs>
    <polygon points="28,2 54,16 54,48 28,62 2,48 2,16"
      fill="none" stroke="#f0bf5c" stroke-width="1.5" opacity=".8"/>
    <polygon points="28,8 48,19.5 48,44.5 28,56 8,44.5 8,19.5"
      fill="none" stroke="rgba(240,191,92,.25)" stroke-width="1"/>
    <circle cx="28" cy="32" r="8" fill="#43e2d2" filter="url(#gsi-glow)"/>
    <circle cx="28" cy="32" r="4" fill="#010A13"/>
    <circle cx="28" cy="32" r="2" fill="#43e2d2"/>
  </svg>`;

  function ensureOverlay() {
    if (document.getElementById('gsi-overlay')) return;
    const div = document.createElement('div');
    div.id = 'gsi-overlay';
    div.className = 'gsi-backdrop';
    div.innerHTML = `
      <div class="gsi-card" role="dialog" aria-modal="true" aria-labelledby="gsi-title">
        <button class="gsi-close" aria-label="Close" type="button">&times;</button>

        <!-- Intro view -->
        <div class="gsi-intro">
          <div class="gsi-hex-mark">${HEX_MARK}</div>
          <h1 class="gsi-title" id="gsi-title">WELCOME TO <span>ARCANEMATH</span></h1>
          <p class="gsi-sub">Sign in to publish your own activities and explore creations from the community.</p>
          <button class="gsi-google-btn" type="button">
            ${GOOGLE_G}
            Sign in with Google
          </button>
          <p class="gsi-disc">By continuing, you agree to use ArcaneMath for educational purposes.</p>
        </div>

        <!-- Account picker (shown after clicking Google) -->
        <div class="gsi-picker">
          <p class="gsi-picker-head">
            <strong>Choose an account</strong>
            to continue to arcanemath.dev
          </p>
          <div class="gsi-list">
            ${PRESET_ACCOUNTS.map((a, i) => `
              <div class="gsi-row" data-idx="${i}">
                <img class="gsi-avatar" src="${esc(a.picture)}" alt=""/>
                <div class="gsi-info">
                  <div class="gsi-name">${esc(a.name)}</div>
                  <div class="gsi-email">${esc(a.email)}</div>
                </div>
              </div>
            `).join('')}
            <div class="gsi-row" data-idx="other">
              <div class="gsi-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </div>
              <div class="gsi-info">
                <div class="gsi-name">Use another account</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    div.addEventListener('click', e => { if (e.target === div) closeOverlay(); });
    div.querySelector('.gsi-close').addEventListener('click', closeOverlay);

    div.querySelector('.gsi-google-btn').addEventListener('click', () => {
      div.querySelector('.gsi-card').classList.add('choosing');
    });

    div.querySelectorAll('.gsi-row').forEach(row => {
      row.addEventListener('click', () => {
        const idx = row.dataset.idx;
        if (idx === 'other') {
          const name = prompt('Enter your name:');
          if (!name || !name.trim()) return;
          const trimmed = name.trim();
          setUser({
            name: trimmed,
            email: trimmed.toLowerCase().replace(/\s+/g, '.') + '@gmail.com',
            picture: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(trimmed) + '&background=f0bf5c&color=1a1100&bold=true&size=128'
          });
        } else {
          setUser(PRESET_ACCOUNTS[Number(idx)]);
        }
        closeOverlay();
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeOverlay(); closeSignOutOverlay(); }
    });
  }

  function openOverlay() {
    ensureOverlay();
    document.getElementById('gsi-overlay').classList.add('open');
  }
  function closeOverlay() {
    const o = document.getElementById('gsi-overlay');
    if (!o) return;
    o.classList.remove('open');
    const card = o.querySelector('.gsi-card');
    if (card) card.classList.remove('choosing');
  }

  function ensureSignOutOverlay() {
    let div = document.getElementById('gso-overlay');
    if (div) div.remove();
    const user = getUser();
    if (!user) return;
    div = document.createElement('div');
    div.id = 'gso-overlay';
    div.className = 'gsi-backdrop';
    div.innerHTML = `
      <div class="gso-card" role="dialog" aria-modal="true" aria-labelledby="gso-title">
        <button class="gsi-close" aria-label="Close" type="button">&times;</button>
        <div class="gso-top">
          <div class="gso-brand">ARCANEMATH<span style="color:rgba(200,185,122,.3);margin-left:2px">.DEV</span></div>
        </div>
        <div class="gso-account">
          <img class="gso-avatar" src="${esc(user.picture)}" alt=""/>
          <h1 class="gso-hello" id="gso-title">WELCOME BACK, ${esc(user.name.split(' ')[0]).toUpperCase()}</h1>
          <p class="gso-email">${esc(user.email)}</p>
        </div>
        <div class="gso-actions">
          <button class="gso-btn" data-act="switch" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            Switch
          </button>
          <button class="gso-btn" data-act="signout" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            Sign out
          </button>
        </div>
        <div class="gso-foot">
          <a href="#" onclick="event.preventDefault()">Privacy</a>
          <a href="#" onclick="event.preventDefault()">Terms</a>
        </div>
      </div>
    `;
    document.body.appendChild(div);
    div.addEventListener('click', e => { if (e.target === div) closeSignOutOverlay(); });
    div.querySelector('.gsi-close').addEventListener('click', closeSignOutOverlay);
    div.querySelector('[data-act="signout"]').addEventListener('click', () => {
      clearUser();
      closeSignOutOverlay();
    });
    div.querySelector('[data-act="switch"]').addEventListener('click', () => {
      clearUser();
      closeSignOutOverlay();
      setTimeout(openOverlay, 180);
    });
  }

  function openSignOutOverlay() {
    ensureSignOutOverlay();
    const o = document.getElementById('gso-overlay');
    if (o) requestAnimationFrame(() => o.classList.add('open'));
  }
  function closeSignOutOverlay() {
    const o = document.getElementById('gso-overlay');
    if (o) o.classList.remove('open');
  }

  function renderButtons() {
    const user = getUser();
    const stateKey = user ? 'IN:' + user.email : 'OUT';
    document.querySelectorAll('.signin, .gbtn').forEach(btn => {
      if (btn.dataset.authState === stateKey) return;
      btn.dataset.authState = stateKey;
      if (user) {
        btn.classList.add('signed-in');
        btn.innerHTML = '<img src="' + esc(user.picture) + '" alt="' + esc(user.name) + '" class="signin-avatar"/>';
        btn.title = user.name + ' (' + user.email + ') — click to sign out';
      } else {
        btn.classList.remove('signed-in');
        btn.textContent = 'Sign in';
        btn.title = '';
      }
    });
  }

  function handleClick(e) {
    const btn = e.target.closest('.signin, .gbtn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (getUser()) {
      openSignOutOverlay();
    } else {
      openOverlay();
    }
  }

  function init() {
    ensureStyles();
    ensureOverlay();
    renderButtons();
    document.addEventListener('click', handleClick, true);

    const obs = new MutationObserver(() => renderButtons());
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
