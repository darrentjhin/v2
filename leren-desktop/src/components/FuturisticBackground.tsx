import { useEffect, useRef } from 'react';

export function FuturisticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, t = 0;

    /* ── types ─────────────────────────────────────────────────────── */
    interface EnergyLine {
      y: number; speed: number; width: number;
      alpha: number; length: number; x: number;
    }
    interface Mote {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; life: number; max: number;
    }

    let lines: EnergyLine[] = [];
    let motes: Mote[] = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    /* ── horizon perspective grid ───────────────────────────────────── */
    const drawGrid = () => {
      const vx = W * 0.5;          // vanishing point x
      const vy = H * 0.48;         // vanishing point y (slightly above center)
      const COLS = 20;
      const ROWS = 14;
      const spread = W * 1.6;      // width of grid at bottom

      // How far the grid scrolls (creates forward-movement illusion)
      const scroll = (t * 0.4) % (H / ROWS);

      ctx.lineWidth = 0.6;

      // Vertical perspective lines
      for (let i = 0; i <= COLS; i++) {
        const bx = (W / 2) - spread / 2 + (spread / COLS) * i;
        const fade = 1 - Math.abs(i / COLS - 0.5) * 1.6;
        ctx.strokeStyle = `rgba(29,78,216,${Math.max(0, fade) * 0.25})`;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(bx, H + 20);
        ctx.stroke();
      }

      // Horizontal lines (get denser near horizon)
      for (let r = 1; r <= ROWS; r++) {
        const progress = (r / ROWS + scroll / H) % 1;
        const y = vy + (H - vy + 20) * Math.pow(progress, 1.6);
        const xLeft  = vx - (vx - (W / 2 - spread / 2)) * progress;
        const xRight = vx + ((W / 2 + spread / 2) - vx) * progress;
        const alpha  = progress * 0.3;
        ctx.strokeStyle = `rgba(37,99,235,${alpha})`;
        ctx.lineWidth = 0.5 + progress * 0.8;
        ctx.beginPath();
        ctx.moveTo(xLeft, y);
        ctx.lineTo(xRight, y);
        ctx.stroke();
      }
    };

    /* ── glow at vanishing point ────────────────────────────────────── */
    const drawCore = () => {
      const cx = W * 0.5, cy = H * 0.48;
      const pulse = 0.7 + 0.3 * Math.sin(t * 0.018);

      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 280 * pulse);
      g1.addColorStop(0,   `rgba(59,130,246,${0.18 * pulse})`);
      g1.addColorStop(0.4, `rgba(29,78,216,${0.08 * pulse})`);
      g1.addColorStop(1,   'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      // Bright core dot
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * pulse);
      g2.addColorStop(0,   `rgba(147,197,253,${0.55 * pulse})`);
      g2.addColorStop(0.3, `rgba(59,130,246,${0.2 * pulse})`);
      g2.addColorStop(1,   'transparent');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(cx, cy, 60 * pulse, 0, Math.PI * 2);
      ctx.fill();
    };

    /* ── horizontal energy streaks ──────────────────────────────────── */
    const spawnLine = () => {
      if (lines.length < 14) {
        lines.push({
          y: H * 0.1 + Math.random() * H * 0.8,
          x: -200,
          speed: 1.5 + Math.random() * 3.5,
          width: 0.6 + Math.random() * 1.2,
          alpha: 0.3 + Math.random() * 0.5,
          length: 80 + Math.random() * 200,
        });
      }
    };

    const drawLines = () => {
      lines = lines.filter(l => l.x - l.length < W + 50);
      lines.forEach(l => {
        const g = ctx.createLinearGradient(l.x - l.length, 0, l.x, 0);
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.7, `rgba(59,130,246,${l.alpha * 0.4})`);
        g.addColorStop(1,   `rgba(147,197,253,${l.alpha})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = l.width;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(l.x - l.length, l.y);
        ctx.lineTo(l.x, l.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
        l.x += l.speed;
      });
    };

    /* ── floating motes ─────────────────────────────────────────────── */
    const spawnMote = () => {
      if (motes.length < 50) {
        motes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -0.1 - Math.random() * 0.3,
          r: 0.8 + Math.random() * 1.6,
          alpha: 0.3 + Math.random() * 0.4,
          life: 0, max: 180 + Math.random() * 240,
        });
      }
    };

    const drawMotes = () => {
      motes = motes.filter(m => m.life < m.max);
      motes.forEach(m => {
        const a = m.alpha * Math.sin((m.life / m.max) * Math.PI);
        ctx.fillStyle = `rgba(96,165,250,${a})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
        m.x += m.vx; m.y += m.vy; m.life++;
      });
    };

    /* ── top-edge scanline ──────────────────────────────────────────── */
    const drawScan = () => {
      const y = (t * 0.5) % H;
      const g = ctx.createLinearGradient(0, y - 30, 0, y + 2);
      g.addColorStop(0, 'transparent');
      g.addColorStop(1, 'rgba(59,130,246,0.035)');
      ctx.fillStyle = g;
      ctx.fillRect(0, y - 30, W, 32);
    };

    /* ── corner vignette ────────────────────────────────────────────── */
    const drawVignette = () => {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.9);
      g.addColorStop(0, 'transparent');
      g.addColorStop(1, 'rgba(0,5,20,0.65)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    /* ── main loop ──────────────────────────────────────────────────── */
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#000d1a';
      ctx.fillRect(0, 0, W, H);

      drawGrid();
      drawCore();
      drawLines();
      drawMotes();
      drawScan();
      drawVignette();

      if (Math.random() < 0.05) spawnLine();
      if (Math.random() < 0.08) spawnMote();

      t++;
      rafRef.current = requestAnimationFrame(frame);
    };

    window.addEventListener('resize', resize);
    resize();
    frame();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
