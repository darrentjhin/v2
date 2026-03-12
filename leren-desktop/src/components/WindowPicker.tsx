import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface NativeWindow {
  id: number;
  title: string;
  app: string;
  thumb?: string; // base64 PNG thumbnail
}

interface Props {
  onSelect: (id: number) => void;
  onCancel: () => void;
}

export function WindowPicker({ onSelect, onCancel }: Props) {
  const [windows, setWindows]   = useState<NativeWindow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [thumbing, setThumbing] = useState<Set<number>>(new Set());
  const [thumbs, setThumbs]     = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await invoke<NativeWindow[]>('list_windows');
        if (cancelled) return;
        setWindows(list);
        setLoading(false);
        // Load thumbnails one by one
        for (const w of list) {
          if (cancelled) break;
          setThumbing(prev => new Set(prev).add(w.id));
          try {
            const b64 = await invoke<string>('capture_window', { id: w.id });
            if (!cancelled && b64) {
              setThumbs(prev => ({ ...prev, [w.id]: b64 }));
            }
          } catch { /* skip thumbnail */ }
          setThumbing(prev => { const n = new Set(prev); n.delete(w.id); return n; });
        }
      } catch (e) {
        if (!cancelled) {
          setError('Could not load windows. Make sure Screen Recording permission is granted in System Settings → Privacy & Security.');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-700/60 flex flex-col"
        style={{ background: 'linear-gradient(160deg, #020c1a 0%, #000d1a 100%)', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 shrink-0">
          <div>
            <h2 className="font-bold text-white text-base">Choose a window to share</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              The tutor will see screenshots of the selected window.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <p className="text-sm">Loading open windows…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-red-800/40"
                   style={{ background: 'rgba(239,68,68,0.08)' }}>
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <p className="text-sm text-red-400 max-w-sm leading-relaxed">{error}</p>
              <p className="text-xs text-slate-500">
                Go to <strong className="text-slate-400">System Settings → Privacy & Security → Screen Recording</strong> and enable it for Leren, then restart the app.
              </p>
            </div>
          ) : windows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
              <p className="text-sm">No windows found. Open an app first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {windows.map(w => {
                const thumb = thumbs[w.id];
                const isLoading = thumbing.has(w.id);
                const isSelected = selected === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelected(w.id)}
                    className={`rounded-xl border text-left overflow-hidden transition-all ${
                      isSelected
                        ? 'border-blue-500/70 ring-2 ring-blue-500/30'
                        : 'border-slate-700/50 hover:border-slate-600/80'
                    }`}
                    style={{ background: isSelected ? 'rgba(37,99,235,0.1)' : 'rgba(1,10,28,0.8)' }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-video bg-slate-900/60 flex items-center justify-center overflow-hidden">
                      {thumb ? (
                        <img
                          src={`data:image/png;base64,${thumb}`}
                          alt={w.title}
                          className="w-full h-full object-cover"
                        />
                      ) : isLoading ? (
                        <svg className="w-5 h-5 text-slate-600 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="14" rx="2" strokeWidth={1.5}/>
                          <path strokeLinecap="round" strokeWidth={1.5} d="M8 21h8M12 17v4"/>
                        </svg>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
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
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/60 flex items-center gap-3 shrink-0">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1 justify-center rounded-full"
          >
            Cancel
          </button>
          <button
            disabled={selected === null}
            onClick={() => selected !== null && onSelect(selected)}
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
