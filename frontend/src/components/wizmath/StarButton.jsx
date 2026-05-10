import React from 'react';

/**
 * Star/favorite toggle button.
 * Props:
 *   isStarred (bool) — current state
 *   count (number)   — display count
 *   onClick (fn)     — async, returns when toggle finishes
 *   size: 'sm' | 'md' (default 'md')
 *   stopPropagation (bool) — prevent parent click handler (for cards)
 */
export default function StarButton({ isStarred, count = 0, onClick, size = 'md', stopPropagation = false }) {
  const dim = size === 'sm' ? 14 : 16;
  const padY = size === 'sm' ? 5 : 7;
  const padX = size === 'sm' ? 9 : 12;
  const fontSize = size === 'sm' ? 11 : 12;
  const chamferPx = size === 'sm' ? 6 : 8;
  const clipPath = `polygon(${chamferPx}px 0, 100% 0, 100% calc(100% - ${chamferPx}px), calc(100% - ${chamferPx}px) 100%, 0 100%, 0 ${chamferPx}px)`;

  const handleClick = (e) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      title={isStarred ? 'Unstar' : 'Star this activity'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: isStarred ? 'rgba(240,191,92,.14)' : 'rgba(255,255,255,.04)',
        border: `1px solid ${isStarred ? 'rgba(240,191,92,.5)' : 'rgba(255,255,255,.12)'}`,
        borderRadius: 0,
        clipPath,
        color: isStarred ? '#f0bf5c' : '#aaa',
        padding: `${padY}px ${padX}px`,
        cursor: 'pointer',
        fontFamily: 'Space Grotesk,sans-serif',
        fontSize, fontWeight: 700,
        letterSpacing: '.04em',
        transition: 'background .15s, border-color .15s, color .15s, transform .12s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(240,191,92,.6)';
        e.currentTarget.style.color = '#f0bf5c';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isStarred ? 'rgba(240,191,92,.5)' : 'rgba(255,255,255,.12)';
        e.currentTarget.style.color = isStarred ? '#f0bf5c' : '#aaa';
      }}
    >
      <svg width={dim} height={dim} viewBox="0 0 24 24" fill={isStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <span>{count}</span>
    </button>
  );
}
