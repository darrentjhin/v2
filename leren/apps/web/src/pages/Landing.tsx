import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FuturisticBackground } from '@/components/FuturisticBackground';
import { LANGUAGES, getT } from '@/lib/landingTranslations';
import { api } from '@/lib/api';

const FEATURE_ICONS = ['▣', '◎', '✦', '⊕', '↗', '⊞'];
const SCROLL_WORDS = ['Learn', 'Practice', 'Summarize'];

/* ── Animated counter that starts when scrolled into view ─────────────── */
function CountUp({ target, suffix = '', prefix = '', duration = 1600 }: {
  target: number; suffix?: string; prefix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setCount(Math.round(eased * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

/* ── Radial tick-gauge with animated count-up ────────────────────────── */
function RadialGauge({ countTo, suffix, label, duration = 2000 }: {
  countTo: number; suffix: string; label: string; duration?: number;
}) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayNum, setDisplayNum] = useState(0);
  const started = useRef(false);

  const SIZE   = 240;
  const TICKS  = 72;
  const INNER  = 82;
  const OUTER  = 106;

  /* draw ticks where progress ∈ [0,1] */
  const drawTicks = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const cx = SIZE / 2, cy = SIZE / 2;
    ctx.clearRect(0, 0, SIZE * dpr, SIZE * dpr);

    const filled = Math.round(progress * TICKS);

    for (let i = 0; i < TICKS; i++) {
      const angle = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      const isFilled = i < filled;

      ctx.beginPath();
      ctx.moveTo(cx + cos * (isFilled ? INNER : INNER + 4), cy + sin * (isFilled ? INNER : INNER + 4));
      ctx.lineTo(cx + cos * OUTER, cy + sin * OUTER);

      if (isFilled) {
        /* light sky-blue (start) → royal blue → deep navy (end) */
        const t = i / TICKS;          // 0 = first tick, 1 = last tick
        const r = Math.round(186 - 156 * t);  // 186 → 30
        const g = Math.round(230 - 172 * t);  // 230 → 58
        const b = Math.round(255 - 117 * t);  // 255 → 138
        ctx.strokeStyle = `rgba(${r},${g},${b},0.95)`;
        ctx.lineWidth = 3.5;
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 2;
      }
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  };

  /* set up canvas DPR scaling once on mount */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width  = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    canvas.getContext('2d')!.scale(dpr, dpr);
    drawTicks(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* trigger animation when scrolled into view */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let raf = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          drawTicks(eased);
          setDisplayNum(Math.round(eased * countTo));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    observer.observe(container);
    return () => { observer.disconnect(); cancelAnimationFrame(raf); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countTo, duration]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold text-white leading-none">
            {displayNum}{suffix}
          </span>
        </div>
      </div>
      <p className="text-slate-300 font-semibold text-center">{label}</p>
    </div>
  );
}

/* ── Animated bar chart — "3× Increase in Understanding" ─────────────── */
function UnderstandingChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const started = useRef(false);

  const DURATION = 1600;
  const bars = [
    { label: 'Traditional', value: 33, color: 'rgba(100,116,139,0.7)', glow: 'rgba(100,116,139,0.2)' },
    { label: 'With Leren',  value: 100, color: 'rgba(59,130,246,1)',   glow: 'rgba(59,130,246,0.35)' },
  ];
  const MAX_H = 140;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / DURATION, 1);
          setProgress(1 - Math.pow(1 - p, 3));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 w-full">
      {/* Chart */}
      <div className="flex items-end justify-center gap-10 w-full px-4" style={{ height: MAX_H + 36 }}>
        {bars.map((bar) => {
          const h = Math.round((bar.value / 100) * MAX_H * progress);
          const displayVal = bar.label === 'With Leren'
            ? `3×`
            : `1×`;
          return (
            <div key={bar.label} className="flex flex-col items-center gap-2">
              {/* Value label above bar */}
              <span className="text-sm font-bold transition-opacity duration-300"
                    style={{ color: bar.color, opacity: progress > 0.15 ? 1 : 0 }}>
                {displayVal}
              </span>
              {/* Bar */}
              <div
                style={{
                  width: 52,
                  height: h,
                  background: bar.label === 'With Leren'
                    ? `linear-gradient(to top, #1d4ed8, #3b82f6, #93c5fd)`
                    : bar.color,
                  boxShadow: progress > 0.3 ? `0 0 18px 2px ${bar.glow}` : 'none',
                  borderRadius: '8px 8px 4px 4px',
                  transition: 'box-shadow 0.4s ease',
                }}
              />
              {/* X-axis label */}
              <span className="text-xs text-slate-400 text-center leading-tight w-16">
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Y-axis hint */}
      <p className="text-xs text-slate-500 tracking-wide">Comprehension speed</p>
      <p className="text-slate-300 font-semibold text-center">3× Increase in Understanding</p>
    </div>
  );
}

/* ── Single "How it works" step with scroll-reveal ───────────────────── */
/* ── Fancy step card ──────────────────────────────────────────────────── */
function StepCard({ num, title, desc, index, visible }: {
  num: string; title: string; desc: string; index: number; visible: boolean;
}) {
  const d = index * 0.18;
  return (
    <div
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0) scale(1)' : 'translateY(64px) scale(0.88)',
        filter:     visible ? 'blur(0px)' : 'blur(6px)',
        transition: [
          `opacity 0.75s ease ${d}s`,
          `transform 0.8s cubic-bezier(0.34,1.45,0.64,1) ${d}s`,
          `filter 0.6s ease ${d}s`,
        ].join(', '),
      }}
      className="relative group overflow-hidden rounded-xl border border-slate-700/50
                 bg-slate-900/70 p-5 hover:border-blue-500/50
                 hover:shadow-[0_0_45px_rgba(59,130,246,0.13)]
                 transition-all duration-500 cursor-default"
    >
      {/* Hover ambient glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600/8 via-transparent
                      to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700
                      pointer-events-none" />

      {/* Giant decorative watermark number */}
      <div
        className="absolute -right-1 -top-2 text-[72px] font-black leading-none
                   select-none pointer-events-none"
        style={{
          color:      visible ? 'rgba(59,130,246,0.07)' : 'transparent',
          transition: `color 0.9s ease ${d + 0.25}s`,
        }}
      >
        {num}
      </div>

      {/* Step bubble — spring-bounces in */}
      <div
        style={{
          transform:  visible ? 'scale(1)' : 'scale(0)',
          transition: `transform 0.65s cubic-bezier(0.34,1.9,0.64,1) ${d + 0.15}s`,
          boxShadow:  visible ? '0 0 22px rgba(59,130,246,0.45)' : 'none',
        }}
        className="w-10 h-10 rounded-full bg-blue-950 border-2 border-blue-400/60
                   flex items-center justify-center text-blue-300 font-extrabold text-base mb-4"
      >
        {num}
      </div>

      {/* Title slides in from left */}
      <h3
        style={{
          opacity:    visible ? 1 : 0,
          transform:  visible ? 'translateX(0)' : 'translateX(-16px)',
          transition: `opacity 0.5s ease ${d + 0.3}s, transform 0.5s ease ${d + 0.3}s`,
        }}
        className="font-bold text-lg text-white mb-2"
      >
        {title}
      </h3>

      {/* Description fades in */}
      <p
        style={{
          opacity:    visible ? 1 : 0,
          transition: `opacity 0.5s ease ${d + 0.45}s`,
        }}
        className="text-slate-400 text-xs leading-relaxed"
      >
        {desc}
      </p>

      {/* Bottom accent line draws across */}
      <div
        style={{
          width:      visible ? '60%' : '0%',
          transition: `width 0.9s cubic-bezier(0.16,1,0.3,1) ${d + 0.35}s`,
        }}
        className="absolute bottom-0 left-0 h-[2px]
                   bg-gradient-to-r from-blue-500/70 via-blue-400/40 to-transparent"
      />

      {/* One-shot light sweep on reveal */}
      <div
        style={{
          transform:  visible ? 'translateX(350%)' : 'translateX(-100%)',
          transition: `transform 0.7s ease ${d + 0.1}s`,
        }}
        className="absolute inset-0 w-1/3 skew-x-[-20deg] pointer-events-none
                   bg-gradient-to-r from-transparent via-blue-400/6 to-transparent"
      />
    </div>
  );
}

function FancySteps({ steps }: { steps: { num: string; title: string; desc: string }[] }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto">
      {steps.map(({ num, title, desc }, i) => (
        <div key={num} className="relative">
          <StepCard num={num} title={title} desc={desc} index={i} visible={visible} />
          {i < steps.length - 1 && (
            <div
              style={{ opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.18 + 0.7}s` }}
              className="hidden md:flex absolute -right-4 top-[38%] z-10 text-blue-500/50 text-xl
                         select-none pointer-events-none"
            >
              →
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Blue sweep text ─────────────────────────────────────────────────── */
function BlueFadeText({ text }: { text: string }) {
  return (
    <span className="blue-sweep-text">{text}</span>
  );
}

function ScrollWord() {
  const [index, setIndex]   = useState(0);
  const [phase, setPhase]   = useState<'visible' | 'exit' | 'enter'>('visible');

  useEffect(() => {
    const visible = 1100;
    const transition = 380;

    const cycle = () => {
      setPhase('exit');
      setTimeout(() => {
        setIndex(i => (i + 1) % SCROLL_WORDS.length);
        setPhase('enter');
        setTimeout(() => setPhase('visible'), transition);
      }, transition);
    };

    const id = setInterval(cycle, visible + transition * 2);
    return () => clearInterval(id);
  }, []);

  const base: React.CSSProperties = {
    display: 'inline-block',
    transition: 'opacity 380ms cubic-bezier(0.4,0,0.2,1), filter 380ms cubic-bezier(0.4,0,0.2,1), transform 380ms cubic-bezier(0.4,0,0.2,1)',
  };

  const styles: Record<string, React.CSSProperties> = {
    visible: { opacity: 1,   filter: 'blur(0px)',  transform: 'translateY(0)' },
    exit:    { opacity: 0,   filter: 'blur(6px)',  transform: 'translateY(-8px)' },
    enter:   { opacity: 0,   filter: 'blur(6px)',  transform: 'translateY(8px)' },
  };

  return (
    <span style={{ ...base, ...styles[phase] }} className="gradient-text">
      {SCROLL_WORDS[index]}
    </span>
  );
}

/* ── Per-feature colour themes — all in blue / dark-blue palette ─────── */
const FEAT_THEMES = [
  { color: '#60a5fa', glow: 'rgba(96,165,250,0.38)',  bg: 'rgba(96,165,250,0.07)'  },  // sky blue
  { color: '#3b82f6', glow: 'rgba(59,130,246,0.38)',  bg: 'rgba(59,130,246,0.07)'  },  // blue
  { color: '#93c5fd', glow: 'rgba(147,197,253,0.35)', bg: 'rgba(147,197,253,0.06)' },  // light blue
  { color: '#1d4ed8', glow: 'rgba(29,78,216,0.45)',   bg: 'rgba(29,78,216,0.09)'   },  // dark blue
  { color: '#38bdf8', glow: 'rgba(56,189,248,0.38)',  bg: 'rgba(56,189,248,0.07)'  },  // light sky
  { color: '#1e40af', glow: 'rgba(30,64,175,0.5)',    bg: 'rgba(30,64,175,0.1)'    },  // navy
];

/* Inline SVG icons — strokeWidth="2" for bold, consistent weight */
const FEAT_SVGS = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="11" y2="9"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><path d="M2 20h20"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
];

/* Rotation speeds — each card slightly different so they feel independent */
const BORDER_SPEEDS = [5, 6.5, 4.5, 7, 5.5, 6];

function FancyFeatureCard({ svg, title, desc, index, themeIdx, visible }: {
  svg: React.ReactNode; title: string; desc: string;
  index: number; themeIdx: number; visible: boolean;
}) {
  const th = FEAT_THEMES[themeIdx];
  const d  = index * 0.09;

  return (
    /* Outer wrapper: clips the spinning gradient ring to the card shape */
    <div
      className="relative rounded-2xl overflow-hidden cursor-default group
                 hover:-translate-y-1.5 hover:scale-[1.025]
                 transition-[transform,box-shadow] duration-300"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(52px) scale(0.91)',
        filter:    visible ? 'blur(0)' : 'blur(5px)',
        transition: [
          `opacity 0.7s ease ${d}s`,
          `transform 0.75s cubic-bezier(0.34,1.35,0.64,1) ${d}s`,
          `filter 0.55s ease ${d}s`,
        ].join(', '),
        border: `1px solid ${th.color}26`,
        boxShadow: `0 0 0 0 ${th.glow}`,
        animation: `feat-border-pulse-${themeIdx} ${2.5 + index * 0.3}s ease-in-out infinite`,
      }}
    >
      {/* ── Card ── */}
      <div
        className="relative z-10 rounded-2xl p-6 h-full overflow-hidden"
        style={{ background: '#030d1f' }}
      >
        {/* Icon */}
        <div
          className="w-[44px] h-[44px] rounded-xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(255,255,255,0.04)', color: th.color }}
        >
          <span className="w-[24px] h-[24px] block">{svg}</span>
        </div>

        {/* Title */}
        <h3
          style={{
            opacity:   visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(-12px)',
            transition: `opacity 0.45s ease ${d + 0.28}s, transform 0.45s ease ${d + 0.28}s`,
          }}
          className="font-bold text-[1.05rem] text-slate-100 mb-2"
        >
          {title}
        </h3>

        {/* Description */}
        <p
          style={{ opacity: visible ? 1 : 0, transition: `opacity 0.45s ease ${d + 0.42}s` }}
          className="text-slate-400 text-sm leading-relaxed"
        >
          {desc}
        </p>

        {/* One-shot shimmer sweep on reveal */}
        <div
          style={{
            transform:  visible ? 'translateX(400%)' : 'translateX(-120%)',
            transition: `transform 0.75s ease ${d + 0.1}s`,
          }}
          className="absolute inset-0 w-1/4 skew-x-[-18deg] pointer-events-none
                     bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
        />
      </div>
    </div>
  );
}

function FancyFeatures({ features }: {
  features: { icon: string; title: string; desc: string }[];
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {features.map((f, i) => (
        <FancyFeatureCard
          key={i}
          svg={FEAT_SVGS[i]}
          title={f.title}
          desc={f.desc}
          index={i}
          themeIdx={i}
          visible={visible}
        />
      ))}
    </div>
  );
}

/* ── FAQ accordion ───────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'How does Leren see my screen?',
    a: 'When you start a session, Leren requests screen-share permission via your browser. It captures a snapshot of your screen only when you ask a question — nothing is recorded continuously.',
  },
  {
    q: 'What subjects does Leren support?',
    a: 'Leren works across all subjects — maths, sciences, languages, history, coding, law, and more. If you can ask a question about it, Leren can help.',
  },
  {
    q: 'Can I cancel my Pro subscription anytime?',
    a: 'Yes. You can cancel at any time from your account settings. Your Pro access continues until the end of the current billing period with no extra charges.',
  },
  {
    q: 'Is my conversation data stored?',
    a: 'By default, session history is stored so you can review your past explanations and notes. You can disable this at any time in Settings → Privacy.',
  },
  {
    q: 'What is the difference between monthly and annual billing?',
    a: 'Both plans give you identical Pro features. Choosing annual billing simply pays for 12 months upfront and saves you 20% — equivalent to getting over 2 months free.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-800/70 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left
                   text-slate-200 font-medium hover:bg-slate-800/30 transition-colors duration-200"
      >
        <span>{q}</span>
        <span
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
          className="text-blue-400 text-xl shrink-0 leading-none"
        >+</span>
      </button>
      <div
        style={{
          maxHeight: open ? '200px' : '0px',
          opacity: open ? 1 : 0,
          transition: 'max-height 0.35s ease, opacity 0.25s ease',
          overflow: 'hidden',
        }}
      >
        <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ── Pricing section with billing toggle ─────────────────────────────── */
function PricingSection({ t, ctaTo }: { t: ReturnType<typeof getT>; ctaTo: string }) {
  const [annual, setAnnual] = useState(false);
  const monthlyPrice = 20;
  const annualPrice  = Math.round(monthlyPrice * 0.8);

  return (
    <section className="max-w-5xl mx-auto px-6 py-20 border-t border-slate-800">
      <h2 className="text-3xl font-bold text-center mb-3">{t.pricingTitle}</h2>
      <p className="text-slate-400 text-center mb-8">{t.pricingSub}</p>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm ${!annual ? 'text-white' : 'text-slate-500'} transition-colors`}>Monthly</span>
        <button
          onClick={() => setAnnual(a => !a)}
          className="relative w-12 h-6 rounded-full border border-blue-500/40 bg-slate-800
                     transition-colors duration-200"
          style={{ background: annual ? 'rgba(59,130,246,0.3)' : undefined }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-blue-400 shadow transition-transform duration-200"
            style={{ transform: annual ? 'translateX(24px)' : 'translateX(0)' }}
          />
        </button>
        <span className={`text-sm ${annual ? 'text-white' : 'text-slate-500'} transition-colors`}>
          Annual
        </span>
        <span className="text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30
                         rounded-full px-2 py-0.5 font-medium">
          Save 20%
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* Starter */}
        <div className="card card-lift flex flex-col">
          <div className="font-bold text-lg mb-1">Starter</div>
          <div className="text-4xl font-extrabold mb-1">Free</div>
          <p className="text-slate-500 text-xs mb-5">Forever free</p>
          <ul className="text-slate-400 text-sm space-y-2 flex-1 mb-6">
            {[t.free1, t.free2, t.free3, t.free4].map(f => (
              <li key={f} className="flex items-center gap-2"><span className="text-blue-400/70">+</span>{f}</li>
            ))}
          </ul>
          <Link to="/register" className="btn-secondary justify-center rounded-full">{t.getStarted}</Link>
        </div>

        {/* Pro */}
        <div className="card card-lift flex flex-col relative overflow-hidden border-blue-600/60">
          <div className="absolute inset-0 rounded-xl pointer-events-none"
               style={{ boxShadow: '0 0 30px rgba(59,130,246,0.18), inset 0 0 20px rgba(59,130,246,0.05)' }} />
          <div className="font-bold text-lg mb-1 flex items-center gap-2">
            {t.proPlan} <span className="badge bg-blue-600/30 text-blue-300 shimmer">{t.popular}</span>
          </div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-extrabold gradient-text">
              ${annual ? annualPrice : monthlyPrice}
            </span>
            <span className="text-base text-slate-400 mb-1">/mo</span>
          </div>
          <p className="text-slate-500 text-xs mb-5">
            {annual
              ? `$${annualPrice * 12} billed annually · 2+ months free`
              : 'Billed monthly'}
          </p>
          <ul className="text-slate-400 text-sm space-y-2 flex-1 mb-6">
            {[t.pro1, t.pro2, t.pro3, t.pro4, t.pro5, t.pro6].map(f => (
              <li key={f} className="flex items-center gap-2"><span className="text-blue-400">+</span>{f}</li>
            ))}
          </ul>
          <Link to="/register" className="btn-glow !rounded-full justify-center text-center">
            <span className="comet-blur" />Subscribe
          </Link>
        </div>

        {/* Enterprise */}
        <div className="card card-lift flex flex-col relative overflow-hidden border-slate-600/40"
             style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(2,8,23,0.95) 100%)' }}>
          <div className="absolute inset-0 rounded-xl pointer-events-none"
               style={{ boxShadow: 'inset 0 0 40px rgba(148,163,184,0.03)' }} />
          <div className="font-bold text-lg mb-1 flex items-center gap-2">
            Enterprise
            <span className="badge bg-slate-700/60 text-slate-300 text-xs px-2 py-0.5 rounded-full border border-slate-600/40">
              Custom
            </span>
          </div>
          <p className="text-slate-500 text-xs mb-5">Volume pricing available</p>
          <ul className="text-slate-400 text-sm space-y-2 flex-1 mb-6">
            {['Everything in Pro', 'Unlimited seats', 'SSO & admin dashboard',
              'Custom AI model tuning', 'SLA & priority support', 'Dedicated onboarding',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-slate-500">+</span>{f}
              </li>
            ))}
          </ul>
          <a href="mailto:sales@leren.ai"
             className="btn-secondary justify-center rounded-full border-slate-600/60
                        hover:border-slate-400/60 hover:text-slate-200">
            Contact Sales
          </a>
        </div>

      </div>

      {/* FAQ */}
      <div className="mt-20">
        <h3 className="text-2xl font-bold text-center mb-8 text-white">Frequently Asked Questions</h3>
        <div className="flex flex-col gap-3 max-w-3xl mx-auto">
          {FAQS.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Contact us section ─────────────────────────────────────────────────────── */
// Uses Formspree (https://formspree.io) — free, no backend needed.
// To activate: sign up at formspree.io, create a form pointed at lerenai.cs@gmail.com,
// then replace FORMSPREE_FORM_ID below with your form's ID (e.g. "xpwzgkla").
const FORMSPREE_FORM_ID = 'mnjgvoov';

function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const MAX_WORDS = 250;

  const handleMessageChange = (value: string) => {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length > MAX_WORDS) {
      setMessage(parts.slice(0, MAX_WORDS).join(' '));
      setWordCount(MAX_WORDS);
    } else {
      setMessage(value);
      setWordCount(parts.length);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const words = message.trim().split(/\s+/).filter(Boolean).length;
    if (words === 0) { setStatus({ ok: false, text: 'Please enter a message.' }); return; }
    if (words > MAX_WORDS) { setStatus({ ok: false, text: 'Message must be 250 words or fewer.' }); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatus({ ok: true, text: "Thanks! We've received your message and will reply soon." });
        setName(''); setEmail(''); setMessage(''); setWordCount(0);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus({ ok: false, text: data?.errors?.[0]?.message ?? 'Something went wrong. Please try again.' });
      }
    } catch {
      setStatus({ ok: false, text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-6 pb-20">
      <div className="card bg-slate-900/40 border-slate-800/70 backdrop-blur-sm text-left">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-1">Contact Us</h2>
          <p className="text-slate-400 text-sm">
            Have a question or feedback? Send us a message and we&apos;ll reply by email.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm
                           text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm
                           text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-400">
                Message
              </label>
              <span className="text-[11px] text-slate-500">
                {wordCount}/{MAX_WORDS} words
              </span>
            </div>
            <textarea
              value={message}
              onChange={e => handleMessageChange(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm
                         text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500
                         resize-none"
              placeholder="Write your message here (max 250 words)…"
              required
            />
          </div>
          {status && (
            <p className={`text-xs ${status.ok ? 'text-green-400' : 'text-red-400'}`}>
              {status.text}
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="btn-secondary rounded-full px-5 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending…' : 'Contact Us'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const ctaTo = user ? '/app/live' : '/register';
  const [lang, setLang] = useState('en');
  const t = getT(lang);
  const isRtl = lang === 'ar';
  const textDir = isRtl ? 'rtl' : 'ltr';

  const features = [
    { icon: FEATURE_ICONS[0], title: t.feat1Title, desc: t.feat1Desc },
    { icon: FEATURE_ICONS[1], title: t.feat2Title, desc: t.feat2Desc },
    { icon: FEATURE_ICONS[2], title: t.feat3Title, desc: t.feat3Desc },
    { icon: FEATURE_ICONS[3], title: t.feat4Title, desc: t.feat4Desc },
    { icon: FEATURE_ICONS[4], title: t.feat5Title, desc: t.feat5Desc },
    { icon: FEATURE_ICONS[5], title: t.feat6Title, desc: t.feat6Desc },
  ];

  const steps = [
    { num: '01', title: t.step1Title, desc: t.step1Desc },
    { num: '02', title: t.step2Title, desc: t.step2Desc },
    { num: '03', title: t.step3Title, desc: t.step3Desc },
  ];

  return (
    <div className="min-h-screen bg-[#000d1a] text-slate-100 overflow-x-hidden" dir="ltr">
      <FuturisticBackground />

      <div className="relative z-10">

        {/* Header */}
        <header className="flex items-center justify-end max-w-6xl mx-auto px-6 py-5">
          <nav className="flex items-center gap-5 mr-12">
            {/* Language selector */}
            <div className="relative shrink-0">
              {/* Visible label: name + big flag */}
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm text-slate-300" style={{ isolation: 'isolate' }}>
                {LANGUAGES.find(l => l.code === lang)?.label}
                <span style={{ fontSize: '1.4em', lineHeight: 1, display: 'inline-block', transform: 'translateZ(0)', imageRendering: 'crisp-edges' }}>
                  {LANGUAGES.find(l => l.code === lang)?.flag}
                </span>
              </span>
              {/* Native select is transparent — only used for interaction */}
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="appearance-none bg-slate-800 border border-slate-700/60 rounded-full text-sm text-transparent px-3 py-2 pr-7 cursor-pointer focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors"
                style={{ minWidth: '9rem' }}
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">{l.label} {l.flag}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">▾</span>
            </div>

            <Link to="/download" className="btn-secondary rounded-full whitespace-nowrap shrink-0">Download</Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="relative max-w-4xl mx-auto px-6 pt-6 pb-28 text-center" dir={textDir}>
          <Link to="/" className="fade-up flex justify-center mb-5" style={{ animationDelay: '0.05s' }}>
            <img src="/logo.png" alt="Leren" className="w-auto object-contain" style={{ height: '165px' }} />
          </Link>
          <div className="fade-up shimmer inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-6" style={{ animationDelay: '0.1s' }}>
            {t.heroBadge}
          </div>

          <h1 className="fade-up text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6" style={{ animationDelay: '0.2s' }}>
            <ScrollWord />
            <br />
            <BlueFadeText text="With Your Personal AI Tutor" />
          </h1>

          <p className="fade-up text-xl text-slate-400 max-w-2xl mx-auto mb-12" style={{ animationDelay: '0.35s' }}>
            {t.heroSub}
          </p>

          <div className="fade-up" style={{ animationDelay: '0.5s' }}>
            <Link to="/demo" className="btn-glow"><span className="comet-blur" />Start Demo</Link>
          </div>

          <p className="fade-up text-sm text-slate-500 mt-6" style={{ animationDelay: '0.65s' }}>
            {t.noCard}
          </p>
        </section>

        {/* Stats — radial gauges */}
        <section className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-20">
            <div className="flex flex-col items-center gap-4 max-w-[260px] text-center">
              <p className="text-slate-400 text-sm leading-relaxed">
                Every student gets a response the moment they ask — no waiting, no limits, day or night.
              </p>
              <RadialGauge
                countTo={100}
                suffix="%"
                label="Questions Answered Anytime"
                duration={2000}
              />
            </div>
            <div className="flex flex-col items-center gap-4 max-w-[280px] text-center">
              <p className="text-slate-400 text-sm leading-relaxed">
                Students using Leren grasp new concepts up to 3× faster than studying alone with traditional methods.
              </p>
              <UnderstandingChart />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-slate-800/50">
          <div className="max-w-4xl mx-auto px-8 sm:px-10 md:px-12 pt-20 pb-16">
            {/* Title stays in normal flow and scrolls away */}
            <div className="max-w-2xl mx-auto pb-8 text-center">
              <h2 className="text-3xl font-bold mb-3">{t.howTitle}</h2>
              <p className="text-slate-400 max-w-xl mx-auto">{t.howSub}</p>
            </div>
            {/* Scroll-driven step reveal — constrained so boxes don't touch edges */}
            <FancySteps steps={steps} />
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 py-24 border-t border-slate-800/60">
          {/* Section header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25
                            rounded-full px-4 py-1.5 text-blue-300 text-xs tracking-widest uppercase
                            mb-5 shimmer">
              Features
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.featTitle}</h2>
            <p className="text-slate-400 max-w-xl mx-auto">{t.featSub}</p>
          </div>
          <FancyFeatures features={features} />
        </section>

        {/* Languages banner */}
        <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-800">
          <div className="card text-center bg-slate-900/30 backdrop-blur-sm border-slate-700/30">
            <h2 className="text-2xl font-bold mb-3">{t.langTitle}</h2>
            <p className="text-slate-400 mb-6 text-sm">{t.langSub}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`badge text-sm px-3 py-1 transition-colors cursor-pointer ${lang === l.code ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40' : 'bg-slate-800/50 text-slate-400 border border-slate-700/40 hover:bg-slate-700/50 hover:text-slate-300'}`}
                >
                  {l.label} <span style={{ fontSize: '1.35em', lineHeight: 1 }}>{l.flag}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <PricingSection t={t} ctaTo={ctaTo} />

        {/* Final CTA */}
        <section className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h2 className="fade-up text-4xl font-extrabold mb-4" style={{ animationDelay: '0.1s' }}>{t.ctaTitle}</h2>
          <p className="fade-up text-slate-400 mb-10 text-lg" style={{ animationDelay: '0.2s' }}>{t.ctaSub}</p>
          <div className="fade-up" style={{ animationDelay: '0.3s' }}>
            <Link to={ctaTo} className="btn-glow text-lg px-10 py-4"><span className="comet-blur" />{t.startFree}</Link>
          </div>
        </section>

        {/* Contact us – very bottom */}
        <ContactSection />

        <footer className="text-center py-10 text-slate-500 text-sm border-t border-slate-800/60">
          © {new Date().getFullYear()} Leren · {t.footer}
        </footer>

      </div>
    </div>
  );
}
