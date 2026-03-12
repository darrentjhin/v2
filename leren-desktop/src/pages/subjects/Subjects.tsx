import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

type SubjectStatus = 'active' | 'archived' | 'trashed';

interface SubjectFile {
  id: string; fileName: string; fileUrl: string; fileType: string; createdAt: string;
}
interface Subject {
  id: string; name: string; createdAt: string; files: SubjectFile[];
}
interface PracticeProblem { id: string; prompt: string; solution: string; }
interface PracticeSet { id: string; subject: string; difficulty: string; problems: PracticeProblem[]; }

const QUESTION_COUNTS = [5, 10, 20] as const;

// ── Confirm dialog ─────────────────────────────────────────────────────────
function ConfirmDialog({
  message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel,
}: { message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-xs rounded-2xl border border-slate-700/60 p-6"
           style={{ background: 'linear-gradient(135deg, #020c1e 0%, #000d1a 100%)' }}>
        <p className="text-white text-sm mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center rounded-full">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 justify-center rounded-full ${danger ? 'btn-danger' : 'btn-glow'}`}>
            {danger ? null : <span className="comet-blur" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Practice modal ─────────────────────────────────────────────────────────
function PracticeModal({
  subject, onClose,
}: { subject: Subject; onClose: () => void }) {
  const [count, setCount]           = useState<number>(10);
  const [custom, setCustom]         = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [results, setResults]       = useState<Record<string, { isCorrect: boolean; feedback: string }>>({});
  const [checking, setChecking]     = useState<string | null>(null);
  const finalCount = count === 0 ? (parseInt(custom) || 10) : count;

  const generate = async () => {
    if (count === 0 && (!parseInt(custom) || parseInt(custom) < 1 || parseInt(custom) > 50)) {
      setError('Enter a number between 1 and 50.'); return;
    }
    setLoading(true); setError('');
    try {
      const set = await api.post<PracticeSet>(`/subjects/${subject.id}/practice`, { count: finalCount, difficulty });
      setPracticeSet(set);
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

  // ── Results view ──────────────────────────────────────────────────────
  if (practiceSet) {
    const answered = Object.keys(results).length;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
           style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
        <div className="w-full max-w-2xl rounded-2xl border border-slate-700/60 flex flex-col"
             style={{ background: 'linear-gradient(135deg, #020c1e 0%, #000d1a 100%)', maxHeight: '90vh' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 shrink-0">
            <div>
              <h2 className="font-bold text-white">{subject.name} — Practice Exam</h2>
              <p className="text-xs text-slate-500 mt-0.5 capitalize">
                {practiceSet.difficulty} · {practiceSet.problems.length} questions
                {answered > 0 && ` · ${answered} answered`}
              </p>
            </div>
            <button onClick={onClose} className="btn-secondary !px-3 !py-1.5 !text-xs rounded-full">Close</button>
          </div>

          {/* Questions */}
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
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
      </div>
    );
  }

  // ── Setup view ────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl border border-slate-700/60 p-6"
           style={{ background: 'linear-gradient(135deg, #020c1e 0%, #000d1a 100%)' }}>
        <h2 className="font-bold text-lg mb-1 text-white">Generate Practice Exam</h2>
        <p className="text-slate-400 text-sm mb-5">
          Subject: <span className="text-blue-300">{subject.name}</span>
          {subject.files.length > 0 && (
            <span className="text-slate-500"> · {subject.files.length} file{subject.files.length !== 1 ? 's' : ''} as context</span>
          )}
        </p>
        <div className="mb-4">
          <label className="label mb-2 block">Difficulty</label>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize ${
                  difficulty === d ? 'bg-blue-600/30 border-blue-500/60 text-blue-300'
                  : 'border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-300'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <label className="label mb-2 block">Number of questions</label>
          <div className="flex gap-2 flex-wrap">
            {QUESTION_COUNTS.map(n => (
              <button key={n} onClick={() => { setCount(n); setCustom(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  count === n ? 'bg-blue-600/30 border-blue-500/60 text-blue-300'
                  : 'border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-300'}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setCount(0)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                count === 0 ? 'bg-blue-600/30 border-blue-500/60 text-blue-300'
                : 'border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-300'}`}>
              Custom
            </button>
          </div>
          {count === 0 && (
            <input className="input mt-2 w-full" type="number" min={1} max={50}
              placeholder="Enter number (1–50)" value={custom}
              onChange={e => setCustom(e.target.value)} autoFocus />
          )}
        </div>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center rounded-full">Cancel</button>
          <button onClick={generate} disabled={loading} className="btn-glow flex-1 justify-center !rounded-full">
            <span className="comet-blur" />
            {loading ? `Generating ${finalCount} questions…` : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Subject card content (shared between real card and floating clone) ────────
function CardContent({
  subject, selectMode, selected, onToggleSelect,
  onDelete, onArchive, onTrash, onNavigate, onHandlePointerDown, isFloating = false,
}: {
  subject: Subject;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onTrash: (id: string) => void;
  onNavigate: (id: string) => void;
  onHandlePointerDown?: (e: React.PointerEvent) => void;
  isFloating?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4"
         onClick={() => !selectMode && !isFloating && onNavigate(subject.id)}>
      {selectMode ? (
        <button onClick={e => { e.stopPropagation(); onToggleSelect(subject.id); }} className="shrink-0">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            selected ? 'bg-blue-500 border-blue-500' : 'border-slate-600 hover:border-slate-400'
          }`}>
            {selected && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="2 6 5 9 10 3"/>
              </svg>
            )}
          </div>
        </button>
      ) : (
        <div
          className="shrink-0 text-slate-500 cursor-grab active:cursor-grabbing touch-none select-none"
          title="Hold to reorder"
          onClick={e => e.stopPropagation()}
          onPointerDown={onHandlePointerDown}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="17" r="1.5"/><circle cx="15" cy="17" r="1.5"/>
          </svg>
        </div>
      )}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-white truncate">{subject.name}</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {subject.files.length === 0 ? 'No files yet' : `${subject.files.length} file${subject.files.length !== 1 ? 's' : ''}`}
        </p>
      </div>
      {!selectMode && (
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          {!isFloating && (
            <>
              {/* Archive */}
              <button onClick={() => onArchive(subject.id)}
                title="Archive"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600
                           hover:text-blue-400 hover:bg-blue-900/20 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"/>
                </svg>
              </button>
              {/* Trash */}
              <button onClick={() => onTrash(subject.id)}
                title="Move to Trash"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600
                           hover:text-red-400 hover:bg-red-900/20 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </>
          )}
          {/* Navigate chevron — always clickable */}
          <button
            onClick={() => onNavigate(subject.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Subject card ───────────────────────────────────────────────────────────
function SubjectCard({
  subject, selectMode, selected, onToggleSelect,
  isDragging, onDelete, onArchive, onTrash, onNavigate, onHandlePointerDown, cardRef,
}: {
  subject: Subject;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  isDragging: boolean;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onTrash: (id: string) => void;
  onNavigate: (id: string) => void;
  onHandlePointerDown: (e: React.PointerEvent, id: string) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={cardRef}
      className={`rounded-2xl border overflow-hidden transition-[border-color,background,opacity,transform] duration-200 ${
        selected ? 'border-blue-500/50' : 'border-slate-700/50'
      }`}
      style={{
        background: selected ? 'rgba(37,99,235,0.07)' : 'rgba(1,10,28,0.7)',
        cursor: selectMode ? 'default' : 'pointer',
        opacity: isDragging ? 0 : 1,
        pointerEvents: isDragging ? 'none' : undefined,
      }}
    >
      <CardContent
        subject={subject} selectMode={selectMode} selected={selected}
        onToggleSelect={onToggleSelect} onDelete={onDelete} onArchive={onArchive} onTrash={onTrash} onNavigate={onNavigate}
        onHandlePointerDown={!selectMode ? e => onHandlePointerDown(e, subject.id) : undefined}
      />
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Subjects() {
  const navigate                          = useNavigate();
  const [subjects, setSubjects]           = useState<Subject[]>([]);
  const [loading, setLoading]             = useState(true);
  const [adding, setAdding]               = useState(false);
  const [newName, setNewName]             = useState('');
  const [saving, setSaving]               = useState(false);
  const [selectMode, setSelectMode]       = useState(false);
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[]; message: string } | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<{ id: string; name: string } | null>(null);
  const [confirmTrash, setConfirmTrash]     = useState<{ id: string; name: string } | null>(null);

  // ── Pointer-based drag state ─────────────────────────────────────────
  const [draggingId, setDraggingId]   = useState<string | null>(null);
  const [floatPos, setFloatPos]       = useState({ x: 0, y: 0 });
  const [floatSize, setFloatSize]     = useState({ w: 0, h: 0 });
  const dragOffsetRef                 = useRef({ x: 0, y: 0 });
  const cardElsRef                    = useRef<Map<string, HTMLDivElement>>(new Map());
  const draggingIdRef                 = useRef<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<Subject[]>('/subjects')
      .then(setSubjects).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (adding) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [adding]);

  const createSubject = async () => {
    const name = newName.trim(); if (!name) return;
    setSaving(true);
    try {
      const subject = await api.post<Subject>('/subjects', { name });
      setSubjects(prev => [subject, ...prev]);
      setNewName(''); setAdding(false);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const doDelete = async (ids: string[]) => {
    await Promise.all(ids.map(id => api.delete(`/subjects/${id}`)));
    setSubjects(prev => prev.filter(s => !ids.includes(s.id)));
    setSelectedIds(new Set());
    setSelectMode(false);
    setConfirmDelete(null);
  };

  const requestDelete = (ids: string[]) => {
    const single = ids.length === 1;
    const name = single ? subjects.find(s => s.id === ids[0])?.name : undefined;
    setConfirmDelete({
      ids,
      message: single
        ? `Delete "${name}"? This will remove all its uploaded files too.`
        : `Delete ${ids.length} subjects? All their uploaded files will be removed too.`,
    });
  };

  const doArchive = async (id: string) => {
    try {
      await api.patch(`/subjects/${id}/archive`, {});
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch { /* ignore */ } finally { setConfirmArchive(null); }
  };

  const doTrash = async (id: string) => {
    try {
      await api.patch(`/subjects/${id}/trash`, {});
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch { /* ignore */ } finally { setConfirmTrash(null); }
  };

  const requestArchive = (id: string) => {
    const name = subjects.find(s => s.id === id)?.name ?? 'this subject';
    setConfirmArchive({ id, name });
  };

  const requestTrash = (id: string) => {
    const name = subjects.find(s => s.id === id)?.name ?? 'this subject';
    setConfirmTrash({ id, name });
  };

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectAll   = () => setSelectedIds(new Set(subjects.map(s => s.id)));
  const clearSelect = () => { setSelectedIds(new Set()); setSelectMode(false); };

  // ── Pointer drag ─────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    const el = cardElsRef.current.get(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    draggingIdRef.current = id;
    setDraggingId(id);
    setFloatPos({ x: rect.left, y: rect.top });
    setFloatSize({ w: rect.width, h: rect.height });
  };

  useEffect(() => {
    if (!draggingId) return;

    const onMove = (e: PointerEvent) => {
      // Move the floating clone
      setFloatPos({
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      });

      // Determine target index by comparing cursor Y against each card's midpoint
      const cursorY = e.clientY;
      setSubjects(prev => {
        const fromIdx = prev.findIndex(s => s.id === draggingIdRef.current);
        if (fromIdx === -1) return prev;

        let toIdx = fromIdx;
        for (let i = 0; i < prev.length; i++) {
          if (i === fromIdx) continue;
          const el = cardElsRef.current.get(prev[i].id);
          if (!el) continue;
          const { top, height } = el.getBoundingClientRect();
          const mid = top + height / 2;
          if (i < fromIdx && cursorY < mid) { toIdx = i; break; }
          if (i > fromIdx && cursorY > mid)  { toIdx = i; }
        }

        if (toIdx === fromIdx) return prev; // no change — skip re-render
        const arr = [...prev];
        const [item] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, item);
        return arr;
      });
    };

    const onUp = () => {
      draggingIdRef.current = null;
      setDraggingId(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [draggingId]);

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Subjects</h1>
          <p className="text-slate-500 text-sm mt-0.5">Add subjects and upload materials to personalise your learning.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!adding && subjects.length > 0 && !selectMode && (
            <button onClick={() => setSelectMode(true)}
              className="btn-secondary !px-3 !py-1.5 !text-xs rounded-full">
              Select
            </button>
          )}
          {selectMode && (
            <>
              <button onClick={selectAll}
                className="btn-secondary !px-3 !py-1.5 !text-xs rounded-full">
                Select All
              </button>
              {selectedIds.size > 0 && (
                <button onClick={() => requestDelete([...selectedIds])}
                  className="btn-danger !px-3 !py-1.5 !text-xs rounded-full flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                  Delete ({selectedIds.size})
                </button>
              )}
              <button onClick={clearSelect}
                className="btn-secondary !px-3 !py-1.5 !text-xs rounded-full">
                Cancel
              </button>
            </>
          )}
          {!adding && !selectMode && (
            <button onClick={() => setAdding(true)} className="btn-glow !px-4 !py-2 !text-sm !rounded-full">
              <span className="comet-blur" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Subject
            </button>
          )}
        </div>
      </div>

      {/* Add subject inline form */}
      {adding && (
        <div className="mb-4 rounded-2xl border border-blue-500/20 p-4 flex gap-2"
             style={{ background: 'rgba(37,99,235,0.06)' }}>
          <input ref={nameInputRef} className="input flex-1"
            placeholder="Subject name (e.g. Calculus, Biology…)"
            value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createSubject(); if (e.key === 'Escape') { setAdding(false); setNewName(''); } }} />
          <button onClick={createSubject} disabled={saving || !newName.trim()}
            className="btn-glow !px-4 !py-2 !text-sm !rounded-full shrink-0">
            <span className="comet-blur" />{saving ? 'Adding…' : 'Add'}
          </button>
          <button onClick={() => { setAdding(false); setNewName(''); }}
            className="btn-secondary !px-3 !py-2 rounded-full shrink-0">Cancel</button>
        </div>
      )}

      {/* Subject list */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
      ) : subjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-700/50"
               style={{ background: 'rgba(59,130,246,0.06)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <p className="text-sm">No subjects yet — click <span className="text-blue-400">Add Subject</span> to get started.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 flex-1" style={{ userSelect: 'none' }}>
            {subjects.map(s => (
              <SubjectCard key={s.id} subject={s}
                selectMode={selectMode} selected={selectedIds.has(s.id)}
                onToggleSelect={toggleSelect}
                isDragging={draggingId === s.id}
                onDelete={id => requestDelete([id])}
                onArchive={id => requestArchive(id)}
                onTrash={id => requestTrash(id)}
                onNavigate={id => navigate(`/app/subjects/${id}`)}
                onHandlePointerDown={handlePointerDown}
                cardRef={el => {
                  if (el) cardElsRef.current.set(s.id, el);
                  else cardElsRef.current.delete(s.id);
                }}
              />
            ))}
          </div>

          {/* Floating clone that follows the cursor */}
          {draggingId && (() => {
            const s = subjects.find(sub => sub.id === draggingId);
            if (!s) return null;
            return (
              <div
                style={{
                  position: 'fixed',
                  left: floatPos.x,
                  top: floatPos.y,
                  width: floatSize.w,
                  height: floatSize.h,
                  zIndex: 9999,
                  pointerEvents: 'none',
                  borderRadius: 16,
                  transform: 'scale(1.04) rotate(-1deg)',
                  boxShadow: '0 24px 64px rgba(0,0,10,0.6), 0 0 0 1px rgba(59,130,246,0.4)',
                  background: 'rgba(10,25,60,0.92)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(59,130,246,0.35)',
                  overflow: 'hidden',
                }}
              >
                <CardContent
                  subject={s} selectMode={false} selected={false}
                  onToggleSelect={() => {}} onDelete={() => {}} onArchive={() => {}} onTrash={() => {}} onNavigate={() => {}}
                  isFloating
                />
              </div>
            );
          })()}
        </>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={confirmDelete.message}
          confirmLabel="Delete"
          danger
          onConfirm={() => doDelete(confirmDelete.ids)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {confirmArchive && (
        <ConfirmDialog
          message={`Archive "${confirmArchive.name}"? It will be moved to Archive & Trash and can be restored any time.`}
          confirmLabel="Archive"
          danger={false}
          onConfirm={() => doArchive(confirmArchive.id)}
          onCancel={() => setConfirmArchive(null)}
        />
      )}

      {confirmTrash && (
        <ConfirmDialog
          message={`Move "${confirmTrash.name}" to Trash? It will be permanently deleted after 10 days.`}
          confirmLabel="Move to Trash"
          danger
          onConfirm={() => doTrash(confirmTrash.id)}
          onCancel={() => setConfirmTrash(null)}
        />
      )}
    </div>
  );
}
