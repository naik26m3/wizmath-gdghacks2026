import React, { useState, useRef, useEffect } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Match Create page palette
const BG2 = '#111d26';
const BG3 = '#091428';
const BORDER = 'rgba(200,155,60,.25)';

const INITIAL_MESSAGES = [
  { role: 'ai', text: 'Ask Arcane to explain more about the activiy.' },
];

export default function AskAISidebar({ collapsed, onToggle, activity }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);
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
      const res = await fetch(`${BACKEND_URL}/api/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          activity: {
            title: activity?.title ?? '',
            description: activity?.description ?? '',
            commands: Array.isArray(activity?.commands) ? activity.commands : [],
          },
          history: messages.slice(-8),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Backend error ${res.status}`);
      }
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.answer || '(no answer)' }]);
    } catch (err) {
      console.error('Tutor failed:', err);
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message}.`, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside style={{
      borderLeft: `1px solid ${BORDER}`,
      background: BG2,
      display: 'grid',
      gridTemplateRows: collapsed ? 'auto 1fr' : 'auto 1fr auto',
      minHeight: 0,
      position: 'relative',
      transition: 'all .25s',
      overflow: 'hidden',
      height: '100%',
    }}>
      <style>{`@keyframes ask-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding: collapsed ? '14px 0' : '12px 14px', borderBottom: collapsed ? 'none' : `1px solid ${BORDER}`, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        {!collapsed && (
          <>
            <div style={{ width: 8, height: 8, borderRadius: 0, background: '#43e2d2', boxShadow: '0 0 6px #43e2d2' }}/>
            <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 14, letterSpacing: '.18em', color: '#d7e4f1' }}>
              Arcane <span style={{ color: '#43e2d2' }}>AI</span>
            </span>
          </>
        )}
        <button onClick={onToggle} style={{ marginLeft: collapsed ? 0 : 'auto', width: 24, height: 24, background: 'transparent', border: 0, cursor: 'pointer', color: '#555', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0, transition: 'color .2s, transform .25s', transform: collapsed ? 'rotate(180deg)' : 'none' }}
          onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 L15 12 L9 18"/></svg>
        </button>
      </div>

      {/* Vertical label when collapsed */}
      {collapsed && (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', writingMode:'vertical-rl', transform:'rotate(180deg)', fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:'.32em', textTransform:'uppercase', color:'#aaa', userSelect:'none', cursor:'pointer' }} onClick={onToggle}>
          Ask <span style={{ color:'#43e2d2' }}>Arcane</span>
        </div>
      )}

      {/* Messages */}
      {!collapsed && (
        <>
          <div ref={bodyRef} style={{ overflowY:'auto', padding:'12px', display:'flex', flexDirection:'column', gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ maxWidth:'95%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: 10, fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 4, color: msg.role === 'user' ? '#f0bf5c' : (msg.error ? '#e25c7a' : '#43e2d2') }}>
                  {msg.role === 'user' ? 'You' : 'Arcane'}
                </div>
                <div style={{
                  padding: '9px 12px',
                  background: msg.role === 'user'
                    ? 'rgba(240,191,92,.08)'
                    : (msg.error ? 'rgba(226,92,122,.06)' : 'rgba(67,226,210,.06)'),
                  border: `1px solid ${msg.role === 'user' ? 'rgba(200,155,60,.2)' : (msg.error ? 'rgba(226,92,122,.25)' : 'rgba(67,226,210,.15)')}`,
                  borderRadius: 0,
                  clipPath: msg.role === 'user'
                    ? 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)'
                    : 'polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                  fontSize: 13, lineHeight: '20px',
                  color: '#d7e4f1', fontFamily: 'Manrope,sans-serif',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf:'flex-start', display: 'flex', alignItems: 'center', gap: 8, color:'#43e2d2', fontSize: 12, fontFamily:'Manrope,sans-serif', opacity: 0.7 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: 0, background: '#43e2d2', animation: `ask-bounce 1s ${i*0.15}s infinite` }}/>
                  ))}
                </div>
                Arcane is thinking…
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
              placeholder="Ask Arcane…"
              style={{ flex: 1, background: BG3, border: `1px solid ${BORDER}`, borderRadius: 0, color: '#d7e4f1', padding: '9px 12px', fontFamily: 'Manrope,sans-serif', fontSize: 13, outline: 0, clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
            />
            <button onClick={send} disabled={loading} style={{ width: 38, background: 'linear-gradient(180deg,#43e2d2,#005049)', border: 0, borderRadius: 0, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#002a26" strokeWidth="2.5"><path d="M4 12 L20 4 L14 20 L12 13 Z"/></svg>
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
