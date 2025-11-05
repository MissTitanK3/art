import { NextResponse } from "next/server";

export function jsonError(error: unknown, fallbackStatus = 500) {
  const message = (error && typeof error === "object" && "message" in error && typeof (error as any).message === "string")
    ? (error as any).message
    : String(error);
  const status = message === "AUTH_REQUIRED" ? 401 : fallbackStatus;
  return NextResponse.json({ error: message }, { status });
}

export function isAuthRequired(error: unknown): boolean {
  return !!(error && typeof error === "object" && "message" in error && (error as any).message === "AUTH_REQUIRED");
}

