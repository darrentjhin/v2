import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Mic, Monitor } from 'lucide-react';
const logo = '/logo.png';
import { useState, useEffect } from 'react';
import { Universities } from './Universities';
const cyclingWords = ['Learn.', 'Practice.', 'Summarize.'];

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % cyclingWords.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center pt-32 pb-24">
      {/* Blue radial gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 50% -5%, rgba(59,130,246,0.1) 0%, rgba(147,197,253,0.05) 45%, transparent 70%)',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="max-w-[800px] mx-auto text-center relative z-10 px-6">
        {/* Badge */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-8 flex justify-center"
        >
          <div
            className="inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(59,130,246,0.12)',
              boxShadow: '0 1px 8px rgba(59,130,246,0.06)',
            }}
          >
            <span
              className="px-2.5 py-0.5 rounded-full text-white"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              NEW
            </span>
            <span className="text-slate-500" style={{ fontSize: '13px', fontWeight: 500 }}>
              Screen-aware AI tutoring is now live
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            lineHeight: 1.06,
            letterSpacing: '-0.04em',
          }}
        >
          {/* Cycling word */}
          <div
            className="flex items-center justify-center overflow-hidden"
            style={{
              fontSize: 'clamp(48px, 7vw, 82px)',
              height: 'clamp(56px, 8.5vw, 96px)',
              marginBottom: 6,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ y: 40, opacity: 0, filter: 'blur(6px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -40, opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'inline-block' }}
              >
                <span
                  style={{
                    background: 'linear-gradient(135deg, #1e2a6e 0%, #4f46e5 45%, #2563eb 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                  }}
                >
                  {cyclingWords[wordIndex]}
                </span>
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Static second line */}
          <div
            style={{
              fontSize: 'clamp(28px, 4.2vw, 52px)',
              color: '#09090f',
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
            }}
          >
            With Your Personal AI Professor
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.42 }}
          className="flex justify-center mb-5"
        >
          <div className="relative group">
            {/* Animated shimmer border */}
            <div
              className="absolute -inset-[2px] rounded-[16px] pointer-events-none"
              style={{
                background: 'conic-gradient(from var(--angle), #6366f1, #3b82f6, #06b6d4, #6366f1)',
                animation: 'spin-border 3s linear infinite',
              }}
            />
            <style>{`
              @property --angle {
                syntax: '<angle>';
                initial-value: 0deg;
                inherits: false;
              }
              @keyframes spin-border {
                to { --angle: 360deg; }
              }
              @keyframes shimmer-slide {
                0%   { transform: translateX(-100%) skewX(-12deg); }
                100% { transform: translateX(250%) skewX(-12deg); }
              }
            `}</style>

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex items-center gap-2.5 px-8 py-3.5 rounded-[14px] text-white overflow-hidden"
              style={{
                fontSize: '15px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1e2a6e, #4f46e5, #2563eb)',
                boxShadow: '0 8px 32px rgba(30,42,110,0.45), 0 2px 8px rgba(37,99,235,0.2)',
                letterSpacing: '-0.01em',
              }}
            >
              {/* Shimmer sweep on hover */}
              <span
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                  animation: 'shimmer-slide 0.7s ease forwards',
                }}
              />
              Start Demo
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-slate-400"
          style={{ fontSize: '12px', fontWeight: 400 }}
        >
          No credit card required · Free tier always available
        </motion.p>

      </div>{/* end max-w-[800px] */}

      {/* University trust strip — full width */}
      <div className="mt-10 w-full">
        <Universities />
      </div>

      <div className="max-w-[800px] mx-auto text-center relative z-10 w-full px-6">
        {/* Product mockup */}
        <motion.div
          initial={{ y: 48, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 relative mx-auto max-w-[680px]"
        >
          {/* Blue glow behind mockup */}
          <div
            className="absolute -inset-10 rounded-[36px] blur-3xl opacity-25 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(59,130,246,0.2))',
            }}
          />

          <div
            className="relative rounded-[20px] overflow-hidden"
            style={{
              border: '1px solid rgba(0,0,0,0.07)',
              boxShadow:
                '0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(37,99,235,0.06), 0 0 0 1px rgba(255,255,255,0.6) inset',
            }}
          >
            {/* Browser chrome */}
            <div
              className="flex items-center gap-2 px-4 py-2.5"
              style={{ background: '#f4f5f7', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
              </div>
              <div
                className="flex-1 mx-6 py-1 px-3 rounded-md text-center"
                style={{
                  background: 'rgba(0,0,0,0.04)',
                  fontSize: '11px',
                  color: '#94a3b8',
                  fontFamily: "'Inter', monospace",
                }}
              >
                app.leren.ai
              </div>
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                <Monitor className="w-2.5 h-2.5 text-red-500" />
                <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>
                  Sharing
                </span>
              </div>
            </div>

            {/* App content */}
            <div style={{ background: '#f8f9fc' }}>
              <div className="p-6 md:p-7">
                {/* Top status */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <img src={logo} alt="" className="w-6 h-6 rounded-lg" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                      Leren
                    </span>
                    <div
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.15)',
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>
                        Online
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(37,99,235,0.07)',
                      border: '1px solid rgba(37,99,235,0.12)',
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#2563eb' }}
                    />
                    <Mic className="w-3 h-3 text-blue-600" />
                    <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
                      Listening
                    </span>
                  </div>
                </div>

                {/* Chat */}
                <div className="flex flex-col gap-3.5">
                  <div className="flex justify-end">
                    <div
                      className="max-w-[260px] px-4 py-2.5 rounded-2xl rounded-br-md"
                      style={{
                        background: '#09090f',
                        color: 'white',
                        fontSize: '13px',
                        lineHeight: 1.6,
                      }}
                    >
                      Can you explain how derivatives work using my notes?
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <img
                      src={logo}
                      alt=""
                      className="w-6 h-6 rounded-lg mt-0.5 flex-shrink-0"
                    />
                    <div
                      className="max-w-[360px] px-4 py-3 rounded-2xl rounded-bl-md"
                      style={{
                        background: 'white',
                        border: '1px solid rgba(0,0,0,0.06)',
                        fontSize: '13px',
                        lineHeight: 1.65,
                        color: '#334155',
                      }}
                    >
                      <p className="mb-2.5">
                        I can see your notes on{' '}
                        <strong style={{ color: '#1e293b' }}>calculus</strong>. A derivative
                        measures the <em>rate of change</em> — how fast something shifts at any
                        point.
                      </p>
                      <div
                        className="p-2.5 rounded-xl"
                        style={{ background: '#f1f5f9', border: '1px solid rgba(0,0,0,0.04)' }}
                      >
                        <code
                          style={{
                            fontSize: '11.5px',
                            color: '#2563eb',
                            fontFamily: "'Inter', monospace",
                          }}
                        >
                          f′(x) = lim(h→0) [f(x+h) − f(x)] / h
                        </code>
                      </div>
                      <p className="mt-2.5">
                        Want me to walk through your example on page 3?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-center">
                    <div className="w-6 h-6" />
                    <div
                      className="flex gap-1 px-3 py-2.5 rounded-2xl"
                      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: '#94a3b8' }}
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div
                  className="mt-4 flex items-center gap-3 px-4 py-2.5 rounded-2xl"
                  style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <span className="flex-1 text-slate-300" style={{ fontSize: '13px' }}>
                    Ask anything...
                  </span>
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
                  >
                    <Mic className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}