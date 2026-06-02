import { getSupabaseClient } from '@/lib/supabase';
import { getSessionId, getVisitorId } from './identity';

const duplicateWindowMs = 1200;

let lastTrackedPath: string | null = null;
let lastTrackedAt = 0;

export function normalizeAnalyticsPath(pathname: string) {
  const path = pathname.split('#')[0].split('?')[0].trim() || '/';
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.replace(/\/{2,}/g, '/').slice(0, 256);
}

export function getExternalReferrerHost() {
  if (typeof document === 'undefined' || !document.referrer) return null;

  try {
    const referrer = new URL(document.referrer);
    if (typeof window !== 'undefined' && referrer.hostname === window.location.hostname) return null;
    return referrer.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export const analyticsService = {
  async trackPageView(pathname: string) {
    const path = normalizeAnalyticsPath(pathname);
    const now = Date.now();

    if (lastTrackedPath === path && now - lastTrackedAt < duplicateWindowMs) {
      return;
    }

    lastTrackedPath = path;
    lastTrackedAt = now;

    try {
      const supabase = getSupabaseClient();
      const trackPageView = supabase.rpc.bind(supabase) as unknown as (
        fn: 'track_page_view',
        args: {
          p_visitor_id: string;
          p_session_id: string;
          p_path: string;
          p_referrer_host: string | null;
        },
      ) => Promise<{ error: Error | null }>;
      const { error } = await trackPageView('track_page_view', {
        p_visitor_id: getVisitorId(),
        p_session_id: getSessionId(now),
        p_path: path,
        p_referrer_host: getExternalReferrerHost(),
      });

      if (error) throw error;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Analytics tracking failed', error);
      }
    }
  },
};
