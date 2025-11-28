import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getAuthenticatedProfile } from '@/lib/api/warehouse/utils';

export async function DELETE(req: Request) {
  try {
    const { supabase } = await getAuthenticatedProfile();
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get('warehouseId');
    const confirmedAt = searchParams.get('confirmedAt');

    if (!warehouseId || !confirmedAt) {
      return NextResponse.json(
        {
          error: 'Missing warehouseId or confirmedAt',
        },
        { status: 400 },
      );
    }

    // Find all items in this confirmed list
    const { data: items, error: findError } = await supabase
      .from('warehouse_pick_lists')
      .select('id')
      .eq('warehouse_id', warehouseId)
      .eq('confirmed_at', confirmedAt);

    if (findError) throw findError;
    if (!items || items.length === 0) {
      return NextResponse.json({ success: true });
    }

    const pickIds = items.map((item: { id: string }) => item.id);

    for (const pickId of pickIds) {
      const { error } = await supabase.rpc('safe_delete_warehouse_pick_list', {
        p_id: pickId,
      });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, deleted: pickIds.length });
  } catch (error) {
    return jsonError(error);
  }
}
