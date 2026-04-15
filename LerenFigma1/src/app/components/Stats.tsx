import { motion, useInView } from 'motion/react';
import { useId, useRef, useState, useEffect } from 'react';

/**
 * Waits one requestAnimationFrame so the browser paints the initial hidden
 * state before any entrance animation fires — prevents the pop-in on reload.
 */
function useSmooth(amount = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return { ref, go: mounted && inView };
}

/* ── Background ───────────────────────────────────────────────── */

function GridOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '52px 52px',
      }}
    />
  );
}

function ArcLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1280 640"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g opacity={0.07} stroke="#6366f1" strokeWidth={1}>
        <circle cx={1240} cy={0} r={210} />
        <circle cx={1240} cy={0} r={300} />
        <circle cx={1240} cy={0} r={390} />
      </g>
      <g opacity={0.06} stroke="#3b82f6" strokeWidth={1}>
        <circle cx={50} cy={640} r={180} />
        <circle cx={50} cy={640} r={270} />
        <circle cx={50} cy={640} r={360} />
      </g>
    </svg>
  );
}

/* ── Card 1 · 3.0× faster ────────────────────────────────────── */

function JourneyCard() {
  const { ref, go } = useSmooth(0.25);
  const traditional = ['Search', 'Re-read', 'Guess', 'Retry'];
  const leren = ['Ask', 'Guided explanation', 'Practice'];

  return (
    <div ref={ref} className="flex flex-col h-full gap-5">
      {/* Metric headline */}
      <div>
        <p style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(30px, 2.8vw, 38px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
          <span style={{ color: '#2563eb' }}>3.0×</span>
          <span style={{ color: '#2563eb' }}> faster</span>
        </p>
        <p style={{ margin: '6px 0 0', fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.015em' }}>
          to reach understanding
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b', lineHeight: 1.58 }}>
          Based on beta users completing guided concept sessions
        </p>
      </div>

      <div style={{ height: 1, background: 'rgba(15,23,42,0.06)' }} />

      {/* Traditional */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#94a3b8' }}>Traditional</span>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: '#f1f5f9', color: '#64748b', border: '1px solid rgba(15,23,42,0.07)' }}>3h+</span>
        </div>
        <div className="flex items-center">
          {traditional.map((s, i) => (
            <div key={i} className="flex items-center" style={{ flex: i < traditional.length - 1 ? 1 : 0 }}>
              <motion.div
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                initial={{ opacity: 0, scale: 0 }}
                animate={go ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.06 + i * 0.07 }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#cbd5e1', border: '1.5px solid #e2e8f0' }} />
                <span style={{ fontSize: '9.5px', color: '#94a3b8', whiteSpace: 'nowrap', fontWeight: 500 }}>{s}</span>
              </motion.div>
              {i < traditional.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={go ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.28, delay: 0.1 + i * 0.07, ease: 'easeOut' }}
                  style={{ flex: 1, height: 1.5, marginBottom: 18, transformOrigin: 'left', background: '#e2e8f0', borderRadius: 2 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leren */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#2563eb' }}>With Leren</span>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: 'rgba(37,99,235,0.08)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.18)' }}>1h</span>
        </div>
        <div className="flex items-center">
          {leren.map((s, i) => (
            <div key={i} className="flex items-center" style={{ flex: i < leren.length - 1 ? 1 : 0 }}>
              <motion.div
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                initial={{ opacity: 0, scale: 0 }}
                animate={go ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.3 + i * 0.09 }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg,#1e40af,#2563eb)', boxShadow: '0 0 0 3px rgba(37,99,235,0.12)' }} />
                <span style={{ fontSize: '9.5px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', maxWidth: 68, textAlign: 'center', lineHeight: 1.3 }}>{s}</span>
              </motion.div>
              {i < leren.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={go ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.28, delay: 0.34 + i * 0.09, ease: 'easeOut' }}
                  style={{ flex: 1, height: 2.5, marginBottom: 18, transformOrigin: 'left', background: 'linear-gradient(90deg,#2563eb,#3b82f6)', borderRadius: 2 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Card 2 · 45 % recall ────────────────────────────────────── */

function RecallCard() {
  const { ref, go } = useSmooth(0.3);
  const uid = useId().replace(/:/g, '');
  const R = 74, CX = 104, CY = 104, W = 208, H = 208;
  const C = 2 * Math.PI * R;
  const dashFilled = 0.45 * C;
  const gradId = `rg-${uid}`;
  const filterId = `rf-${uid}`;

  return (
    <div ref={ref} className="relative flex flex-col h-full min-h-[380px]">
      {/* Internal atmospheric layers */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 65% at 50% 82%, rgba(96,165,250,0.13), transparent 55%)' }} />
        <div style={{ position: 'absolute', inset: 0, filter: 'blur(22px)', background: 'radial-gradient(circle at 38% 58%, rgba(59,130,246,0.09), transparent 45%), radial-gradient(circle at 66% 76%, rgba(147,197,253,0.10), transparent 40%)' }} />
        <div style={{ position: 'absolute', bottom: '-18%', left: '50%', transform: 'translateX(-50%)', width: '130%', height: '58%', borderRadius: '50%', background: 'linear-gradient(180deg,transparent,rgba(191,219,254,0.16),rgba(255,255,255,0.05))', filter: 'blur(36px)' }} />
      </div>

      {/* Faint upward arrows */}
      <svg
        className="absolute pointer-events-none z-[1]"
        style={{ top: '38%', left: '5%', width: '19%', height: '28%', opacity: 0.2, filter: 'blur(0.35px)' }}
        viewBox="0 0 56 96" fill="none" aria-hidden
      >
        <g stroke="#60a5fa" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 78 L12 50 M12 50 L6 62 M12 50 L18 62" strokeWidth={1.1} />
          <path d="M32 84 L32 42 M32 42 L24 56 M32 42 L40 56" strokeWidth={1.3} opacity={0.82} />
        </g>
      </svg>

      {/* Header */}
      <div className="relative z-20 px-7 pt-7 pb-2 text-center shrink-0">
        <p style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '21px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.25, color: '#0f172a' }}>
          45% better recall
        </p>
        <p style={{ margin: '3px 0 0', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>after 7 days</p>
        <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.52 }}>
          Learning that sticks beyond the session
        </p>
      </div>

      {/* Donut zone */}
      <div className="relative z-10 flex flex-1 items-center justify-center py-3">
        {/* Bloom */}
        <div style={{ position: 'absolute', width: 230, height: 230, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.11) 0%, rgba(147,197,253,0.05) 42%, transparent 68%)', filter: 'blur(22px)' }} />

        <div className="relative" style={{ width: W, height: H }}>
          <svg width={W} height={H} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="55%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Outer halo */}
            <circle cx={CX} cy={CY} r={R + 9} fill="none" stroke="rgba(191,219,254,0.42)" strokeWidth={4} />
            {/* Full track */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(219,234,254,0.9)" strokeWidth={11} strokeLinecap="round" />
            {/* Progress arc */}
            <motion.circle
              cx={CX} cy={CY} r={R} fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={11}
              strokeLinecap="round"
              strokeDasharray={`${dashFilled} ${C}`}
              transform={`rotate(-90 ${CX} ${CY})`}
              filter={`url(#${filterId})`}
              initial={{ strokeDasharray: `0 ${C}` }}
              animate={go ? { strokeDasharray: `${dashFilled} ${C}` } : { strokeDasharray: `0 ${C}` }}
              transition={{ duration: 1.1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>

          {/* Centre text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={go ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.42, delay: 0.5 }}
            >
              <p style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '42px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: '#0f172a' }}>45%</p>
              <p style={{ margin: '7px auto 0', fontSize: '9.5px', color: '#94a3b8', lineHeight: 1.45, maxWidth: 110 }}>
                Compared with self-study &amp; search alone
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-20 px-7 pb-7 text-center shrink-0">
        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
          Compared with self-study &amp; search alone
        </p>
      </div>
    </div>
  );
}

/* ── Card 3 · Device illustration ────────────────────────────── */

function DeviceCard() {
  const { ref, go } = useSmooth(0.25);

  return (
    <div ref={ref} className="flex flex-col justify-between h-full gap-5">
      <div>
        <p style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.25 }}>
          Voice + screen-aware tutoring
        </p>
        <p style={{ margin: '7px 0 0', fontSize: '12.5px', color: '#64748b', lineHeight: 1.62 }}>
          Leren explains what you are looking at in real time and guides you step by step
        </p>
      </div>

      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={go ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div style={{ position: 'relative', width: 204, height: 154 }}>
          {/* Tablet */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: 'linear-gradient(148deg,#f8faff 0%,#edf2ff 100%)', border: '1.5px solid rgba(37,99,235,0.11)', boxShadow: '0 10px 36px rgba(37,99,235,0.09),0 2px 10px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
            {/* Top bar */}
            <div style={{ height: 26, background: 'rgba(240,245,255,0.95)', borderBottom: '1px solid rgba(37,99,235,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 11px' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(37,99,235,0.15)' }} />)}
              </div>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8' }}>2 / 4</span>
            </div>
            {/* Body */}
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {/* Fractions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center' }}>
                {([['1','3'],['1','4']] as [string,string][]).map(([n,d], fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    {fi > 0 && <span style={{ fontSize: '15px', fontWeight: 500, color: '#64748b' }}>+</span>}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{n}</span>
                      <div style={{ width: 14, height: 1.5, background: '#0f172a', margin: '3px 0' }} />
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{d}</span>
                    </div>
                  </div>
                ))}
                <span style={{ fontSize: '15px', fontWeight: 500, color: '#64748b' }}>=</span>
                <div style={{ width: 30, height: 1.5, background: 'rgba(37,99,235,0.28)', borderRadius: 2 }} />
              </div>
              {/* Text lines */}
              <div style={{ background: 'rgba(37,99,235,0.05)', borderRadius: 7, padding: '7px 9px', border: '1px solid rgba(37,99,235,0.08)' }}>
                <div style={{ width: '80%', height: 5, borderRadius: 3, background: 'rgba(37,99,235,0.13)', marginBottom: 5 }} />
                <div style={{ width: '56%', height: 5, borderRadius: 3, background: 'rgba(37,99,235,0.09)' }} />
              </div>
              {/* Step dots */}
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ width: i === 1 ? 16 : 5, height: 5, borderRadius: 3, background: i === 1 ? '#2563eb' : 'rgba(37,99,235,0.13)' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Mic badge */}
          <div style={{ position: 'absolute', top: -15, right: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {[4, 10, 5, 11, 3].map((h, i) => <div key={i} style={{ width: 2, height: h, borderRadius: 1, background: 'rgba(37,99,235,0.27)' }} />)}
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1px solid rgba(37,99,235,0.13)', boxShadow: '0 5px 24px rgba(37,99,235,0.18),0 2px 8px rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={15} height={17} viewBox="0 0 15 17" fill="none">
                <rect x={4.5} y={0.5} width={6} height={9} rx={3} fill="#2563eb" opacity={0.9}/>
                <path d="M1.5 8.5a6 6 0 0012 0" stroke="#2563eb" strokeWidth={1.5} strokeLinecap="round" fill="none"/>
                <line x1={7.5} y1={14.5} x2={7.5} y2={16.5} stroke="#2563eb" strokeWidth={1.5} strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {[3, 11, 5, 9, 4].map((h, i) => <div key={i} style={{ width: 2, height: h, borderRadius: 1, background: 'rgba(37,99,235,0.27)' }} />)}
            </div>
          </div>

          {/* Mic glow */}
          <div style={{ position: 'absolute', top: -22, right: 4, width: 68, height: 68, borderRadius: '50%', background: 'radial-gradient(circle,rgba(147,197,253,0.28) 0%,transparent 68%)', pointerEvents: 'none' }} />
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main section ─────────────────────────────────────────────── */

export function Stats() {
  const { ref, go } = useSmooth(0.1);

  const cards: { content: React.ReactNode; recall: boolean }[] = [
    { content: <JourneyCard />, recall: false },
    { content: <RecallCard />,  recall: true  },
    { content: <DeviceCard />,  recall: false },
  ];

  return (
    <section
      ref={ref}
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: 'linear-gradient(158deg,#f7f9ff 0%,#eef3ff 36%,#f4f8ff 66%,#f9fbff 100%)' }}
    >
      <GridOverlay />
      <ArcLines />

      {/* Bloom behind cards */}
      <div className="absolute pointer-events-none" style={{ bottom: '4%', left: '50%', transform: 'translateX(-50%)', width: '70%', height: '55%', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(59,130,246,0.08) 0%,rgba(147,197,253,0.04) 45%,transparent 68%)', filter: 'blur(50px)' }} />

      <div className="relative z-[1] max-w-5xl mx-auto">

        {/* Headline */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 18 }}
          animate={go ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 style={{ margin: '0 0 14px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.038em', lineHeight: 1.13 }}>
            Learn faster. Understand deeper.{' '}
            <span className="inline md:block">Stay in flow.</span>
          </h2>
          <p style={{ margin: 0, fontSize: '15.5px', color: '#64748b', maxWidth: 448, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.66 }}>
            Leren helps students move from confusion to confidence with voice&#8209;first, screen&#8209;aware tutoring.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map(({ content, recall }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 22 }}
              animate={go ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={{ duration: 0.52, delay: 0.05 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
              className="rounded-[32px] will-change-transform"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(15,23,42,0.055)',
                boxShadow: '0 12px 40px rgba(15,23,42,0.06),0 3px 12px rgba(15,23,42,0.04)',
                minHeight: 380,
                padding: recall ? 0 : '32px',
                overflow: recall ? 'hidden' : 'visible',
              }}
            >
              {content}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
