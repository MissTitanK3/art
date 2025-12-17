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

    // Get pick list item and validate against inventory
    const { data: pickItem, error: pickError } = await supabase
      .from('warehouse_pick_lists')
      .select('*')
      .eq('id', id)
      .single();

    if (pickError) throw pickError;

    const { data: inventory, error: invError } = await supabase
      .from('warehouse_inventory')
      .select('quantity')
      .eq('id', pickItem.inventory_id)
      .single();

    if (invError) throw invError;

    const finalQty = Math.min(quantity, inventory.quantity);

    const { error } = await supabase.from('warehouse_pick_lists').update({ quantity: finalQty }).eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, quantity: finalQty });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await getAuthenticatedProfile();

    const { error } = await supabase.rpc('safe_delete_warehouse_pick_list', {
      p_id: id,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
