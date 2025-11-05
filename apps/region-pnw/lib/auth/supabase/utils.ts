export interface SupabaseEnv {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export function ensureSupabaseEnv(target: 'server' | 'client' | 'admin' = 'server'): SupabaseEnv {
  let url: string | undefined;
  let anonKey: string | undefined;
  let serviceRoleKey: string | undefined;

  switch (target) {
    case 'admin':
      url = process.env.NEXT_PUBLIC_SUPABASE_URL_ADMIN;
      anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_ADMIN;
      serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY_ADMIN;
      break;

    case 'client':
      url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      break;

    default:
      url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      // Allow privileged server routes to use regional service role when configured
      serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      break;
  }

  if (!url || !anonKey) {
    throw new Error(`Missing Supabase environment variables for ${target} environment.`);
  }

  return { url, anonKey, serviceRoleKey };
}
