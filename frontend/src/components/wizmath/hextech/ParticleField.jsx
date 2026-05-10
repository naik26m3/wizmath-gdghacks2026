// Drifting, pulsing hex + diamond particles for the page backdrop.
// Pure-decorative, fixed-position, pointer-events:none. Reads vars
// from `.hx-particle` keyframes defined in index.css.

const PARTICLES = [
  { top:'8%',  left:'6%',  size:38, kind:'hex', color:'#f0bf5c', dx:'60px',  dy:'40px',  dur:'72s', pdur:'7s',  delay:'0s',   opMin:.28, opMax:.78 },
  { top:'22%', left:'88%', size:26, kind:'dia', color:'#43e2d2', dx:'-50px', dy:'30px',  dur:'58s', pdur:'5.5s',delay:'-2s',  opMin:.32, opMax:.9  },
  { top:'72%', left:'12%', size:32, kind:'dia', color:'#43e2d2', dx:'45px',  dy:'-55px', dur:'90s', pdur:'9s',  delay:'-15s', opMin:.24, opMax:.7  },
  { top:'58%', left:'82%', size:44, kind:'hex', color:'#f0bf5c', dx:'-70px', dy:'-40px', dur:'85s', pdur:'8s',  delay:'-4s',  opMin:.24, opMax:.72 },
  { top:'14%', left:'46%', size:22, kind:'dia', color:'#43e2d2', dx:'30px',  dy:'50px',  dur:'62s', pdur:'4.5s',delay:'-9s',  opMin:.36, opMax:.95 },
  { top:'86%', left:'48%', size:28, kind:'hex', color:'#f0bf5c', dx:'-40px', dy:'-30px', dur:'78s', pdur:'6.5s',delay:'-12s', opMin:.28, opMax:.8  },
  { top:'40%', left:'4%',  size:24, kind:'hex', color:'#f0bf5c', dx:'55px',  dy:'25px',  dur:'68s', pdur:'5s',  delay:'-6s',  opMin:.3,  opMax:.82 },
  { top:'46%', left:'94%', size:20, kind:'dia', color:'#43e2d2', dx:'-35px', dy:'-45px', dur:'74s', pdur:'4s',  delay:'-3s',  opMin:.36, opMax:.95 },
  { top:'30%', left:'30%', size:18, kind:'hex', color:'#f0bf5c', dx:'25px',  dy:'-35px', dur:'92s', pdur:'5.8s',delay:'-18s', opMin:.2,  opMax:.62 },
  { top:'68%', left:'62%', size:34, kind:'dia', color:'#43e2d2', dx:'-55px', dy:'40px',  dur:'82s', pdur:'7.5s',delay:'-7s',  opMin:.24, opMax:.72 },
  { top:'90%', left:'22%', size:22, kind:'hex', color:'#f0bf5c', dx:'40px',  dy:'-25px', dur:'70s', pdur:'5.2s',delay:'-11s', opMin:.28, opMax:.78 },
  { top:'4%',  left:'72%', size:30, kind:'hex', color:'#f0bf5c', dx:'-45px', dy:'35px',  dur:'88s', pdur:'8.5s',delay:'-1s',  opMin:.24, opMax:.7  },
  { top:'52%', left:'40%', size:16, kind:'dia', color:'#43e2d2', dx:'30px',  dy:'30px',  dur:'64s', pdur:'3.8s',delay:'-5s',  opMin:.36, opMax:.95 },
  { top:'78%', left:'94%', size:26, kind:'hex', color:'#f0bf5c', dx:'-35px', dy:'-45px', dur:'76s', pdur:'6.2s',delay:'-14s', opMin:.24, opMax:.72 },
  { top:'18%', left:'18%', size:20, kind:'dia', color:'#43e2d2', dx:'40px',  dy:'-30px', dur:'66s', pdur:'4.6s',delay:'-8s',  opMin:.34, opMax:.85 },
];

export default function ParticleField() {
  return (
    <div className="hx-particles" aria-hidden="true">
      {PARTICLES.map((p, i) => {
        const glow = p.color === '#43e2d2' ? 'rgba(67,226,210,.9)' : 'rgba(240,191,92,.9)';
        return (
          <div key={i} className="hx-particle" style={{
            top: p.top, left: p.left, width: p.size, height: p.size,
            ['--dx']: p.dx, ['--dy']: p.dy, ['--dur']: p.dur, ['--pdur']: p.pdur,
            ['--opMin']: p.opMin, ['--opMax']: p.opMax, ['--glow']: glow,
            animationDelay: `${p.delay}, ${p.delay}`,
          }}>
            {p.kind === 'hex' ? (
              <svg viewBox="0 0 24 24">
                <polygon points="12,1.5 22.4,7.5 22.4,16.5 12,22.5 1.6,16.5 1.6,7.5" fill="none" stroke={p.color} strokeWidth="1.8"/>
                <polygon points="12,5 19,9 19,15 12,19 5,15 5,9" fill={p.color} opacity=".5"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <polygon points="12,1.5 22.5,12 12,22.5 1.5,12" fill="none" stroke={p.color} strokeWidth="1.8"/>
                <polygon points="12,6 18,12 12,18 6,12" fill={p.color} opacity=".55"/>
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
