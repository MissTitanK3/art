import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import {
  addVolunteerHours,
  getVolunteerHoursByDispatch,
} from "@/lib/dal/impact";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await getVolunteerHoursByDispatch(id);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await req.json();
    const result = await addVolunteerHours({
      dispatchId: id,
      profileId: payload?.profileId ?? null,
      minutes: Number(payload?.minutes ?? 0),
      activityType: payload?.activityType,
      notes: payload?.notes,
      attributedAt: payload?.attributedAt,
    });
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
