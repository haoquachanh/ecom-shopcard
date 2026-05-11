import { getSupabaseClient } from '@/lib/supabase';
import type { ProductType, Sample } from '@/types/product.types';

type ProductTypeRow = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

type SampleRow = {
  id: number;
  product_type_id: number;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  tags: string[];
  is_active: boolean;
  sample_images?: Array<{
    id: number;
    image_url: string;
    sort_order: number;
  }>;
  productType?: ProductTypeRow | ProductTypeRow[] | null;
};

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function makeEntitySlug(id: number, name: string) {
  const slug = slugify(name);
  return slug ? `${slug}-${id}` : String(id);
}

export function idFromSlug(slug: string) {
  const match = slug.match(/-(\d+)$/) || slug.match(/^(\d+)$/);
  return match ? Number(match[1]) : null;
}

export function mapProductType(row: ProductTypeRow): ProductType {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || makeEntitySlug(row.id, row.name),
    description: row.description || undefined,
    imageUrl: row.image_url || undefined,
    pricingConfig: {},
    isActive: row.is_active,
  };
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] || null : value || null;
}

export function mapSample(row: SampleRow): Sample {
  const productTypeRow = firstRelation(row.productType);
  return {
    id: row.id,
    productTypeId: row.product_type_id,
    productType: productTypeRow ? mapProductType(productTypeRow) : undefined,
    name: row.name,
    slug: row.slug || makeEntitySlug(row.id, row.name),
    description: row.description || undefined,
    imageUrl: row.image_url || undefined,
    thumbnailUrl: row.thumbnail_url || row.image_url || undefined,
    tags: row.tags || [],
    isActive: row.is_active,
    images: (row.sample_images || []).map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
      sortOrder: image.sort_order,
    })),
  };
}

export const productTypesService = {
  async getAll() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_types')
      .select('id,name,slug,description,image_url,is_active,sort_order,created_at,updated_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapProductType);
  },

  async getOne(id: number) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('product_types')
      .select('id,name,slug,description,image_url,is_active,sort_order,created_at,updated_at')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return mapProductType(data);
  },
};

export const samplesService = {
  async getAll(productTypeId?: number) {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('samples')
      .select(
        'id,product_type_id,name,slug,description,image_url,thumbnail_url,tags,is_active,sort_order,created_at,updated_at,productType:product_types(id,name,slug,description,image_url,is_active,sort_order,created_at,updated_at),sample_images(id,image_url,sort_order)',
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (productTypeId) {
      query = query.eq('product_type_id', productTypeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return ((data || []) as SampleRow[])
      .filter((row) => firstRelation(row.productType)?.is_active !== false)
      .map(mapSample);
  },

  async getBySlug(slug: string) {
    const id = idFromSlug(slug);
    if (id) {
      return this.getOne(id);
    }

    const samples = await this.getAll();
    const sample = samples.find((item) => item.slug === slug);
    if (!sample) {
      throw new Error('Sample not found');
    }
    return sample;
  },

  async getOne(id: number) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('samples')
      .select(
        'id,product_type_id,name,slug,description,image_url,thumbnail_url,tags,is_active,sort_order,created_at,updated_at,productType:product_types(id,name,slug,description,image_url,is_active,sort_order,created_at,updated_at),sample_images(id,image_url,sort_order)',
      )
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    const sample = mapSample(data as SampleRow);
    if (sample.productType?.isActive === false) {
      throw new Error('Sample not found');
    }
    return sample;
  },
};
