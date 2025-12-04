import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { getAuthenticatedProfile, generateId } from "@/lib/api/warehouse/utils";
import { REGION_IDENTIFIER } from "@/app/brand_settings";
import type { WarehouseRecord } from "@workspace/ui/patterns/features/warehouse/types";

type CreateWarehouseRequest = {
    warehouseData: Partial<WarehouseRecord>;
};

export async function POST(req: Request) {
    try {
        const { supabase, profile } = await getAuthenticatedProfile();
        const { warehouseData }: CreateWarehouseRequest = await req.json();

        const id = warehouseData.id || generateId();
        const now = new Date().toISOString();

        const capabilityPayload: Record<string, unknown> = {
            flags: warehouseData.capabilities || [],
            site_type: warehouseData.siteType || "home",
        };
        if (warehouseData.quickNotes) {
            capabilityPayload.quick_note = warehouseData.quickNotes;
        }

        // Insert/Update warehouse
        const { error: warehouseError } = await supabase.from("warehouses").upsert({
            id,
            region_id: warehouseData.regionId || REGION_IDENTIFIER,
            display_name: warehouseData.stewardDisplayName || warehouseData.displayName,
            region_zone: warehouseData.regionZone,
            urban_type: warehouseData.urbanType,
            capabilities: capabilityPayload,
            max_capacity_rating: warehouseData.maxCapacityRating,
            visibility_scope: warehouseData.visibilityScope || "regional",
            invited_user_ids: warehouseData.invitedUserIds || [],
        });

        if (warehouseError) throw warehouseError;

        // Handle zones and bins
        if (warehouseData.zones && warehouseData.zones.length > 0) {
            const zonesPayload = warehouseData.zones.map((zone) => ({
                id: zone.id,
                warehouse_id: id,
                name: zone.name,
                sort_order: zone.sortOrder ?? null,
            }));

            const { error: zonesError } = await supabase
                .from("warehouse_zones")
                .upsert(zonesPayload);
            if (zonesError) throw zonesError;

            const binsPayload = warehouseData.zones.flatMap((zone) =>
                zone.bins.map((bin) => ({
                    id: bin.id,
                    zone_id: zone.id,
                    label: bin.label,
                    sort_order: bin.sortOrder ?? null,
                })),
            );

            if (binsPayload.length > 0) {
                const { error: binsError } = await supabase
                    .from("warehouse_bins")
                    .upsert(binsPayload);
                if (binsError) throw binsError;
            }
        }

        return NextResponse.json({ success: true, warehouseId: id });
    } catch (error) {
        return jsonError(error);
    }
}
