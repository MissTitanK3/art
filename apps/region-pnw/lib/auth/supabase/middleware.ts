// apps/region-pnw/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ensureSupabaseEnv } from './utils';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // If env vars are missing, skip to avoid throwing during local/tutorial flows
  let env: ReturnType<typeof ensureSupabaseEnv>;
  try {
    env = ensureSupabaseEnv('server');
  } catch {
    return supabaseResponse;
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  // Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Example gate: redirect if not authenticated and not on public routes
  if (
    request.nextUrl.pathname !== '/' &&
    !user &&
    !request.nextUrl.pathname.startsWith('/sign-in') &&
    // Allow unauthenticated access to sign-up as a public route
    !request.nextUrl.pathname.startsWith('/sign-up') &&
    !request.nextUrl.pathname.startsWith('/intents') &&
    !request.nextUrl.pathname.startsWith('/roles') &&
    !request.nextUrl.pathname.startsWith('/impact') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
