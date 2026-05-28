import { getSupabaseClient } from '@/lib/supabase';

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
}

type HomepageSection = {
  section?: {
    id: number;
    title: string | null;
    subtitle: string | null;
    cta_url: string | null;
  };
  media?: Array<{
    public_url: string | null;
    sort_order: number;
  }>;
};

type HomepageData = {
  sections?: HomepageSection[];
};

export const bannersService = {
  async getHomeBanners(): Promise<Banner[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_homepage_data');
    if (error) throw error;

    const payload = (data || {}) as HomepageData;
    return (payload.sections || [])
      .map((entry) => {
        const imageUrl = [...(entry.media || [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.public_url;
        if (!entry.section || !imageUrl) return null;
        return {
          id: Number(entry.section.id),
          title: entry.section.title || '',
          subtitle: entry.section.subtitle || undefined,
          imageUrl,
          linkUrl: entry.section.cta_url || undefined,
        };
      })
      .filter(Boolean) as Banner[];
  },
};
