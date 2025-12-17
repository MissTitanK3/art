import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import {
  getDispatchImpactMetrics,
  updateDispatchImpactMetrics,
} from "@/lib/dal/impact";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const metrics = await getDispatchImpactMetrics(id);
    return NextResponse.json(metrics);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await req.json();
    const metrics = await updateDispatchImpactMetrics({
      dispatchId: id,
      people_served:
        typeof payload?.people_served === "number"
          ? payload.people_served
          : undefined,
      resources_distributed:
        typeof payload?.resources_distributed === "number"
          ? payload.resources_distributed
          : undefined,
      risk_level: payload?.risk_level,
    });
    return NextResponse.json(metrics);
  } catch (error) {
    return jsonError(error);
  }
}
