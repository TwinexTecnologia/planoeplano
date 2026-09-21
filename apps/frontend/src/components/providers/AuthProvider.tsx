'use client';

import * as React from 'react';
import { createContext, useContext } from 'react';

type AuthUser = {
  id: string;
  nome: string;
  email: string;
  role: string;
  company_id: string;
  company_nome: string;
} | null;

type AuthCtx = {
  user: AuthUser;
  accessToken: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const TOKEN_KEY = 'costbase.access_token';
const USER_KEY = 'costbase.user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      const u = localStorage.getItem(USER_KEY);
      if (t && u) {
        setAccessToken(t);
        setUser(JSON.parse(u));
      }
    } catch {
      /* noop */
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = React.useCallback(async (email: string, senha: string) => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    if (!res.ok) throw new Error('Credenciais inválidas');
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setAccessToken(data.access_token);
    setUser(data.user);
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
