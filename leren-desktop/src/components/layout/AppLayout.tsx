import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SessionProvider } from '@/context/SessionContext';

export function AppLayout() {
  return (
    <SessionProvider>
      <div className="flex min-h-screen" style={{ background: 'linear-gradient(160deg, #000d1a 0%, #001233 40%, #000814 100%)' }}>
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </SessionProvider>
  );
}
