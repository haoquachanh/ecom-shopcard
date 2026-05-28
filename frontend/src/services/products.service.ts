import { getSupabaseClient } from '@/lib/supabase';
import type { ProductType, Sample } from '@/types/product.types';

type PublicProductTypeRow = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
};

type SampleMediaRow = {
  id: number;
  media_type: 'image' | 'video';
  public_url: string | null;
  storage_path: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
};

type SampleProductRow = {
  id: number;
  product_type_id: number;
  name: string;
  slug: string | null;
  description: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  product_types?: PublicProductTypeRow | PublicProductTypeRow[] | null;
  sample_product_media?: SampleMediaRow[];
};

type HomepageData = {
  productTypes?: PublicProductTypeRow[];
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

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] || null : value || null;
}

function mapProductType(row: PublicProductTypeRow): ProductType {
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug || makeEntitySlug(Number(row.id), row.name),
    description: row.description || undefined,
    imageUrl: row.image_url || undefined,
    pricingConfig: row.metadata ?? {},
    isActive: true,
  };
}

function mapSample(row: SampleProductRow): Sample {
  const media = [...(row.sample_product_media ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order || a.id - b.id;
  });
  const images = media
    .filter((item) => item.media_type === 'image' && item.public_url)
    .map((item) => ({
      id: Number(item.id),
      imageUrl: item.public_url || '',
      sortOrder: Number(item.sort_order),
    }));
  const videos = media
    .filter((item) => item.media_type === 'video' && item.public_url)
    .map((item) => ({
      id: Number(item.id),
      videoUrl: item.public_url || '',
      sortOrder: Number(item.sort_order),
      altText: item.alt_text || undefined,
    }));
  const allMedia = media
    .filter((item) => item.public_url)
    .map((item) => ({
      id: Number(item.id),
      type: item.media_type,
      url: item.public_url || '',
      sortOrder: Number(item.sort_order),
      altText: item.alt_text || undefined,
      isPrimary: item.is_primary,
    }));
  const primaryImage = images[0]?.imageUrl;
  const productTypeRow = firstRelation(row.product_types);

  return {
    id: Number(row.id),
    productTypeId: Number(row.product_type_id),
    productType: productTypeRow ? mapProductType(productTypeRow) : undefined,
    name: row.name,
    slug: row.slug || makeEntitySlug(Number(row.id), row.name),
    description: row.description || undefined,
    imageUrl: primaryImage,
    thumbnailUrl: primaryImage,
    tags: row.tags || [],
    isActive: true,
    images,
    videos,
    media: allMedia,
  };
}

async function listSampleRows(productTypeId?: number) {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('sample_products')
    .select(
      'id,product_type_id,name,slug,description,tags,metadata,product_types(id,name,slug,description,image_url,sort_order,metadata),sample_product_media(id,media_type,public_url,storage_path,alt_text,is_primary,sort_order)',
    )
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });

  if (productTypeId) {
    query = query.eq('product_type_id', productTypeId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as unknown as SampleProductRow[];
}

export const productTypesService = {
  async getAll() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_homepage_data');
    if (error) throw error;

    const payload = (data || {}) as HomepageData;
    return (payload.productTypes || []).map(mapProductType);
  },

  async getOne(id: number) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('public_active_product_types')
      .select('id,name,slug,description,image_url,sort_order,metadata')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapProductType(data as PublicProductTypeRow);
  },
};

export const samplesService = {
  async getAll(productTypeId?: number) {
    const rows = await listSampleRows(productTypeId);
    return rows.map(mapSample);
  },

  async getBySlug(slug: string) {
    const id = idFromSlug(slug);
    if (id) {
      return this.getOne(id);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('sample_products')
      .select(
        'id,product_type_id,name,slug,description,tags,metadata,product_types(id,name,slug,description,image_url,sort_order,metadata),sample_product_media(id,media_type,public_url,storage_path,alt_text,is_primary,sort_order)',
      )
      .eq('slug', slug)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return mapSample(data as unknown as SampleProductRow);
  },

  async getOne(id: number) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('sample_products')
      .select(
        'id,product_type_id,name,slug,description,tags,metadata,product_types(id,name,slug,description,image_url,sort_order,metadata),sample_product_media(id,media_type,public_url,storage_path,alt_text,is_primary,sort_order)',
      )
      .eq('id', id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return mapSample(data as unknown as SampleProductRow);
  },
};
