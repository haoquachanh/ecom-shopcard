export interface GridRow {
  quantity: string;
  values: Record<string, number>;
}

export interface GridData {
  rows: GridRow[];
}

export interface PricingConfig {
  has_materials?: boolean;
  has_dimensions?: boolean;
  available_sizes?: string[];
  available_materials?: { code: string; label: string }[];
  quantity_breaks?: number[];
}

export interface PriceTier {
  id: number;
  productTypeId: number;
  name: string;
  displayName: string;
  description?: string;
  sortOrder: number;
  isDefault: boolean;
}

export interface ProductType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  pricingConfig: PricingConfig;
  isActive: boolean;
  priceTiers?: PriceTier[];
  samples?: Sample[];
}

export interface SampleImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

export interface SampleVideo {
  id: number;
  videoUrl: string;
  sortOrder: number;
  altText?: string;
}

export interface SampleMedia {
  id: number;
  type: 'image' | 'video';
  url: string;
  sortOrder: number;
  altText?: string;
  isPrimary?: boolean;
}

export interface Sample {
  id: number;
  productTypeId: number;
  productType?: ProductType;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  isActive: boolean;
  images?: SampleImage[];
  videos?: SampleVideo[];
  media?: SampleMedia[];
}

export interface PriceGrid {
  id: number;
  productTypeId: number;
  priceTierId: number;
  materialCode?: string;
  gridData: GridData;
}

export interface ExtraCharge {
  id: number;
  name: string;
  chargeType: 'per_item' | 'per_request' | 'per_100_items';
  priceVnd: number;
  isPerItem: boolean;
  description?: string;
}

export interface PriceCalculateResult {
  unitPrice: number;
  quantity: number;
  extraCharges: Array<{ id: number; name: string; chargeType: string; priceVnd: number; isPerItem: boolean; total: number }>;
  extraTotal: number;
  subtotal: number;
}
