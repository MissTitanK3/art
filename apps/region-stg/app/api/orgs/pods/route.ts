import { NextResponse } from "next/server";

import { createSupabaseRegionServiceClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";
import { REGION_IDENTIFIER } from "@/app/brand_settings";

export async function GET(req: Request) {
  try {
    const supabase = createSupabaseRegionServiceClient();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    if (!orgId) {
      return NextResponse.json(
        { message: "orgId is required" },
        { status: 400 },
      );
    }

    // Ensure org belongs to this region to avoid cross-region leakage
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, region_id")
      .eq("id", orgId)
      .is("deleted_at", null)
      .maybeSingle();
    if (orgError) throw orgError;
    if (!org || org.region_id !== REGION_IDENTIFIER) {
      return NextResponse.json(
        { message: "Organization not found for this region" },
        { status: 404 },
      );
    }

    const { data: orgPodRows, error: orgPodError } = await supabase
      .from("organization_pods")
      .select("id, org_id, pod_id, created_at")
      .eq("org_id", orgId)
      .is("deleted_at", null);
    if (orgPodError) throw orgPodError;

    const podIds = Array.from(
      new Set((orgPodRows ?? []).map((row: any) => row.pod_id).filter(Boolean)),
    );

    let podsById: Record<string, any> = {};
    if (podIds.length > 0) {
      const { data: pods, error: podsError } = await supabase
        .from("pods")
        .select("id, name, slug, area, description")
        .in("id", podIds)
        .is("deleted_at", null);
      if (podsError) throw podsError;
      podsById = Object.fromEntries(
        (pods ?? []).map((p: any) => [String(p.id), p]),
      );
    }

    const response = (orgPodRows ?? []).map((row: any) => ({
      id: row.id,
      org_id: row.org_id,
      created_at: row.created_at,
      pod: podsById[row.pod_id] ?? null,
    }));

    return NextResponse.json(response);
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseRegionServiceClient();
    const { orgId, podId } = await req.json();

    if (!orgId || !podId) {
      return NextResponse.json(
        { message: "orgId and podId are required" },
        { status: 400 },
      );
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, region_id")
      .eq("id", orgId)
      .maybeSingle();
    if (orgError) throw orgError;
    if (!org || org.region_id !== REGION_IDENTIFIER) {
      return NextResponse.json(
        { message: "Organization not found for this region" },
        { status: 404 },
      );
    }

    const { error } = await supabase
      .from("organization_pods")
      .insert({ org_id: orgId, pod_id: podId });
    if (error) throw error;

    return NextResponse.json({ orgId, podId });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createSupabaseRegionServiceClient();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const podId = searchParams.get("podId");

    if (!orgId || !podId) {
      return NextResponse.json(
        { message: "orgId and podId are required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("organization_pods")
      .delete()
      .eq("org_id", orgId)
      .eq("pod_id", podId);
    if (error) throw error;

    return NextResponse.json({ orgId, podId });
  } catch (e) {
    return jsonError(e);
  }
}
