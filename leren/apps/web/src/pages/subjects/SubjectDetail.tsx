import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useSession } from '@/context/SessionContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SubjectFile {
  id: string; fileName: string; fileUrl: string; fileType: string; createdAt: string;
}
interface SessionStub {
  id: string; title: string | null; startedAt: string; endedAt: string | null;
  _count: { turns: number };
}
interface Subject {
  id: string; name: string; summary: string | null; createdAt: string;
  files: SubjectFile[];
  sessions: SessionStub[];
}
interface PracticeProblem { id: string; prompt: string; solution: string; }
interface PracticeSet { id: string; subject: string; difficulty: string; problems: PracticeProblem[]; }

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }: {
  message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-xs rounded-2xl border border-slate-700/60 p-6"
           style={{ background: 'linear-gradient(135deg, #020c1e 0%, #000d1a 100%)' }}>
        <p className="text-white text-sm mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center rounded-full">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 justify-center rounded-full ${danger ? 'btn-danger' : 'btn-glow'}`}>
            {!danger && <span className="comet-blur" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Practice exam panel (inline, not modal) ───────────────────────────────────
function PracticePanel({ subject }: { subject: Subject }) {
  const [count, setCount]             = useState<number>(10);
  const [custom, setCustom]           = useState('');
  const [difficulty, setDifficulty]   = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [answers, setAnswers]         = useState<Record<string, string>>({});
  const [results, setResults]         = useState<Record<string, { isCorrect: boolean; feedback: string }>>({});
  const [checking, setChecking]       = useState<string | null>(null);
  const finalCount = count === 0 ? (parseInt(custom) || 10) : count;

  const generate = async () => {
    if (count === 0 && (!parseInt(custom) || parseInt(custom) < 1 || parseInt(custom) > 50)) {
      setError('Enter a number between 1 and 50.'); return;
    }
    setLoading(true); setError('');
    try {
      const set = await api.post<PracticeSet>(`/subjects/${subject.id}/practice`, { count: finalCount, difficulty });
      setPracticeSet(set); setAnswers({}); setResults({});
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const checkAnswer = async (problemId: string) => {
    const answer = answers[problemId]; if (!answer) return;
    setChecking(problemId);
    try {
      const result = await api.post<{ isCorrect: boolean; feedback: string }>('/practice/attempt', { problemId, answer });
      setResults(prev => ({ ...prev, [problemId]: result }));
    } catch { /* ignore */ } finally { setChecking(null); }
  };

  if (practiceSet) {
    const answered = Object.keys(results).length;
    return (
      <div className="space-y-4">
        {/* Exam header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 capitalize">
              {practiceSet.difficulty} · {practiceSet.problems.length} questions
              {answered > 0 && ` · ${answered} answered`}
            </p>
          </div>
          <button onClick={() => { setPracticeSet(null); setAnswers({}); setResults({}); }}
                  className="btn-secondary !px-3 !py-1.5 !text-xs rounded-full">
            New Exam
          </button>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {practiceSet.problems.map((p, i) => (
            <div key={p.id} className="rounded-xl border border-slate-700/40 p-4"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-sm font-medium text-slate-200 mb-3">
                <span className="text-slate-500 mr-2">Q{i + 1}.</span>{p.prompt}
              </p>
              <div className="flex gap-2">
                <input
                  className="input flex-1 !text-sm"
                  placeholder="Your answer…"
                  value={answers[p.id] ?? ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [p.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && checkAnswer(p.id)}
                  disabled={!!results[p.id]}
                />
                {!results[p.id] && (
                  <button onClick={() => checkAnswer(p.id)} disabled={checking === p.id || !answers[p.id]}
                          className="btn-secondary !px-3 !py-2 !text-xs rounded-lg shrink-0">
                    {checking === p.id ? '…' : 'Check'}
                  </button>
                )}
              </div>
              {results[p.id] && (
                <div className={`mt-2 rounded-lg px-3 py-2 text-xs ${
                  results[p.id].isCorrect
                    ? 'bg-green-900/25 border border-green-800/50 text-green-300'
                    : 'bg-red-900/25 border border-red-800/50 text-red-300'
                }`}>
                  {results[p.id].isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}
                  {results[p.id].feedback}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Setup view
  return (
    <div className="space-y-5">
      {subject.files.length === 0 && (
        <p className="text-xs text-amber-400/80 rounded-lg border border-amber-500/20 bg-amber-900/10 px-3 py-2">
          Upload study materials above for a personalised exam.
        </p>
      )}

      {/* Count selector */}
      <div>
        <p className="text-xs text-slate-400 mb-2 font-medium">Number of questions</p>
        <div className="flex gap-2 flex-wrap">
          {([5, 10, 20] as const).map(n => (
            <button key={n} onClick={() => setCount(n)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      count === n
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-700/60 text-slate-400 hover:border-blue-500/50 hover:text-slate-200'
                    }`}>
              {n}
            </button>
          ))}
          <button onClick={() => setCount(0)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    count === 0
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-slate-700/60 text-slate-400 hover:border-blue-500/50 hover:text-slate-200'
                  }`}>
            Custom
          </button>
          {count === 0 && (
            <input
              type="number" min={1} max={50} placeholder="1–50"
              value={custom} onChange={e => setCustom(e.target.value)}
              className="input !w-24 !text-sm"
            />
          )}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <p className="text-xs text-slate-400 mb-2 font-medium">Difficulty</p>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map(d => (
            <button key={d} onClick={() => setDifficulty(d)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all capitalize ${
                      difficulty === d
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-700/60 text-slate-400 hover:border-blue-500/50 hover:text-slate-200'
                    }`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button onClick={generate} disabled={loading}
              className="btn-secondary rounded-full flex items-center gap-2">
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Generating…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Generate Exam
          </>
        )}
      </button>
    </div>
  );
}

// ── Section card wrapper ───────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-700/40 overflow-hidden"
         style={{ background: 'rgba(1,10,30,0.6)', backdropFilter: 'blur(12px)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-blue-400">{icon}</span>
          <span className="font-semibold text-white">{title}</span>
        </div>
        <svg className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SubjectDetail() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { sessionId, activeSubject, status, startSession, endSession } = useSession();

  const [subject, setSubject]       = useState<Subject | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Summary state
  const [genSummary, setGenSummary] = useState(false);
  const [summaryErr, setSummaryErr] = useState('');

  // File upload state
  const [uploading, setUploading]   = useState(false);
  const [uploadErr, setUploadErr]   = useState('');
  const [deleteTarget, setDeleteTarget] = useState<SubjectFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Session start state
  const [startingSession, setStartingSession] = useState(false);
  const [sessionErr, setSessionErr]           = useState('');

  const isActiveHere = sessionId && activeSubject?.id === id;

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.get<Subject>(`/subjects/${id}`);
      setSubject(data);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  // ── File upload ───────────────────────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !id) return;
    setUploading(true); setUploadErr('');
    try {
      const form = new FormData();
      Array.from(fileList).forEach(f => form.append('files', f));
      await api.upload<SubjectFile | SubjectFile[]>(`/subjects/${id}/files`, form);
      await load();
    } catch (err) { setUploadErr((err as Error).message); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const confirmDeleteFile = async () => {
    if (!deleteTarget || !id) return;
    try {
      await api.patch(`/subjects/${id}/files/${deleteTarget.id}/trash`, {});
      await load();
    } catch { /* ignore */ }
    setDeleteTarget(null);
  };

  // ── Summary ───────────────────────────────────────────────────────────
  const generateSummary = async () => {
    if (!id) return;
    setGenSummary(true); setSummaryErr('');
    try {
      const res = await api.post<{ summary: string }>(`/subjects/${id}/summary`, {});
      setSubject(prev => prev ? { ...prev, summary: res.summary } : prev);
    } catch (e) { setSummaryErr((e as Error).message); }
    finally { setGenSummary(false); }
  };

  // ── Session ───────────────────────────────────────────────────────────
  const handleStartSession = async () => {
    if (!subject) return;
    setStartingSession(true); setSessionErr('');
    try {
      await startSession({ id: subject.id, name: subject.name, summary: subject.summary });
      navigate('/app/live');
    } catch (e) { setSessionErr((e as Error).message); }
    finally { setStartingSession(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{error || 'Subject not found.'}</p>
        <button onClick={() => navigate('/app/subjects')} className="btn-secondary rounded-full">
          Back to Subjects
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/app/subjects')}
                className="mt-1 p-2 rounded-full border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-blue-500/40 transition-all shrink-0"
                title="Back to subjects">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white truncate">{subject.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {subject.files.length} file{subject.files.length !== 1 ? 's' : ''} · Created {new Date(subject.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Session button */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isActiveHere ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                Session active
              </span>
              <button onClick={() => navigate('/app/live')}
                      className="btn-secondary !px-3 !py-1.5 !text-xs rounded-full">
                View
              </button>
              <button onClick={endSession}
                      className="btn-danger !px-3 !py-1.5 !text-xs rounded-full">
                End
              </button>
            </div>
          ) : sessionId ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Another session is active</span>
              <button onClick={() => navigate('/app/live')} className="btn-secondary !px-3 !py-1.5 !text-xs rounded-full">
                View Session
              </button>
            </div>
          ) : (
            <button onClick={handleStartSession} disabled={startingSession}
                    className="btn-glow relative rounded-full flex items-center gap-2">
              <span className="comet-blur"/>
              {startingSession ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Starting…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                  </svg>
                  Start Session
                </>
              )}
            </button>
          )}
          {sessionErr && <p className="text-red-400 text-xs">{sessionErr}</p>}
        </div>
      </div>

      {/* ── Learning Materials ─────────────────────────────────────────── */}
      <Section
        title="Learning Materials"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        }
      >
        {/* Upload */}
        <div className="mb-4">
          <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.txt,.md"
                 className="hidden" onChange={handleUpload}/>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="btn-secondary rounded-full flex items-center gap-2">
            {uploading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Uploading…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                Upload Files
              </>
            )}
          </button>
          {uploadErr && <p className="text-red-400 text-xs mt-2">{uploadErr}</p>}
        </div>

        {/* File list */}
        {subject.files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500 border border-dashed border-slate-700/50 rounded-xl">
            <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p className="text-sm">No files yet — upload your study materials.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {subject.files.map(f => (
              <div key={f.id}
                   className="flex items-center gap-3 rounded-xl border border-slate-700/40 px-4 py-3"
                   style={{ background: 'rgba(255,255,255,0.02)' }}>
                {/* Icon by type */}
                <span className="text-blue-400 shrink-0">
                  {f.fileType === 'image' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  ) : f.fileType === 'pdf' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  )}
                </span>
                <span className="text-sm text-slate-300 flex-1 truncate">{f.fileName}</span>
                <span className="text-xs text-slate-600 capitalize shrink-0">{f.fileType}</span>
                <button onClick={() => setDeleteTarget(f)}
                        className="text-slate-600 hover:text-red-400 transition-colors shrink-0" title="Move to Trash">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── AI Summary ─────────────────────────────────────────────────── */}
      <Section
        title="AI Summary"
        defaultOpen={!!subject.summary}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        }
      >
        {subject.summary ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-700/40 p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              {subject.summary}
            </div>
            <button onClick={generateSummary} disabled={genSummary || subject.files.length === 0}
                    className="btn-secondary !text-xs rounded-full flex items-center gap-1.5">
              {genSummary ? (
                <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>Regenerating…</>
              ) : '↻ Regenerate'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Generate an AI summary of your uploaded materials to get a quick overview and help your tutor understand your course better.
            </p>
            {summaryErr && <p className="text-red-400 text-xs">{summaryErr}</p>}
            <button onClick={generateSummary} disabled={genSummary || subject.files.length === 0}
                    className="btn-secondary rounded-full flex items-center gap-2">
              {genSummary ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Generating Summary…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  Generate Summary
                </>
              )}
            </button>
            {subject.files.length === 0 && (
              <p className="text-xs text-slate-600">Upload files first.</p>
            )}
          </div>
        )}
      </Section>

      {/* ── Practice Exam ──────────────────────────────────────────────── */}
      <Section
        title="Practice Exam"
        defaultOpen={false}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
        }
      >
        <PracticePanel subject={subject} />
      </Section>

      {/* ── Past Sessions ──────────────────────────────────────────────── */}
      <Section
        title="Past Sessions"
        defaultOpen={false}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        }
      >
        {subject.sessions.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No sessions yet. Start one above!</p>
        ) : (
          <div className="space-y-2">
            {subject.sessions.map(s => (
              <div key={s.id}
                   className="flex items-center justify-between rounded-xl border border-slate-700/40 px-4 py-3"
                   style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div>
                  <p className="text-sm text-slate-300">{s.title || 'Untitled session'}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {new Date(s.startedAt).toLocaleString()} · {s._count.turns} message{s._count.turns !== 1 ? 's' : ''}
                    {!s.endedAt && <span className="ml-2 text-green-400">• ongoing</span>}
                  </p>
                </div>
                {!s.endedAt && (
                  <button onClick={() => navigate('/app/live')}
                          className="btn-secondary !px-3 !py-1.5 !text-xs rounded-full shrink-0">
                    Continue
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* File delete confirm dialog */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Move "${deleteTarget.fileName}" to Trash? It will be permanently deleted after 10 days and can be restored from Archive & Trash.`}
          confirmLabel="Move to Trash"
          danger
          onConfirm={confirmDeleteFile}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
