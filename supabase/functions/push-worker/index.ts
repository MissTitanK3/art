import { serve, postgres, webpush } from './deps.ts';

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const databaseUrl = Deno.env.get('SUPABASE_DB_URL') ?? Deno.env.get('DATABASE_URL');
if (!databaseUrl) {
  throw new Error('Missing SUPABASE_DB_URL/DATABASE_URL environment variable');
}

const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY') ?? Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY');
const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY');
if (!vapidPublic || !vapidPrivate) {
  throw new Error('Missing VAPID public/private key environment variables');
}

const sql = postgres(databaseUrl, { ssl: 'require' });

webpush.setVapidDetails('mailto:security@alwaysreadytools.org', vapidPublic, vapidPrivate);

async function sendPendingNotifications() {
  const rows =
    (await sql<
      {
        endpoint: string;
        p256dh: string;
        auth: string;
        title: string | null;
        body: string | null;
        link: string | null;
      }[]
    >`
      select ns.endpoint, ns.p256dh, ns.auth,
             n.title, n.body, n.link
      from notification_recipients nr
      join notifications n on n.id = nr.notification_id
      join notification_subscriptions ns on ns.user_id = nr.user_id
      where nr.read_at is null
        and nr.dismissed_at is null
        and (n.expires_at is null or n.expires_at > now())
      limit 100;
    `) ?? [];

  let delivered = 0;
  let failures = 0;

  for (const row of rows) {
    const subscription = {
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh,
        auth: row.auth,
      },
    };
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: row.title ?? 'Dispatch Update',
          body: row.body ?? '',
          url: row.link ?? '/',
        }),
      );
      delivered += 1;
      await sql`update notification_subscriptions set last_used_at = now() where endpoint = ${row.endpoint}`;
    } catch (_error) {
      failures += 1;
      await sql`delete from notification_subscriptions where endpoint = ${row.endpoint}`;
    }
  }

  return { delivered, failures };
}

serve(async () => {
  try {
    const result = await sendPendingNotifications();
    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[push-worker] failure', error);
    return new Response(JSON.stringify({ error: error?.message ?? 'Unknown failure' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});
