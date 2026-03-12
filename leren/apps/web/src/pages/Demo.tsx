import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FuturisticBackground } from '@/components/FuturisticBackground';

type DemoStep =
  | 'try-button'
  | 'app-start'
  | 'share-dialog'
  | 'share-choice'
  | 'tabs'
  | 'questions'
  | 'explanation'
  | 'notes'
  | 'features'
  | 'done';

const TABS = [
  { id: 'module', label: 'Module: How AI Helps Studying Efficiency', icon: '📄', iconUrl: '' },
  { id: 'gmail', label: 'Gmail - Inbox', icon: '', iconUrl: 'https://www.google.com/s2/favicons?domain=mail.google.com&sz=32' },
  { id: 'youtube', label: 'YouTube - Music', icon: '', iconUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32' },
];

const MODULE_CONTENT = (
  <article className="text-slate-700 space-y-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
    <h1 className="text-2xl font-bold text-slate-900 mb-4">How AI Helps Studying Efficiency</h1>
    <p className="leading-relaxed">
      As students face increasing academic pressure, artificial intelligence is transforming how we learn. This module explores the key ways AI can make your study sessions more effective, personalized, and efficient.
    </p>
    <h2 className="text-lg font-semibold text-slate-800 mt-8">1. Personalized Learning Paths</h2>
    <p className="leading-relaxed">
      Traditional one-size-fits-all curricula often leave students either bored or overwhelmed. AI changes this by analyzing your strengths, weaknesses, and learning pace. It creates custom study plans that focus on what you need most, skipping material you've already mastered and spending more time on challenging concepts. Platforms can adapt in real time based on your quiz results and engagement, ensuring you're always studying at the right level.
    </p>
    <h2 className="text-lg font-semibold text-slate-200 mt-8">2. Smart Spaced Repetition</h2>
    <p className="leading-relaxed">
      Spaced repetition is a proven technique where you review material at increasing intervals to improve long-term retention. AI optimizes this by analyzing when you're likely to forget—based on your performance, the difficulty of each concept, and the forgetting curve. Instead of reviewing everything equally, you focus on the right material at the right time. Studies show this can reduce study time by up to 50% while improving retention.
    </p>
    <h2 className="text-lg font-semibold text-slate-800 mt-8">3. Instant Explanations</h2>
    <p className="leading-relaxed">
      One of the biggest barriers to learning is not knowing where to turn when you're stuck. Office hours are limited, forums can be unreliable, and textbooks don't always address your specific question. AI tutors provide clear, step-by-step explanations 24/7. You can ask follow-up questions until the concept clicks, without the fear of slowing down a class or bothering a busy professor. This instant feedback keeps your study flow going and reduces frustration.
    </p>
    <h2 className="text-lg font-semibold text-slate-200 mt-8">4. Context-Aware Assistance</h2>
    <p className="leading-relaxed">
      Modern AI can see what you're working on—whether it's a textbook page, a problem set, or a lecture slide. This context allows it to give precise, relevant answers instead of generic explanations. When you ask "how do I solve this?", it understands exactly which problem you mean and can guide you through it step by step, just like a tutor sitting beside you.
    </p>
    <p className="leading-relaxed mt-8 text-slate-500 text-sm">
      — End of module. Use the questions below to check your understanding, or ask Leren directly.
    </p>
  </article>
);

const GMAIL_CONTENT = (
  <div className="space-y-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
    <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
      <img src="https://www.google.com/s2/favicons?domain=mail.google.com&sz=24" alt="" className="w-6 h-6" />
      <h2 className="text-lg font-semibold text-slate-800">Inbox</h2>
    </div>
    <div className="space-y-2">
      {['Professor Chen - Assignment feedback', 'Study Group - Meeting tomorrow 3pm', 'Library - Book due in 2 days'].map((subj, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
          <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
          <div>
            <p className="font-medium text-slate-800 text-sm">{subj}</p>
            <p className="text-slate-500 text-xs mt-0.5">Preview of email content goes here. In a real inbox you would see the full message...</p>
          </div>
        </div>
      ))}
    </div>
    <p className="text-slate-500 text-xs mt-6">(Demo: typical daily tab — your real inbox)</p>
  </div>
);

const YOUTUBE_CONTENT = (
  <div className="space-y-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
    <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
      <img src="https://www.google.com/s2/favicons?domain=youtube.com&sz=24" alt="" className="w-6 h-6" />
      <h2 className="text-lg font-semibold text-slate-800">Music & Focus</h2>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {['Lofi Beats', 'Classical Study', 'Ambient Focus', 'Piano Instrumental'].map((title, i) => (
        <div key={i} className="rounded-lg overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
          <div className="aspect-video bg-slate-200 flex items-center justify-center text-red-600 text-3xl">▶</div>
          <p className="p-2 text-sm font-medium text-slate-800">{title}</p>
          <p className="px-2 pb-2 text-xs text-slate-500">Playlist · 2.5k views</p>
        </div>
      ))}
    </div>
    <p className="text-slate-500 text-xs mt-6">(Demo: typical daily tab — background music while studying)</p>
  </div>
);

const EXAMPLE_QUESTIONS = [
  'What is spaced repetition and how does AI optimize it?',
  'How can AI create personalized learning paths?',
  'Why are instant explanations beneficial for students?',
];

const EXPLANATIONS = [
  `Spaced repetition is a learning technique where you review material at increasing intervals. AI optimizes this by analyzing when you're likely to forget—based on your performance and the difficulty of each concept—and scheduling reviews at the perfect moment. This means you retain more information with fewer, strategically timed study sessions.`,
  `AI creates personalized learning paths by analyzing your quiz results, weak topics, and study habits. It then prioritizes what you need to practice most and adapts the difficulty and pace to match your level—so you're always challenged but never overwhelmed.`,
  `Instant explanations mean you don't have to wait for office hours or search through forums. When you're stuck at 2am before an exam, you get clear, step-by-step help right away. This reduces frustration and keeps your study flow going.`,
];

// Guide overlay: dims screen after 1s, spotlights the target button in place, shows instruction
function GuideStep({
  children,
  targetRef,
  instruction,
}: {
  children: React.ReactNode;
  targetRef: React.RefObject<HTMLElement | null>;
  instruction: string;
}) {
  const [dimmed, setDimmed] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDimmed(true), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!dimmed || !targetRef.current) return;
    const el = targetRef.current;
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('scroll', update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', update, true);
    };
  }, [dimmed, targetRef]);

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0">
        {children}
      </div>
      {dimmed && rect && (
        <>
          {/* 4-panel overlay: dark everywhere except a hole at the button; panels block clicks, hole allows through */}
          <div className="fixed inset-0 z-[70] pointer-events-none">
            <div className="absolute top-0 left-0 right-0 pointer-events-auto" style={{ height: rect.top, background: 'rgba(0,0,0,0.85)' }} />
            <div className="absolute left-0 pointer-events-auto" style={{ top: rect.top, width: rect.left, height: rect.height, background: 'rgba(0,0,0,0.85)' }} />
            <div className="absolute pointer-events-auto" style={{ top: rect.top, left: rect.right, right: 0, height: rect.height, background: 'rgba(0,0,0,0.85)' }} />
            <div className="absolute left-0 right-0 bottom-0 pointer-events-auto" style={{ top: rect.bottom, height: window.innerHeight - rect.bottom, background: 'rgba(0,0,0,0.85)' }} />
          </div>
          {/* Ring highlight + instruction near the button */}
          <div
            className="fixed z-[71] pointer-events-none"
            style={{ left: rect.left - 6, top: rect.top - 6, width: rect.width + 12, height: rect.height + 12 }}
          >
            <div className="absolute inset-0 ring-4 ring-blue-400/90 rounded-xl animate-pulse" style={{ animationDuration: '2s' }} />
          </div>
          <p
            className="fixed z-[71] pointer-events-none text-white text-sm font-medium drop-shadow-lg max-w-[220px]"
            style={{ left: rect.left, top: rect.bottom + 12 }}
          >
            {instruction}
          </p>
        </>
      )}
    </div>
  );
}

// 3 example open windows — macOS style thumbnails
const DEMO_WINDOWS = [
  {
    id: 'messages',
    title: 'Messages',
    app: 'Messages',
    thumb: (
      // macOS Messages — light background, conversation list
      <div className="w-full h-full flex" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#f5f5f7' }}>
        {/* Sidebar */}
        <div className="w-[38%] border-r border-gray-200 flex flex-col" style={{ background: '#f5f5f7' }}>
          <div className="px-2 pt-2 pb-1">
            <div className="h-2 w-12 rounded-full bg-gray-300 mx-auto mb-1" />
          </div>
          {[{ name: 'Study Group', msg: 'Meeting at 3pm?', unread: true }, { name: 'Professor Chen', msg: 'Assignment due Fri', unread: false }, { name: 'Mom', msg: 'Dinner tonight?', unread: false }].map((c, i) => (
            <div key={i} className={`flex items-center gap-1.5 px-2 py-1.5 ${i === 0 ? 'rounded-lg mx-1' : ''}`} style={i === 0 ? { background: '#007AFF' } : {}}>
              <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[8px] font-bold ${i === 0 ? 'bg-white/30 text-white' : 'bg-gray-300 text-gray-600'}`}>{c.name[0]}</div>
              <div className="min-w-0">
                <p className={`text-[8px] font-semibold truncate ${i === 0 ? 'text-white' : 'text-gray-800'}`}>{c.name}</p>
                <p className={`text-[7px] truncate ${i === 0 ? 'text-blue-100' : 'text-gray-400'}`}>{c.msg}</p>
              </div>
              {c.unread && i !== 0 && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ml-auto" />}
            </div>
          ))}
        </div>
        {/* Chat area */}
        <div className="flex-1 flex flex-col" style={{ background: '#fff' }}>
          <div className="border-b border-gray-100 px-2 py-1 flex items-center justify-center">
            <p className="text-[8px] font-semibold text-gray-700">Study Group</p>
          </div>
          <div className="flex-1 px-2 py-1 space-y-1">
            <div className="flex justify-start"><div className="bg-gray-100 rounded-xl px-2 py-0.5 text-[7px] text-gray-700 max-w-[80%]">Are you joining tonight?</div></div>
            <div className="flex justify-end"><div className="rounded-xl px-2 py-0.5 text-[7px] text-white max-w-[80%]" style={{ background: '#007AFF' }}>Yes, at 8!</div></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'notes',
    title: 'Notes',
    app: 'Notes',
    thumb: (
      // macOS Notes — yellow sidebar, note content
      <div className="w-full h-full flex" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        {/* Sidebar */}
        <div className="w-[40%] border-r border-yellow-200 flex flex-col py-1" style={{ background: '#faf3dc' }}>
          {[{ title: 'Exam Revision', preview: 'Chapter 4 — key points...' }, { title: 'Lecture Notes', preview: 'Intro to AI systems...' }, { title: 'Project Ideas', preview: 'Group project — topic...' }].map((n, i) => (
            <div key={i} className={`px-2 py-1 ${i === 0 ? 'rounded mx-1' : ''}`} style={i === 0 ? { background: '#f5d76e' } : {}}>
              <p className="text-[8px] font-semibold text-gray-800 truncate">{n.title}</p>
              <p className="text-[7px] text-gray-500 truncate">{n.preview}</p>
            </div>
          ))}
        </div>
        {/* Note content */}
        <div className="flex-1 px-2 py-1.5" style={{ background: '#fffef5' }}>
          <p className="text-[9px] font-bold text-gray-900 mb-1">Exam Revision</p>
          <div className="space-y-0.5">
            <p className="text-[7px] text-gray-700">Chapter 4 key points:</p>
            <p className="text-[7px] text-gray-500">• Spaced repetition theory</p>
            <p className="text-[7px] text-gray-500">• Active recall methods</p>
            <p className="text-[7px] text-gray-500">• Pomodoro technique</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'chrome',
    title: 'Required Reading: AI & Learning Efficiency – CS 301 · Canvas',
    app: 'Google Chrome',
    thumb: (
      <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: '#dee1e6', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        {/* Chrome title bar */}
        <div className="flex items-center gap-1 px-2 py-0.5 shrink-0" style={{ background: '#dee1e6' }}>
          <div className="flex gap-0.5">
            <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <span className="w-2 h-2 rounded-full bg-[#28c840]" />
          </div>
        </div>
        {/* Chrome tab bar — Canvas "C" favicon in tab */}
        <div className="flex px-1 items-end shrink-0" style={{ background: '#dee1e6' }}>
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-t text-[5.5px] text-gray-700 truncate max-w-[95%]" style={{ background: '#fff' }}>
            <svg className="w-2 h-2 shrink-0" viewBox="0 0 20 20"><rect width="20" height="20" rx="3" fill="#E66000"/><text x="3.5" y="14.5" fontSize="13" fontWeight="bold" fill="white" fontFamily="sans-serif">C</text></svg>
            <span className="truncate">Required Reading: AI &amp; Learning – Canvas</span>
          </div>
        </div>
        {/* Canvas page */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Global nav — dark icon rail */}
          <div className="w-[13%] shrink-0 flex flex-col items-center pt-1 gap-1 border-r border-gray-700" style={{ background: '#394B58' }}>
            <div className="w-4 h-4 rounded flex items-center justify-center font-bold text-white mb-0.5" style={{ background: '#E66000', fontSize: '7px' }}>C</div>
            {['👤','⊞','📚','✉️','🕐'].map((ic, i) => (
              <div key={i} className={`w-full flex flex-col items-center py-0.5 ${i === 2 ? 'bg-white/20' : ''}`}>
                <span style={{ fontSize: '5.5px' }}>{ic}</span>
              </div>
            ))}
          </div>
          {/* Course nav */}
          <div className="w-[24%] shrink-0 border-r border-gray-200 flex flex-col" style={{ background: '#fff' }}>
            <div className="px-1.5 py-0.5 border-b border-gray-100">
              <p className="text-[6px] font-bold text-gray-800">CS 301</p>
              <p className="text-[4.5px] text-gray-400">Spring 2026</p>
            </div>
            {['Home','Announcements','Modules','Assignments','Grades','Files','People'].map((item, i) => (
              <div key={item} className={`px-1.5 py-0.5 text-[5px] border-l-2 ${i === 1 ? 'border-[#E66000] font-bold bg-orange-50 text-gray-900' : 'border-transparent text-gray-500'}`}>{item}</div>
            ))}
          </div>
          {/* Article content */}
          <div className="flex-1 overflow-hidden px-1.5 py-1 flex flex-col gap-0.5" style={{ background: '#fff' }}>
            <div className="flex items-center gap-0.5 text-[4.5px] text-gray-400 mb-0.5">
              <span>CS 301</span><span>›</span><span>Announcements</span>
            </div>
            {/* Author row */}
            <div className="flex items-center gap-0.5 mb-0.5">
              <div className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center text-white font-bold" style={{ background: '#5B6DC8', fontSize: '4.5px' }}>MC</div>
              <div>
                <p className="text-[5.5px] font-semibold" style={{ color: '#0770C2' }}>Prof. Michelle Chen</p>
                <p className="text-[4px] text-gray-400">AUTHOR · INSTRUCTOR · Posted Mar 3, 9:00am</p>
              </div>
            </div>
            <p className="text-[7.5px] font-bold text-gray-900 leading-tight">Required Reading: How AI Improves Learning Efficiency</p>
            <div className="space-y-0.5 text-[5px] text-gray-700 leading-relaxed">
              <p>Hi everyone,</p>
              <p>This week's reading explores how AI is reshaping how students learn. Please read carefully before Tuesday's lecture.</p>
              <p><span className="font-semibold">1) Personalized learning</span> — AI adapts content to your performance in real time, so you're always at the right level.</p>
              <p><span className="font-semibold">2) Spaced repetition</span> — Instead of cramming, AI schedules reviews at optimal intervals based on your forgetting curve.</p>
              <p><span className="font-semibold">3) Instant feedback</span> — AI tutors answer questions 24/7, in context, without waiting for office hours.</p>
              <p className="text-gray-400 italic">Come prepared to discuss. — Prof. Chen</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

function DemoWindowPicker({ onShare, onCancel }: { onShare: () => void; onCancel: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'guide-card' | 'guide-share'>('idle');
  const cardRef = useRef<HTMLButtonElement>(null);
  const shareRef = useRef<HTMLButtonElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // 1s delay then start guiding
  useEffect(() => {
    const t = setTimeout(() => setPhase('guide-card'), 1000);
    return () => clearTimeout(t);
  }, []);

  // After user selects chrome, switch guide to Share button
  useEffect(() => {
    if (selected === 'chrome') {
      setPhase('guide-share');
    }
  }, [selected]);

  // Track rect of the current target
  useEffect(() => {
    if (phase === 'idle') return;
    const el = phase === 'guide-share' ? shareRef.current : cardRef.current;
    if (!el) return;
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('scroll', update, true);
    return () => { ro.disconnect(); window.removeEventListener('scroll', update, true); };
  }, [phase]);

  const isDimmed = phase !== 'idle' && rect !== null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}>
      {/* Overlay panels — 4-panel cutout around target */}
      {isDimmed && rect && (
        <div className="fixed inset-0 z-[70] pointer-events-none">
          <div className="absolute top-0 left-0 right-0 pointer-events-auto" style={{ height: rect.top, background: 'rgba(0,0,0,0.85)' }} />
          <div className="absolute left-0 pointer-events-auto" style={{ top: rect.top, width: rect.left, height: rect.height, background: 'rgba(0,0,0,0.85)' }} />
          <div className="absolute pointer-events-auto" style={{ top: rect.top, left: rect.right, right: 0, height: rect.height, background: 'rgba(0,0,0,0.85)' }} />
          <div className="absolute left-0 right-0 bottom-0 pointer-events-auto" style={{ top: rect.bottom, background: 'rgba(0,0,0,0.85)' }} />
          <div className="fixed z-[71] pointer-events-none"
               style={{ left: rect.left - 4, top: rect.top - 4, width: rect.width + 8, height: rect.height + 8 }}>
            <div className="absolute inset-0 ring-4 ring-blue-400/90 rounded-xl animate-pulse" style={{ animationDuration: '2s' }} />
          </div>
          <p className="fixed z-[71] pointer-events-none text-white text-sm font-medium drop-shadow-lg max-w-[240px]"
             style={{ left: rect.left, top: rect.bottom + 12 }}>
            {phase === 'guide-card'
              ? 'Click the Chrome window with your study material to select it.'
              : 'Now click Share this window to continue.'}
          </p>
        </div>
      )}

      {/* Dialog */}
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700/60 flex flex-col"
           style={{ background: 'linear-gradient(160deg, #020c1a 0%, #000d1a 100%)', maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 shrink-0">
          <div>
            <h2 className="font-bold text-white text-base">Choose a window to share</h2>
            <p className="text-slate-500 text-xs mt-0.5">The tutor will see screenshots of the selected window.</p>
          </div>
          <button type="button" onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Window grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            {DEMO_WINDOWS.map((w) => {
              const isSelected = selected === w.id;
              return (
                <button
                  key={w.id}
                  ref={w.id === 'chrome' ? cardRef : undefined}
                  type="button"
                  onClick={() => setSelected(w.id)}
                  className={`rounded-xl border text-left overflow-hidden transition-all ${
                    isSelected
                      ? 'border-blue-500/70 ring-2 ring-blue-500/30'
                      : 'border-slate-700/50 hover:border-slate-600/80'
                  }`}
                  style={{ background: isSelected ? 'rgba(37,99,235,0.1)' : 'rgba(1,10,28,0.8)' }}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video bg-slate-900/60 overflow-hidden">
                    {w.thumb}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Label */}
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-white truncate">{w.title}</p>
                    <p className="text-xs text-slate-500 truncate">{w.app}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/60 flex items-center gap-3 shrink-0">
          <button type="button" onClick={onCancel}
                  className="flex-1 py-2.5 rounded-full text-sm font-medium text-slate-300 border border-slate-700/60 hover:border-slate-600"
                  style={{ background: 'rgba(15,23,42,0.6)' }}>
            Cancel
          </button>
          <button
            ref={shareRef}
            type="button"
            disabled={selected === null}
            onClick={() => selected !== null && onShare()}
            className="btn-glow flex-1 justify-center !rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="comet-blur" />
            Share this window
          </button>
        </div>
      </div>
    </div>
  );
}

// Demo sidebar (matches app layout)
function DemoSidebar() {
  return (
    <aside className="flex flex-col w-60 min-h-screen border-r border-slate-800/60 px-3 py-5 shrink-0" style={{ background: 'rgba(0,10,25,0.7)', backdropFilter: 'blur(12px)' }}>
      <div className="flex justify-center mb-8">
        <Link to="/"><img src="/logo.png" alt="Leren" className="h-12 w-auto object-contain" /></Link>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {['Live Tutor', 'Subjects', 'Saved', 'Progress', 'Archive & Trash'].map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
              i === 0 ? 'bg-blue-600/20 text-blue-300' : 'text-slate-400'
            }`}
          >
            {label}
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-800 pt-4 flex flex-col gap-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400">Profile</div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400">Settings</div>
      </div>
    </aside>
  );
}

export default function Demo() {
  const [step, setStep] = useState<DemoStep>('try-button');
  const [fullScreen, setFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState('module');
  const [selectedQ, setSelectedQ] = useState<number | null>(null);
  const [featureTab, setFeatureTab] = useState<'exam' | 'upload' | 'summarize'>('exam');
  const targetRef = useRef<HTMLElement>(null);

  const startDemo = () => {
    setFullScreen(true);
    setStep('app-start');
  };

  const exitFullScreen = () => {
    setFullScreen(false);
    setStep('try-button');
    setActiveTab('module');
    setSelectedQ(null);
  };

  return (
    <div className="min-h-screen bg-[#000d1a] text-slate-100 overflow-x-hidden">
      <FuturisticBackground />
      <div className="relative z-10">
        <header className="flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
          <Link to="/" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
            <img src="/logo.png" alt="Leren" className="h-14 w-auto object-contain" />
            <span className="text-xl font-semibold">Leren</span>
          </Link>
          <Link
            to="/download"
            className="px-4 py-2 rounded-full text-sm font-medium border border-slate-600/60 bg-slate-800/50 text-slate-200
                       hover:border-blue-500/50 hover:bg-blue-600/20 hover:text-blue-300 transition-colors"
          >
            Download app
          </Link>
        </header>

        <main className="max-w-4xl mx-auto px-6 pb-20">
          <section className="mb-12">
            <h1 className="text-3xl font-bold text-white mb-6">How Leren Works</h1>
            <div
              className="w-full aspect-video rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center gap-3"
              style={{ background: 'rgba(15,23,42,0.6)' }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-slate-500/50 text-slate-500">
                <svg className="w-6 h-6 shrink-0 block" fill="currentColor" viewBox="0 0 24 24" style={{ marginLeft: '3px' }}><path d="M8 5v14l11-7z"/></svg>
              </div>
              <p className="text-slate-500 text-sm">Explanation video</p>
              <p className="text-slate-600 text-xs">Add your demo or tutorial video here</p>
            </div>
          </section>

          {/* Try the tutor */}
          <section>
            <h2 className="text-xl font-bold text-white mb-2">Try the tutor</h2>
            <p className="text-slate-400 text-sm mb-6">Experience a guided walkthrough of how Leren works.</p>

            {!fullScreen ? (
              <div className="rounded-2xl border border-slate-700/50 overflow-hidden" style={{ background: 'rgba(1,10,28,0.8)' }}>
                <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500/80" />
                  <span className="text-slate-400 text-sm">Live demo</span>
                </div>
                <div className="p-8 flex flex-col items-center justify-center gap-6 min-h-[200px]">
                  <button
                    type="button"
                    onClick={startDemo}
                    className="btn-glow !px-8 !py-4 !text-base"
                  >
                    <span className="comet-blur" />
                    Try Leren
                  </button>
                </div>
              </div>
            ) : (
              /* Full-screen demo overlay */
              <div
                className="fixed inset-0 z-50 flex flex-col"
                style={{ background: 'linear-gradient(160deg, #000d1a 0%, #001233 40%, #000814 100%)' }}
              >
                <div className="flex flex-1 min-h-0">
                  <DemoSidebar />
                  <main className="flex-1 overflow-auto p-6 flex flex-col">
                    {/* Step: app-start — Start Session */}
                    {step === 'app-start' && (
                      <GuideStep targetRef={targetRef} instruction="Click Start Session to begin your live tutor session.">
                        <div className="flex flex-col h-full max-h-[calc(100vh-3rem)]">
                          <div className="flex items-center justify-between mb-5">
                            <div>
                              <h1 className="text-2xl font-bold tracking-tight">Live Tutor</h1>
                              <p className="text-slate-500 text-sm mt-0.5">Speak naturally — Leren replies when you pause.</p>
                            </div>
                            <div ref={targetRef as React.RefObject<HTMLDivElement>}>
                              <button
                                type="button"
                                onClick={() => setStep('share-dialog')}
                                className="btn-glow !px-5 !py-2 !text-sm"
                              >
                                <span className="comet-blur" />
                                Start Session
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 rounded-2xl border border-slate-800/60 p-8 flex flex-col items-center justify-center gap-3 text-slate-500" style={{ background: 'rgba(0,8,22,0.6)' }}>
                            <p className="text-sm">Click Start Session to begin.</p>
                          </div>
                        </div>
                      </GuideStep>
                    )}

                    {/* Step: share-dialog — "Start session" modal, guide to Choose a window */}
                    {step === 'share-dialog' && (
                      <GuideStep targetRef={targetRef} instruction="Click Choose a window to pick which window the tutor sees.">
                        <div className="flex flex-col h-full max-h-[calc(100vh-3rem)]">
                          <div className="flex items-center justify-between mb-5">
                            <div>
                              <h1 className="text-2xl font-bold tracking-tight">Live Tutor</h1>
                              <p className="text-slate-500 text-sm mt-0.5">Speak naturally — Leren replies when you pause.</p>
                            </div>
                            <button type="button" className="btn-glow !px-5 !py-2 !text-sm opacity-100">
                              <span className="comet-blur" />Start Session
                            </button>
                          </div>
                          <div className="flex-1 rounded-2xl border border-slate-800/60 p-8 flex flex-col items-center justify-center gap-3 text-slate-500" style={{ background: 'rgba(0,8,22,0.6)' }}>
                            <p className="text-sm">Click Start Session to begin.</p>
                          </div>
                        </div>
                        {/* "Start session" modal — rendered on top */}
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
                          <div className="w-full max-w-md rounded-2xl border border-slate-700/60 p-6" style={{ background: 'linear-gradient(160deg, #020c1a 0%, #000d1a 100%)' }}>
                            <h2 className="text-lg font-bold text-white mb-1">Start session</h2>
                            <p className="text-slate-400 text-sm mb-2">Share a screen or window so the tutor can see what you're working on, or continue with voice only.</p>
                            <p className="text-slate-500 text-xs mb-6">You'll see a list of open windows — pick exactly the one you want to share.</p>
                            <div className="flex flex-col gap-3">
                              <div ref={targetRef as React.RefObject<HTMLDivElement>}>
                                <button type="button" onClick={() => setStep('share-choice')} className="btn-glow w-full justify-center !rounded-xl">
                                  <span className="comet-blur" />Choose a window…
                                </button>
                              </div>
                              <button type="button" onClick={() => setStep('tabs')} className="text-sm text-slate-400 hover:text-slate-200 py-2 transition-colors">
                                Continue without sharing
                              </button>
                              <button type="button" onClick={() => setStep('app-start')} className="text-sm text-slate-500 hover:text-slate-300 py-2 transition-colors">
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </GuideStep>
                    )}

                    {/* Step: share-choice — mirrors real app WindowPicker */}
                    {step === 'share-choice' && (
                      <>
                        <div className="mb-5">
                          <h1 className="text-2xl font-bold">Live Tutor</h1>
                        </div>
                        <DemoWindowPicker
                          onShare={() => setStep('tabs')}
                          onCancel={() => setStep('app-start')}
                        />
                      </>
                    )}

                    {/* Step: tabs — MacBook display with 3 opened files */}
                    {step === 'tabs' && (
                      <GuideStep targetRef={targetRef} instruction="Click here to move on to the practice questions. Leren uses your shared content as context.">
                        <div className="flex flex-col h-full max-h-[calc(100vh-3rem)]">
                          <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">Live Tutor</h1>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500/80" />
                              <span className="text-slate-400 text-xs">Screen shared</span>
                            </div>
                          </div>
                          <div
                            className="flex-1 rounded-2xl overflow-hidden border border-slate-300/40 flex flex-col min-h-[420px] shadow-xl"
                            style={{ background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                          >
                            {/* Chrome title bar — Mac traffic lights + title */}
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200" style={{ background: '#f1f3f4' }}>
                              <div className="flex gap-1.5 shrink-0">
                                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                              </div>
                              <span className="text-slate-600 text-xs ml-2 truncate flex-1 text-center font-medium">
                                {TABS.find(t => t.id === activeTab)?.label}
                              </span>
                            </div>
                            {/* Chrome tabs — white, lively */}
                            <div className="flex border-b border-slate-200 px-2 pt-2 gap-0.5" style={{ background: '#e8eaed' }}>
                              {TABS.map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => setActiveTab(t.id)}
                                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm transition-all min-w-[160px] justify-center ${
                                    activeTab === t.id
                                      ? 'text-slate-800 bg-white border border-slate-200 border-b-0 -mb-px shadow-sm'
                                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
                                  }`}
                                >
                                  {t.iconUrl ? (
                                    <img src={t.iconUrl} alt="" className="w-4 h-4 shrink-0" />
                                  ) : (
                                    <span className="text-base">{t.icon || '📄'}</span>
                                  )}
                                  <span className="truncate font-normal">{t.label}</span>
                                </button>
                              ))}
                            </div>
                            <div className="flex-1 overflow-auto p-8" style={{ background: '#fff' }}>
                              {activeTab === 'module' && (
                                <div className="max-w-2xl">
                                  {MODULE_CONTENT}
                                  <div ref={targetRef as React.RefObject<HTMLDivElement>} className="inline-block mt-8">
                                    <button type="button" onClick={() => setStep('questions')} className="btn-glow !px-5 !py-2.5 !text-sm">
                                      <span className="comet-blur" />Continue to questions
                                    </button>
                                  </div>
                                </div>
                              )}
                              {activeTab === 'gmail' && GMAIL_CONTENT}
                              {activeTab === 'youtube' && YOUTUBE_CONTENT}
                            </div>
                          </div>
                        </div>
                      </GuideStep>
                    )}

                    {/* Step: questions */}
                    {step === 'questions' && (
                      <GuideStep targetRef={targetRef} instruction="Click a question to ask the AI. In the real app, you'd speak it—Leren hears and responds.">
                        <div className="flex flex-col gap-4">
                          <h1 className="text-2xl font-bold">Example questions</h1>
                          <p className="text-slate-400 text-sm">This is just an example. In reality, you speak to the AI right away—no typing needed.</p>
                          <div className="space-y-2">
                            {EXAMPLE_QUESTIONS.map((q, i) => (
                              <div key={i} ref={i === 0 ? (targetRef as React.RefObject<HTMLDivElement>) : undefined}>
                                <button
                                  type="button"
                                  onClick={() => { setSelectedQ(i); setStep('explanation'); }}
                                  className="w-full text-left px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-blue-500/40 hover:bg-slate-800/50 text-slate-200 text-sm transition-colors"
                                >
                                  {q}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </GuideStep>
                    )}

                    {/* Step: explanation */}
                    {step === 'explanation' && (
                      <GuideStep targetRef={targetRef} instruction="Click Next to see your session notes. Leren saves summaries automatically.">
                        <div className="flex flex-col gap-4">
                          <h1 className="text-2xl font-bold">Tutor response</h1>
                          <div className="rounded-2xl border border-slate-700/50 p-5 bg-slate-800/30">
                            <p className="text-slate-400 text-xs mb-2">Question: {EXAMPLE_QUESTIONS[selectedQ ?? 0]}</p>
                            <p className="text-slate-200 text-sm leading-relaxed">{EXPLANATIONS[selectedQ ?? 0]}</p>
                          </div>
                          <div ref={targetRef as React.RefObject<HTMLDivElement>} className="w-fit">
                            <button type="button" onClick={() => setStep('notes')} className="btn-glow !px-5 !py-2 !text-sm w-fit">
                              <span className="comet-blur" />Next
                            </button>
                          </div>
                        </div>
                      </GuideStep>
                    )}

                    {/* Step: notes */}
                    {step === 'notes' && (
                      <GuideStep targetRef={targetRef} instruction="Click to discover exam prediction, file upload, and summarization features.">
                        <div className="flex flex-col gap-4">
                          <h1 className="text-2xl font-bold">Session notes</h1>
                          <div className="rounded-2xl border border-blue-500/30 p-5" style={{ background: 'rgba(59,130,246,0.08)' }}>
                            <p className="text-slate-200 text-sm mb-2">When you end a session, Leren automatically summarizes your conversation into clean, downloadable notes.</p>
                            <p className="text-blue-400 text-xs">You can download these notes anytime from the session history.</p>
                          </div>
                          <div ref={targetRef as React.RefObject<HTMLDivElement>} className="w-fit">
                            <button type="button" onClick={() => setStep('features')} className="btn-glow !px-5 !py-2 !text-sm w-fit">
                              <span className="comet-blur" />See more features
                            </button>
                          </div>
                        </div>
                      </GuideStep>
                    )}

                    {/* Step: features */}
                    {step === 'features' && (
                      <GuideStep targetRef={targetRef} instruction="Click Finish when you're ready. You can create a free account to try the full app.">
                        <div className="flex flex-col gap-4">
                          <h1 className="text-2xl font-bold">More in Leren</h1>
                          <div className="flex gap-2 mb-4">
                            {(['exam', 'upload', 'summarize'] as const).map((t) => (
                              <button key={t} type="button" onClick={() => setFeatureTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${featureTab === t ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-500 border border-slate-700/50 hover:text-slate-300'}`}>
                                {t === 'exam' ? 'Exam prediction' : t === 'upload' ? 'File upload' : 'Summarize'}
                              </button>
                            ))}
                          </div>
                          <div className="rounded-2xl border border-slate-700/50 p-5 bg-slate-800/30 min-h-[120px]">
                            {featureTab === 'exam' && <p className="text-slate-300 text-sm">Generate practice exams on any topic. AI predicts likely question types and creates full exam-style sets tailored to your syllabus.</p>}
                            {featureTab === 'upload' && <p className="text-slate-300 text-sm">Upload PDFs, images, or documents. Leren extracts the content and uses it as context when you ask questions—perfect for textbooks and lecture slides.</p>}
                            {featureTab === 'summarize' && <p className="text-slate-300 text-sm">Get AI-generated summaries of your uploaded materials. One click to condense long readings into key points you can review quickly.</p>}
                          </div>
                          <div ref={targetRef as React.RefObject<HTMLDivElement>} className="w-fit">
                            <button type="button" onClick={() => setStep('done')} className="btn-glow !px-5 !py-2 !text-sm w-fit">
                              <span className="comet-blur" />Finish demo
                            </button>
                          </div>
                        </div>
                      </GuideStep>
                    )}

                    {/* Step: done */}
                    {step === 'done' && (
                      <div className="flex flex-col items-center justify-center gap-6 py-12">
                        <h1 className="text-2xl font-bold text-white">That's how Leren works</h1>
                        <p className="text-slate-400 text-sm text-center max-w-md">Create a free account to try the real app with voice, screen share, and all features.</p>
                        <div className="flex gap-3">
                          <Link to="/register" className="btn-glow !px-6 !py-3">
                            <span className="comet-blur" />Create free account
                          </Link>
                          <button type="button" onClick={exitFullScreen} className="btn-secondary !px-6 !py-3">
                            Exit demo
                          </button>
                        </div>
                      </div>
                    )}
                  </main>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
