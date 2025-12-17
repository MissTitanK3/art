create table if not exists public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz null,
  constraint uq_notification_subscriptions_endpoint unique(endpoint)
);

create index if not exists idx_notification_subscriptions_user
  on public.notification_subscriptions(user_id);
