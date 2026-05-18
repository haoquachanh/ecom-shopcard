import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApiClient, clearAuthTokens, setAuthTokens } from '@/shared/api/client';
import { adminApi } from '@/shared/api/adminApi';
import type { AdminUser, AuthUser } from '@/shared/types/api';

type AuthContextValue = {
  user: AuthUser | null;
  isBooting: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    initializeApiClient()
      .then(async () => {
        try {
          const profile = await adminApi.profile();
          if (mounted) setUser(normalizeUser(profile));
        } catch {
          await clearAuthTokens();
        }
      })
      .finally(() => {
        if (mounted) setIsBooting(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await adminApi.login({ email, password });
    const accessToken = response.access_token ?? response.accessToken;
    const refreshToken = response.refresh_token ?? response.refreshToken;
    if (!accessToken) throw new Error('Backend không trả access token.');
    const normalized = normalizeUser(response.user);
    if (normalized.role !== 'admin') {
      await clearAuthTokens();
      throw new Error('Tài khoản này chưa có quyền admin.');
    }
    await setAuthTokens({ accessToken, refreshToken });
    setUser(normalized);
  }, []);

  const logout = useCallback(async () => {
    await adminApi.logout();
    await clearAuthTokens();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(() => ({ user, isBooting, login, logout }), [user, isBooting, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

function normalizeUser(user: AdminUser | AuthUser): AuthUser {
  return {
    ...user,
    name: user.name ?? user.fullName ?? null,
    role: user.role ?? (user.isAdmin ? 'admin' : 'user'),
    isActive: user.isActive ?? true,
  };
}
