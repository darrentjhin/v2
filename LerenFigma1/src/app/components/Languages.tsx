import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const languages = [
  { name: 'English', flag: '🇬🇧' },
  { name: 'Español', flag: '🇪🇸' },
  { name: 'Français', flag: '🇫🇷' },
  { name: 'Deutsch', flag: '🇩🇪' },
  { name: '中文', flag: '🇨🇳' },
  { name: '日本語', flag: '🇯🇵' },
  { name: '한국어', flag: '🇰🇷' },
  { name: 'العربية', flag: '🇸🇦' },
  { name: 'Português', flag: '🇵🇹' },
  { name: 'Italiano', flag: '🇮🇹' },
  { name: 'ไทย', flag: '🇹🇭' },
  { name: 'Bahasa', flag: '🇮🇩' },
];

// Duplicate for infinite scroll
const doubled = [...languages, ...languages];

export function Languages() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-20 px-6">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 28s linear infinite;
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.55 }}
          className="flex flex-col md:flex-row md:items-center gap-10 mb-10"
        >
          <div className="flex-shrink-0">
            <span
              className="inline-block mb-3"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#6366f1',
              }}
            >
              Languages
            </span>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(26px, 3vw, 36px)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                color: '#09090f',
              }}
            >
              Speaks your
              <br />language.
            </h2>
          </div>
          <p className="text-slate-500 max-w-xs" style={{ fontSize: '14.5px', lineHeight: 1.65 }}>
            Learn in your native tongue or practice a new one. Bilingual mode lets you bridge two languages simultaneously — so context is never lost.
          </p>
        </motion.div>

        {/* Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative overflow-hidden rounded-[16px] py-4"
          style={{
            maskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
          }}
        >
          <div className="marquee-track flex gap-2.5 w-max">
            {doubled.map((lang, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full flex-shrink-0 select-none"
                style={{
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontSize: '15px' }}>{lang.flag}</span>
                <span
                  className="text-slate-600"
                  style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                  {lang.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}