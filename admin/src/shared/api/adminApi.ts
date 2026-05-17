import { apiClient } from './client';
import type { AdminUser, AuthResponse, ProductType, Sample } from '@/shared/types/api';

type ListParams = {
  search?: string;
  page?: number;
  pageSize?: number;
  status?: string;
};

function normalizeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && Array.isArray((value as { items?: unknown[] }).items)) {
    return (value as { items: T[] }).items;
  }
  return [];
}

export const adminApi = {
  login: (payload: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', payload).then((response) => response.data),

  profile: () => apiClient.get<AdminUser>('/profile').then((response) => response.data),

  logout: () => apiClient.post('/auth/logout').catch(() => undefined),

  health: () => apiClient.get('/health').then((response) => response.data),

  listUsers: (params: ListParams) =>
    apiClient.get('/admin/users', { params }).then((response) => normalizeArray<AdminUser>(response.data)),

  updateUserStatus: (id: number, isActive: boolean) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}/status`, { isActive }).then((response) => response.data),

  listProductTypes: () =>
    apiClient.get('/product-types').then((response) => normalizeArray<ProductType>(response.data)),

  createProductType: (payload: Partial<ProductType>) =>
    apiClient.post<ProductType>('/admin/product-types', payload).then((response) => response.data),

  updateProductType: (id: number, payload: Partial<ProductType>) =>
    apiClient.put<ProductType>(`/admin/product-types/${id}`, payload).then((response) => response.data),

  listSamples: (productTypeId?: number) =>
    apiClient
      .get('/samples', { params: productTypeId ? { product_type_id: productTypeId } : undefined })
      .then((response) => normalizeArray<Sample>(response.data)),

  createSample: (payload: Partial<Sample>) =>
    apiClient.post<Sample>('/admin/samples', payload).then((response) => response.data),

  updateSample: (id: number, payload: Partial<Sample>) =>
    apiClient.put<Sample>(`/admin/samples/${id}`, payload).then((response) => response.data),

  listPriceAdminData: () => apiClient.get('/admin/price-grids').then((response) => response.data),
};
