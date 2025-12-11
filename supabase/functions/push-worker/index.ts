import { serve, postgres, webpush } from './deps.ts';

// Ensure to turn off the thing

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

async function sendPendingNotifications() {
  const databaseUrl = Deno.env.get('SUPABASE_DB_URL');
  if (!databaseUrl) {
    throw new Error('Missing SUPABASE_DB_URL environment variable');
  }

  const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY');
  if (!vapidPublic || !vapidPrivate) {
    throw new Error('Missing VAPID public/private key environment variables');
  }

  // Set VAPID details with actual keys from env
  webpush.setVapidDetails('mailto:security@alwaysreadytools.org', vapidPublic, vapidPrivate);

  // Parse the database URL
  const url = new URL(databaseUrl);

  console.log('[push-worker] Connection details:', {
    host: url.hostname,
    port: 6543,
    database: url.pathname.slice(1),
    user: url.username,
    ssl: 'require',
  });

  // Connect using explicit parameters to avoid URL parsing issues and force pooler port
  const sql = postgres({
    host: url.hostname,
    port: 5432,
    database: url.pathname.slice(1),
    username: url.username,
    password: url.password,
    ssl: 'require',
    max: 1,
    prepare: false,
    connect_timeout: 30,
  });

  const rows =
    (await sql<
      {
        endpoint: string;
        p256dh: string;
        auth: string;
        title: string | null;
        body: string | null;
        link: string | null;
        meta: any;
      }[]
    >`
      select ns.endpoint, ns.p256dh, ns.auth,
             n.title, n.body, n.link, n.meta
      from notification_recipients nr
      join notifications n on n.id = nr.notification_id
      join notification_subscriptions ns on ns.user_id = nr.user_id
      where nr.read_at is null
        and nr.dismissed_at is null
        and (n.expires_at is null or n.expires_at > now())
      limit 100;
    `) ?? [];

  console.log(`[push-worker] Found ${rows.length} pending notifications`);

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
          icon: row.meta?.icon ?? '/icon-192.png',
        }),
      );
      delivered += 1;
      await sql`update notification_subscriptions set last_used_at = now() where endpoint = ${row.endpoint}`;
      console.log(`[push-worker] Delivered to ${row.endpoint}`);
    } catch (error: any) {
      failures += 1;
      console.error(`[push-worker] Failed ${row.endpoint}:`, error?.message);
      await sql`delete from notification_subscriptions where endpoint = ${row.endpoint}`;
    }
  }

  console.log(`[push-worker] Done: ${delivered} delivered, ${failures} failed`);

  return { delivered, failures };
}

serve(async (req: Request) => {
  console.log('[push-worker] Invoked');

  // Security check: Ensure the request is authorized with the Service Role Key
  // This is critical because "Verify JWT" is disabled in the platform settings.
  const authHeader = req.headers.get('Authorization');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (authHeader !== `Bearer ${serviceRoleKey}`) {
    console.error('[push-worker] Unauthorized invocation attempt');

    // Detailed debug logging to help diagnose the issue
    if (!serviceRoleKey) {
      console.error('[push-worker] Critical: SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.');
    } else if (!authHeader) {
      console.error('[push-worker] No Authorization header received.');
    } else {
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
      if (anonKey && authHeader === `Bearer ${anonKey}`) {
        console.error('[push-worker] Received Anon Key, but this function requires the Service Role Key.');
      } else {
        console.error('[push-worker] Received incorrect Authorization token.');
      }
    }

    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const result = await sendPendingNotifications();
    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[push-worker] Fatal error:', error);
    return new Response(JSON.stringify({ error: error?.message ?? 'Unknown failure', delivered: 0, failed: 0 }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});
