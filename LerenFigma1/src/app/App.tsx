import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { FasterLearning } from './components/FasterLearning';
import { Languages } from './components/Languages';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#fafafe] text-slate-900 relative overflow-x-hidden">
      {/* ── Fixed background layer ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        {/* Large glowing orb — top centre hero glow */}
        <div
          className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.09) 40%, transparent 68%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Bold orb — left mid */}
        <div
          className="absolute top-[30%] -left-[120px] w-[560px] h-[560px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.16) 0%, rgba(139,92,246,0.07) 45%, transparent 70%)',
            filter: 'blur(32px)',
          }}
        />

        {/* Bold orb — right mid-lower */}
        <div
          className="absolute top-[55%] -right-[100px] w-[520px] h-[520px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, rgba(96,165,250,0.07) 45%, transparent 70%)',
            filter: 'blur(32px)',
          }}
        />

        {/* Bottom violet bloom */}
        <div
          className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.06) 50%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Fine square grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Decorative rings — top-right */}
        <svg
          className="absolute -top-10 -right-16 opacity-[0.11]"
          width="580" height="580" viewBox="0 0 580 580" fill="none"
        >
          <circle cx="290" cy="290" r="270" stroke="#6366f1" strokeWidth="1.5" />
          <circle cx="290" cy="290" r="210" stroke="#3b82f6" strokeWidth="1" />
          <circle cx="290" cy="290" r="150" stroke="#6366f1" strokeWidth="0.75" />
          <circle cx="290" cy="290" r="90"  stroke="#3b82f6" strokeWidth="0.5" />
        </svg>

        {/* Decorative rings — bottom-left */}
        <svg
          className="absolute -bottom-16 -left-16 opacity-[0.09]"
          width="520" height="520" viewBox="0 0 520 520" fill="none"
        >
          <circle cx="260" cy="260" r="240" stroke="#8b5cf6" strokeWidth="1.5" />
          <circle cx="260" cy="260" r="180" stroke="#6366f1" strokeWidth="1" />
          <circle cx="260" cy="260" r="120" stroke="#8b5cf6" strokeWidth="0.75" />
        </svg>

        {/* Cross / plus marks */}
        {[
          { top: '18%', left: '8%' },
          { top: '42%', right: '7%' },
          { top: '72%', left: '22%' },
          { top: '12%', right: '22%' },
          { top: '85%', right: '30%' },
        ].map((pos, i) => (
          <svg
            key={i}
            className="absolute opacity-[0.18]"
            style={pos as React.CSSProperties}
            width="18" height="18" viewBox="0 0 18 18" fill="none"
          >
            <line x1="9" y1="0" x2="9" y2="18" stroke="#6366f1" strokeWidth="1.5" />
            <line x1="0" y1="9" x2="18" y2="9" stroke="#6366f1" strokeWidth="1.5" />
          </svg>
        ))}

        {/* Diagonal slash accents */}
        <svg
          className="absolute top-[22%] left-[55%] opacity-[0.07]"
          width="220" height="220" viewBox="0 0 220 220" fill="none"
        >
          <line x1="0" y1="220" x2="220" y2="0" stroke="#3b82f6" strokeWidth="1" />
          <line x1="40" y1="220" x2="220" y2="40" stroke="#3b82f6" strokeWidth="0.75" />
          <line x1="80" y1="220" x2="220" y2="80" stroke="#3b82f6" strokeWidth="0.5" />
        </svg>
        <svg
          className="absolute top-[58%] left-[10%] opacity-[0.06]"
          width="180" height="180" viewBox="0 0 180 180" fill="none"
        >
          <line x1="0" y1="180" x2="180" y2="0" stroke="#8b5cf6" strokeWidth="1" />
          <line x1="36" y1="180" x2="180" y2="36" stroke="#8b5cf6" strokeWidth="0.75" />
        </svg>

        {/* Small glowing dots */}
        {[
          { top: '20%',  left: '15%',  size: 5, color: '#6366f1', blur: 3, opacity: 0.45 },
          { top: '38%',  right: '12%', size: 4, color: '#3b82f6', blur: 2, opacity: 0.4  },
          { top: '65%',  left: '42%',  size: 6, color: '#8b5cf6', blur: 4, opacity: 0.38 },
          { top: '10%',  right: '35%', size: 3, color: '#60a5fa', blur: 2, opacity: 0.5  },
          { top: '80%',  right: '18%', size: 5, color: '#6366f1', blur: 3, opacity: 0.35 },
          { top: '50%',  left: '5%',   size: 4, color: '#3b82f6', blur: 2, opacity: 0.4  },
        ].map((d, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: d.top,
              left: (d as any).left,
              right: (d as any).right,
              width: d.size,
              height: d.size,
              background: d.color,
              filter: `blur(${d.blur}px)`,
              opacity: d.opacity,
            }}
          />
        ))}

        {/* Thin horizontal gradient lines */}
        <div
          className="absolute top-[33%] left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.18) 25%, rgba(59,130,246,0.22) 50%, rgba(99,102,241,0.18) 75%, transparent 100%)' }}
        />
        <div
          className="absolute top-[67%] left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.14) 25%, rgba(99,102,241,0.18) 50%, rgba(139,92,246,0.14) 75%, transparent 100%)' }}
        />

      </div>

      <div className="relative z-10">
        <Header />
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <FasterLearning />
        <Languages />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}