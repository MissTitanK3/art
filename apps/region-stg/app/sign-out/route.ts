import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";

export async function GET(request: Request) {
  // Avoid triggering sign-out on Next.js RSC prefetch/intent fetches
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose") === "prefetch";

  if (isPrefetch) {
    // No side effects, and ensure this response isn't cached/shared.
    return new NextResponse(null, {
      status: 204,
      headers: {
        "cache-control": "no-store",
        vary: "next-router-prefetch, purpose, sec-purpose",
      },
    });
  }

  const supabase = await createSupabaseServerClient();
  try {
    await supabase.auth.signOut();
  } catch {
    /* ignore signOut errors */ void 0;
  }
  return NextResponse.redirect(new URL("/sign-in", request.url));
}
