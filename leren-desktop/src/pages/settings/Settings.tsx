import { useState, useEffect, FormEvent } from 'react';
import { api } from '@/lib/api';

interface SettingsData { uiLanguage: string; tutorLanguage: string; bilingualMode: boolean; voice: string; voiceSpeed: number; autoReplySeconds: number; storeHistory: boolean; notificationsEnabled: boolean; }

const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
const LANGUAGES = [['en', 'English'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'], ['zh', 'Chinese'], ['ja', 'Japanese'], ['ko', 'Korean'], ['ar', 'Arabic'], ['hi', 'Hindi'], ['pt', 'Portuguese'], ['it', 'Italian']];

export default function Settings() {
  const [form, setForm] = useState<SettingsData>({ uiLanguage: 'en', tutorLanguage: 'en', bilingualMode: false, voice: 'alloy', voiceSpeed: 1, autoReplySeconds: 2, storeHistory: true, notificationsEnabled: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.get<SettingsData>('/settings').then(s => setForm(s)).catch(() => {}); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setSaved(false);
    try { await api.patch('/settings', form); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    catch { /* ignore */ } finally { setSaving(false); }
  };

  const set = <K extends keyof SettingsData>(k: K, v: SettingsData[K]) => setForm(p => ({ ...p, [k]: v }));

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card space-y-4"><h2 className="font-semibold text-slate-200">{title}</h2>{children}</div>
  );
  const Toggle = ({ k, label }: { k: keyof SettingsData; label: string }) => (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-slate-300">{label}</span>
      <button type="button" onClick={() => set(k, !form[k] as SettingsData[typeof k])} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${form[k] ? 'bg-blue-600' : 'bg-slate-700'}`}>
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${form[k] ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  );

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="🌍 Languages">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">UI Language</label>
              <select className="input" value={form.uiLanguage} onChange={e => set('uiLanguage', e.target.value)}>{LANGUAGES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></div>
            <div><label className="label">Tutor Language</label>
              <select className="input" value={form.tutorLanguage} onChange={e => set('tutorLanguage', e.target.value)}>{LANGUAGES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></div>
          </div>
          <Toggle k="bilingualMode" label="Bilingual mode (tutor replies in both languages)" />
        </Section>

        <Section title="🔊 Voice">
          <div><label className="label">Voice</label>
            <select className="input" value={form.voice} onChange={e => set('voice', e.target.value)}>{VOICES.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}</select></div>
          <div><label className="label">Speed: {form.voiceSpeed}x</label>
            <input type="range" min={0.5} max={2} step={0.1} value={form.voiceSpeed} onChange={e => set('voiceSpeed', parseFloat(e.target.value))} className="w-full accent-blue-500" /></div>
        </Section>

        <Section title="🎙️ Live Tutor">
          <div><label className="label">Silence threshold (seconds before auto-reply): {form.autoReplySeconds}s</label>
            <input type="range" min={1} max={8} step={1} value={form.autoReplySeconds} onChange={e => set('autoReplySeconds', parseInt(e.target.value))} className="w-full accent-blue-500" /></div>
        </Section>

        <Section title="🔒 Privacy & Notifications">
          <Toggle k="storeHistory" label="Store session history" />
          <Toggle k="notificationsEnabled" label="Enable notifications" />
        </Section>

        <div className="flex items-center gap-3">
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
          {saved && <span className="text-green-400 text-sm">✓ Saved</span>}
        </div>
      </form>
    </div>
  );
}
