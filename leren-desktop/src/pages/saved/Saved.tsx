import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Explanation { id: string; title: string; content: string; tags: string[]; createdAt: string; }

export default function Saved() {
  const [items, setItems] = useState<Explanation[]>([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Explanation | null>(null);

  const load = (search = '') => api.get<{ data: Explanation[] }>(`/saved?q=${encodeURIComponent(search)}`).then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const del = async (id: string) => { await api.delete(`/saved/${id}`); setItems(p => p.filter(i => i.id !== id)); if (selected?.id === id) setSelected(null); };

  return (
    <div className="flex gap-4 w-full h-[calc(100vh-5rem)] min-h-0">
      <div className="w-72 shrink-0 flex flex-col gap-3">
        <h1 className="text-xl font-bold text-white">Saved Explanations</h1>
        <input className="input" placeholder="Search…" value={q} onChange={e => { setQ(e.target.value); load(e.target.value); }} />
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {items.length === 0 && <p className="text-slate-400 text-sm mt-4 text-center">No saved explanations yet.</p>}
          {items.map(item => (
            <button key={item.id} onClick={() => setSelected(item)} className={`w-full text-left p-3 rounded-lg border transition-colors ${selected?.id === item.id ? 'border-blue-500 bg-blue-600/10 text-white' : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100'}`}>
              <div className="font-medium text-sm truncate">{item.title}</div>
              <div className="flex gap-1 mt-1 flex-wrap">{item.tags.map(t => <span key={t} className="badge bg-slate-700 text-slate-300">{t}</span>)}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 card overflow-y-auto min-w-0">
        {selected ? (
          <>
            <div className="flex items-start justify-between mb-4 gap-3">
              <h2 className="font-bold text-xl text-white">{selected.title}</h2>
              <button onClick={() => del(selected.id)} className="btn-danger text-xs shrink-0">Delete</button>
            </div>
            <div className="flex gap-1 mb-4 flex-wrap">{selected.tags.map(t => <span key={t} className="badge bg-blue-600/20 text-blue-300">{t}</span>)}</div>
            <p className="text-slate-100 whitespace-pre-wrap text-sm leading-relaxed font-sans">{selected.content}</p>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">Select an explanation to view it</div>
        )}
      </div>
    </div>
  );
}
