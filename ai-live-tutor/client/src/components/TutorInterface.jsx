/**
 * TutorInterface - Continuous voice session (like ChatGPT voice mode).
 *
 * - "Start Session": starts mic + optional screen; then the app listens continuously.
 * - When you speak and then stop talking (silence), the last utterance is sent to the API
 *   and the tutor responds. No need to click "Stop" for each question.
 * - "End Session": stops listening and ends the session.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const API_BASE = '/api';

// Voice activity detection: treat as "speech" when volume above this (0–1)
const VOLUME_THRESHOLD = 0.018;
// Seconds of silence after speech before we send the utterance
const SILENCE_DURATION_MS = 1400;
// Min ms of speech before we consider it a real utterance (ignore tiny noises)
const MIN_SPEECH_MS = 400;

export default function TutorInterface() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [responseText, setResponseText] = useState('');
  const [error, setError] = useState('');

  const audioStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const screenVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const vadRafRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const speechStartRef = useRef(0);
  const silenceStartRef = useRef(null);
  const processingRef = useRef(false);

  /**
   * Capture one frame from the screen stream as PNG (for the AI).
   */
  const captureScreenFrame = useCallback(() => {
    const video = screenVideoRef.current;
    const stream = screenStreamRef.current;
    if (!video || !stream || video.readyState < 2) return Promise.resolve(null);
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return Promise.resolve(null);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png', 0.92);
    });
  }, []);

  /**
   * Send one utterance (audio + optional screen) to the API and show the response.
   */
  const sendUtterance = useCallback(
    async (audioBlob) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setIsProcessing(true);
      setStatusMessage('Thinking…');
      setError('');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'utterance.webm');
      const screenBlob = await captureScreenFrame();
      if (screenBlob) formData.append('screen', screenBlob, 'screen.png');

      try {
        const res = await fetch(`${API_BASE}/tutor`, { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Request failed.');
          return;
        }
        setResponseText(data.text || 'No response text.');
      } catch (err) {
        console.error('Request error:', err);
        setError('Could not reach the server. Is the backend running?');
      } finally {
        setIsProcessing(false);
        setStatusMessage('Listening…');
        processingRef.current = false;
      }
    },
    [captureScreenFrame]
  );

  /**
   * VAD loop: read mic volume, detect speech start/end, start/stop MediaRecorder per utterance.
   */
  const runVAD = useCallback(() => {
    const analyser = analyserRef.current;
    const stream = audioStreamRef.current;
    if (!analyser || !stream) return;

    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const n = (data[i] - 128) / 128;
      sum += n * n;
    }
    const rms = Math.sqrt(sum / data.length);
    const now = Date.now();

    if (rms > VOLUME_THRESHOLD) {
      if (!isSpeakingRef.current) {
        isSpeakingRef.current = true;
        speechStartRef.current = now;
        silenceStartRef.current = null;
        if (!processingRef.current && (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive')) {
          chunksRef.current = [];
          const rec = new MediaRecorder(stream);
          mediaRecorderRef.current = rec;
          rec.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
          };
          rec.onstop = () => {
            const chunks = chunksRef.current;
            if (chunks.length > 0 && !processingRef.current) {
              const blob = new Blob(chunks, { type: 'audio/webm' });
              sendUtterance(blob);
            }
          };
          rec.start(100);
          setStatusMessage('Speaking…');
        }
      }
    } else {
      if (isSpeakingRef.current) {
        const speechDuration = now - speechStartRef.current;
        if (speechDuration < MIN_SPEECH_MS) {
          // Too short, ignore
        } else if (silenceStartRef.current === null) {
          silenceStartRef.current = now;
        } else if (now - silenceStartRef.current >= SILENCE_DURATION_MS) {
          const rec = mediaRecorderRef.current;
          if (rec && rec.state === 'recording') {
            rec.stop();
            mediaRecorderRef.current = null;
          }
          isSpeakingRef.current = false;
          silenceStartRef.current = null;
        }
      } else {
        silenceStartRef.current = null;
      }
    }

    vadRafRef.current = requestAnimationFrame(runVAD);
  }, [sendUtterance]);

  /**
   * Start session: request screen first (so it’s in the same user gesture), then mic; set up VAD.
   * Browsers often only allow getDisplayMedia when it’s called directly from a click.
   */
  const startSession = useCallback(async () => {
    setError('');
    setResponseText('');
    setStatusMessage('Starting…');

    try {
      // Ask for screen share FIRST so it’s still in the same user gesture as the click.
      // If we ask for mic first, some browsers block screen share (“denied”).
      let screenStream = null;
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      } catch (screenErr) {
        console.warn('Screen share:', screenErr);
        const name = screenErr?.name || '';
        if (name === 'NotAllowedError') {
          setError('Screen share cancelled or denied. Tutor will only hear you.');
        } else {
          setError('Screen share failed. Click Start Session again and choose a tab/window when prompted. Tutor will only hear you for now.');
        }
      }

      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = audioStream;

      if (screenStream) {
        screenStreamRef.current = screenStream;
        const video = document.createElement('video');
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.srcObject = screenStream;
        video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;';
        document.body.appendChild(video);
        screenVideoRef.current = video;
        video.play().catch(() => {});
      }

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(audioStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      setIsSessionActive(true);
      setStatusMessage('Listening…');
      vadRafRef.current = requestAnimationFrame(runVAD);
    } catch (err) {
      console.error('Start session error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Microphone (and optionally screen) access was denied.'
          : 'Could not start session. Please allow microphone and try again.'
      );
      setStatusMessage('');
    }
  }, [runVAD]);

  /**
   * End session: stop VAD loop, stop all streams and recorders.
   */
  const endSession = useCallback(() => {
    if (vadRafRef.current) {
      cancelAnimationFrame(vadRafRef.current);
      vadRafRef.current = null;
    }
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === 'recording') rec.stop();
    mediaRecorderRef.current = null;

    const audioStream = audioStreamRef.current;
    if (audioStream) {
      audioStream.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }

    const screenStream = screenStreamRef.current;
    const video = screenVideoRef.current;
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (video && video.parentNode) {
      video.srcObject = null;
      video.parentNode.removeChild(video);
      screenVideoRef.current = null;
    }

    const ctx = audioContextRef.current;
    if (ctx) audioContextRef.current = null;
    analyserRef.current = null;

    setIsSessionActive(false);
    setStatusMessage('');
  }, []);

  useEffect(() => {
    return () => {
      if (vadRafRef.current) cancelAnimationFrame(vadRafRef.current);
    };
  }, []);

  const handleButtonClick = () => {
    if (isSessionActive) endSession();
    else startSession();
  };

  return (
    <div className="tutor-interface">
      <h1>AI Live Tutor</h1>
      <p className="subtitle">
        Start a session (browser will ask for screen, then mic). Then just talk—when you stop speaking, the tutor replies automatically.
      </p>

      <button
        type="button"
        className="record-button"
        onClick={handleButtonClick}
        disabled={isProcessing}
        aria-label={isSessionActive ? 'End session' : 'Start session'}
      >
        <span>
          {isSessionActive ? 'End Session' : 'Start Session'}
        </span>
      </button>

      {isSessionActive && statusMessage && (
        <p className="status">{statusMessage}</p>
      )}

      {error && <p className="error">{error}</p>}
      {responseText && (
        <div className="response-box">
          <strong>Tutor says:</strong>
          <p>{responseText}</p>
        </div>
      )}

      <style>{`
        .tutor-interface {
          position: relative;
          max-width: 420px;
          width: 100%;
          background: radial-gradient(circle at top, #020617, #020617 60%, #020617 100%);
          padding: 2rem;
          border-radius: 999px;
          text-align: center;
          box-shadow:
            0 18px 40px rgba(15, 23, 42, 0.9),
            0 0 40px rgba(15, 23, 42, 0.9);
          overflow: hidden;
        }
        .tutor-interface::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: conic-gradient(
            from 0deg,
            rgba(59, 130, 246, 0) 0deg,
            rgba(59, 130, 246, 0.9) 60deg,
            rgba(59, 130, 246, 0) 120deg,
            rgba(59, 130, 246, 0) 360deg
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.85;
          animation: spin-border 6s linear infinite;
          pointer-events: none;
        }
        .tutor-interface h1 {
          margin: 0 0 0.5rem;
          font-size: 1.75rem;
          color: #f4f4f5;
        }
        .subtitle {
          margin: 0 0 1.5rem;
          color: #a1a1aa;
          font-size: 0.95rem;
        }
        .record-button {
          padding: 0.75rem 1.8rem;
          font-size: 1rem;
          font-weight: 600;
          color: #e5f0ff;
          background: #020617;
          border-radius: 999px;
          border: 1px solid rgba(59, 130, 246, 0.85);
          cursor: pointer;
          box-shadow:
            0 0 0 1px rgba(15, 23, 42, 0.9),
            0 0 16px rgba(37, 99, 235, 0.85),
            0 0 36px rgba(37, 99, 235, 0.4);
          transition: transform 0.15s ease-out, box-shadow 0.2s ease-out, filter 0.2s ease-out;
          animation: blue-glow 2.4s ease-in-out infinite;
        }
        .record-button span {
          position: relative;
          z-index: 1;
        }
        .record-button:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.02);
          box-shadow:
            0 0 0 1px rgba(37, 99, 235, 0.9),
            0 0 24px rgba(37, 99, 235, 1),
            0 0 40px rgba(37, 99, 235, 0.7);
          filter: brightness(1.08);
        }
        .record-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          animation: none;
          box-shadow: none;
          filter: none;
        }
        .record-button:focus-visible {
          outline: 2px solid #8b5cf6;
          outline-offset: 2px;
        }
        .status {
          margin-top: 0.75rem;
          font-size: 0.9rem;
          color: #94a3b8;
        }
        .error {
          margin-top: 1rem;
          color: #f87171;
          font-size: 0.9rem;
        }
        .response-box {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(124, 58, 237, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          text-align: left;
        }
        .response-box strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #a78bfa;
        }
        .response-box p {
          margin: 0;
          color: #e4e4e7;
        }

        @keyframes blue-glow {
          0% {
            box-shadow:
              0 0 0 1px rgba(15, 23, 42, 0.9),
              0 0 16px rgba(37, 99, 235, 0.7),
              0 0 32px rgba(37, 99, 235, 0.3);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(37, 99, 235, 0.9),
              0 0 26px rgba(59, 130, 246, 1),
              0 0 50px rgba(59, 130, 246, 0.7);
          }
          100% {
            box-shadow:
              0 0 0 1px rgba(15, 23, 42, 0.9),
              0 0 16px rgba(37, 99, 235, 0.7),
              0 0 32px rgba(37, 99, 235, 0.3);
          }
        }

        @keyframes spin-border {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
