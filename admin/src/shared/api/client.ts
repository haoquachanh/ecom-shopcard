import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { nativeStore } from './nativeStore';
import type { ApiEnvelope, AuthResponse } from '@/shared/types/api';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
let refreshPromise: Promise<string | null> | null = null;

export const apiClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

export async function initializeApiClient() {
  const [settings, tokens] = await Promise.all([nativeStore.getSettings(), nativeStore.getTokens()]);
  baseUrl = normalizeBaseUrl(settings.apiBaseUrl);
  accessToken = tokens?.accessToken ?? null;
  refreshToken = tokens?.refreshToken ?? null;
  apiClient.defaults.baseURL = baseUrl;
}

export function getApiBaseUrl() {
  return baseUrl;
}

export async function setApiBaseUrl(nextBaseUrl: string) {
  baseUrl = normalizeBaseUrl(nextBaseUrl);
  apiClient.defaults.baseURL = baseUrl;
  await nativeStore.setSettings({ apiBaseUrl: baseUrl });
}

export async function setAuthTokens(tokens: { accessToken: string; refreshToken?: string }) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken ?? null;
  await nativeStore.setTokens(tokens);
}

export async function clearAuthTokens() {
  accessToken = null;
  refreshToken = null;
  await nativeStore.clearTokens();
}

export function unwrap<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = baseUrl;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    response.data = unwrap(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retry && refreshToken) {
      original._retry = true;
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        original.headers.Authorization = `Bearer ${nextToken}`;
        return apiClient(original);
      }
    }
    return Promise.reject(error);
  },
);

async function refreshAccessToken() {
  refreshPromise ??= apiClient
    .post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken })
    .then(async (response) => {
      const nextAccess = response.data.access_token ?? response.data.accessToken;
      const nextRefresh = response.data.refresh_token ?? response.data.refreshToken ?? refreshToken ?? undefined;
      if (!nextAccess) return null;
      await setAuthTokens({ accessToken: nextAccess, refreshToken: nextRefresh });
      return nextAccess;
    })
    .catch(async () => {
      await clearAuthTokens();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function normalizeBaseUrl(value: string) {
  return (value || 'http://localhost:3000').trim().replace(/\/+$/, '');
}
