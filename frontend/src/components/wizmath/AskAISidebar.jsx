import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const INITIAL_MESSAGES = [
  { role: 'ai', text: 'Greetings, apprentice. Plot a function on the canvas, or ask me anything about the spell of mathematics.' },
];

export default function AskAISidebar({ collapsed, onToggle }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Oracle, a wise math tutor for WizMath. Answer concisely and helpfully. User asks: ${text}`,
    });
    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  return (
    <aside style={{
      borderLeft: '1px solid rgba(200,155,60,.25)',
      background: 'linear-gradient(180deg,#091428,#010A13)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      position: 'relative',
      transition: 'all .25s',
      overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:1, background:'linear-gradient(180deg,transparent,rgba(240,191,92,.5) 30%,transparent 70%)' }} />

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding: collapsed ? '14px 0' : '18px 22px', borderBottom:'1px solid rgba(200,155,60,.10)', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        {!collapsed && (
          <>
            <div style={{ width:22, height:22, background:'linear-gradient(135deg,#43e2d2,#005049)', clipPath:'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)', boxShadow:'0 0 14px rgba(67,226,210,.5)' }} />
            <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:'.18em', textTransform:'uppercase', color:'#d7e4f1' }}>
              Ask <span style={{ color:'#43e2d2' }}>AI</span>
            </span>
          </>
        )}
        <button onClick={onToggle} style={{ marginLeft: collapsed ? 0 : 'auto', width:28, height:28, background:'transparent', border:0, cursor:'pointer', color:'#d2c5b1', display:'inline-flex', alignItems:'center', justifyContent:'center', transition:'color .2s, transform .25s', transform: collapsed ? 'rotate(180deg)' : 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 L15 12 L9 18"/></svg>
        </button>
      </div>

      {/* Vertical label when collapsed */}
      {collapsed && (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', writingMode:'vertical-rl', transform:'rotate(180deg)', fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:'.32em', textTransform:'uppercase', color:'#d2c5b1', userSelect:'none', cursor:'pointer' }} onClick={onToggle}>
          Ask <span style={{ color:'#43e2d2', marginLeft:4 }}>AI</span>
        </div>
      )}

      {/* Messages */}
      {!collapsed && (
        <>
          <div ref={bodyRef} style={{ flex:1, minHeight:0, overflowY:'auto', padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                maxWidth:'86%',
                padding:'12px 14px',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user'
                  ? 'linear-gradient(180deg,rgba(240,191,92,.14),rgba(200,155,60,.06))'
                  : 'linear-gradient(180deg,rgba(67,226,210,.10),rgba(0,80,73,.18))',
                border: `1px solid ${msg.role === 'user' ? 'rgba(200,155,60,.25)' : 'rgba(67,226,210,.25)'}`,
                clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)',
                fontFamily: 'Manrope,sans-serif',
                fontSize: 14,
                lineHeight: '22px',
                color: '#d7e4f1',
              }}>
                <span style={{ display:'block', fontFamily:'Space Grotesk,sans-serif', fontSize:10, fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6, color: msg.role === 'user' ? '#f0bf5c' : '#43e2d2' }}>
                  {msg.role === 'user' ? 'You' : 'Oracle'}
                </span>
                <p style={{ margin:0 }}>{msg.text}</p>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf:'flex-start', color:'#43e2d2', fontSize:13, fontFamily:'Manrope,sans-serif', opacity:0.7 }}>Oracle is thinking…</div>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'stretch', gap:8, padding:'14px 16px 18px', borderTop:'1px solid rgba(200,155,60,.10)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask the Oracle…"
              style={{ flex:1, background:'linear-gradient(180deg,#111d26,#091428)', border:'1px solid rgba(200,155,60,.25)', color:'#d7e4f1', padding:'12px 14px', fontFamily:'Manrope,sans-serif', fontSize:14, outline:0, clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}
            />
            <button onClick={send} style={{ width:44, background:'linear-gradient(180deg,#43e2d2,#00c6b7 60%,#005049)', color:'#002a26', border:0, cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)', boxShadow:'0 0 18px rgba(67,226,210,.25)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12 L20 4 L14 20 L12 13 Z"/></svg>
            </button>
          </div>
        </>
      )}
    </aside>
  );
}