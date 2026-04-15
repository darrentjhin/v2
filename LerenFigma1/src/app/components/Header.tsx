import { motion, AnimatePresence } from 'motion/react';
import { Globe, ChevronDown, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function Header() {
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Fixed wrapper — never moves */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto relative pointer-events-auto"
          style={{
            background: scrolled
              ? 'linear-gradient(rgba(6,9,20,0.97) 0%, rgba(6,9,20,0.97) 100%) padding-box, linear-gradient(135deg, rgba(99,102,241,0.75) 0%, rgba(59,130,246,0.45) 45%, rgba(139,92,246,0.6) 100%) border-box'
              : 'linear-gradient(rgba(6,9,20,0.82) 0%, rgba(6,9,20,0.82) 100%) padding-box, linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(59,130,246,0.3) 45%, rgba(139,92,246,0.42) 100%) border-box',
            border: '1px solid transparent',
            borderRadius: '22px',
            backdropFilter: 'blur(36px) saturate(220%)',
            WebkitBackdropFilter: 'blur(36px) saturate(220%)',
            boxShadow: scrolled
              ? '0 10px 48px rgba(0,0,0,0.55), 0 0 100px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.07)'
              : '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
            transition: 'background 0.5s, box-shadow 0.5s',
          }}
        >
          {/* Prismatic top-edge accent */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-px rounded-full pointer-events-none"
            style={{
              width: '72%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.7) 25%, rgba(99,102,241,0.9) 50%, rgba(59,130,246,0.7) 75%, transparent 100%)',
              opacity: scrolled ? 0.9 : 0.55,
              transition: 'opacity 0.5s',
            }}
          />

          <div className="flex items-center justify-between px-5 py-3">

            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo className="hidden sm:flex" />
              <Logo className="sm:hidden" showText={false} />
            </div>

            {/* Vertical separator */}
            <div
              className="hidden md:block flex-shrink-0 mx-4"
              style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.09)' }}
            />

            {/* Center nav */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1">
              {navLinks.map((link) => (
                <motion.button
                  key={link.label}
                  onClick={() => { scrollTo(link.href); setActiveLink(link.label); }}
                  onHoverStart={() => setHoveredLink(link.label)}
                  onHoverEnd={() => setHoveredLink(null)}
                  className="relative px-4 py-2 rounded-xl outline-none"
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 500,
                    color: activeLink === link.label
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(255,255,255,0.52)',
                    transition: 'color 0.2s',
                  }}
                >
                  <AnimatePresence>
                    {hoveredLink === link.label && (
                      <motion.span
                        layoutId="nav-hover-bg"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative z-10">{link.label}</span>
                  {activeLink === link.label && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute left-1/2 -translate-x-1/2 rounded-full"
                      style={{
                        bottom: '4px',
                        width: '4px',
                        height: '4px',
                        background: 'linear-gradient(135deg, #818cf8, #60a5fa)',
                        boxShadow: '0 0 6px rgba(99,102,241,0.8)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Vertical separator */}
            <div
              className="hidden md:block flex-shrink-0 mx-3"
              style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.09)' }}
            />

            {/* Right cluster */}
            <div className="flex items-center gap-1.5">

              {/* Language */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors duration-200"
                  style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>EN</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full mt-2 right-0 py-1.5 min-w-[150px] z-50"
                      style={{
                        background: 'rgba(6,9,20,0.98)',
                        backdropFilter: 'blur(24px)',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
                      }}
                    >
                      {['English', 'Español', 'Français', '中文'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLangOpen(false)}
                          className="w-full px-4 py-2 text-left transition-all duration-150"
                          style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {lang}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sign in */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="hidden sm:flex items-center px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                Sign in
              </motion.button>

              {/* Get Started CTA */}
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="relative flex items-center px-4 py-2 rounded-xl text-white overflow-hidden"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1e2a6e 0%, #4f46e5 55%, #2563eb 100%)',
                  boxShadow: '0 4px 18px rgba(30,42,110,0.5), 0 1px 4px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.18)',
                  letterSpacing: '-0.01em',
                }}
              >
                <span className="relative z-10">Get Started</span>
                <motion.div
                  animate={{ x: ['-150%', '220%'] }}
                  transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
                  className="absolute top-0 bottom-0 w-1/2 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
                    transform: 'skewX(-18deg)',
                  }}
                />
              </motion.button>

              {/* Mobile hamburger */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl transition-colors"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-4 right-4 z-40 p-3 rounded-2xl md:hidden overflow-hidden"
            style={{
              top: '82px',
              background: 'rgba(6,9,20,0.96)',
              backdropFilter: 'blur(36px) saturate(200%)',
              WebkitBackdropFilter: 'blur(36px) saturate(200%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 h-px pointer-events-none"
              style={{
                width: '60%',
                background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(139,92,246,0.7), transparent)',
              }}
            />
            <div className="flex flex-col gap-0.5 py-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => { scrollTo(link.href); setActiveLink(link.label); }}
                  className="w-full text-left px-4 py-3 rounded-xl transition-all duration-150"
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: activeLink === link.label ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
                    background: activeLink === link.label ? 'rgba(99,102,241,0.12)' : 'transparent',
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="mt-2 pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                className="w-full py-3 rounded-xl text-center"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Sign in
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="relative w-full py-3 rounded-xl text-white text-center overflow-hidden flex items-center justify-center"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1e2a6e 0%, #4f46e5 55%, #2563eb 100%)',
                  boxShadow: '0 4px 18px rgba(30,42,110,0.45)',
                }}
              >
                Get Started Free
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}