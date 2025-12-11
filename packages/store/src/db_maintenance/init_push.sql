-- Push notification bootstrap script
-- Run order:
--   1. Ensure `init_notifications.sql` has been applied (provides notifications + recipients tables).
--   2. Apply this file to add durable push subscription storage + policies.
--   3. Provision VAPID keys and set env vars (NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY).
--   3.1. `pnpm dlx web-push generate-vapid-keys`
--   4. Deploy the Supabase Edge Function (push-worker) or other job that reads `notification_subscriptions`.
--   4.1. https://supabase.com/dashboard/project/[PROJECT_ID]/functions
--   5. Schedule/run the worker so unread notification_recipients entries get fanned out via Web Push.
--
-- Safe to re-run; guarded with IF NOT EXISTS / DROP POLICY statements.

-- Ensure gen_random_uuid is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  CONSTRAINT uq_notification_subscriptions_endpoint UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_user
  ON public.notification_subscriptions (user_id);

ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_subscriptions TO authenticated;

DROP POLICY IF EXISTS notification_subscriptions_select_own ON public.notification_subscriptions;
CREATE POLICY notification_subscriptions_select_own ON public.notification_subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS notification_subscriptions_manage_own ON public.notification_subscriptions;
CREATE POLICY notification_subscriptions_manage_own ON public.notification_subscriptions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

COMMENT ON TABLE public.notification_subscriptions IS
  'Web Push subscriptions per user; users manage their own rows, service roles can fan-out notifications.';
