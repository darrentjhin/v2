import { motion } from 'motion/react';
const logoImg = '/logo.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <motion.a
      href="/"
      className={`flex items-center gap-2 sm:gap-2.5 group cursor-pointer no-underline ${className}`}
      whileHover="hover"
      initial="initial"
    >
      {/* Icon Mark */}
      <div className="relative flex items-center justify-center">
        {/* Subtle glow behind */}
        <motion.div
          variants={{
            initial: { opacity: 0.4, scale: 0.85 },
            hover: { opacity: 0.75, scale: 1.15 },
          }}
          className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full pointer-events-none"
        />

        <motion.div
          className="relative w-9 h-9 flex items-center justify-center"
          variants={{
            initial: { scale: 1 },
            hover: { scale: 1.07 },
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 14 }}
        >
          <img
            src={logoImg}
            alt="Leren AI logo"
            className="w-9 h-9 object-contain relative z-10 rounded-[5px]"
            style={{ mixBlendMode: 'screen' }}
          />
        </motion.div>
      </div>

      {/* Brand text — sized to the mark; generous line-height avoids glyph clipping */}
      {showText && (
        <span
          className="shrink-0 whitespace-nowrap text-white select-none"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(14px, 2.1vw, 15px)',
            lineHeight: 1.22,
            letterSpacing: '-0.018em',
            paddingTop: '0.06em',
            paddingBottom: '0.06em',
          }}
        >
          Leren
        </span>
      )}
    </motion.a>
  );
}