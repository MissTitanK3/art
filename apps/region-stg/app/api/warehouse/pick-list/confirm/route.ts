import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getAuthenticatedProfile, generateId } from '@/lib/api/warehouse/utils';
import type { ConfirmPickListRequest } from '@/lib/api/warehouse/types';

export async function POST(req: Request) {
  try {
    const { supabase, profile } = await getAuthenticatedProfile();
    const { pickListIds }: ConfirmPickListRequest = await req.json();

    if (!pickListIds || pickListIds.length === 0) {
      return NextResponse.json({ error: 'No items to confirm' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const stewardName = profile?.display_name ?? 'Unknown steward';

    // Fetch pick list items
    const { data: pickList, error: pickError } = await supabase
      .from('warehouse_pick_lists')
      .select('*')
      .in('id', pickListIds);

    if (pickError) throw pickError;
    if (!pickList || pickList.length === 0) {
      return NextResponse.json({ error: 'Pick list items not found' }, { status: 404 });
    }

    // Validate inventory availability
    const inventoryUpdates: Array<{ id: string; newQuantity: number }> = [];
    const movementLogs: Array<any> = [];

    for (const pick of pickList) {
      const { data: entry, error: invError } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .eq('id', pick.inventory_id)
        .single();

      if (invError || !entry) {
        return NextResponse.json(
          {
            error: `Inventory row for ${pick.item_name} is missing`,
          },
          { status: 400 },
        );
      }

      if (pick.quantity > entry.quantity) {
        return NextResponse.json(
          {
            error: `Only ${entry.quantity} units of ${pick.item_name} are available`,
          },
          { status: 400 },
        );
      }

      inventoryUpdates.push({
        id: entry.id,
        newQuantity: entry.quantity - pick.quantity,
      });

      movementLogs.push({
        id: generateId(),
        warehouse_id: entry.warehouse_id,
        type: 'outflow',
        sku: entry.sku,
        item_name: entry.item_name,
        quantity: pick.quantity,
        by_display_name: stewardName,
        created_at: now,
        zone_id: entry.zone_id,
        bin_id: entry.bin_id,
      });
    }

    // Update inventory quantities
    for (const update of inventoryUpdates) {
      if (update.newQuantity === 0) {
        const { error: deleteError } = await supabase.rpc('safe_delete_warehouse_inventory', { p_id: update.id });
        if (deleteError) throw deleteError;
      } else {
        await supabase
          .from('warehouse_inventory')
          .update({ quantity: update.newQuantity, updated_at: now })
          .eq('id', update.id);
      }
    }

    // Insert movement logs
    const { error: logError } = await supabase.from('warehouse_movement_logs').insert(movementLogs);

    if (logError) throw logError;

    // Mark pick list as confirmed
    const { error: confirmError } = await supabase
      .from('warehouse_pick_lists')
      .update({
        confirmed: true,
        confirmed_at: now,
        confirmed_by: profile?.id,
      })
      .in('id', pickListIds);

    if (confirmError) throw confirmError;

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
