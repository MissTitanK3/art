import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getAuthenticatedProfile } from '@/lib/api/warehouse/utils';
import type { UpdateQuantityRequest } from '@/lib/api/warehouse/types';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await getAuthenticatedProfile();
    const { quantity }: UpdateQuantityRequest = await req.json();

    if (Number.isNaN(quantity) || quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Get confirmed pick item
    const { data: confirmedItem, error: pickError } = await supabase
      .from('warehouse_pick_lists')
      .select('*')
      .eq('id', id)
      .single();

    if (pickError) throw pickError;

    const oldQuantity = confirmedItem.quantity;
    const quantityDiff = quantity - oldQuantity;

    // Get inventory entry
    const { data: inventoryEntry, error: invError } = await supabase
      .from('warehouse_inventory')
      .select('*')
      .eq('id', confirmedItem.inventory_id)
      .single();

    if (invError || !inventoryEntry) {
      return NextResponse.json({ error: 'Inventory entry not found' }, { status: 404 });
    }

    // Check availability for increase
    if (quantityDiff > 0 && inventoryEntry.quantity < quantityDiff) {
      return NextResponse.json(
        {
          error: `Only ${inventoryEntry.quantity} units available`,
        },
        { status: 400 },
      );
    }

    // Update confirmed pick
    const { error: updatePickError } = await supabase.from('warehouse_pick_lists').update({ quantity }).eq('id', id);

    if (updatePickError) throw updatePickError;

    // Adjust inventory
    const newInventoryQuantity = inventoryEntry.quantity - quantityDiff;

    if (newInventoryQuantity === 0) {
      const { error: deleteInventoryError } = await supabase.rpc('safe_delete_warehouse_inventory', {
        p_id: confirmedItem.inventory_id,
      });
      if (deleteInventoryError) throw deleteInventoryError;
    } else {
      await supabase
        .from('warehouse_inventory')
        .update({
          quantity: newInventoryQuantity,
          updated_at: now,
        })
        .eq('id', confirmedItem.inventory_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await getAuthenticatedProfile();
    const now = new Date().toISOString();

    // Get confirmed pick item
    const { data: confirmedItem, error: pickError } = await supabase
      .from('warehouse_pick_lists')
      .select('*')
      .eq('id', id)
      .single();

    if (pickError) throw pickError;

    // Return quantity to inventory
    const { data: inventoryEntry, error: invError } = await supabase
      .from('warehouse_inventory')
      .select('*')
      .eq('id', confirmedItem.inventory_id)
      .single();

    if (invError || !inventoryEntry) {
      // Inventory might have been deleted, just remove pick list item
      const { error: deletePickError } = await supabase.rpc('safe_delete_warehouse_pick_list', { p_id: id });
      if (deletePickError) throw deletePickError;
      return NextResponse.json({ success: true });
    }

    // Update inventory
    await supabase
      .from('warehouse_inventory')
      .update({
        quantity: inventoryEntry.quantity + confirmedItem.quantity,
        updated_at: now,
      })
      .eq('id', confirmedItem.inventory_id);

    // Delete pick list item
    const { error: deletePickError } = await supabase.rpc('safe_delete_warehouse_pick_list', { p_id: id });
    if (deletePickError) throw deletePickError;

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
