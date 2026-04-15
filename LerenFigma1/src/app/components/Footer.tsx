import { motion } from 'motion/react';
import { Twitter, Github, Linkedin, Youtube } from 'lucide-react';
const logo = '/logo.png';

const footerLinks = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'Download', 'Changelog'],
  },
  {
    title: 'Resources',
    links: ['Blog', 'Help Center', 'Community', 'Status'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Press', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'Cookies'],
  },
];

const socials = [
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Github, label: 'GitHub' },
  { Icon: Linkedin, label: 'LinkedIn' },
  { Icon: Youtube, label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="px-6 pb-10">
      <div className="max-w-4xl mx-auto">
        <div className="h-px w-full" style={{ background: 'rgba(0,0,0,0.06)' }} />

        <div className="pt-12">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src={logo}
                  alt="Leren"
                  className="w-7 h-7 rounded-[8px]"
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                />
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '-0.018em',
                    lineHeight: 1.22,
                    color: '#09090f',
                  }}
                >
                  Leren
                </span>
              </div>
              <p className="text-slate-400 mb-5 max-w-[200px]" style={{ fontSize: '13px', lineHeight: 1.65 }}>
                Your AI-powered personal tutor — any subject, any language, anytime.
              </p>
              <div className="flex items-center gap-1.5">
                {socials.map(({ Icon, label }) => (
                  <motion.a
                    key={label}
                    href="#"
                    whileHover={{ scale: 1.08, y: -1 }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    style={{ background: '#f4f5f7', border: '1px solid rgba(0,0,0,0.04)' }}
                    aria-label={label}
                  >
                    <Icon className="w-3 h-3" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerLinks.map((group) => (
              <div key={group.title}>
                <p
                  className="text-slate-800 mb-3"
                  style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                >
                  {group.title}
                </p>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                        style={{ fontSize: '13px' }}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="h-px w-full mb-6" style={{ background: 'rgba(0,0,0,0.04)' }} />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-slate-400" style={{ fontSize: '12px' }}>
              © 2026 Leren. All rights reserved.
            </p>
            <p className="text-slate-300" style={{ fontSize: '12px' }}>
              Built for learners everywhere.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
