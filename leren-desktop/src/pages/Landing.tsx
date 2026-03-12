import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FuturisticBackground } from '@/components/FuturisticBackground';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="fixed inset-0 bg-[#000d1a] text-slate-100 overflow-hidden flex flex-col">
      <FuturisticBackground />

      {/* When logged in: profile name top right */}
      {user && (
        <header className="relative z-20 flex items-center justify-end px-6 py-4">
          <Link
            to="/app/profile"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-600/80 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800/50 transition-colors text-slate-200 text-sm font-medium"
          >
            <span className="w-7 h-7 rounded-full bg-blue-600/80 flex items-center justify-center text-xs font-bold text-white">
              {(user.profile?.fullName || user.email).charAt(0).toUpperCase()}
            </span>
            {user.profile?.fullName || user.email}
          </Link>
        </header>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 gap-6 px-6">
        <img src="/logo.png" alt="Leren" className="leren-logo mb-4" />

        <p className="text-slate-400 text-sm tracking-wide">
          {user ? `Welcome back${user.profile?.fullName ? `, ${user.profile.fullName}` : ''}` : 'Your Personal AI Tutor'}
        </p>

        <Link
          to={user ? '/app/live' : '/register'}
          className="btn-glow w-56 justify-center text-base"
        >
          <span className="comet-blur" />
          Get Started
        </Link>

        {!user && (
          <Link to="/login" className="btn-secondary w-56 justify-center text-base rounded-full">
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
