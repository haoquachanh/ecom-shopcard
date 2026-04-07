import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '@/api/auth.api';
import type { AuthUser } from '@/types/auth.types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName?: string; phone?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authApi.getProfile()
        .then(setUser)
        .catch(() => { localStorage.removeItem('accessToken'); })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: userData } = await authApi.login(email, password);
    localStorage.setItem('accessToken', accessToken);
    setUser(userData);
  }, []);

  const register = useCallback(async (data: any) => {
    const { accessToken, user: userData } = await authApi.register(data);
    localStorage.setItem('accessToken', accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, isAdmin: user?.isAdmin ?? false, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
