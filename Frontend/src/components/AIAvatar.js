import { useEffect, useRef } from 'react';

/* ══════════════════════════════════════════════════════════
   SIRI / BIXBY-STYLE ORB AVATAR
   state: 'idle' | 'speaking' | 'listening' | 'thinking'
══════════════════════════════════════════════════════════ */
const AIAvatar = ({ state = 'idle', size = 130 }) => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const tRef      = useRef(0);

  const isSpeaking  = state === 'speaking';
  const isListening = state === 'listening';
  const isThinking  = state === 'thinking';

  const COLORS = {
    idle:      { a: '#4a5568', b: '#2d3748', c: '#718096', label: '#4a5568' },
    speaking:  { a: '#7c6af7', b: '#2dd4bf', c: '#a78bfa', label: '#a78bfa' },
    listening: { a: '#2dd4bf', b: '#06b6d4', c: '#5eead4', label: '#2dd4bf' },
    thinking:  { a: '#f59e0b', b: '#ef4444', c: '#fbbf24', label: '#f59e0b' },
  };

  const LABELS = {
    idle: '○ Ready',
    speaking: '● Speaking',
    listening: '◎ Listening',
    thinking: '◌ Thinking',
  };

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const R  = size * 0.36;
    const C  = COLORS[state];
    const N  = 8;
    const baseAngles = Array.from({ length: N }, (_, i) => (i / N) * Math.PI * 2);

    function blobPoint(i, time) {
      const angle = baseAngles[i];
      let r = R;
      if (isSpeaking) {
        r = R * (1
          + 0.22 * Math.sin(time * 2.8 + i * 0.9)
          + 0.14 * Math.cos(time * 4.1 + i * 1.7)
          + 0.08 * Math.sin(time * 6.3 + i * 2.5)
          + 0.05 * Math.cos(time * 1.2 + i * 3.1)
        );
      } else if (isListening) {
        r = R * (1
          + 0.12 * Math.sin(time * 2.0 + i * 0.7)
          + 0.07 * Math.cos(time * 3.4 + i * 1.3)
        );
      } else if (isThinking) {
        r = R * (1
          + 0.09 * Math.sin(time * 1.1 + i * 1.2)
          + 0.05 * Math.cos(time * 2.2 + i * 0.5)
          + 0.03 * Math.sin(time * 4.0 + i * 2.8)
        );
      } else {
        r = R * (1 + 0.04 * Math.sin(time * 0.8 + i * 0.6));
      }
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    }

    function drawBlob(time, colorA, colorB, alpha) {
      const pts = baseAngles.map((_, i) => blobPoint(i, time));
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const curr = pts[i];
        const next = pts[(i + 1) % N];
        const prev = pts[(i - 1 + N) % N];
        const cp1x = curr.x + (next.x - prev.x) * 0.18;
        const cp1y = curr.y + (next.y - prev.y) * 0.18;
        const cp2x = next.x - (pts[(i + 2) % N].x - curr.x) * 0.18;
        const cp2y = next.y - (pts[(i + 2) % N].y - curr.y) * 0.18;
        if (i === 0) ctx.moveTo(curr.x, curr.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
      }
      ctx.closePath();
      const grad = ctx.createRadialGradient(
        cx - R * 0.2, cy - R * 0.3, R * 0.05,
        cx, cy, R * 1.3
      );
      grad.addColorStop(0,   colorA + 'ff');
      grad.addColorStop(0.5, colorB + 'cc');
      grad.addColorStop(1,   colorA + '44');
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = grad;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function drawRings(time) {
      if (!isSpeaking && !isListening) return;
      const ringCount = isSpeaking ? 3 : 2;
      for (let r = 0; r < ringCount; r++) {
        const phase   = (time * (isSpeaking ? 1.4 : 0.9) + r * 0.6) % 1;
        const ringR   = R * (1.05 + phase * 0.9);
        const opacity = (1 - phase) * (isSpeaking ? 0.45 : 0.3);
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${hexToRgb(C.a)},${opacity})`;
        ctx.lineWidth   = isSpeaking ? 1.5 : 1;
        ctx.stroke();
      }
    }

    function drawWaveRing(time) {
      if (!isSpeaking && !isListening) return;
      const segments = 120;
      const ringR    = R * 1.22;
      const ampBase  = isSpeaking ? 14 : 7;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const amp = isSpeaking
          ? ampBase * (
              0.6 * Math.abs(Math.sin(time * 5.5 + angle * 3)) +
              0.4 * Math.abs(Math.sin(time * 3.2 + angle * 5))
            )
          : ampBase * Math.abs(Math.sin(time * 2.2 + angle * 2));
        const r = ringR + amp;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = isSpeaking
        ? `rgba(${hexToRgb(C.c)},0.5)`
        : `rgba(${hexToRgb(C.a)},0.35)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function drawInnerSheen(time) {
      const sx = cx + R * 0.25 * Math.sin(time * 0.7);
      const sy = cy - R * 0.3 + R * 0.1 * Math.cos(time * 0.5);
      const g  = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 0.5);
      g.addColorStop(0,   'rgba(255,255,255,0.18)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.06)');
      g.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    function drawThinkingOrbit(time) {
      if (!isThinking) return;
      const orbitR  = R * 1.2;
      const numDots = 3;
      for (let i = 0; i < numDots; i++) {
        const angle   = time * 1.8 + (i / numDots) * Math.PI * 2;
        const x       = cx + orbitR * Math.cos(angle);
        const y       = cy + orbitR * Math.sin(angle);
        const opacity = 0.4 + 0.6 * ((Math.sin(time * 3 + i * 2) + 1) / 2);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(C.a)},${opacity})`;
        ctx.fill();
      }
    }

    const frame = () => {
      ctx.clearRect(0, 0, size, size);
      const t = tRef.current;

      // Outer ambient glow
      const outerGlow = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 2.2);
      outerGlow.addColorStop(0,   `rgba(${hexToRgb(C.a)},0.18)`);
      outerGlow.addColorStop(0.6, `rgba(${hexToRgb(C.b)},0.07)`);
      outerGlow.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      drawRings(t);
      drawWaveRing(t);
      drawThinkingOrbit(t);

      // Back blob layer (slightly slower, offset)
      drawBlob(t * 0.85, C.b, C.a, 0.55);
      // Main blob
      drawBlob(t, C.a, C.c, 0.85);

      drawInnerSheen(t);

      tRef.current += 0.022;
      animRef.current = requestAnimationFrame(frame);
    };

    frame();
    return () => cancelAnimationFrame(animRef.current);
  }, [state, size]);

  const C = COLORS[state];

  return (
    <div style={{
      position: 'relative',
      width: size,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <canvas ref={canvasRef} />

      {/* State badge */}
      <div style={{
        marginTop: 8,
        background: isSpeaking  ? 'rgba(124,106,247,0.18)'
                  : isListening ? 'rgba(45,212,191,0.14)'
                  : isThinking  ? 'rgba(245,158,11,0.14)'
                  : 'rgba(74,85,104,0.14)',
        border: `1px solid ${
                    isSpeaking  ? 'rgba(124,106,247,0.38)'
                  : isListening ? 'rgba(45,212,191,0.32)'
                  : isThinking  ? 'rgba(245,158,11,0.28)'
                  : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 99,
        padding: '2px 10px',
        fontSize: 9,
        fontFamily: 'DM Mono, monospace',
        color: C.label,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        transition: 'all 0.4s',
      }}>
        {LABELS[state]}
      </div>
    </div>
  );
};

export default AIAvatar;