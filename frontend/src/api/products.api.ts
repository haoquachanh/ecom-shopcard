import { apiClient } from './client';
import type { ProductType, Sample, PriceGrid, ExtraCharge, PriceCalculateResult } from '@/types/product.types';

export const productTypesApi = {
  getAll: () => apiClient.get<ProductType[]>('/product-types').then(r => r.data),
  getOne: (id: number) => apiClient.get<ProductType>(`/product-types/${id}`).then(r => r.data),
  getBySlug: (slug: string) => apiClient.get<ProductType>(`/product-types/slug/${slug}`).then(r => r.data),
};

export const samplesApi = {
  getAll: (productTypeId?: number) =>
    apiClient.get<Sample[]>('/samples', { params: productTypeId ? { productTypeId } : {} }).then(r => r.data),
  getBySlug: (slug: string) => apiClient.get<Sample>(`/samples/slug/${slug}`).then(r => r.data),
  getOne: (id: number) => apiClient.get<Sample>(`/samples/${id}`).then(r => r.data),
};

export const priceGridsApi = {
  getTiers: (productTypeId: number) =>
    apiClient.get('/price-grids/tiers', { params: { productTypeId } }).then(r => r.data),
  getGrids: (productTypeId: number, priceTierId?: number) =>
    apiClient.get<PriceGrid[]>('/price-grids', { params: { productTypeId, priceTierId } }).then(r => r.data),
  getExtraCharges: () => apiClient.get<ExtraCharge[]>('/price-grids/extra-charges').then(r => r.data),
  calculate: (data: {
    productTypeId: number; priceTierId: number; materialCode?: string;
    sizeSelected?: string; quantity: number; extraChargeIds?: number[];
  }) => apiClient.post<PriceCalculateResult>('/price-grids/calculate', data).then(r => r.data),
};
