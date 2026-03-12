import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { token } = await api.post<{ token: string }>('/auth/register', { email, password });
      await login(token);
      navigate('/app/live');
    } catch (err) {
      setError((err as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 text-slate-100"
      style={{ background: 'linear-gradient(160deg, #000d1a 0%, #001233 40%, #000814 100%)' }}
    >
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src="/logo.png" alt="Leren" className="leren-logo-lg" />
        </Link>

        <div className="card" style={{ background: 'rgba(1,10,30,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <h1 className="text-xl font-bold mb-6 text-white">Create account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required autoFocus
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">
                Password <span className="text-slate-500">(min 8 chars)</span>
              </label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required minLength={8}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(99,155,255,0.35)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(59,130,246,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <p className="text-slate-400 text-sm mt-5 text-center">
            Already registered?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
