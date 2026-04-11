import { apiClient } from './client';
import type { AuthResponse } from '@/types/auth.types';

export const authApi = {
  register: (data: { email: string; password: string; fullName?: string; phone?: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),

  getProfile: () => apiClient.get('/auth/profile').then(r => r.data),
};
