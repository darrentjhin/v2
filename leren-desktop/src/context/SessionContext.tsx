import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

// ── Tauri detection ───────────────────────────────────────────────────────────
const IS_TAURI = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export type Turn   = { id: string; role: 'USER' | 'TUTOR'; text: string; createdAt: string };
export type Status = 'idle' | 'listening' | 'speaking' | 'thinking' | 'replying';
export type SubjectCtx = { id: string; name: string; summary?: string | null };

// ── TTS endpoint ─────────────────────────────────────────────────────────────
// POST /api/tutor/tts  { text: string }  →  audio/* blob
// Falls back to browser SpeechSynthesis until the API is ready.
const TTS_PATH = '/tutor/tts';

const VOLUME_THRESHOLD = 0.018;
const SILENCE_MS       = 1500;
const MIN_SPEECH_MS    = 400;

interface SessionContextValue {
  sessionId:      string | null;
  activeSubject:  SubjectCtx | null;
  turns:          Turn[];
  status:         Status;
  error:          string;
  screenActive:   boolean;
  isTauri:        boolean;
  startSession:   (subject?: SubjectCtx, withScreenShare?: boolean, tauriWindowId?: number) => Promise<void>;
  endSession:     () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId]         = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<SubjectCtx | null>(null);
  const [turns, setTurns]                 = useState<Turn[]>([]);
  const [status, setStatus]               = useState<Status>('idle');
  const [error, setError]                 = useState('');
  const [screenActive, setScreenActive]   = useState(false);

  // ── audio / screen refs ──────────────────────────────────────────────
  const audioStreamRef  = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenVideoRef  = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef     = useRef<AudioContext | null>(null);
  const analyserRef     = useRef<AnalyserNode | null>(null);
  const recorderRef     = useRef<MediaRecorder | null>(null);
  const chunksRef       = useRef<Blob[]>([]);

  // ── VAD refs ─────────────────────────────────────────────────────────
  const vadRafRef           = useRef<number>(0);
  const isSpeakingRef       = useRef(false);
  const speechStartRef      = useRef(0);
  const silenceStartRef     = useRef<number | null>(null);
  const processingRef       = useRef(false);
  const ttsPlayingRef       = useRef(false);
  const vadStatusRef        = useRef<Status>('listening');
  const silentSinceRef      = useRef<number | null>(null); // when silence began for status debounce
  const STATUS_SILENCE_DELAY = 1500; // ms of silence before flipping to 'listening'

  // ── poll / TTS refs ──────────────────────────────────────────────────
  const pollIntervalRef = useRef<number>(0);
  const lastPollRef     = useRef<string>(new Date().toISOString());
  const spokenTurnsRef  = useRef<Set<string>>(new Set());
  const ttsAudioRef     = useRef<HTMLAudioElement | null>(null);
  const sessionIdRef    = useRef<string | null>(null); // mirror for callbacks

  // Keep sessionIdRef in sync so callbacks always see current value
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // ── Tauri: native window ID for per-utterance capture ────────────────────
  const tauriWindowIdRef = useRef<number | null>(null);

  // ── screen capture ───────────────────────────────────────────────────────
  const captureScreenFrame = useCallback(async (): Promise<Blob | null> => {
    // Desktop app: call native Rust command to screenshot the chosen window
    if (IS_TAURI && tauriWindowIdRef.current !== null) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const b64 = await invoke<string>('capture_window', { id: tauriWindowIdRef.current });
        if (!b64) return null;
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new Blob([bytes], { type: 'image/png' });
      } catch { return null; }
    }
    // Web: draw the hidden <video> element (from getDisplayMedia) to canvas
    const video = screenVideoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    return new Promise(res => canvas.toBlob(res, 'image/png', 0.85));
  }, []);

  // ── send user utterance ───────────────────────────────────────────────
  const sendUtterance = useCallback(async (audioBlob: Blob, sid: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setStatus('thinking');

    const form = new FormData();
    form.append('audio', audioBlob, 'utterance.webm');
    const frame = await captureScreenFrame();
    if (frame) form.append('screenshot', frame, 'screen.png');

    try {
      const turn = await api.upload<Turn>(`/tutor/session/${sid}/turn`, form);
      setTurns(prev => [...prev, turn]);
      lastPollRef.current = new Date().toISOString();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      processingRef.current = false;
      silentSinceRef.current = null;
      vadStatusRef.current = 'listening';
      setStatus('listening');
    }
  }, [captureScreenFrame]);

  // ── VAD loop ──────────────────────────────────────────────────────────
  const runVAD = useCallback(() => {
    const analyser = analyserRef.current;
    const stream   = audioStreamRef.current;
    const sid      = sessionIdRef.current;
    if (!analyser || !stream || !sid) return;

    if (ttsPlayingRef.current) {
      vadRafRef.current = requestAnimationFrame(runVAD);
      return;
    }

    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) { const n = (data[i] - 128) / 128; sum += n * n; }
    const rms = Math.sqrt(sum / data.length);
    const now = Date.now();

    // ── Real-time status: speaking instantly, listening after 1.5 s of silence ──
    if (!processingRef.current) {
      if (rms > VOLUME_THRESHOLD) {
        silentSinceRef.current = null; // reset silence timer on any sound
        if (vadStatusRef.current !== 'speaking') {
          vadStatusRef.current = 'speaking';
          setStatus('speaking');
        }
      } else {
        if (vadStatusRef.current === 'speaking') {
          if (silentSinceRef.current === null) {
            silentSinceRef.current = now; // start silence timer
          } else if (now - silentSinceRef.current >= STATUS_SILENCE_DELAY) {
            silentSinceRef.current = null;
            vadStatusRef.current = 'listening';
            setStatus('listening');
          }
        }
      }
    }

    if (rms > VOLUME_THRESHOLD) {
      if (!isSpeakingRef.current) {
        isSpeakingRef.current = true;
        speechStartRef.current = now;
        silenceStartRef.current = null;
        if (!processingRef.current && (!recorderRef.current || recorderRef.current.state === 'inactive')) {
          chunksRef.current = [];
          const rec = new MediaRecorder(stream);
          recorderRef.current = rec;
          rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
          rec.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            if (chunksRef.current.length > 0) sendUtterance(blob, sid);
          };
          rec.start(100);
        }
      }
    } else if (isSpeakingRef.current) {
      const speechDuration = now - speechStartRef.current;
      if (speechDuration >= MIN_SPEECH_MS) {
        if (!silenceStartRef.current) { silenceStartRef.current = now; }
        else if (now - silenceStartRef.current >= SILENCE_MS) {
          const rec = recorderRef.current;
          if (rec?.state === 'recording') { rec.stop(); recorderRef.current = null; }
          isSpeakingRef.current = false; silenceStartRef.current = null;
        }
      } else {
        // too short — discard
        isSpeakingRef.current = false; silenceStartRef.current = null;
      }
    }
    vadRafRef.current = requestAnimationFrame(runVAD);
  }, [sendUtterance]);

  // ── TTS ───────────────────────────────────────────────────────────────
  const speakText = useCallback(async (text: string) => {
    if (ttsAudioRef.current) { ttsAudioRef.current.pause(); ttsAudioRef.current = null; }
    window.speechSynthesis?.cancel();

    const rec = recorderRef.current;
    if (rec?.state === 'recording') { rec.stop(); recorderRef.current = null; }
    isSpeakingRef.current = false;

    ttsPlayingRef.current = true;
    setStatus('replying');

    try {
      const blob = await api.tts(TTS_PATH, { text });
      const url  = URL.createObjectURL(blob);
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      await new Promise<void>(resolve => {
        audio.onended  = () => resolve();
        audio.onerror  = () => resolve();
        audio.play().catch(() => resolve());
      });
      URL.revokeObjectURL(url);
      ttsAudioRef.current = null;
    } catch {
      if ('speechSynthesis' in window) {
        await new Promise<void>(resolve => {
          const utt   = new SpeechSynthesisUtterance(text);
          utt.onend   = () => resolve();
          utt.onerror = () => resolve();
          window.speechSynthesis.speak(utt);
        });
      }
    } finally {
      ttsPlayingRef.current = false;
      silentSinceRef.current = null;
      vadStatusRef.current = 'listening';
      setStatus('listening');
    }
  }, []);

  // ── Speak new TUTOR turns ─────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    const unseen = turns.filter(t => t.role === 'TUTOR' && t.text && !spokenTurnsRef.current.has(t.id));
    for (const turn of unseen) {
      spokenTurnsRef.current.add(turn.id);
      speakText(turn.text);
    }
  }, [turns, sessionId, speakText]);

  // ── Poll for new turns ────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const newTurns = await api.get<Turn[]>(`/tutor/session/${sessionId}/poll?since=${encodeURIComponent(lastPollRef.current)}`);
        if (newTurns.length > 0) {
          lastPollRef.current = newTurns[newTurns.length - 1].createdAt;
          setTurns(prev => [...prev, ...newTurns]);
        }
      } catch { /* silent */ }
    }, 2000);
    return () => clearInterval(pollIntervalRef.current);
  }, [sessionId]);

  // ── Start session ─────────────────────────────────────────────────────
  const startSession = useCallback(async (subject?: SubjectCtx, withScreenShare = true, tauriWindowId?: number) => {
    setError('');
    spokenTurnsRef.current.clear();

    let screenStream: MediaStream | null = null;

    if (withScreenShare) {
      if (IS_TAURI && tauriWindowId !== undefined) {
        // Desktop app: store the chosen window ID; screenshots taken per-utterance
        tauriWindowIdRef.current = tauriWindowId;
        setScreenActive(true);
      } else if (!IS_TAURI) {
        // Web browser: use standard getDisplayMedia picker
        try {
          screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false,
          });
          setScreenActive(true);
        } catch {
          setError('Share cancelled — session not started.');
          return;
        }
      }
    } else {
      tauriWindowIdRef.current = null;
    }

    let audioStream: MediaStream;
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Microphone access is needed to start a session.');
      return;
    }
    audioStreamRef.current = audioStream;

    if (screenStream) {
      screenStreamRef.current = screenStream;
      const vid = document.createElement('video');
      vid.autoplay = true; vid.muted = true; vid.playsInline = true;
      vid.srcObject = screenStream;
      vid.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;';
      document.body.appendChild(vid);
      screenVideoRef.current = vid;
      vid.play().catch(() => {});
    }

    const ctx      = new AudioContext();
    const src      = ctx.createMediaStreamSource(audioStream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.6;
    src.connect(analyser);
    audioCtxRef.current = ctx; analyserRef.current = analyser;

    const title = subject ? `${subject.name} — ${new Date().toLocaleString()}` : `Session ${new Date().toLocaleString()}`;
    const body: Record<string, unknown> = { title };
    if (subject) body.subjectId = subject.id;

    const sess = await api.post<{ id: string }>('/tutor/session', body);
    setSessionId(sess.id);
    setActiveSubject(subject ?? null);
    setTurns([]);
    setStatus('listening');
    vadRafRef.current = requestAnimationFrame(runVAD);
  }, [runVAD]);

  // ── End session ───────────────────────────────────────────────────────
  const endSession = useCallback(async () => {
    if (ttsAudioRef.current) { ttsAudioRef.current.pause(); ttsAudioRef.current = null; }
    window.speechSynthesis?.cancel();
    ttsPlayingRef.current = false;

    cancelAnimationFrame(vadRafRef.current);
    const rec = recorderRef.current;
    if (rec?.state === 'recording') rec.stop();
    recorderRef.current = null;

    audioStreamRef.current?.getTracks().forEach(t => t.stop());
    audioStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    const vid = screenVideoRef.current;
    if (vid?.parentNode) { vid.srcObject = null; vid.parentNode.removeChild(vid); screenVideoRef.current = null; }
    audioCtxRef.current = null; analyserRef.current = null;

    tauriWindowIdRef.current = null;
    const sid = sessionIdRef.current;
    if (sid) await api.patch(`/tutor/session/${sid}/end`, {});
    setSessionId(null); setActiveSubject(null); setStatus('idle'); setScreenActive(false); setError('');
  }, []);

  // ── Global cleanup on app unload ──────────────────────────────────────
  useEffect(() => {
    const onUnload = () => {
      cancelAnimationFrame(vadRafRef.current);
      clearInterval(pollIntervalRef.current);
      ttsAudioRef.current?.pause();
      window.speechSynthesis?.cancel();
      audioStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId, activeSubject, turns, status, error, screenActive, isTauri: IS_TAURI, startSession, endSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
