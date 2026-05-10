import { getSupabaseClient } from '@/lib/supabase';

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
}

type BannerRow = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
};

export const bannersService = {
  async getHomeBanners(): Promise<Banner[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('banners' as never)
      .select('id,title,subtitle,image_url,link_url,placement,is_active,sort_order')
      .eq('placement', 'home')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (error) throw error;

    return ((data || []) as BannerRow[])
      .filter((row) => row.image_url)
      .map((row) => ({
        id: row.id,
        title: row.title,
        subtitle: row.subtitle || undefined,
        imageUrl: row.image_url || '',
        linkUrl: row.link_url || undefined,
      }));
  },
};
