import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';

const faqs = [
  {
    question: 'How does Leren see my screen?',
    answer:
      'Leren uses screen capture with your explicit permission. Content is processed securely and never stored permanently — you can disable screen sharing at any time.',
  },
  {
    question: 'What subjects does Leren support?',
    answer:
      'Math, Science, History, Programming, Languages, Literature, and more. Leren is trained across a wide range of academic topics and adapts to your curriculum.',
  },
  {
    question: 'Can I cancel my Pro subscription anytime?',
    answer:
      'Yes. No long-term commitments, no cancellation fees. Your subscription remains active until the end of the current billing period.',
  },
  {
    question: 'Is my conversation data stored?',
    answer:
      'Session notes are stored to help you review your learning. Voice recordings are processed in real-time and never permanently saved. You can delete history anytime from settings.',
  },
  {
    question: 'How does annual billing work?',
    answer:
      'Annual billing saves you 20% vs. monthly. You pay for 12 months upfront — both plans include identical features.',
  },
];

export function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section ref={ref} id="faq" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-[200px_1fr] gap-12">
          {/* Sticky label */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.55 }}
          >
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
              FAQ
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
              Common
              <br />questions.
            </h2>
          </motion.div>

          {/* Accordion */}
          <div>
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <motion.div
                  key={i}
                  initial={{ y: 16, opacity: 0 }}
                  animate={isInView ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="border-b"
                  style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-4 text-left group"
                  >
                    <span
                      style={{
                        fontSize: '14.5px',
                        fontWeight: 600,
                        color: isOpen ? '#09090f' : '#334155',
                        letterSpacing: '-0.01em',
                        transition: 'color 0.15s',
                      }}
                    >
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
                      style={{ color: isOpen ? '#6366f1' : '#94a3b8' }}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p
                          className="pb-5 text-slate-500"
                          style={{ fontSize: '13.5px', lineHeight: 1.7, paddingRight: '2rem' }}
                        >
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
