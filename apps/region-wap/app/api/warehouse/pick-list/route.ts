import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { getAuthenticatedProfile, generateId } from "@/lib/api/warehouse/utils";
import type { AddToPickListRequest } from "@/lib/api/warehouse/types";

export async function POST(req: Request) {
    try {
        const { supabase, profile } = await getAuthenticatedProfile();
        const { inventoryId }: AddToPickListRequest = await req.json();

        // Get inventory entry
        const { data: entry, error: invError } = await supabase
            .from("warehouse_inventory")
            .select("*")
            .eq("id", inventoryId)
            .single();

        if (invError) throw invError;
        if (!entry || entry.quantity <= 0) {
            return NextResponse.json({ error: "Nothing available to pick" }, { status: 400 });
        }

        // Check if already in pick list
        const { data: existing } = await supabase
            .from("warehouse_pick_lists")
            .select("*")
            .eq("inventory_id", inventoryId)
            .eq("confirmed", false)
            .single();

        if (existing) {
            // Update quantity
            const newQty = Math.min(existing.quantity + 1, entry.quantity);
            const { error } = await supabase
                .from("warehouse_pick_lists")
                .update({ quantity: newQty })
                .eq("id", existing.id);

            if (error) throw error;
            return NextResponse.json({ pickListItem: { ...existing, quantity: newQty } });
        } else {
            // Create new pick list item
            const newItem = {
                id: generateId(),
                inventory_id: inventoryId,
                warehouse_id: entry.warehouse_id,
                zone_id: entry.zone_id,
                bin_id: entry.bin_id,
                item_name: entry.item_name,
                sku: entry.sku,
                quantity: 1,
                created_by: profile?.id,
            };

            const { error } = await supabase
                .from("warehouse_pick_lists")
                .insert(newItem);

            if (error) throw error;

            return NextResponse.json({
                pickListItem: {
                    id: newItem.id,
                    inventoryId: newItem.inventory_id,
                    warehouseId: newItem.warehouse_id,
                    zoneId: newItem.zone_id,
                    binId: newItem.bin_id,
                    itemName: newItem.item_name,
                    sku: newItem.sku,
                    quantity: newItem.quantity,
                }
            });
        }
    } catch (error) {
        return jsonError(error);
    }
}
