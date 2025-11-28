import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ensureSupabaseEnv } from "./utils";
import { isDemoMode } from "@/lib/demo/supabaseStub";

const PUBLIC_PWA_PATHS = new Set([
  "/site.webmanifest",
  "/manifest.json",
  "/manifest.webmanifest",
  "/sw.js",
  "/service-worker.js",
  "/robots.txt",
  "/sitemap.xml",
]);

const PUBLIC_PWA_PREFIXES = ["/splash"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isApi = pathname.startsWith("/api/");

  const isPublicPwaAsset =
    PUBLIC_PWA_PATHS.has(pathname) ||
    PUBLIC_PWA_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isPublicPwaAsset) {
    return supabaseResponse;
  }

  // In demo mode, skip all auth checks and allow all navigation
  if (isDemoMode()) {
    return supabaseResponse;
  }

  // If env vars are missing, skip to avoid throwing during local/tutorial flows
  let env: ReturnType<typeof ensureSupabaseEnv>;
  try {
    env = ensureSupabaseEnv("server");
  } catch {
    return supabaseResponse;
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Example gate: redirect if not authenticated and not on public routes
  if (
    pathname !== "/" &&
    !user &&
    !pathname.startsWith("/sign-in") &&
    // Allow unauthenticated access to sign-up as a public route
    !pathname.startsWith("/sign-up") &&
    !pathname.startsWith("/intents") &&
    !pathname.startsWith("/roles") &&
    !pathname.startsWith("/impact") &&
    !pathname.startsWith("/forgot-password") &&
    !pathname.startsWith("/auth")
  ) {
    if (isApi) {
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
