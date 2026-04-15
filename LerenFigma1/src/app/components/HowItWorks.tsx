import { motion, useInView } from 'motion/react';
import type { CSSProperties } from 'react';
import { useRef, useState, useEffect, useId } from 'react';

function useSmooth(amount = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return { ref, go: mounted && inView };
}

/* ── Icons (outlined, consistent stroke, premium) ─────────────── */

function MicIcon({ color }: { color: string }) {
  return (
    <svg width={20} height={24} viewBox="0 0 20 24" fill="none" aria-hidden>
      <rect x={6.5} y={1.5} width={7} height={12} rx={3.5} stroke={color} strokeWidth={1.5} />
      <path d="M2.5 11.5a7.5 7.5 0 0015 0" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={10} y1={19} x2={10} y2={23} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={6} y1={23} x2={14} y2={23} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function MonitorIcon({ color }: { color: string }) {
  return (
    <svg width={24} height={22} viewBox="0 0 24 22" fill="none" aria-hidden>
      <rect x={1.5} y={1.5} width={21} height={14} rx={2.5} stroke={color} strokeWidth={1.5} />
      <path d="M8.5 15.5v4M15.5 15.5v4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={5.5} y1={19.5} x2={18.5} y2={19.5} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={4.5} y1={6.5} x2={19.5} y2={6.5} stroke={color} strokeWidth={1.05} strokeLinecap="round" opacity={0.5} />
      <line x1={4.5} y1={10} x2={13} y2={10} stroke={color} strokeWidth={1.05} strokeLinecap="round" opacity={0.38} />
    </svg>
  );
}

function BookIcon({ color }: { color: string }) {
  return (
    <svg width={24} height={22} viewBox="0 0 24 22" fill="none" aria-hidden>
      <path
        d="M12 4.5C12 4.5 7.5 2.5 1.5 3.8L1.5 19.5C7.5 18.2 12 20.2 12 20.2C12 20.2 16.5 18.2 22.5 19.5L22.5 3.8C16.5 2.5 12 4.5 12 4.5Z"
        stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill="none"
      />
      <line x1={12} y1={4.5} x2={12} y2={20.2} stroke={color} strokeWidth={1.35} strokeLinecap="round" />
      <line x1={4.5} y1={7.5} x2={9.5} y2={6.9} stroke={color} strokeWidth={1.0} strokeLinecap="round" opacity={0.5} />
      <line x1={4.5} y1={10.8} x2={9.5} y2={10.2} stroke={color} strokeWidth={1.0} strokeLinecap="round" opacity={0.38} />
      <line x1={14.5} y1={6.9} x2={19.5} y2={7.5} stroke={color} strokeWidth={1.0} strokeLinecap="round" opacity={0.5} />
      <line x1={14.5} y1={10.2} x2={19.5} y2={10.8} stroke={color} strokeWidth={1.0} strokeLinecap="round" opacity={0.38} />
    </svg>
  );
}

/* ── Design tokens ─────────────────────────────────────────────── */

const ACCENT = '#6366f1';
const RGB    = '99,102,241';

const steps = [
  {
    num: '01',
    Icon: MicIcon,
    title: 'Speak your question',
    copy: 'Start naturally with your voice. No typing, no friction — just ask.',
  },
  {
    num: '02',
    Icon: MonitorIcon,
    title: 'Leren reads your screen',
    copy: "Share your screen when needed so Leren understands exactly what you're working on.",
  },
  {
    num: '03',
    Icon: BookIcon,
    title: 'Get step-by-step help',
    copy: 'Receive clear, structured guidance tailored to your level, with examples and follow-up support.',
  },
];

type SpineGeom = {
  w: number;
  h: number;
  spineX: number;
  ys: number[];
  cardLefts: number[];
};

/** Measured vertical spine + horizontal bridges (SVG, behind cards). */
function GlowSpine({ go, geom }: { go: boolean; geom: SpineGeom | null }) {
  const uid = useId().replace(/:/g, '');
  if (!geom || geom.ys.length < 3) return null;

  const { w, h, spineX, ys, cardLefts } = geom;
  const [y1, y2, y3] = ys;
  const pad = 36;
  const yTop = Math.max(pad, Math.min(y1, y2, y3) - 28);
  const yBot = Math.min(h - pad, Math.max(y1, y2, y3) + 28);

  const filterGlow = `hiw-spine-glow-${uid}`;
  const filterNode = `hiw-spine-node-${uid}`;
  const gradRail = `hiw-spine-rail-${uid}`;

  return (
    <svg
      className="absolute inset-0 pointer-events-none select-none hidden lg:block"
      style={{ zIndex: 0 }}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradRail} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={`rgb(${RGB})`} stopOpacity={0} />
          <stop offset="12%"  stopColor={`rgb(${RGB})`} stopOpacity={0.14} />
          <stop offset="50%"  stopColor={`rgb(${RGB})`} stopOpacity={0.22} />
          <stop offset="88%"  stopColor={`rgb(${RGB})`} stopOpacity={0.14} />
          <stop offset="100%" stopColor={`rgb(${RGB})`} stopOpacity={0} />
        </linearGradient>
        <filter id={filterGlow} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={filterNode} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Wide soft rail behind the core line */}
      <motion.line
        x1={spineX} y1={yTop} x2={spineX} y2={yBot}
        stroke={`rgba(${RGB},0.10)`}
        strokeWidth={10}
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={go ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
      />

      {/* Core vertical rail */}
      <motion.line
        x1={spineX} y1={yTop} x2={spineX} y2={yBot}
        stroke={`url(#${gradRail})`}
        strokeWidth={1.5}
        strokeLinecap="round"
        filter={`url(#${filterGlow})`}
        initial={{ opacity: 0 }}
        animate={go ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      {/* Anchor glows + horizontal bridges */}
      {[y1, y2, y3].map((cy, i) => {
        const cx = cardLefts[i] ?? w;
        const bridgeEnd = Math.max(spineX + 10, cx - 6);
        const bridgeStart = spineX + 5;
        return (
          <g key={i}>
            {/* Horizontal bridge — minimal */}
            <motion.line
              x1={bridgeStart} y1={cy} x2={bridgeEnd} y2={cy}
              stroke={`rgba(${RGB},0.18)`}
              strokeWidth={1}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={go ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.45, delay: 0.45 + i * 0.12 }}
            />
            <motion.line
              x1={bridgeStart} y1={cy} x2={bridgeEnd} y2={cy}
              stroke={`rgba(${RGB},0.35)`}
              strokeWidth={0.75}
              strokeLinecap="round"
              opacity={0.5}
              initial={{ opacity: 0 }}
              animate={go ? { opacity: 0.5 } : { opacity: 0 }}
              transition={{ duration: 0.45, delay: 0.45 + i * 0.12 }}
            />

            {/* Node outer bloom */}
            <motion.circle
              cx={spineX} cy={cy} r={14}
              fill={`rgba(${RGB},0.07)`}
              filter={`url(#${filterNode})`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={go ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.5 + i * 0.1 }}
            />
            <motion.circle
              cx={spineX} cy={cy} r={5}
              fill={`rgba(${RGB},0.14)`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={go ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 24, delay: 0.52 + i * 0.1 }}
            />
            <motion.circle
              cx={spineX} cy={cy} r={2.2}
              fill="white"
              stroke={`rgba(${RGB},0.55)`}
              strokeWidth={1}
              initial={{ scale: 0, opacity: 0 }}
              animate={go ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26, delay: 0.55 + i * 0.1 }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ── Main export ───────────────────────────────────────────────── */

export function HowItWorks() {
  const { ref: sectionRef, go } = useSmooth(0.12);

  /** Wraps spine column + cards so the SVG shares one coordinate space */
  const spineTrackRef = useRef<HTMLDivElement>(null);
  const spineColRef = useRef<HTMLDivElement>(null);
  const cardRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [geom, setGeom] = useState<SpineGeom | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');

    const measure = () => {
      const wrap = spineTrackRef.current;
      const spineCol = spineColRef.current;
      if (!wrap || !spineCol || cardRefs.some((r) => !r.current)) return;

      const t = wrap.getBoundingClientRect();
      const sc = spineCol.getBoundingClientRect();

      /* lg+ only: dedicated spine column is visible */
      if (!mq.matches || sc.width < 2) {
        setGeom(null);
        return;
      }

      const spineX = sc.left - t.left + sc.width / 2;

      const ys: number[] = [];
      const cardLefts: number[] = [];
      cardRefs.forEach((r) => {
        const rect = r.current!.getBoundingClientRect();
        ys.push(rect.top - t.top + rect.height / 2);
        cardLefts.push(rect.left - t.left);
      });

      setGeom({
        w: t.width,
        h: Math.max(t.height, 400),
        spineX,
        ys,
        cardLefts,
      });
    };

    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    if (spineTrackRef.current) ro.observe(spineTrackRef.current);
    window.addEventListener('resize', measure);
    mq.addEventListener('change', measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      mq.removeEventListener('change', measure);
    };
  }, []);

  const cardShell =
    'relative rounded-[30px] will-change-transform overflow-hidden max-w-[340px] w-full';

  const cardSurface: CSSProperties = {
    background: 'linear-gradient(180deg, #ffffff 0%, #fafbff 100%)',
    border: '1px solid rgba(125, 135, 255, 0.11)',
    boxShadow:
      '0 10px 40px rgba(99, 102, 241, 0.06), 0 2px 10px rgba(15, 23, 42, 0.035)',
  };

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative pt-24 pb-36 md:pb-40 px-6"
      style={{
        background:
          'linear-gradient(180deg, rgba(245,246,252,0.95) 0%, rgba(248,247,255,0.88) 35%, rgba(250,250,254,0.55) 72%, transparent 100%)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.028) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.028) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px',
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1280 820"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <g opacity={0.045} stroke="#6366f1" strokeWidth={0.85}>
            <circle cx={1180} cy={40} r={280} />
            <circle cx={1180} cy={40} r={400} />
            <circle cx={1180} cy={40} r={520} />
          </g>
          <g opacity={0.032} stroke="#6366f1" strokeWidth={0.75}>
            <circle cx={90} cy={820} r={260} />
            <circle cx={90} cy={820} r={380} />
          </g>
          <g stroke="#6366f1" strokeWidth={1} opacity={0.11}>
            <line x1={140} y1={100} x2={150} y2={100} />
            <line x1={145} y1={95} x2={145} y2={105} />
            <line x1={1020} y1={520} x2={1030} y2={520} />
            <line x1={1025} y1={515} x2={1025} y2={525} />
          </g>
        </svg>
        <div
          className="absolute left-[48%] top-1/2 -translate-y-1/2 w-[55%] max-w-[640px] h-[78%] rounded-full opacity-90"
          style={{
            background: `radial-gradient(ellipse, rgba(${RGB},0.07) 0%, rgba(${RGB},0.025) 45%, transparent 70%)`,
            filter: 'blur(56px)',
          }}
        />
      </div>

      <div className="relative z-[1] max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] gap-x-10 lg:gap-x-14 xl:gap-x-16 gap-y-12 lg:gap-y-0 items-start">
          {/* Left intro */}
          <motion.div
            className="lg:sticky lg:top-28 flex flex-col gap-6 max-w-[440px]"
            initial={{ opacity: 0, y: 16 }}
            animate={go ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className="tracking-[0.14em] uppercase"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: ACCENT,
              }}
            >
              How it works
            </span>

            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(2.1rem, 4vw, 3.35rem)',
                fontWeight: 800,
                color: '#0b1220',
                letterSpacing: '-0.038em',
                lineHeight: 1.08,
                margin: 0,
              }}
            >
              Three steps to{' '}
              <span
                style={{
                  background: 'linear-gradient(120deg, #4f46e5 0%, #6366f1 42%, #7c8cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                mastery
              </span>
              <span style={{ color: '#0b1220' }}>.</span>
            </h2>

            <p
              className="text-[15px] md:text-[15.5px] text-slate-500 leading-[1.72] tracking-[-0.01em]"
              style={{ fontFamily: "'Inter', sans-serif", maxWidth: '26rem', margin: 0 }}
            >
              Leren turns a natural question into guided understanding in seconds — through voice, screen context, and personalized teaching.
            </p>
          </motion.div>

          {/* Right: spine rail + cards share one measurement wrapper */}
          <div
            ref={spineTrackRef}
            className="relative min-h-[420px] min-w-0 flex flex-row gap-6 lg:gap-8 items-stretch"
          >
            <GlowSpine go={go} geom={geom} />

            {/* Spine column — between intro block and card stack */}
            <div
              ref={spineColRef}
              className="hidden lg:flex w-[52px] shrink-0 justify-center self-stretch"
              aria-hidden
            />

            <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-7 md:gap-8 pl-5 lg:pl-0">
                {steps.map((step, i) => (
                  <div key={step.num} ref={cardRefs[i]} className="flex justify-start">
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={go ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                      transition={{ duration: 0.52, delay: 0.08 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{
                        y: -2,
                        boxShadow:
                          '0 18px 48px rgba(99, 102, 241, 0.09), 0 4px 14px rgba(15, 23, 42, 0.05)',
                        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                      }}
                      className={cardShell}
                      style={cardSurface}
                    >
                      {/* Unified top hairline — all cards */}
                      <div
                        className="absolute left-4 right-4 top-0 h-px rounded-full pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, rgba(99,102,241,0.22) 20%, rgba(129,140,248,0.28) 50%, rgba(99,102,241,0.22) 80%, transparent)',
                          opacity: 0.85,
                        }}
                      />

                      <div className="relative p-7 md:p-8">
                        {/* Row 1: pill + ghost number */}
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <span
                            className="inline-flex items-center rounded-full border px-2.5 py-1"
                            style={{
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontSize: '9.5px',
                              fontWeight: 700,
                              letterSpacing: '0.11em',
                              textTransform: 'uppercase',
                              color: ACCENT,
                              background: 'rgba(99,102,241,0.06)',
                              borderColor: 'rgba(99,102,241,0.14)',
                            }}
                          >
                            Step {step.num}
                          </span>
                          <span
                            aria-hidden
                            className="select-none tabular-nums"
                            style={{
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontSize: 'clamp(3rem, 6vw, 3.5rem)',
                              fontWeight: 800,
                              letterSpacing: '-0.05em',
                              lineHeight: 0.85,
                              color: '#94a3b8',
                              opacity: 0.22,
                            }}
                          >
                            {step.num}
                          </span>
                        </div>

                        {/* Row 2: icon + title/copy */}
                        <div className="flex gap-4 md:gap-5">
                          <div
                            className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl"
                            style={{
                              background: 'linear-gradient(165deg, rgba(99,102,241,0.10) 0%, rgba(99,102,241,0.04) 100%)',
                              border: '1px solid rgba(99,102,241,0.14)',
                              boxShadow:
                                '0 0 0 1px rgba(255,255,255,0.85) inset, 0 6px 18px rgba(99,102,241,0.08)',
                            }}
                          >
                            <div
                              className="pointer-events-none absolute inset-0 rounded-2xl"
                              style={{
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.55) 0%, transparent 55%)',
                              }}
                            />
                            <step.Icon color={ACCENT} />
                          </div>

                          <div className="min-w-0 flex-1 pt-0.5">
                            <h3
                              className="mb-2 text-[16px] md:text-[17px] font-bold text-slate-900 tracking-[-0.02em] leading-snug"
                              style={{ fontFamily: "'Space Grotesk', sans-serif", margin: '0 0 8px' }}
                            >
                              {step.title}
                            </h3>
                            <p
                              className="text-[13px] md:text-[13.5px] text-slate-500 leading-relaxed"
                              style={{ fontFamily: "'Inter', sans-serif", margin: 0, lineHeight: 1.68 }}
                            >
                              {step.copy}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
            </div>

            {/* Mobile / tablet: slim vertical rail beside cards */}
            <div
              className="pointer-events-none absolute left-1 top-6 bottom-24 w-px rounded-full lg:hidden opacity-55"
              style={{
                background: `linear-gradient(180deg, transparent, rgba(${RGB},0.18) 15%, rgba(${RGB},0.26) 50%, rgba(${RGB},0.18) 85%, transparent)`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
