import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getAuthenticatedProfile } from '@/lib/api/warehouse/utils';
import type { UpdateQuantityRequest } from '@/lib/api/warehouse/types';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await getAuthenticatedProfile();
    const { quantity }: UpdateQuantityRequest = await req.json();

    const { error } = await supabase.from('warehouse_inventory').update({ quantity }).eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await getAuthenticatedProfile();

    const { error } = await supabase.rpc('safe_delete_warehouse_inventory', {
      p_id: id,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
