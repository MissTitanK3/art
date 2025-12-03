import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { getVolunteerHoursByProfile } from "@/lib/dal/impact";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");
    const result = await getVolunteerHoursByProfile({
      profileId: id,
      period,
    });
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
