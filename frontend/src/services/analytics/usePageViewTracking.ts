import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from './analytics.service';

export function usePageViewTracking() {
  const location = useLocation();

  useEffect(() => {
    void analyticsService.trackPageView(location.pathname);
  }, [location.pathname]);
}
