import { NextResponse } from "next/server";
import { createSupabaseRegionServiceClient } from "@/lib/auth/supabase/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const rateLimiter = new Map<string, { count: number; reset: number }>();

const MESSAGES = [
  "Neighbors are feeling your care. Keep sharing support quietly.",
  "Pods are stretching every hour into relief. Thank you for backing them.",
  "Every shift, every ride, every check-in protects another family.",
  "Community care is still the strongest network. You're powering it.",
  "Burnout is real, but so is the impact you're making together.",
];

function getClientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function allowRequest(ip: string) {
  const now = Date.now();
  const entry = rateLimiter.get(ip);
  if (!entry || now > entry.reset) {
    rateLimiter.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) {
    return false;
  }
  entry.count += 1;
  return true;
}

function pickMessage(hours: number, people: number) {
  const index = Math.abs(Math.floor(hours + people)) % MESSAGES.length;
  return MESSAGES[index];
}

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!allowRequest(ip)) {
      return NextResponse.json(
        { error: "Temporarily unavailable" },
        { status: 429 },
      );
    }

    const supabase = createSupabaseRegionServiceClient();
    const [hoursRow, peopleRow, dispatchCount] = await Promise.all([
      supabase
        .from("view_total_volunteer_hours_last_30d")
        .select("total_hours")
        .maybeSingle(),
      supabase
        .from("view_total_people_served_last_30d")
        .select("total_people_served")
        .maybeSingle(),
      supabase
        .from("dispatch_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "verified_complete")
        .gte(
          "timestamp",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        ),
    ]);

    if (hoursRow.error) throw hoursRow.error;
    if (peopleRow.error) throw peopleRow.error;
    if (dispatchCount.error) throw dispatchCount.error;

    const countedDispatches = dispatchCount.count ?? 0;
    if (countedDispatches < 3) {
      return NextResponse.json({ hidden: true });
    }

    const rawHours = Number(hoursRow.data?.total_hours ?? 0);
    const rawPeople = Number(peopleRow.data?.total_people_served ?? 0);
    const roundedHours = Math.max(0, Math.round(rawHours / 10) * 10);
    const roundedPeople = Math.max(0, Math.round(rawPeople / 25) * 25);

    return NextResponse.json({
      hours: roundedHours,
      people: roundedPeople,
      dispatchCount: countedDispatches,
      message: pickMessage(roundedHours, roundedPeople),
    });
  } catch (error) {
    console.warn("[public-impact] summary error", error);
    return NextResponse.json(
      { error: "Temporarily unavailable" },
      { status: 503 },
    );
  }
}
