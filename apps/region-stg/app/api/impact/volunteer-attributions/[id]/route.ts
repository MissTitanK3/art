import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { revertVolunteerHours } from "@/lib/dal/impact";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await req.json();
    const result = await revertVolunteerHours({
      attributionId: id,
      reason: payload?.reason ?? "",
    });
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
