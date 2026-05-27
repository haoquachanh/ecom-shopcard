-- Website analytics: public customer tracking + admin-only reporting.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS analytics_page_views (
  id BIGSERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visitor_id UUID NOT NULL,
  session_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  path TEXT NOT NULL,
  referrer_host TEXT,
  device_category TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_analytics_path CHECK (
    length(path) BETWEEN 1 AND 256
    AND path LIKE '/%'
    AND path NOT LIKE '%?%'
    AND path NOT LIKE '%#%'
  ),
  CONSTRAINT chk_analytics_referrer_host CHECK (
    referrer_host IS NULL
    OR (
      length(referrer_host) <= 253
      AND referrer_host = lower(referrer_host)
      AND referrer_host !~ '[/\s]'
    )
  ),
  CONSTRAINT chk_analytics_device_category CHECK (device_category IN ('desktop', 'mobile', 'tablet', 'bot', 'unknown'))
);

CREATE INDEX IF NOT EXISTS idx_analytics_page_views_occurred_at
ON analytics_page_views(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_page_views_visitor_date
ON analytics_page_views(visitor_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session_date
ON analytics_page_views(session_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_page_views_path_date
ON analytics_page_views(path, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_page_views_referrer_date
ON analytics_page_views(referrer_host, occurred_at DESC);

ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON analytics_page_views FROM PUBLIC;
REVOKE ALL ON analytics_page_views FROM anon;
REVOKE ALL ON analytics_page_views FROM authenticated;
REVOKE ALL ON SEQUENCE analytics_page_views_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE analytics_page_views_id_seq FROM anon;
REVOKE ALL ON SEQUENCE analytics_page_views_id_seq FROM authenticated;

DROP POLICY IF EXISTS "Admins read analytics page views" ON analytics_page_views;

CREATE OR REPLACE FUNCTION normalize_analytics_path(input_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
IMMUTABLE
AS $$
DECLARE
  cleaned TEXT;
BEGIN
  cleaned := COALESCE(input_path, '');
  cleaned := split_part(cleaned, '#', 1);
  cleaned := split_part(cleaned, '?', 1);
  cleaned := trim(cleaned);

  IF cleaned = '' THEN
    cleaned := '/';
  END IF;

  IF left(cleaned, 1) <> '/' THEN
    cleaned := '/' || cleaned;
  END IF;

  cleaned := regexp_replace(cleaned, '/{2,}', '/', 'g');

  IF length(cleaned) > 256 THEN
    cleaned := left(cleaned, 256);
  END IF;

  IF cleaned !~ '^/[A-Za-z0-9._~/%:@!$&''()*+,;=\-]*$' THEN
    RAISE EXCEPTION 'Invalid analytics path' USING ERRCODE = '22023';
  END IF;

  RETURN cleaned;
END;
$$;

CREATE OR REPLACE FUNCTION normalize_analytics_referrer(input_referrer TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
IMMUTABLE
AS $$
DECLARE
  cleaned TEXT;
BEGIN
  cleaned := lower(trim(COALESCE(input_referrer, '')));
  cleaned := regexp_replace(cleaned, '^https?://', '');
  cleaned := split_part(cleaned, '/', 1);
  cleaned := split_part(cleaned, ':', 1);

  IF cleaned = '' THEN
    RETURN NULL;
  END IF;

  IF length(cleaned) > 253 OR cleaned !~ '^[a-z0-9.-]+$' OR cleaned LIKE '.%' OR cleaned LIKE '%.' THEN
    RETURN NULL;
  END IF;

  RETURN cleaned;
END;
$$;

CREATE OR REPLACE FUNCTION analytics_device_category()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  headers JSONB;
  headers_text TEXT;
  ua TEXT;
BEGIN
  headers_text := NULLIF(current_setting('request.headers', TRUE), '');
  headers := COALESCE(headers_text::jsonb, '{}'::jsonb);
  ua := lower(COALESCE(headers->>'user-agent', ''));

  IF ua = '' THEN
    RETURN 'unknown';
  ELSIF ua ~ '(bot|crawler|spider|preview|slurp)' THEN
    RETURN 'bot';
  ELSIF ua ~ '(ipad|tablet)' THEN
    RETURN 'tablet';
  ELSIF ua ~ '(mobi|android|iphone|ipod)' THEN
    RETURN 'mobile';
  END IF;

  RETURN 'desktop';
END;
$$;

CREATE OR REPLACE FUNCTION track_page_view(
  p_visitor_id UUID,
  p_session_id UUID,
  p_path TEXT,
  p_referrer_host TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  normalized_path TEXT;
  normalized_referrer TEXT;
BEGIN
  IF p_visitor_id IS NULL OR p_session_id IS NULL THEN
    RAISE EXCEPTION 'Missing analytics identifiers' USING ERRCODE = '22023';
  END IF;

  normalized_path := normalize_analytics_path(p_path);
  normalized_referrer := normalize_analytics_referrer(p_referrer_host);

  INSERT INTO analytics_page_views (
    visitor_id,
    session_id,
    user_id,
    path,
    referrer_host,
    device_category
  )
  VALUES (
    p_visitor_id,
    p_session_id,
    auth.uid(),
    normalized_path,
    normalized_referrer,
    analytics_device_category()
  );

  RETURN jsonb_build_object('ok', TRUE);
END;
$$;

CREATE OR REPLACE FUNCTION get_analytics_overview(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  start_local DATE;
  end_local DATE;
  start_at TIMESTAMPTZ;
  end_at TIMESTAMPTZ;
  today_local DATE;
  month_start_local DATE;
  previous_start_local DATE;
  previous_end_local DATE;
  previous_start_at TIMESTAMPTZ;
  previous_end_at TIMESTAMPTZ;
  result JSONB;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  IF p_start_date IS NULL OR p_end_date IS NULL THEN
    RAISE EXCEPTION 'Date range is required' USING ERRCODE = '22023';
  END IF;

  IF p_end_date < p_start_date THEN
    RAISE EXCEPTION 'End date must be after start date' USING ERRCODE = '22023';
  END IF;

  IF p_end_date - p_start_date > 730 THEN
    RAISE EXCEPTION 'Analytics date range is too large' USING ERRCODE = '22023';
  END IF;

  start_local := p_start_date;
  end_local := p_end_date;
  start_at := start_local::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh';
  end_at := (end_local + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh';
  today_local := (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  month_start_local := date_trunc('month', today_local::timestamp)::date;
  previous_end_local := start_local - 1;
  previous_start_local := previous_end_local - (end_local - start_local);
  previous_start_at := previous_start_local::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh';
  previous_end_at := (previous_end_local + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh';

  WITH current_events AS (
    SELECT *
    FROM analytics_page_views
    WHERE occurred_at >= start_at
      AND occurred_at < end_at
  ),
  previous_events AS (
    SELECT *
    FROM analytics_page_views
    WHERE occurred_at >= previous_start_at
      AND occurred_at < previous_end_at
  ),
  summary AS (
    SELECT
      COUNT(*)::INT AS page_views,
      COUNT(DISTINCT visitor_id)::INT AS visitors,
      COUNT(DISTINCT session_id)::INT AS sessions,
      COUNT(*) FILTER (
        WHERE (occurred_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = today_local
      )::INT AS today_page_views,
      COUNT(DISTINCT visitor_id) FILTER (
        WHERE (occurred_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = today_local
      )::INT AS today_visitors,
      COUNT(*) FILTER (
        WHERE (occurred_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date >= month_start_local
      )::INT AS month_page_views,
      COUNT(DISTINCT visitor_id) FILTER (
        WHERE (occurred_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date >= month_start_local
      )::INT AS month_visitors
    FROM current_events
  ),
  previous_summary AS (
    SELECT
      COUNT(*)::INT AS page_views,
      COUNT(DISTINCT visitor_id)::INT AS visitors,
      COUNT(DISTINCT session_id)::INT AS sessions
    FROM previous_events
  ),
  daily_series AS (
    SELECT generate_series(start_local, end_local, INTERVAL '1 day')::date AS day
  ),
  daily AS (
    SELECT
      daily_series.day,
      COUNT(current_events.id)::INT AS page_views,
      COUNT(DISTINCT current_events.visitor_id)::INT AS visitors,
      COUNT(DISTINCT current_events.session_id)::INT AS sessions
    FROM daily_series
    LEFT JOIN current_events
      ON (current_events.occurred_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = daily_series.day
    GROUP BY daily_series.day
    ORDER BY daily_series.day
  ),
  month_series AS (
    SELECT generate_series(
      date_trunc('month', start_local::timestamp)::date,
      date_trunc('month', end_local::timestamp)::date,
      INTERVAL '1 month'
    )::date AS month
  ),
  monthly AS (
    SELECT
      month_series.month,
      COUNT(current_events.id)::INT AS page_views,
      COUNT(DISTINCT current_events.visitor_id)::INT AS visitors,
      COUNT(DISTINCT current_events.session_id)::INT AS sessions
    FROM month_series
    LEFT JOIN current_events
      ON date_trunc('month', current_events.occurred_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = month_series.month
    GROUP BY month_series.month
    ORDER BY month_series.month
  ),
  top_pages AS (
    SELECT
      path,
      COUNT(*)::INT AS page_views,
      COUNT(DISTINCT visitor_id)::INT AS visitors
    FROM current_events
    GROUP BY path
    ORDER BY COUNT(*) DESC, path ASC
    LIMIT 10
  ),
  top_referrers AS (
    SELECT
      COALESCE(referrer_host, 'direct') AS referrer,
      COUNT(*)::INT AS page_views,
      COUNT(DISTINCT visitor_id)::INT AS visitors
    FROM current_events
    GROUP BY COALESCE(referrer_host, 'direct')
    ORDER BY COUNT(*) DESC, referrer ASC
    LIMIT 10
  )
  SELECT jsonb_build_object(
    'range', jsonb_build_object(
      'startDate', start_local,
      'endDate', end_local,
      'timezone', 'Asia/Ho_Chi_Minh',
      'previousStartDate', previous_start_local,
      'previousEndDate', previous_end_local
    ),
    'summary', jsonb_build_object(
      'pageViews', summary.page_views,
      'visitors', summary.visitors,
      'sessions', summary.sessions,
      'todayPageViews', summary.today_page_views,
      'todayVisitors', summary.today_visitors,
      'monthPageViews', summary.month_page_views,
      'monthVisitors', summary.month_visitors
    ),
    'comparison', jsonb_build_object(
      'pageViews', summary.page_views - previous_summary.page_views,
      'visitors', summary.visitors - previous_summary.visitors,
      'sessions', summary.sessions - previous_summary.sessions,
      'previousPageViews', previous_summary.page_views,
      'previousVisitors', previous_summary.visitors,
      'previousSessions', previous_summary.sessions
    ),
    'daily', COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'date', day,
      'pageViews', page_views,
      'visitors', visitors,
      'sessions', sessions
    ) ORDER BY day) FROM daily), '[]'::jsonb),
    'monthly', COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'month', month,
      'pageViews', page_views,
      'visitors', visitors,
      'sessions', sessions
    ) ORDER BY month) FROM monthly), '[]'::jsonb),
    'topPages', COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'path', path,
      'pageViews', page_views,
      'visitors', visitors
    ) ORDER BY page_views DESC, path ASC) FROM top_pages), '[]'::jsonb),
    'topReferrers', COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'referrer', referrer,
      'pageViews', page_views,
      'visitors', visitors
    ) ORDER BY page_views DESC, referrer ASC) FROM top_referrers), '[]'::jsonb)
  )
  INTO result
  FROM summary, previous_summary;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION normalize_analytics_path(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION normalize_analytics_referrer(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION analytics_device_category() FROM PUBLIC;
REVOKE ALL ON FUNCTION track_page_view(UUID, UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_analytics_overview(DATE, DATE) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION track_page_view(UUID, UUID, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_analytics_overview(DATE, DATE) TO authenticated;
