import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  plan: string;
  profile: { fullName?: string | null } | null;
  settings: { uiLanguage?: string } | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredToken(): string | null {
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  if (rememberMe) return localStorage.getItem('token');
  return sessionStorage.getItem('token');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const me = await api.get<AuthUser>('/auth/me');
      setUser(me);
    } catch {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('token');
    }
  };

  useEffect(() => {
    if (token) {
      fetchMe().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (newToken: string, rememberMe: boolean) => {
    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
    if (rememberMe) {
      localStorage.setItem('token', newToken);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', newToken);
      localStorage.removeItem('token');
    }
    setToken(newToken);
    await fetchMe();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refresh: fetchMe, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
