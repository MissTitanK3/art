import { NextResponse } from "next/server";
import { serverSignOut } from "@/lib/auth/server";

export async function GET(request: Request) {
  await serverSignOut();
  return NextResponse.redirect(new URL("/sign-in", request.url));
}
