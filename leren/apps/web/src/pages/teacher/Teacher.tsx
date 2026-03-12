import { useState, useEffect, FormEvent } from 'react';
import { api } from '@/lib/api';

interface Classroom { id: string; name: string; _count: { enrollments: number; classAssignments: number }; }
interface Analytics { studentCount: number; totalAttempts: number; overallAccuracy: number; subjectStats: { subject: string; accuracy: number; total: number }[]; }

export default function Teacher() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selected, setSelected] = useState<Classroom | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [newName, setNewName] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => api.get<Classroom[]>('/teacher/classrooms').then(setClassrooms).catch(() => {});
  useEffect(() => { load(); }, []);

  const createClassroom = async (e: FormEvent) => {
    e.preventDefault(); if (!newName.trim()) return;
    try { await api.post('/teacher/classrooms', { name: newName }); await load(); setNewName(''); } catch { /* ignore */ }
  };

  const enroll = async (e: FormEvent) => {
    e.preventDefault(); if (!selected || !enrollEmail.trim()) return;
    try { await api.post(`/teacher/classrooms/${selected.id}/enroll`, { studentEmail: enrollEmail }); setEnrollEmail(''); } catch { /* ignore */ }
  };

  const loadAnalytics = async (c: Classroom) => {
    setSelected(c); setLoading(true);
    try { const a = await api.get<Analytics>(`/teacher/classrooms/${c.id}/analytics`); setAnalytics(a); }
    catch { /* ignore */ } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Create classroom */}
        <div className="card space-y-3">
          <h2 className="font-semibold">Create classroom</h2>
          <form onSubmit={createClassroom} className="flex gap-2">
            <input className="input flex-1" placeholder="Classroom name…" value={newName} onChange={e => setNewName(e.target.value)} required />
            <button className="btn-primary" type="submit">Create</button>
          </form>
        </div>
        {/* Enroll student */}
        <div className="card space-y-3">
          <h2 className="font-semibold">Enroll student</h2>
          {selected ? (
            <form onSubmit={enroll} className="flex gap-2">
              <input className="input flex-1" type="email" placeholder="student@email.com" value={enrollEmail} onChange={e => setEnrollEmail(e.target.value)} required />
              <button className="btn-primary" type="submit">Enroll</button>
            </form>
          ) : <p className="text-slate-500 text-sm">Select a classroom first</p>}
        </div>
      </div>

      {/* Classroom list */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {classrooms.map(c => (
          <button key={c.id} onClick={() => loadAnalytics(c)} className={`card text-left transition-colors ${selected?.id === c.id ? 'border-blue-500' : 'hover:border-slate-600'}`}>
            <div className="font-semibold">{c.name}</div>
            <div className="text-xs text-slate-400 mt-1">{c._count.enrollments} students · {c._count.classAssignments} assignments</div>
          </button>
        ))}
        {classrooms.length === 0 && <p className="text-slate-500 text-sm col-span-full">No classrooms yet.</p>}
      </div>

      {/* Analytics panel */}
      {selected && (
        <div className="card space-y-4">
          <h2 className="font-semibold">{selected.name} — Analytics</h2>
          {loading ? <p className="text-slate-400">Loading…</p> : analytics && (
            <>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className="text-2xl font-bold">{analytics.studentCount}</div><div className="text-xs text-slate-400">Students</div></div>
                <div><div className="text-2xl font-bold">{analytics.totalAttempts}</div><div className="text-xs text-slate-400">Attempts</div></div>
                <div><div className="text-2xl font-bold">{analytics.overallAccuracy}%</div><div className="text-xs text-slate-400">Accuracy</div></div>
              </div>
              {analytics.subjectStats.length > 0 && (
                <div className="space-y-2">
                  {analytics.subjectStats.map(s => (
                    <div key={s.subject}>
                      <div className="flex justify-between text-sm mb-1"><span>{s.subject}</span><span className="text-slate-400">{s.accuracy}%</span></div>
                      <div className="h-2 rounded-full bg-slate-700"><div className={`h-2 rounded-full ${s.accuracy >= 70 ? 'bg-green-500' : s.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${s.accuracy}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
