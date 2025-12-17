-- 20251211_search_path_hardening.sql
-- Harden function search_path and restrict materialized view exposure.

-- Notifications helpers: pin search_path
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  UPDATE public.notification_recipients
    SET read_at = COALESCE(read_at, now())
  WHERE notification_id = p_notification_id AND user_id = auth.uid();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;

CREATE OR REPLACE FUNCTION public.dismiss_notification(p_notification_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  UPDATE public.notification_recipients
    SET dismissed_at = now()
  WHERE notification_id = p_notification_id AND user_id = auth.uid();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;

-- Trigger helpers: pin search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_dispatch_location_geog()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE lon NUMERIC; lat NUMERIC;
BEGIN
  IF NEW.location IS NOT NULL THEN
    BEGIN
      lon := (NEW.location -> 'coordinates' ->> 0)::numeric;
      lat := (NEW.location -> 'coordinates' ->> 1)::numeric;
    EXCEPTION WHEN OTHERS THEN
      lon := NULL; lat := NULL;
    END;
    IF lon IS NULL OR lat IS NULL THEN
      BEGIN
        lat := (NEW.location -> 'coords' ->> 0)::numeric;
        lon := (NEW.location -> 'coords' ->> 1)::numeric;
      EXCEPTION WHEN OTHERS THEN
        lat := NULL; lon := NULL;
      END;
    END IF;
    IF lon IS NOT NULL AND lat IS NOT NULL THEN
      NEW.location_geog := ST_SetSRID(ST_MakePoint(lon, lat), 4326);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Limit API exposure of materialized view
REVOKE SELECT ON public.mv_median_response_time_last_30d FROM anon, authenticated;
