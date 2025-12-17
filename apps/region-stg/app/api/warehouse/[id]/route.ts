import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getAuthenticatedProfile, normalizeWarehouse } from '@/lib/api/warehouse/utils';
import type { UpdateWarehouseRequest } from '@/lib/api/warehouse/types';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await getAuthenticatedProfile();
    const warehouseId = id;
    const updates: UpdateWarehouseRequest = await req.json();

    // Update warehouse basic fields
    const { error: warehouseError } = await supabase
      .from('warehouses')
      .update({
        display_name: updates.displayName,
        region_zone: updates.regionZone,
        urban_type: updates.urbanType,
        max_capacity_rating: updates.maxCapacityRating,
        capabilities: {
          flags: updates.capabilities || [],
          quick_note: updates.quickNotes || '',
          site_type: updates.siteType || 'home',
        },
        visibility_scope: updates.visibilityScope || 'regional',
        invited_user_ids: updates.invitedUserIds || [],
      })
      .eq('id', warehouseId);

    if (warehouseError) throw warehouseError;

    // Handle zones and bins updates
    if (updates.zones) {
      const { data: existingZones } = await supabase
        .from('warehouse_zones')
        .select('id, name')
        .eq('warehouse_id', warehouseId);

      const existingZoneIds = new Set(existingZones?.map((z) => z.id) || []);
      const updatedZoneIds = new Set(updates.zones.map((z) => z.id));

      // Delete removed zones
      const zonesToDelete = Array.from(existingZoneIds).filter((id) => !updatedZoneIds.has(id));
      if (zonesToDelete.length > 0) {
        for (const zoneId of zonesToDelete) {
          const { error: zoneDeleteError } = await supabase.rpc('safe_delete_warehouse_zone', { p_id: zoneId });
          if (zoneDeleteError) throw zoneDeleteError;
        }
      }

      // Process each zone
      for (const zone of updates.zones) {
        if (zone.id.startsWith('temp-')) {
          // Insert new zone
          const { data: newZone, error: zoneError } = await supabase
            .from('warehouse_zones')
            .insert({
              warehouse_id: warehouseId,
              name: zone.name,
              sort_order: zone.sortOrder,
            })
            .select()
            .single();

          if (zoneError || !newZone) continue;

          // Insert bins for new zone
          if (zone.bins.length > 0) {
            const binsToInsert = zone.bins.map((bin) => ({
              zone_id: newZone.id,
              label: bin.label,
              sort_order: bin.sortOrder,
            }));
            await supabase.from('warehouse_bins').insert(binsToInsert);
          }
        } else {
          // Update existing zone
          await supabase
            .from('warehouse_zones')
            .update({
              name: zone.name,
              sort_order: zone.sortOrder,
            })
            .eq('id', zone.id);

          // Handle bins for existing zone
          const { data: existingBins } = await supabase.from('warehouse_bins').select('id').eq('zone_id', zone.id);

          const existingBinIds = new Set(existingBins?.map((b) => b.id) || []);
          const updatedBinIds = new Set(zone.bins.filter((b) => !b.id.startsWith('temp-')).map((b) => b.id));

          // Delete removed bins
          const binsToDelete = Array.from(existingBinIds).filter((id) => !updatedBinIds.has(id));
          if (binsToDelete.length > 0) {
            for (const binId of binsToDelete) {
              const { error: binDeleteError } = await supabase.rpc('safe_delete_warehouse_bin', { p_id: binId });
              if (binDeleteError) throw binDeleteError;
            }
          }

          // Update or insert bins
          for (const bin of zone.bins) {
            if (bin.id.startsWith('temp-')) {
              await supabase.from('warehouse_bins').insert({
                zone_id: zone.id,
                label: bin.label,
                sort_order: bin.sortOrder,
              });
            } else {
              await supabase
                .from('warehouse_bins')
                .update({
                  label: bin.label,
                  sort_order: bin.sortOrder,
                })
                .eq('id', bin.id);
            }
          }
        }
      }
    }

    // Refresh and return updated warehouse
    const { data: refreshed, error: fetchError } = await supabase
      .from('warehouses')
      .select(
        `
        *,
        zones:warehouse_zones(
          *,
          bins:warehouse_bins(*)
        )
      `,
      )
      .eq('id', warehouseId)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json({ warehouse: normalizeWarehouse(refreshed) });
  } catch (error) {
    return jsonError(error);
  }
}
