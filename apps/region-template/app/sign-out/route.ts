import { NextResponse } from "next/server";
import { serverSignOut } from "@/lib/auth/server";

export async function GET(request: Request) {
  // Avoid side effects during Next.js RSC/Link prefetches
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose") === "prefetch";
  if (isPrefetch) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "cache-control": "no-store",
        vary: "next-router-prefetch, purpose, sec-purpose",
      },
    });
  }

  await serverSignOut();
  return NextResponse.redirect(new URL("/sign-in", request.url));
}
