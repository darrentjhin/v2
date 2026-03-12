import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRememberPrompt, setShowRememberPrompt] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.post<{ token: string }>('/auth/register', { email, password });
      setPendingToken(token);
      setShowRememberPrompt(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRememberChoice = async (rememberMe: boolean) => {
    if (!pendingToken) return;
    await login(pendingToken, rememberMe);
    setPendingToken(null);
    setShowRememberPrompt(false);
    navigate('/app/live');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 text-slate-100"
      style={{ background: 'linear-gradient(160deg, #000d1a 0%, #001233 40%, #000814 100%)' }}
    >
      {showRememberPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remember-title-reg"
        >
          <div
            className="card max-w-sm mx-4 p-6"
            style={{
              background: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(59,130,246,0.25)',
              boxShadow: '0 0 40px rgba(59,130,246,0.15)',
            }}
          >
            <h2 id="remember-title-reg" className="text-lg font-bold text-white mb-2">
              Keep you logged in?
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Choose &quot;Yes&quot; to stay signed in when you open the app next time. Choose &quot;No&quot; to sign in again each time.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleRememberChoice(true)}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleRememberChoice(false)}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-slate-200 border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src="/logo.png" alt="Leren" className="leren-logo-lg" />
        </Link>

        <div
          className="card"
          style={{
            background: 'rgba(1,10,30,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(59,130,246,0.15)',
          }}
        >
          <h1 className="text-xl font-bold mb-6 text-white">Create account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
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
                required
                minLength={8}
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
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                e.currentTarget.style.borderColor = 'rgba(99,155,255,0.35)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(59,130,246,0.18)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
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
