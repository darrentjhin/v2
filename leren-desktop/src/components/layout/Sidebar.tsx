import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSession } from '@/context/SessionContext';

const navItems = [
  { to: '/app/live',     label: 'Live Tutor' },
  { to: '/app/subjects', label: 'Subjects' },
  { to: '/app/saved',    label: 'Saved' },
  { to: '/app/progress', label: 'Progress' },
  { to: '/app/archive',  label: 'Archive & Trash' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { sessionId, status, endSession } = useSession();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="flex flex-col w-60 min-h-screen border-r border-slate-800/60 px-3 py-5 shrink-0" style={{ background: 'rgba(0,10,25,0.7)', backdropFilter: 'blur(12px)' }}>
      <div className="relative flex items-center justify-center px-2 mb-8 w-full min-h-[52px]">
        <Link to="/"><img src="/logo.png" alt="Leren" className="leren-logo" /></Link>
        {user?.plan === 'PRO' && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 badge bg-blue-600/30 text-blue-300">PRO</span>
        )}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600/20 text-blue-300' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Active session indicator */}
      {sessionId && (
        <div className="mb-3 rounded-xl border border-blue-500/20 overflow-hidden"
             style={{ background: 'rgba(37,99,235,0.07)' }}>
          <Link to="/app/live" className="flex items-center gap-2 px-3 pt-3 pb-1.5 hover:opacity-80 transition-opacity">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              status === 'replying'  ? 'bg-purple-400 animate-pulse' :
              status === 'thinking' ? 'bg-yellow-400 animate-pulse' :
              status === 'speaking' ? 'bg-blue-400 animate-pulse'   :
                                      'bg-green-400 animate-pulse'
            }`} />
            <span className="text-xs font-medium text-blue-300 truncate">Session active</span>
          </Link>
          <button
            onClick={endSession}
            className="w-full text-left px-3 pb-2.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            End session
          </button>
        </div>
      )}

      <div className="border-t border-slate-800 pt-4 flex flex-col gap-1">
        <NavLink to="/app/profile" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600/20 text-blue-300' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}>
          {user?.profile?.fullName ?? user?.email?.split('@')[0] ?? 'Profile'}
        </NavLink>
        <NavLink to="/app/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600/20 text-blue-300' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}>
          Settings
        </NavLink>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors text-left">
          Log out
        </button>
      </div>
    </aside>
  );
}
