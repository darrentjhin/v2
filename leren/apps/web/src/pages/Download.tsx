import { Link } from 'react-router-dom';
import { FuturisticBackground } from '@/components/FuturisticBackground';

const MAC_SPECS = [
  'macOS 10.15 (Catalina) or later',
  'RAM: 4 GB minimum, 8 GB recommended',
  'Storage: 200 MB free space',
  'Internet: Required for AI features',
];

const WINDOWS_SPECS = [
  'Windows 10 or 11 (64-bit)',
  'RAM: 4 GB minimum, 8 GB recommended',
  'Storage: 200 MB free space',
  'Internet: Required for AI features',
];

const iconWrap = 'w-20 h-20 rounded-2xl flex items-center justify-center mb-4 opacity-70 group-hover:opacity-90 transition-opacity';
const iconBg = { background: 'rgba(255,255,255,0.06)' };

export default function Download() {
  return (
    <div className="min-h-screen bg-[#000d1a] text-slate-100 overflow-x-hidden">
      <FuturisticBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm mb-12 transition-colors">
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Download Leren</h1>
        <p className="text-slate-400 mb-10">Choose your platform to get started.</p>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Mac */}
          <div className="flex flex-col rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
            <a
              href="#"
              className="group flex flex-col items-center justify-center p-8 hover:bg-slate-800/40 transition-colors duration-200"
            >
              <div className={iconWrap} style={iconBg}>
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor" aria-hidden>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <span className="font-semibold text-white text-lg">Download for Mac</span>
              <span className="text-slate-500 text-sm mt-1">macOS 10.15 or later</span>
            </a>
            <div className="px-5 pb-5 pt-0">
              <p className="text-xs font-semibold text-slate-400 mb-2">Minimum system requirements</p>
              <ul className="text-slate-500 text-xs space-y-1">
                {MAC_SPECS.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-blue-400/70">•</span>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Windows */}
          <div className="flex flex-col rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
            <a
              href="#"
              className="group flex flex-col items-center justify-center p-8 hover:bg-slate-800/40 transition-colors duration-200"
            >
              <div className={iconWrap} style={iconBg}>
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor" aria-hidden>
                  <rect x="0" y="0" width="11" height="11" rx="0.5"/>
                  <rect x="13" y="0" width="11" height="11" rx="0.5"/>
                  <rect x="0" y="13" width="11" height="11" rx="0.5"/>
                  <rect x="13" y="13" width="11" height="11" rx="0.5"/>
                </svg>
              </div>
              <span className="font-semibold text-white text-lg">Download for Windows</span>
              <span className="text-slate-500 text-sm mt-1">Windows 10/11 (64-bit)</span>
            </a>
            <div className="px-5 pb-5 pt-0">
              <p className="text-xs font-semibold text-slate-400 mb-2">Minimum system requirements</p>
              <ul className="text-slate-500 text-xs space-y-1">
                {WINDOWS_SPECS.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-blue-400/70">•</span>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
