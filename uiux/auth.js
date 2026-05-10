(function () {
  'use strict';

  const STORAGE_KEY = 'wizmath_user';

  const PRESET_ACCOUNTS = [
    {
      name: 'Arcane Summoner',
      email: 'summoner@wizmath.dev',
      picture: 'https://ui-avatars.com/api/?name=Arcane+Summoner&background=43e2d2&color=003732&bold=true&size=128'
    }
  ];

  const GOOGLE_G = `<svg width="22" height="22" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>`;

  const CSS = `
    .gsi-backdrop {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0, 5, 10, 0.72);
      backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity .18s ease;
    }
    .gsi-backdrop.open { opacity: 1; pointer-events: auto; }
    .gsi-card {
      position: relative;
      background: #fff; color: #202124;
      width: 400px; max-width: calc(100vw - 32px);
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(60,64,67,.3), 0 2px 6px 2px rgba(60,64,67,.15);
      font-family: 'Roboto', 'Manrope', system-ui, sans-serif;
      padding: 36px 0 24px;
      transform: translateY(8px); transition: transform .18s ease;
    }
    .gsi-backdrop.open .gsi-card { transform: translateY(0); }
    .gsi-close {
      position: absolute; top: 10px; right: 10px;
      width: 32px; height: 32px; border-radius: 50%;
      background: transparent; border: 0; cursor: pointer;
      color: #5f6368; font-size: 22px; line-height: 1;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s;
    }
    .gsi-close:hover { background: #f1f3f4; }
    .gsi-head { padding: 0 40px 20px; }
    .gsi-brand {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 18px;
    }
    .gsi-brand-text {
      font-family: 'Google Sans', 'Roboto', 'Manrope', sans-serif;
      font-size: 16px; color: #5f6368; letter-spacing: .1px;
    }
    .gsi-title {
      font-size: 24px; font-weight: 400; line-height: 32px;
      color: #202124; margin: 0 0 4px;
      font-family: 'Google Sans', 'Roboto', sans-serif;
    }
    .gsi-sub {
      font-size: 14px; line-height: 20px; color: #5f6368; margin: 0;
    }
    .gsi-sub b { color: #1a73e8; font-weight: 400; }
    .gsi-list { padding: 4px 0; }
    .gsi-row {
      display: flex; align-items: center; gap: 16px;
      padding: 10px 40px; cursor: pointer;
      transition: background .12s;
    }
    .gsi-row:hover { background: #f8f9fa; }
    .gsi-row .gsi-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      flex-shrink: 0; object-fit: cover;
      background: #e8eaed;
    }
    .gsi-row .gsi-icon {
      width: 32px; height: 32px; border-radius: 50%;
      background: #e8eaed; color: #5f6368;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .gsi-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .gsi-name { font-size: 14px; color: #202124; line-height: 20px; }
    .gsi-email { font-size: 12px; color: #5f6368; line-height: 16px; }
    .gsi-foot {
      padding: 18px 40px 0; margin-top: 8px;
      border-top: 1px solid #e8eaed;
      font-size: 12px; line-height: 16px; color: #5f6368;
    }
    .gsi-foot a { color: #1a73e8; text-decoration: none; }

    /* Sign-out card */
    .gso-card {
      position: relative;
      background: #fff; color: #202124;
      width: 360px; max-width: calc(100vw - 32px);
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(60,64,67,.3), 0 2px 6px 2px rgba(60,64,67,.15);
      font-family: 'Roboto', 'Manrope', system-ui, sans-serif;
      padding: 14px 0 12px;
      transform: translateY(8px); transition: transform .18s ease;
    }
    .gsi-backdrop.open .gso-card { transform: translateY(0); }
    .gso-top {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 16px 8px;
    }
    .gso-brand {
      display: flex; align-items: center; gap: 8px;
      font-family: 'Google Sans', 'Roboto', sans-serif;
      font-size: 14px; color: #5f6368;
    }
    .gso-account {
      display: flex; flex-direction: column; align-items: center;
      padding: 16px 24px 20px; text-align: center;
    }
    .gso-account .gso-avatar {
      width: 72px; height: 72px; border-radius: 50%;
      object-fit: cover; background: #e8eaed;
      margin-bottom: 10px;
    }
    .gso-hello {
      font-family: 'Google Sans', 'Roboto', sans-serif;
      font-size: 18px; line-height: 24px; color: #202124;
      margin: 0 0 2px;
    }
    .gso-email {
      font-size: 14px; line-height: 20px; color: #5f6368;
      margin: 0;
    }
    .gso-actions {
      display: flex; gap: 8px;
      padding: 8px 16px 4px;
      border-top: 1px solid #e8eaed;
      margin-top: 4px;
    }
    .gso-btn {
      flex: 1;
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px 14px;
      font-family: 'Google Sans', 'Roboto', sans-serif;
      font-size: 14px; font-weight: 500;
      border-radius: 18px; cursor: pointer;
      border: 1px solid #dadce0; background: #fff; color: #1a73e8;
      transition: background .12s, box-shadow .12s;
    }
    .gso-btn:hover { background: #f6fafe; box-shadow: 0 1px 2px rgba(60,64,67,.15); }
    .gso-btn svg { width: 18px; height: 18px; }
    .gso-foot {
      padding: 14px 16px 4px; margin-top: 8px;
      border-top: 1px solid #e8eaed;
      display: flex; justify-content: center; gap: 16px;
      font-size: 12px; color: #5f6368;
    }
    .gso-foot a { color: #5f6368; text-decoration: none; }
    .gso-foot a:hover { text-decoration: underline; }

    /* Avatar replacement in nav */
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

  function ensureOverlay() {
    if (document.getElementById('gsi-overlay')) return;
    const div = document.createElement('div');
    div.id = 'gsi-overlay';
    div.className = 'gsi-backdrop';
    div.innerHTML = `
      <div class="gsi-card" role="dialog" aria-modal="true" aria-labelledby="gsi-title">
        <button class="gsi-close" aria-label="Close" type="button">&times;</button>
        <div class="gsi-head">
          <div class="gsi-brand">
            ${GOOGLE_G}
            <span class="gsi-brand-text">Sign in with Google</span>
          </div>
          <h1 class="gsi-title" id="gsi-title">Choose an account</h1>
          <p class="gsi-sub">to continue to <b>wizmath.dev</b></p>
        </div>
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
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </div>
            <div class="gsi-info">
              <div class="gsi-name">Use another account</div>
            </div>
          </div>
        </div>
        <div class="gsi-foot">
          To continue, Google will share your name, email address, and profile picture with wizmath.dev. Before using this app, you can review wizmath.dev's <a href="#" onclick="event.preventDefault()">privacy policy</a> and <a href="#" onclick="event.preventDefault()">terms of service</a>.
        </div>
      </div>
    `;
    document.body.appendChild(div);

    div.addEventListener('click', e => { if (e.target === div) closeOverlay(); });
    div.querySelector('.gsi-close').addEventListener('click', closeOverlay);
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
    if (o) o.classList.remove('open');
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
          <div class="gso-brand">
            ${GOOGLE_G}
            <span>wizmath.dev</span>
          </div>
        </div>
        <div class="gso-account">
          <img class="gso-avatar" src="${esc(user.picture)}" alt=""/>
          <h1 class="gso-hello" id="gso-title">Hi, ${esc(user.name.split(' ')[0])}!</h1>
          <p class="gso-email">${esc(user.email)}</p>
        </div>
        <div class="gso-actions">
          <button class="gso-btn" data-act="switch" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            Switch account
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
