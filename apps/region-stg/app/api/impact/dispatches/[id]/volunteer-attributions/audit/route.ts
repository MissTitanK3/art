import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { getVolunteerAttributionAudit } from "@/lib/dal/impact";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const audit = await getVolunteerAttributionAudit(id);
    return NextResponse.json({ audit });
  } catch (error) {
    return jsonError(error);
  }
}
