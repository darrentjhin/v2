import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { ArrowRight, Play } from 'lucide-react';
const logo = '/logo.png';

export function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 28, opacity: 0, scale: 0.98 }}
          animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[24px] px-8 py-14 md:px-14"
          style={{
            background: 'linear-gradient(135deg, #09090f 0%, #18182a 55%, #1e1b4b 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
          }}
        >
          {/* Background accents */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5), transparent 65%)' }}
            />
            <div
              className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 65%)' }}
            />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
                backgroundSize: '52px 52px',
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10">
            {/* Left */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <img
                  src={logo}
                  alt="Leren"
                  className="w-10 h-10 rounded-[12px]"
                  style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                />
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Leren
                </span>
              </div>
              <h2
                className="text-white mb-3"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'clamp(30px, 4vw, 48px)',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.08,
                }}
              >
                Ready to study smarter?
              </h2>
              <p className="text-slate-400 max-w-sm mx-auto lg:mx-0" style={{ fontSize: '14.5px', lineHeight: 1.65 }}>
                Join thousands of students mastering any subject, in any language, on their own schedule.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 px-7 py-3 rounded-[12px] transition-all"
                style={{
                  background: 'white',
                  color: '#09090f',
                  fontSize: '14px',
                  fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  letterSpacing: '-0.01em',
                }}
              >
                Start free session
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2.5 px-7 py-3 rounded-[12px] text-white/70 hover:text-white/90 transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <Play className="w-2.5 h-2.5 ml-0.5" fill="currentColor" />
                </div>
                Watch demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
