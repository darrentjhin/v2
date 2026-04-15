import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { X, Check } from 'lucide-react';

const comparisons = [
  {
    topic: 'Doubt resolution',
    traditional: 'Wait hours for office hours or a forum reply',
    leren: 'Instant, context-aware answer in seconds',
  },
  {
    topic: 'Personalization',
    traditional: 'One-size-fits-all lectures & textbooks',
    leren: 'Adapts to your pace, level, and weak spots',
  },
  {
    topic: 'Practice feedback',
    traditional: 'See grade days later with little explanation',
    leren: 'Immediate, step-by-step structured feedback',
  },
  {
    topic: 'Note-taking',
    traditional: 'Manual notes, easy to miss key details',
    leren: 'Auto-summarized session notes, always organized',
  },
  {
    topic: 'Study efficiency',
    traditional: 'Passive re-reading — low retention',
    leren: 'Active recall + AI dialogue — 3× retention',
  },
  {
    topic: 'Availability',
    traditional: 'Limited to class hours and library times',
    leren: '24/7, from any device, any language',
  },
];

const metrics = [
  { label: 'Time to master a concept', traditional: '4–6 hrs', leren: '90 min', ratio: 0.73 },
  { label: 'Exam score improvement', traditional: 'Baseline', leren: '+31%', ratio: 0.31 },
  { label: 'Student retention rate', traditional: '42%', leren: '87%', ratio: 0.52 },
];

export function FasterLearning() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.08 });

  return (
    <section ref={ref} className="py-20 px-6">
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
            Why Leren
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
              Faster learning,
              <br />not just harder studying.
            </h2>
            <p className="text-slate-400 max-w-[220px] md:text-right" style={{ fontSize: '14px', lineHeight: 1.6 }}>
              See the difference between traditional methods and AI-assisted learning.
            </p>
          </div>
        </motion.div>

        {/* Metric bars */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4"
        >
          {metrics.map((m, i) => (
            <div
              key={i}
              className="p-5 rounded-[14px]"
              style={{
                background: 'white',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}
            >
              <div className="text-slate-400 mb-3" style={{ fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.01em' }}>
                {m.label}
              </div>
              {/* Traditional bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400" style={{ fontSize: '11px', fontWeight: 500 }}>Traditional</span>
                  <span className="text-slate-400" style={{ fontSize: '12px', fontWeight: 600 }}>{m.traditional}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-slate-300" style={{ width: '100%' }} />
                </div>
              </div>
              {/* Leren bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb' }}>Leren AI</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>{m.leren}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(37,99,235,0.08)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)' }}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${(1 - m.ratio) * 100}%` } : { width: 0 }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="rounded-[16px] overflow-hidden"
          style={{
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-3 px-5 py-3"
            style={{ background: '#f8f9fc', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
          >
            <div className="text-slate-400" style={{ fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.02em' }}>
              Category
            </div>
            <div
              className="text-center flex items-center justify-center gap-1.5"
              style={{ fontSize: '11.5px', fontWeight: 600, color: '#94a3b8' }}
            >
              <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center">
                <X className="w-2.5 h-2.5 text-slate-400" />
              </div>
              Traditional
            </div>
            <div
              className="text-center flex items-center justify-center gap-1.5"
              style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563eb' }}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
              >
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
              Leren AI
            </div>
          </div>

          {/* Rows */}
          {comparisons.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
              className="grid grid-cols-3 px-5 py-3.5 transition-colors hover:bg-slate-50/60"
              style={{
                borderBottom: i < comparisons.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                background: 'white',
              }}
            >
              {/* Topic */}
              <div className="flex items-center">
                <span className="text-slate-700" style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.01em' }}>
                  {row.topic}
                </span>
              </div>

              {/* Traditional */}
              <div className="flex items-start gap-2 px-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                >
                  <X className="w-2.5 h-2.5 text-red-400" />
                </div>
                <span className="text-slate-400" style={{ fontSize: '12px', lineHeight: 1.5 }}>
                  {row.traditional}
                </span>
              </div>

              {/* Leren */}
              <div className="flex items-start gap-2 px-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}
                >
                  <Check className="w-2.5 h-2.5 text-blue-500" />
                </div>
                <span className="text-slate-700" style={{ fontSize: '12px', lineHeight: 1.5, fontWeight: 500 }}>
                  {row.leren}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
