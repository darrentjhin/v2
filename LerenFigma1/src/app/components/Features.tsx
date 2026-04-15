import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

// Custom premium SVG icons — each is a mini-illustration
function IconScreenAware() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="14" rx="2.5" stroke="url(#ia-g)" strokeWidth="1.6" fill="none" />
      <rect x="8" y="18" width="8" height="1.5" rx="0.75" fill="url(#ia-g)" opacity="0.6" />
      <circle cx="12" cy="11" r="2.8" stroke="url(#ia-g)" strokeWidth="1.4" fill="none" />
      <circle cx="12" cy="11" r="1" fill="url(#ia-g)" />
      <path d="M6.5 7.5 L9.5 10.5" stroke="url(#ia-g)" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <defs>
        <linearGradient id="ia-g" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" /><stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IconLanguages() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="url(#il-g)" strokeWidth="1.6" fill="none" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="url(#il-g)" strokeWidth="1.3" fill="none" opacity="0.6" />
      <path d="M3.5 9h17M3.5 15h17" stroke="url(#il-g)" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <defs>
        <linearGradient id="il-g" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" /><stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IconPractice() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9" stroke="url(#ip-g)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9" stroke="url(#ip-g)" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.35" />
      <path d="M8 10h3M8 13h5M8 16h3" stroke="url(#ip-g)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="17.5" cy="17.5" r="3" fill="url(#ip-g)" opacity="0.9" />
      <path d="M16.5 17.5l.8.8 1.6-1.6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="ip-g" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" /><stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IconNotes() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="13" height="17" rx="2.5" stroke="url(#in-g)" strokeWidth="1.6" fill="none" />
      <path d="M8 8h6M8 11.5h6M8 15h4" stroke="url(#in-g)" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      <circle cx="17.5" cy="17.5" r="3.5" fill="url(#in-g)" />
      <path d="M16.2 17.5h2.6M17.5 16.2v2.6" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <defs>
        <linearGradient id="in-g" x1="4" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" /><stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IconProgress() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="url(#ipr-g)" strokeWidth="1.6" fill="none" />
      <path d="M7 15l3-4 3 2.5 4-5" stroke="url(#ipr-g)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="15" r="1.2" fill="url(#ipr-g)" />
      <circle cx="10" cy="11" r="1.2" fill="url(#ipr-g)" />
      <circle cx="13" cy="13.5" r="1.2" fill="url(#ipr-g)" />
      <circle cx="17" cy="8.5" r="1.2" fill="url(#ipr-g)" />
      <defs>
        <linearGradient id="ipr-g" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" /><stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IconExam() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2.5" stroke="url(#ie-g)" strokeWidth="1.6" fill="none" />
      <path d="M8 8h8M8 11.5h8M8 15h5" stroke="url(#ie-g)" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <path d="M14.5 15.5l1.5 1.5 2.5-2.5" stroke="url(#ie-g)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="ie-g" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" /><stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const features = [
  {
    Icon: IconScreenAware,
    title: 'Screen Awareness',
    description:
      "Leren sees exactly what you're working on and delivers context-precise answers — no describing, just instant understanding.",
    color: '#6366f1',
    bg: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
    border: 'rgba(99,102,241,0.14)',
    glow: 'rgba(99,102,241,0.07)',
  },
  {
    Icon: IconLanguages,
    title: '10+ Languages',
    description: 'Learn in your native language or bridge two languages at once with seamless bilingual mode.',
    color: '#3b82f6',
    bg: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(14,165,233,0.05))',
    border: 'rgba(59,130,246,0.14)',
    glow: 'rgba(59,130,246,0.07)',
  },
  {
    Icon: IconPractice,
    title: 'Practice Mode',
    description: 'AI-generated problems with instant, structured feedback on every answer you give.',
    color: '#8b5cf6',
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(167,139,250,0.05))',
    border: 'rgba(139,92,246,0.14)',
    glow: 'rgba(139,92,246,0.07)',
  },
  {
    Icon: IconNotes,
    title: 'Session Notes',
    description: 'Every session auto-summarized into clean, structured notes you can revisit and export anytime.',
    color: '#0ea5e9',
    bg: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(56,189,248,0.05))',
    border: 'rgba(14,165,233,0.14)',
    glow: 'rgba(14,165,233,0.07)',
  },
  {
    Icon: IconProgress,
    title: 'Progress Tracking',
    description: 'Visualize accuracy, streaks, and weak areas with an intuitive learning dashboard.',
    color: '#10b981',
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.05))',
    border: 'rgba(16,185,129,0.14)',
    glow: 'rgba(16,185,129,0.07)',
  },
  {
    Icon: IconExam,
    title: 'Exam Generator',
    description: 'Full exam-style practice sets on any topic, tailored to your level and curriculum.',
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,191,36,0.05))',
    border: 'rgba(245,158,11,0.14)',
    glow: 'rgba(245,158,11,0.07)',
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.08 });

  return (
    <section ref={ref} id="features" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-12"
        >
          <span
            className="inline-block mb-4"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#2563eb',
            }}
          >
            Features
          </span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(28px, 3.5vw, 40px)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                color: '#09090f',
              }}
            >
              Everything you need
              <br />to learn faster.
            </h2>
            <p className="text-slate-400 max-w-[240px] md:text-right" style={{ fontSize: '14px', lineHeight: 1.6 }}>
              Built for students who are serious about results.
            </p>
          </div>
        </motion.div>

        {/* Uniform 3×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ y: 24, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group"
            >
              <div
                className="relative h-full p-5 rounded-[16px] transition-all duration-300 cursor-default hover:-translate-y-1"
                style={{
                  background: 'white',
                  border: `1px solid ${f.border}`,
                  boxShadow: `0 1px 4px rgba(0,0,0,0.03), 0 0 0 0px ${f.glow}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 28px ${f.glow}, 0 2px 8px rgba(0,0,0,0.04)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 1px 4px rgba(0,0,0,0.03)`;
                }}
              >
                {/* Icon container */}
                <div
                  className="w-12 h-12 rounded-[13px] flex items-center justify-center mb-4 relative"
                  style={{
                    background: f.bg,
                    border: `1px solid ${f.border}`,
                    boxShadow: `0 2px 8px ${f.glow}, 0 0 0 1px rgba(255,255,255,0.8) inset`,
                  }}
                >
                  {/* Subtle inner highlight */}
                  <div
                    className="absolute inset-0 rounded-[13px] pointer-events-none"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.5) 0%, transparent 60%)',
                    }}
                  />
                  <f.Icon />
                </div>

                <h3
                  className="text-slate-900 mb-1.5"
                  style={{ fontSize: '14.5px', fontWeight: 700, letterSpacing: '-0.02em' }}
                >
                  {f.title}
                </h3>
                <p className="text-slate-500" style={{ fontSize: '13px', lineHeight: 1.65 }}>
                  {f.description}
                </p>

                {/* Bottom corner accent */}
                <div
                  className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full opacity-40"
                  style={{ background: f.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
