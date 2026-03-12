import { useEffect, useRef, useState } from 'react';
import { useSession, type Status } from '@/context/SessionContext';
import { WindowPicker } from '@/components/WindowPicker';

const statusConfig: Record<Status, { color: string; label: string }> = {
  idle:      { color: 'bg-slate-600',               label: 'Idle' },
  listening: { color: 'bg-green-400 animate-pulse',  label: 'Listening' },
  speaking:  { color: 'bg-blue-400 animate-pulse',   label: 'You\'re speaking' },
  thinking:  { color: 'bg-yellow-400 animate-pulse', label: 'Thinking…' },
  replying:  { color: 'bg-purple-400 animate-pulse', label: 'Tutor is speaking' },
};

export default function LiveTutor() {
  const { sessionId, turns, status, error, screenActive, isTauri, startSession, endSession } = useSession();
  const [showShareChoice, setShowShareChoice]     = useState(false);
  const [showWindowPicker, setShowWindowPicker]   = useState(false);
  const [starting, setStarting]                   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sc = statusConfig[status];

  // Called when user clicks "Share screen or window" in the choice dialog
  const handleStartWithShare = async () => {
    setShowShareChoice(false);
    if (isTauri) {
      // Desktop: show native window picker instead of getDisplayMedia
      setShowWindowPicker(true);
    } else {
      // Web: use getDisplayMedia (supports window/tab selection in Chrome)
      setStarting(true);
      await startSession(undefined, true);
      setStarting(false);
    }
  };

  // Called when user picks a window in the WindowPicker
  const handleWindowSelected = async (windowId: number) => {
    setShowWindowPicker(false);
    setStarting(true);
    await startSession(undefined, true, windowId);
    setStarting(false);
  };

  const handleStartWithoutShare = async () => {
    setStarting(true);
    setShowShareChoice(false);
    await startSession(undefined, false);
    setStarting(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-3rem)] text-slate-100">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Tutor</h1>
          <p className="text-slate-500 text-sm mt-0.5">Speak naturally — Leren replies when you pause.</p>
        </div>

        <div className="flex items-center gap-3">
          {sessionId && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-700/60"
                 style={{ background: 'rgba(0,10,30,0.6)' }}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${sc.color}`} />
              <span className="text-slate-300">{sc.label}</span>
              {screenActive && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-blue-400">Screen on</span>
                </>
              )}
            </div>
          )}

          {!sessionId ? (
            <button
              className="btn-glow !px-5 !py-2 !text-sm"
              onClick={() => setShowShareChoice(true)}
              disabled={starting}
            >
              <span className="comet-blur" />
              {starting ? 'Starting…' : 'Start Session'}
            </button>
          ) : (
            <button className="btn-danger rounded-full !px-5 !py-2 !text-sm" onClick={endSession}>
              End Session
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/60 text-red-300 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Share choice dialog */}
      {showShareChoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-700/60 p-6"
            style={{ background: 'linear-gradient(160deg, #020c1a 0%, #000d1a 100%)' }}
          >
            <h2 className="text-lg font-bold text-white mb-1">Start session</h2>
            <p className="text-slate-400 text-sm mb-2">
              Share a screen or window so the tutor can see what you’re working on, or continue with voice only.
            </p>
            {isTauri ? (
              <p className="text-slate-500 text-xs mb-6">
                You'll see a list of open windows — pick exactly the one you want to share.
              </p>
            ) : (
              <p className="text-slate-500 text-xs mb-6">
                In the system picker, select "Window" or "Chrome tab" to share just one window.
              </p>
            )}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleStartWithShare}
                className="btn-glow w-full justify-center !rounded-xl"
              >
                <span className="comet-blur" />
                {isTauri ? 'Choose a window…' : 'Share screen or window'}
              </button>
              <button
                type="button"
                onClick={handleStartWithoutShare}
                className="text-sm text-slate-400 hover:text-slate-200 py-2 transition-colors"
              >
                Continue without sharing
              </button>
              <button
                type="button"
                onClick={() => setShowShareChoice(false)}
                className="text-sm text-slate-500 hover:text-slate-300 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Native window picker — desktop app only */}
      {showWindowPicker && (
        <WindowPicker
          onSelect={handleWindowSelected}
          onCancel={() => setShowWindowPicker(false)}
        />
      )}

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto rounded-2xl p-4 space-y-4 border border-slate-800/60"
        style={{ background: 'rgba(0,8,22,0.6)', backdropFilter: 'blur(8px)' }}
      >
        {turns.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 select-none">
            <div className="w-12 h-12 rounded-full border border-slate-700/60 flex items-center justify-center"
                 style={{ background: 'rgba(59,130,246,0.07)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400/60">
                <path d="M12 2a9 9 0 0 1 9 9c0 3.5-2 6.5-5 8l-1 3H9l-1-3C5 18.5 3 15.5 3 11a9 9 0 0 1 9-9z"/>
                <circle cx="12" cy="11" r="2.5" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <p className="text-sm">
              {sessionId ? 'Session started — start speaking…' : 'Click Start Session to begin.'}
            </p>
          </div>
        )}

        {turns.map(turn => (
          <div key={turn.id} className={`flex ${turn.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                turn.role === 'USER'
                  ? 'rounded-br-sm text-white'
                  : 'rounded-bl-sm text-slate-100 border border-slate-700/50'
              }`}
              style={turn.role === 'USER'
                ? { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }
                : { background: 'rgba(15,23,42,0.8)' }
              }
            >
              {turn.text || <span className="italic text-slate-500">Transcribing…</span>}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
