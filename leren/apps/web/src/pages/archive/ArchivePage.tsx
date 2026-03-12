import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface SubjectFile { id: string; fileName: string; fileType: string; }
interface Subject {
  id: string; name: string; createdAt: string; trashedAt: string | null;
  files: SubjectFile[]; status: string;
}
interface TrashedFile {
  id: string; fileName: string; fileType: string; trashedAt: string;
  subject: { id: string; name: string };
}

const TRASH_DAYS = 10;

function timeLeftFull(trashedAt: string): string {
  const expiry = new Date(trashedAt).getTime() + TRASH_DAYS * 24 * 60 * 60 * 1000;
  const ms = expiry - Date.now();
  if (ms <= 0) return 'Expiring soon';
  const minutes = ms / 60000;
  const hours   = ms / 3600000;
  const days    = ms / 86400000;
  if (days >= 1)    return `${Math.floor(days)} day${Math.floor(days) !== 1 ? 's' : ''} left`;
  if (hours >= 1)   return `${Math.floor(hours)} hour${Math.floor(hours) !== 1 ? 's' : ''} left`;
  if (minutes >= 1) return `${Math.floor(minutes)} minute${Math.floor(minutes) !== 1 ? 's' : ''} left`;
  return 'Less than a minute';
}

function urgencyColor(trashedAt: string) {
  const expiry = new Date(trashedAt).getTime() + TRASH_DAYS * 24 * 60 * 60 * 1000;
  const ms = expiry - Date.now();
  const days = ms / 86400000;
  if (days < 1)  return { text: 'text-red-400',    bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)' };
  if (days < 3)  return { text: 'text-amber-400',  bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.3)' };
  return              { text: 'text-slate-400',    bg: 'rgba(255,255,255,0.02)', border: 'rgba(100,116,139,0.25)' };
}

function fileIcon(fileType: string) {
  if (fileType === 'image') return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5}/>
      <circle cx="8.5" cy="8.5" r="1.5" strokeWidth={1.5}/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15l-5-5L5 21"/>
    </svg>
  );
  if (fileType === 'pdf') return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
    </svg>
  );
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6M9 16h6M7 3H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V8l-6-6zM13 3v5h5"/>
    </svg>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">{children}</span>
      <div className="flex-1 h-px bg-slate-700/50" />
    </div>
  );
}

function EmptyCol({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center rounded-2xl border border-dashed border-slate-800/60">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-700/50"
           style={{ background: 'rgba(59,130,246,0.04)' }}>
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-xs text-slate-600 max-w-[180px] leading-relaxed">{sub}</p>
    </div>
  );
}

function IconBtn({ onClick, title, children, danger = false }: {
  onClick: () => void; title: string; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
        danger
          ? 'text-slate-600 hover:text-red-400 hover:bg-red-900/20'
          : 'text-slate-500 hover:text-blue-400 hover:bg-blue-900/20'
      }`}
    >
      {children}
    </button>
  );
}

const RestoreIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
  </svg>
);
const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);
const SpinIcon = () => (
  <svg className="w-4 h-4 text-slate-500 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
  </svg>
);

export default function ArchivePage() {
  const navigate                        = useNavigate();
  const [tab, setTab]                   = useState<'archive' | 'trash'>('archive');
  const [archived, setArchived]         = useState<Subject[]>([]);
  const [trashed, setTrashed]           = useState<Subject[]>([]);
  const [trashedFiles, setTrashedFiles] = useState<TrashedFile[]>([]);
  const [loading, setLoading]           = useState(true);
  const [busyIds, setBusyIds]           = useState<Set<string>>(new Set());

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<Subject[]>('/subjects/archived'),
      api.get<Subject[]>('/subjects/trashed'),
      api.get<TrashedFile[]>('/subjects/files/trashed'),
    ]).then(([arch, trash, files]) => {
      setArchived(arch);
      setTrashed(trash);
      setTrashedFiles(files);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const id = setInterval(() => setTrashed(t => [...t]), 60000);
    return () => clearInterval(id);
  }, []);

  const setBusy = (id: string, busy: boolean) =>
    setBusyIds(prev => { const n = new Set(prev); busy ? n.add(id) : n.delete(id); return n; });

  // ── Subject actions ───────────────────────────────────────────────────
  const restoreSubject = async (id: string) => {
    setBusy(id, true);
    try {
      await api.patch(`/subjects/${id}/restore`, {});
      setArchived(prev => prev.filter(s => s.id !== id));
      setTrashed(prev => prev.filter(s => s.id !== id));
    } catch { /* ignore */ } finally { setBusy(id, false); }
  };

  const trashSubject = async (id: string) => {
    setBusy(id, true);
    try {
      const updated = await api.patch<Subject>(`/subjects/${id}/trash`, {});
      setArchived(prev => prev.filter(s => s.id !== id));
      setTrashed(prev => [updated, ...prev]);
    } catch { /* ignore */ } finally { setBusy(id, false); }
  };

  const deleteSubject = async (id: string) => {
    setBusy(id, true);
    try {
      await api.delete(`/subjects/${id}`);
      setTrashed(prev => prev.filter(s => s.id !== id));
    } catch { /* ignore */ } finally { setBusy(id, false); }
  };

  // ── File actions ──────────────────────────────────────────────────────
  const restoreFile = async (file: TrashedFile) => {
    setBusy(file.id, true);
    try {
      await api.patch(`/subjects/${file.subject.id}/files/${file.id}/restore`, {});
      setTrashedFiles(prev => prev.filter(f => f.id !== file.id));
    } catch { /* ignore */ } finally { setBusy(file.id, false); }
  };

  const deleteFile = async (file: TrashedFile) => {
    setBusy(file.id, true);
    try {
      await api.delete(`/subjects/${file.subject.id}/files/${file.id}`);
      setTrashedFiles(prev => prev.filter(f => f.id !== file.id));
    } catch { /* ignore */ } finally { setBusy(file.id, false); }
  };

  const subjects = tab === 'archive' ? archived : trashed;

  // Archive tab shows files embedded in archived subjects
  const archiveFiles = archived.flatMap(s =>
    s.files.map(f => ({ ...f, trashedAt: null as string | null, subject: { id: s.id, name: s.name } }))
  );
  const filesForTab = tab === 'archive' ? archiveFiles : trashedFiles;

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-1">Archive & Trash</h1>
      <p className="text-slate-500 text-sm mb-6">Manage archived and deleted subjects and files.</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl border border-slate-700/40 shrink-0"
           style={{ background: 'rgba(1,10,28,0.5)', width: 'fit-content' }}>
        {(['archive', 'trash'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
            style={tab === t ? { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.25)' } : {}}
          >
            {t === 'archive' ? (
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"/>
                </svg>
                Archive {archived.length > 0 && `(${archived.length})`}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Trash {(trashed.length + trashedFiles.length) > 0 && `(${trashed.length + trashedFiles.length})`}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Trash warning banner */}
      {tab === 'trash' && (trashed.length + trashedFiles.length) > 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/20 px-4 py-3 flex items-start gap-3"
             style={{ background: 'rgba(245,158,11,0.06)' }}>
          <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <p className="text-xs text-amber-300/80 leading-relaxed">
            Items in Trash are permanently deleted after <strong>10 days</strong>. Restore them before they expire.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-slate-500 text-sm">Loading…</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 flex-1 items-start">

          {/* ── Subjects column ── */}
          <div>
            <SectionHeading>
              Subjects {subjects.length > 0 && <span className="font-normal normal-case tracking-normal">({subjects.length})</span>}
            </SectionHeading>

            {subjects.length === 0 ? (
              <EmptyCol
                icon={
                  tab === 'archive'
                    ? <svg className="w-6 h-6 text-blue-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"/>
                      </svg>
                    : <svg className="w-6 h-6 text-slate-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                }
                title={tab === 'archive' ? 'No archived subjects' : 'No trashed subjects'}
                sub={tab === 'archive' ? 'Archived subjects appear here.' : 'Deleted subjects appear here.'}
              />
            ) : (
              <div className="space-y-2">
                {subjects.map(s => {
                  const urg = (tab === 'trash' && s.trashedAt) ? urgencyColor(s.trashedAt) : null;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all duration-150 hover:border-slate-600/60"
                      style={{
                        background: urg?.bg ?? 'rgba(1,10,28,0.7)',
                        borderColor: urg?.border ?? 'rgba(100,116,139,0.25)',
                      }}
                      onClick={() => navigate(`/app/subjects/${s.id}`)}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                           style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{s.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {s.files.length} file{s.files.length !== 1 ? 's' : ''}
                          {tab === 'trash' && s.trashedAt && (
                            <span className={`ml-2 font-medium ${urg?.text}`}>
                              · {timeLeftFull(s.trashedAt)}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        {busyIds.has(s.id) ? <SpinIcon /> : (
                          <>
                            <IconBtn onClick={() => restoreSubject(s.id)} title="Restore">
                              <RestoreIcon />
                            </IconBtn>
                            {tab === 'archive' ? (
                              <IconBtn onClick={() => trashSubject(s.id)} title="Move to Trash" danger>
                                <TrashIcon />
                              </IconBtn>
                            ) : (
                              <IconBtn onClick={() => deleteSubject(s.id)} title="Delete permanently" danger>
                                <DeleteIcon />
                              </IconBtn>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Files column ── */}
          <div>
            <SectionHeading>
              Files {filesForTab.length > 0 && <span className="font-normal normal-case tracking-normal">({filesForTab.length})</span>}
            </SectionHeading>

            {filesForTab.length === 0 ? (
              <EmptyCol
                icon={
                  <svg className="w-6 h-6 text-slate-400 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 12h6M9 16h6M7 3H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V8l-6-6zM13 3v5h5"/>
                  </svg>
                }
                title="No files here"
                sub={
                  tab === 'archive'
                    ? 'Files inside archived subjects appear here.'
                    : 'Files moved to Trash appear here.'
                }
              />
            ) : (
              <div className="space-y-2">
                {filesForTab.map(f => {
                  const urg = (tab === 'trash' && f.trashedAt) ? urgencyColor(f.trashedAt) : null;
                  return (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all"
                      style={{
                        background: urg?.bg ?? 'rgba(1,10,28,0.5)',
                        borderColor: urg?.border ?? 'rgba(100,116,139,0.2)',
                      }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-slate-400"
                           style={{ background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.18)' }}>
                        {fileIcon(f.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{f.fileName}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          from&nbsp;
                          <button
                            className="text-blue-400/70 hover:text-blue-400 transition-colors"
                            onClick={() => navigate(`/app/subjects/${f.subject.id}`)}
                          >
                            {f.subject.name}
                          </button>
                          {tab === 'trash' && f.trashedAt && (
                            <span className={`ml-2 font-medium ${urg?.text ?? 'text-slate-400'}`}>
                              · {timeLeftFull(f.trashedAt)}
                            </span>
                          )}
                        </p>
                      </div>
                      {tab === 'trash' && (
                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          {busyIds.has(f.id) ? <SpinIcon /> : (
                            <>
                              <IconBtn onClick={() => restoreFile(f as TrashedFile)} title="Restore file">
                                <RestoreIcon />
                              </IconBtn>
                              <IconBtn onClick={() => deleteFile(f as TrashedFile)} title="Delete permanently" danger>
                                <DeleteIcon />
                              </IconBtn>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
