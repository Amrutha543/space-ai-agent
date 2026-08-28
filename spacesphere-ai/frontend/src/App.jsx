import React from 'react';
import ChatWindow from './components/ChatWindow.jsx';

export default function App() {
  return (
    <div id="app">
      <BackgroundLayer />
      <header>
        <RocketMark />
        <div>
          <h1>Orbit</h1>
          <p>launch &amp; research command channel</p>
        </div>
      </header>
      <ChatWindow />
    </div>
  );
}

function RocketMark() {
  return (
    <div className="rocket-mark">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 2c2.5 2.2 4 5.6 4 9.5 0 2-.5 3.8-1.2 5.2H9.2C8.5 15.3 8 13.5 8 11.5 8 7.6 9.5 4.2 12 2z" fill="var(--text)"/>
        <circle cx="12" cy="9.5" r="1.6" fill="var(--bg)"/>
        <path d="M8 13l-3 2.5V19l3-1.5V13z" fill="var(--cyan)"/>
        <path d="M16 13l3 2.5V19l-3-1.5V13z" fill="var(--cyan)"/>
        <path className="flame" d="M10.3 16.7h3.4l-1.2 3.6c-.2.6-1 .6-1.2 0l-1-3.6z" fill="var(--accent)"/>
      </svg>
    </div>
  );
}

function BackgroundLayer() {
  return (
    <>
      <svg id="blueprint" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#8FB84A" strokeWidth="1" opacity="0.09">
          <path d="M200 40 C 240 90, 255 170, 255 300 L 255 480 L 145 480 L 145 300 C 145 170, 160 90, 200 40 Z"/>
          <line x1="200" y1="40" x2="200" y2="620" strokeDasharray="2 6"/>
          <line x1="120" y1="620" x2="280" y2="620"/>
          <path d="M145 480 L 90 590 L 90 640 L 145 560 Z"/>
          <path d="M255 480 L 310 590 L 310 640 L 255 560 Z"/>
          <path d="M175 560 L 145 660 L 175 640 Z"/>
          <path d="M225 560 L 255 660 L 225 640 Z"/>
          <circle cx="200" cy="150" r="6"/>
          <circle cx="200" cy="200" r="6"/>
        </g>
      </svg>
      <RadarCanvas />
    </>
  );
}

function RadarCanvas() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let frame;
    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function draw(t) {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(143,184,74,0.06)';
      const step = 42;
      for (let x = 0; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const cx = w * 0.12, cy = h * 0.96, radius = Math.max(w, h) * 0.55;
      const angle = (t * 0.0004) % (Math.PI * 2);
      const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      grad.addColorStop(0, 'rgba(143,184,74,0.18)');
      grad.addColorStop(1, 'rgba(143,184,74,0)');
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle - 0.35, angle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas id="stars" ref={ref} />;
}
