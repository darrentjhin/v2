import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: { monthly: 'Free', annual: 'Free' },
    sub: 'Forever free',
    description: 'Explore what Leren can do.',
    features: ['10 tutor turns / day', '3 practice sets / day', 'Basic progress tracking', '2 saved sessions'],
    cta: 'Get started',
    featured: false,
  },
  {
    name: 'Pro',
    price: { monthly: '$20', annual: '$16' },
    sub: { monthly: '/mo', annual: '/mo · billed yearly' },
    description: 'Unlimited learning, every day.',
    features: [
      'Unlimited tutor turns',
      'Unlimited practice sets',
      'Screen capture context',
      'PDF / image parser',
      'Progress dashboard',
      'Priority AI responses',
    ],
    cta: 'Get Pro',
    featured: true,
    badge: 'Most popular',
  },
  {
    name: 'Enterprise',
    price: { monthly: 'Custom', annual: 'Custom' },
    sub: 'Volume pricing',
    description: 'For schools and institutions.',
    features: [
      'Everything in Pro',
      'Unlimited seats',
      'SSO & admin portal',
      'Custom AI model tuning',
      'SLA & priority support',
      'Dedicated onboarding',
    ],
    cta: 'Contact sales',
    featured: false,
  },
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section ref={ref} id="pricing" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.55 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <span
              className="inline-block mb-4"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#6366f1',
              }}
            >
              Pricing
            </span>
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
              Simple, transparent
              <br />pricing.
            </h2>
          </div>

          {/* Toggle */}
          <div
            className="inline-flex items-center gap-0.5 p-1 rounded-[10px] self-start md:self-auto"
            style={{ background: '#f1f5f9', border: '1px solid rgba(0,0,0,0.05)' }}
          >
            {(['monthly', 'annual'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setBilling(p)}
                className="relative px-4 py-1.5 rounded-[8px] capitalize transition-all duration-200"
                style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: billing === p ? '#09090f' : '#94a3b8',
                  background: billing === p ? 'white' : 'transparent',
                  boxShadow: billing === p ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {p}
                {p === 'annual' && (
                  <span
                    className="ml-1.5 px-1.5 py-0.5 rounded"
                    style={{ fontSize: '9.5px', fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}
                  >
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ y: 32, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {plan.featured && (
                <div
                  className="absolute -inset-px rounded-[18px]"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)', opacity: 0.7 }}
                />
              )}
              <div
                className="relative h-full flex flex-col rounded-[16px] p-6 overflow-hidden"
                style={{
                  background: plan.featured ? '#09090f' : 'white',
                  border: plan.featured ? 'none' : '1px solid rgba(0,0,0,0.07)',
                  boxShadow: plan.featured
                    ? '0 20px 48px rgba(0,0,0,0.2)'
                    : '0 1px 4px rgba(0,0,0,0.03)',
                }}
              >
                {plan.featured && (
                  <div
                    className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6), transparent 70%)' }}
                  />
                )}

                {plan.badge && (
                  <div
                    className="inline-block self-start px-2.5 py-0.5 rounded-full mb-4"
                    style={{
                      background: 'rgba(99,102,241,0.15)',
                      border: '1px solid rgba(99,102,241,0.25)',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#a5b4fc',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <p
                  className="mb-4"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: plan.featured ? '#64748b' : '#94a3b8',
                  }}
                >
                  {plan.name}
                </p>

                <div className="flex items-end gap-1 mb-1">
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: plan.featured ? '44px' : '40px',
                      fontWeight: 700,
                      letterSpacing: '-0.05em',
                      lineHeight: 1,
                      color: plan.featured ? 'white' : '#09090f',
                    }}
                  >
                    {plan.price[billing]}
                  </span>
                  {typeof plan.sub === 'object' && (
                    <span
                      className="mb-1"
                      style={{
                        fontSize: '12px',
                        color: plan.featured ? '#475569' : '#94a3b8',
                        fontWeight: 500,
                      }}
                    >
                      {plan.sub[billing]}
                    </span>
                  )}
                </div>

                {typeof plan.sub === 'string' && (
                  <p style={{ fontSize: '12px', color: plan.featured ? '#475569' : '#94a3b8', marginBottom: 4 }}>
                    {plan.sub}
                  </p>
                )}

                <p
                  className="mb-6 mt-2"
                  style={{ fontSize: '13.5px', lineHeight: 1.55, color: plan.featured ? '#475569' : '#64748b' }}
                >
                  {plan.description}
                </p>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5">
                      <div
                        className="w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 18,
                          height: 18,
                          background: plan.featured ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.07)',
                        }}
                      >
                        <Check className="w-2.5 h-2.5" style={{ color: plan.featured ? '#a5b4fc' : '#6366f1', width: 10, height: 10 }} />
                      </div>
                      <span style={{ fontSize: '13px', color: plan.featured ? '#cbd5e1' : '#64748b' }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] transition-colors duration-200"
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    background: plan.featured ? 'white' : '#f8fafc',
                    color: plan.featured ? '#09090f' : '#334155',
                    border: plan.featured ? 'none' : '1px solid rgba(0,0,0,0.07)',
                    boxShadow: plan.featured ? '0 2px 10px rgba(0,0,0,0.12)' : 'none',
                  }}
                >
                  {plan.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
