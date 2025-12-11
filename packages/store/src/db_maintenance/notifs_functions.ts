// push_worker.ts

// import { serve, postgres, webpush } from './deps.ts';

// declare const Deno: {
//   env: {
//     get(key: string): string | undefined;
//   };
// };

// const databaseUrl = Deno.env.get('SUPABASE_DB_URL') ?? Deno.env.get('DATABASE_URL');
// if (!databaseUrl) {
//   throw new Error('Missing SUPABASE_DB_URL/DATABASE_URL environment variable');
// }

// const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY') ?? Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY');
// const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY');
// const vapidEmail = Deno.env.get('VAPID_EMAIL') ?? 'mailto:security@alwaysreadytools.org';

// if (!vapidPublic || !vapidPrivate) {
//   throw new Error('Missing VAPID public/private key environment variables');
// }

// const sql = postgres(databaseUrl, { ssl: 'require' });
// webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

// interface NotificationRow {
//   notification_id: string;
//   user_id: string;
//   endpoint: string;
//   p256dh: string;
//   auth: string;
//   title: string | null;
//   body: string | null;
//   link: string | null;
// }

// async function sendPendingNotifications() {
//   const rows = (await sql<NotificationRow[]>`
//     select nr.id as notification_id,
//            nr.user_id,
//            ns.endpoint, ns.p256dh, ns.auth,
//            n.title, n.body, n.link
//     from notification_recipients nr
//     join notifications n on n.id = nr.notification_id
//     join notification_subscriptions ns on ns.user_id = nr.user_id
//     where nr.read_at is null
//       and nr.dismissed_at is null
//       and (n.expires_at is null or n.expires_at > now())
//     order by n.created_at desc
//     limit 100;
//   `) ?? [];

//   let delivered = 0;
//   let failed = 0;
//   const errors: string[] = [];

//   for (const row of rows) {
//     const subscription = {
//       endpoint: row.endpoint,
//       keys: {
//         p256dh: row.p256dh,
//         auth: row.auth,
//       },
//     };

//     try {
//       await webpush.sendNotification(
//         subscription,
//         JSON.stringify({
//           title: row.title ?? 'Dispatch Update',
//           body: row.body ?? '',
//           url: row.link ?? '/',
//         }),
//       );

//       delivered += 1;

//       // Mark as sent
//       await sql`
//         update notification_recipients
//         set read_at = now()
//         where id = ${row.notification_id}
//       `;

//       // Update subscription last used
//       await sql`
//         update notification_subscriptions
//         set last_used_at = now()
//         where endpoint = ${row.endpoint}
//       `;

//       console.log(`[push-worker] Sent notification ${row.notification_id} to ${row.user_id}`);
//     } catch (error: any) {
//       failed += 1;
//       const status = error?.statusCode ?? 0;
//       const message = error?.message ?? String(error);

//       console.error(`[push-worker] Failed notification ${row.notification_id}: ${status} ${message}`);

//       // Only delete subscription on permanent failures
//       if (status === 410 || status === 404) {
//         console.log(`[push-worker] Removing invalid subscription: ${row.endpoint}`);
//         await sql`
//           delete from notification_subscriptions
//           where endpoint = ${row.endpoint}
//         `;
//       } else {
//         // Log error for manual review, will retry next run
//         errors.push(`${row.notification_id}: ${status} ${message}`);
//       }
//     }
//   }

//   console.log(`[push-worker] Complete: ${delivered} delivered, ${failed} failed`);

//   return {
//     delivered,
//     failed,
//     processed: delivered + failed,
//     errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
//   };
// }

// serve(async () => {
//   console.log('[push-worker] Invoked');

//   try {
//     const result = await sendPendingNotifications();
//     return new Response(JSON.stringify(result), {
//       status: 200,
//       headers: { 'content-type': 'application/json' },
//     });
//   } catch (error: any) {
//     console.error('[push-worker] Fatal error:', error);
//     return new Response(
//       JSON.stringify({
//         error: error?.message ?? 'Unknown failure',
//         delivered: 0,
//         failed: 0,
//       }),
//       {
//         status: 500,
//         headers: { 'content-type': 'application/json' },
//       },
//     );
//   }
// });

// deps.ts

// @ts-nocheck
// export { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// export { default as postgres } from 'npm:postgres@3.4.4';
// export { default as webpush } from 'npm:web-push@3.6.7';
