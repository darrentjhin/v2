import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ProgressData {
  total: number; correct: number; accuracy: number; streak: number; sessionCount: number;
  timeseries: { date: string; correct: number; total: number }[];
  subjectStats: { subject: string; correct: number; total: number; accuracy: number }[];
  weakTopics: { subject: string; accuracy: number }[];
}

export default function Progress() {
  const [data, setData] = useState<ProgressData | null>(null);
  useEffect(() => { api.get<ProgressData>('/progress').then(setData).catch(() => {}); }, []);

  if (!data) return <div className="text-slate-400">Loading…</div>;

  const maxTotal = Math.max(...data.timeseries.map(t => t.total), 1);

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] space-y-6">
      <h1 className="text-2xl font-bold text-white">Progress</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Accuracy', value: `${data.accuracy}%` },
          { label: 'Streak', value: `${data.streak} day${data.streak !== 1 ? 's' : ''}` },
          { label: 'Attempts', value: data.total },
          { label: 'Sessions', value: data.sessionCount },
        ].map(c => (
          <div key={c.label} className="card text-center">
            <div className="text-2xl font-bold text-white">{c.value}</div>
            <div className="text-xs text-slate-400 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {data.timeseries.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4 text-white">Attempts over time</h2>
          <div className="flex items-end gap-1 h-28">
            {data.timeseries.slice(-30).map(t => (
              <div key={t.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                <div className="absolute -top-7 hidden group-hover:flex text-xs bg-slate-700 text-slate-200 rounded px-2 py-1 whitespace-nowrap">{t.date}: {t.correct}/{t.total}</div>
                <div className="w-full rounded-sm bg-blue-600" style={{ height: `${Math.max(4, (t.correct / maxTotal) * 100)}%` }} />
                <div className="w-full rounded-sm bg-slate-700 -mt-1" style={{ height: `${Math.max(4, ((t.total - t.correct) / maxTotal) * 100)}%` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-blue-600" /> Correct</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-slate-700" /> Incorrect</span>
          </div>
        </div>
      )}

      {data.subjectStats.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4 text-white">By subject</h2>
          <div className="space-y-3">
            {data.subjectStats.map(s => (
              <div key={s.subject}>
                <div className="flex justify-between text-sm mb-1 text-slate-100">
                  <span>{s.subject}</span>
                  <span className="text-slate-400">{s.correct}/{s.total} ({s.accuracy}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700">
                  <div className={`h-2 rounded-full ${s.accuracy >= 70 ? 'bg-green-500' : s.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${s.accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.weakTopics.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-3 text-white">Needs work</h2>
          <div className="flex flex-wrap gap-2">
            {data.weakTopics.map(t => (
              <span key={t.subject} className="badge bg-red-900/40 text-red-300 border border-red-800">{t.subject} ({t.accuracy}%)</span>
            ))}
          </div>
        </div>
      )}

      {data.total === 0 && <div className="text-slate-400 text-center py-12">No practice attempts yet. Go to Practice to get started.</div>}
    </div>
  );
}
