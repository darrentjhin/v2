import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const universities = [
  { name: 'Harvard',   logo: '/logo-harvard.png',   w: 111, h: 108 },
  { name: 'Princeton', logo: '/logo-princeton.png', w:  85, h: 108 },
  { name: 'Columbia',  logo: '/logo-columbia.png',  w: 101, h: 108 },
  { name: 'Berkeley',  logo: '/logo-berkeley.png',  w: 108, h: 108 },
  { name: 'Tsinghua',  logo: '/logo-tsinghua.png',  w: 108, h: 108 },
  { name: 'MIT',       logo: '/logo-mit.png',       w: 142, h:  76 },
  { name: 'Imperial',  logo: '/logo-imperial.png',  w: 101, h: 108 },
  { name: 'NTU',       logo: '/logo-ntu.png',       w:  84, h: 108 },
  { name: 'Yonsei',    logo: '/logo-yonsei.png',    w: 108, h: 108 },
  { name: 'UPenn',     logo: '/logo-upenn.png',     w:  95, h: 108 },
  { name: 'UChicago',  logo: '/logo-uchicago.png',  w: 108, h: 108 },
];

function UnivBadge({ u }: { u: (typeof universities)[0] }) {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 cursor-default select-none"
      style={{ width: u.w, height: u.h, marginRight: 72 }}
    >
      <img
        src={u.logo}
        alt={`${u.name} logo`}
        style={{ width: u.w, height: u.h, objectFit: 'contain' }}
      />
    </div>
  );
}

export function Universities() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="relative py-6 w-full block overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, rgba(250,250,254,0.6) 0%, rgba(250,250,254,0.85) 50%, rgba(250,250,254,0.6) 100%)',
      }}
    >
      <style>{`
        @keyframes univ-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-6 px-8"
      >
        <p className="text-sm font-extrabold tracking-widest uppercase mb-1" style={{ color: '#1d4ed8' }}>
          Trusted by Students Worldwide
        </p>
        <h2 className="text-2xl font-extrabold" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
          Join learners from top universities
        </h2>
      </motion.div>

      {/* Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative overflow-hidden w-full"
      >
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none" style={{
          width: '180px',
          background: 'linear-gradient(to right, rgba(250,250,254,0.95) 0%, rgba(250,250,254,0.6) 50%, transparent 100%)',
        }} />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none" style={{
          width: '180px',
          background: 'linear-gradient(to left, rgba(250,250,254,0.95) 0%, rgba(250,250,254,0.6) 50%, transparent 100%)',
        }} />

        <div
          className="flex items-center"
          style={{
            width: 'max-content',
            animation: 'univ-marquee 32s linear infinite',
            willChange: 'transform',
          }}
        >
          {universities.map((u) => <UnivBadge key={`a-${u.name}`} u={u} />)}
          {universities.map((u) => <UnivBadge key={`b-${u.name}`} u={u} />)}
        </div>
      </motion.div>
    </section>
  );
}
