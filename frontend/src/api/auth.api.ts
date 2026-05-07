import { apiClient } from './client';
import type { AuthResponse, AuthUser } from '@/types/auth.types';

interface BackendAuthUser {
  id: number;
  email: string;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface BackendAuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: string;
  user: BackendAuthUser;
}

function normalizeUser(user: BackendAuthUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
    fullName: user.name ?? undefined,
    phone: user.phone ?? undefined,
    address: user.address ?? undefined,
    role: user.role,
    isAdmin: user.role === 'admin',
    isActive: user.isActive ?? true,
    createdAt: user.createdAt ?? '',
  };
}

function normalizeAuthResponse(response: BackendAuthResponse): AuthResponse {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    user: normalizeUser(response.user),
  };
}

export const authApi = {
  register: (data: { email: string; password: string; fullName?: string; phone?: string }) =>
    apiClient
      .post<BackendAuthResponse>('/auth/register', {
        email: data.email,
        password: data.password,
        name: data.fullName,
        phone: data.phone,
      })
      .then(r => normalizeAuthResponse(r.data)),

  login: (email: string, password: string) =>
    apiClient.post<BackendAuthResponse>('/auth/login', { email, password }).then(r => normalizeAuthResponse(r.data)),

  getProfile: () => apiClient.get<BackendAuthUser>('/profile').then(r => normalizeUser(r.data)),
};
