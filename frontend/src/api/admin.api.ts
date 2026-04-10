import { apiClient } from './client';

export const adminApi = {
  getProductTypes: () => apiClient.get('/admin/product-types').then((r) => r.data),
  createProductType: (data: any) => apiClient.post('/admin/product-types', data).then((r) => r.data),
  updateProductType: (id: number, data: any) => apiClient.put(`/admin/product-types/${id}`, data).then((r) => r.data),
  deleteProductType: (id: number) => apiClient.delete(`/admin/product-types/${id}`).then((r) => r.data),

  getSamples: (productTypeId?: number) =>
    apiClient.get('/admin/samples', { params: productTypeId ? { productTypeId } : {} }).then((r) => r.data),
  createSample: (data: any) => apiClient.post('/admin/samples', data).then((r) => r.data),
  updateSample: (id: number, data: any) => apiClient.put(`/admin/samples/${id}`, data).then((r) => r.data),
  deleteSample: (id: number) => apiClient.delete(`/admin/samples/${id}`).then((r) => r.data),

  getTiers: (productTypeId: number) =>
    apiClient.get('/admin/price-grids/tiers', { params: { productTypeId } }).then((r) => r.data),
  createTier: (data: any) => apiClient.post('/admin/price-grids/tiers', data).then((r) => r.data),
  deleteTier: (id: number) => apiClient.delete(`/admin/price-grids/tiers/${id}`).then((r) => r.data),
  getGrids: (productTypeId: number) =>
    apiClient.get('/admin/price-grids', { params: { productTypeId } }).then((r) => r.data),
  createGrid: (data: any) => apiClient.post('/admin/price-grids', data).then((r) => r.data),
  updateGrid: (id: number, data: any) => apiClient.put(`/admin/price-grids/${id}`, data).then((r) => r.data),
  deleteGrid: (id: number) => apiClient.delete(`/admin/price-grids/${id}`).then((r) => r.data),
  getExtraCharges: () => apiClient.get('/admin/price-grids/extra-charges').then((r) => r.data),
  createExtraCharge: (data: any) => apiClient.post('/admin/price-grids/extra-charges', data).then((r) => r.data),

  getUsers: () => apiClient.get('/admin/users').then((r) => r.data),
};
