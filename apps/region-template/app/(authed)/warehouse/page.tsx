"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@workspace/ui/primitives/sonner";
import { useProfileStore } from "@workspace/store/useProfileStore";
import { slugifyIdentifier } from "@workspace/ui/lib/academy-utils";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";

import { useIntakeTabState } from "@workspace/ui/patterns/features/warehouse/use-intake-tab-state";
import { WarehouseDashboardLayout } from "@workspace/ui/patterns/features/warehouse/warehouse-dashboard-layout";
import {
  InventoryIntakeValues,
  WarehouseRecord,
  InventoryEntry,
  MovementLogEntry,
  PickListItem,
  OfflineWarehouseState,
  InventorySubmission,
  inventoryIntakeSchema,
  CatalogItem,
  resolveInventoryLocation,
} from "@workspace/ui/patterns/features/warehouse/types";

const generateId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const STORAGE_KEY = "art.region.warehouse-plans:v2";

export default function WarehouseDashboardDataLayer() {
  const profile = useProfileStore((state) => state.profile);
  const stewardName = profile?.display_name ?? "Unknown steward";
  const [savedWarehouses, setSavedWarehouses] = useState<WarehouseRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryEntry[]>([]);
  const [isIntakeSheetOpen, setIsIntakeSheetOpen] = useState(false);
  const [movementLogs, setMovementLogs] = useState<MovementLogEntry[]>([]);
  const [pickList, setPickList] = useState<PickListItem[]>([]);
  const [confirmedPickLists, setConfirmedPickLists] = useState<PickListItem[]>(
    []
  );
  const { intakeTab, handleIntakeTabChange: setIntakeTabMode } =
    useIntakeTabState(inventory.length);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>("");

  const intakeForm = useForm<InventoryIntakeValues>({
    resolver: zodResolver(inventoryIntakeSchema),
    mode: "onChange",
    defaultValues: {
      warehouseId: "",
      zoneId: "",
      binId: "",
      itemName: "",
      sku: "",
      category: "",
      quantity: 1,
      condition: "sealed",
      expirationDate: undefined,
      notes: "",
    },
  });

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const client = getSupabaseBrowserClient();

      // Fetch Warehouses
      const { data: warehouses, error: warehouseError } = await client.from(
        "warehouses"
      ).select(`
                    *,
                    zones:warehouse_zones(
                        *,
                        bins:warehouse_bins(*)
                    )
                `);

      if (warehouseError) {
        console.error("Error fetching warehouses:", warehouseError);
      } else if (warehouses) {
        const normalized: WarehouseRecord[] = warehouses.map((w: any) => ({
          id: w.id,
          regionId: w.region_id,
          displayName: w.display_name,
          stewardDisplayName: w.display_name,
          regionZone: w.region_zone,
          urbanType: w.urban_type,
          siteType: "home",
          maxCapacityRating: w.max_capacity_rating,
          capabilities: w.capabilities?.flags || [],
          quickNotes: w.capabilities?.quick_note || "",
          createdAt: w.created_at,
          zones: w.zones
            .map((z: any) => ({
              id: z.id,
              name: z.name,
              sortOrder: z.sort_order,
              bins: z.bins
                .map((b: any) => ({
                  id: b.id,
                  label: b.label,
                  sortOrder: b.sort_order,
                }))
                .sort(
                  (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                ),
            }))
            .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        }));
        setSavedWarehouses(normalized);
      }

      // Fetch Inventory
      const { data: invData, error: invError } = await client
        .from("warehouse_inventory")
        .select("*");
      if (invError) {
        console.error("Error fetching inventory:", invError);
      } else if (invData) {
        const normalizedInv: InventoryEntry[] = invData.map((i: any) => ({
          id: i.id,
          warehouseId: i.warehouse_id,
          zoneId: i.zone_id,
          binId: i.bin_id,
          itemName: i.item_name,
          sku: i.sku,
          category: i.category,
          condition: i.condition,
          quantity: i.quantity,
          expirationDate: i.expiration_date,
          updatedAt: i.updated_at,
        }));
        setInventory(normalizedInv);
      }

      // Fetch Movement Logs
      const { data: logData, error: logError } = await client
        .from("warehouse_movement_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (logError) {
        console.error("Error fetching movement logs:", logError);
      } else if (logData) {
        const normalizedLogs: MovementLogEntry[] = logData.map((l: any) => {
          // Find warehouse name
          const warehouse = warehouses?.find(
            (w: any) => w.id === l.warehouse_id
          );
          const warehouseName =
            warehouse?.steward_display_name ||
            warehouse?.display_name ||
            "Unknown Warehouse";

          return {
            id: l.id,
            warehouseId: l.warehouse_id,
            warehouseName,
            type: l.type,
            sku: l.sku,
            itemName: l.item_name,
            quantity: l.quantity,
            byDisplayName: l.by_display_name,
            createdAt: l.created_at,
            notes: l.notes,
            zoneId: l.zone_id,
            binId: l.bin_id,
          };
        });
        setMovementLogs(normalizedLogs);
      }

      // Fetch Pick Lists
      const { data: pickListData, error: pickError } = await client.from(
        "warehouse_pick_lists"
      ).select(`
                    *,
                    confirmed_by_profile:profiles!warehouse_pick_lists_confirmed_by_fkey(display_name)
                `);
      if (pickError) {
        console.error("Error fetching pick lists:", pickError);
      } else if (pickListData) {
        const normalizedPicks: PickListItem[] = pickListData
          .filter((p: any) => !p.confirmed)
          .map((p: any) => ({
            id: p.id,
            inventoryId: p.inventory_id,
            warehouseId: p.warehouse_id,
            zoneId: p.zone_id,
            binId: p.bin_id,
            itemName: p.item_name,
            sku: p.sku,
            quantity: p.quantity,
          }));
        setPickList(normalizedPicks);

        // Fetch confirmed pick lists
        const normalizedConfirmed: PickListItem[] = pickListData
          .filter((p: any) => p.confirmed)
          .map((p: any) => ({
            id: p.id,
            inventoryId: p.inventory_id,
            warehouseId: p.warehouse_id,
            zoneId: p.zone_id,
            binId: p.bin_id,
            itemName: p.item_name,
            sku: p.sku,
            quantity: p.quantity,
            confirmed: p.confirmed,
            confirmedAt: p.confirmed_at,
            confirmedBy: p.confirmed_by,
            confirmedByDisplayName:
              p.confirmed_by_profile?.display_name || "Unknown",
          }));
        setConfirmedPickLists(normalizedConfirmed);
      }

      // Fetch Catalog
      const { data: catalogData, error: catalogError } = await client
        .from("warehouse_item_catalog")
        .select("*");
      if (catalogError) {
        console.error("Error fetching catalog:", catalogError);
      } else if (catalogData) {
        const normalizedCatalog: CatalogItem[] = catalogData.map((c: any) => ({
          sku: c.sku,
          itemName: c.item_name,
          category: c.category,
        }));
        setCatalogItems(normalizedCatalog);
      }
    };

    fetchData();
  }, []);

  const handleWarehouseUpdate = async (
    warehouseId: string,
    updates: Partial<WarehouseRecord>
  ) => {
    const client = getSupabaseBrowserClient();

    try {
      // Update warehouse basic fields
      const { error: warehouseError } = await client
        .from("warehouses")
        .update({
          display_name: updates.displayName,
          region_zone: updates.regionZone,
          urban_type: updates.urbanType,
          max_capacity_rating: updates.maxCapacityRating,
          capabilities: {
            flags: updates.capabilities || [],
            quick_note: updates.quickNotes || "",
          },
        })
        .eq("id", warehouseId);

      if (warehouseError) {
        console.error("Error updating warehouse:", warehouseError);
        toast.error("Failed to update warehouse");
        return;
      }

      // Handle zones and bins updates
      if (updates.zones) {
        // Get existing zones from database
        const { data: existingZones } = await client
          .from("warehouse_zones")
          .select("id, name")
          .eq("warehouse_id", warehouseId);

        const existingZoneIds = new Set(existingZones?.map((z) => z.id) || []);
        const updatedZoneIds = new Set(updates.zones.map((z) => z.id));

        // Delete removed zones
        const zonesToDelete = Array.from(existingZoneIds).filter(
          (id) => !updatedZoneIds.has(id)
        );
        if (zonesToDelete.length > 0) {
          await client.from("warehouse_zones").delete().in("id", zonesToDelete);
        }

        // Process each zone
        for (const zone of updates.zones) {
          if (zone.id.startsWith("temp-")) {
            // Insert new zone
            const { data: newZone, error: zoneError } = await client
              .from("warehouse_zones")
              .insert({
                warehouse_id: warehouseId,
                name: zone.name,
                sort_order: zone.sortOrder,
              })
              .select()
              .single();

            if (zoneError || !newZone) {
              console.error("Error creating zone:", zoneError);
              continue;
            }

            // Insert bins for new zone
            if (zone.bins.length > 0) {
              const binsToInsert = zone.bins.map((bin) => ({
                zone_id: newZone.id,
                label: bin.label,
                sort_order: bin.sortOrder,
              }));
              await client.from("warehouse_bins").insert(binsToInsert);
            }
          } else {
            // Update existing zone
            await client
              .from("warehouse_zones")
              .update({
                name: zone.name,
                sort_order: zone.sortOrder,
              })
              .eq("id", zone.id);

            // Handle bins for existing zone
            const { data: existingBins } = await client
              .from("warehouse_bins")
              .select("id")
              .eq("zone_id", zone.id);

            const existingBinIds = new Set(
              existingBins?.map((b) => b.id) || []
            );
            const updatedBinIds = new Set(
              zone.bins
                .filter((b) => !b.id.startsWith("temp-"))
                .map((b) => b.id)
            );

            // Delete removed bins
            const binsToDelete = Array.from(existingBinIds).filter(
              (id) => !updatedBinIds.has(id)
            );
            if (binsToDelete.length > 0) {
              await client
                .from("warehouse_bins")
                .delete()
                .in("id", binsToDelete);
            }

            // Update or insert bins
            for (const bin of zone.bins) {
              if (bin.id.startsWith("temp-")) {
                await client.from("warehouse_bins").insert({
                  zone_id: zone.id,
                  label: bin.label,
                  sort_order: bin.sortOrder,
                });
              } else {
                await client
                  .from("warehouse_bins")
                  .update({
                    label: bin.label,
                    sort_order: bin.sortOrder,
                  })
                  .eq("id", bin.id);
              }
            }
          }
        }
      }

      // Refresh warehouses from database
      const { data: warehouses, error: fetchError } = await client.from(
        "warehouses"
      ).select(`
                    *,
                    zones:warehouse_zones(
                        *,
                        bins:warehouse_bins(*)
                    )
                `);

      if (fetchError) {
        console.error("Error refreshing warehouses:", fetchError);
      } else if (warehouses) {
        const normalized: WarehouseRecord[] = warehouses.map((w: any) => ({
          id: w.id,
          regionId: w.region_id,
          displayName: w.display_name,
          stewardDisplayName: w.display_name,
          regionZone: w.region_zone,
          urbanType: w.urban_type,
          siteType: "home",
          maxCapacityRating: w.max_capacity_rating,
          capabilities: w.capabilities?.flags || [],
          quickNotes: w.capabilities?.quick_note || "",
          createdAt: w.created_at,
          zones: w.zones.map((z: any) => ({
            id: z.id,
            name: z.name,
            sortOrder: z.sort_order,
            bins: z.bins.map((b: any) => ({
              id: b.id,
              label: b.label,
              sortOrder: b.sort_order,
            })),
          })),
        }));
        setSavedWarehouses(normalized);
      }

      toast.success("Warehouse updated successfully");
    } catch (error) {
      console.error("Error updating warehouse:", error);
      toast.error("Failed to update warehouse");
    }
  };

  const handleIntakeSubmit = async (values: InventoryIntakeValues) => {
    const client = getSupabaseBrowserClient();
    const warehouse = savedWarehouses.find(
      (candidate) => candidate.id === values.warehouseId
    );
    const zone = warehouse?.zones.find(
      (candidate) => candidate.id === values.zoneId
    );
    const bin = zone?.bins.find((candidate) => candidate.id === values.binId);

    const now = new Date().toISOString();

    // Optimistic Update
    const submission: InventorySubmission = {
      warehouseId: values.warehouseId,
      zoneId: values.zoneId,
      binId: values.binId,
      itemName: values.itemName,
      sku: values.sku,
      category: values.category,
      condition: values.condition,
      quantity: values.quantity,
      expirationDate: values.expirationDate ?? null,
    };

    setInventory((prev) =>
      mergeInventoryEntries({
        previous: prev,
        submission,
        now,
        createId: generateId,
      })
    );

    // DB Update
    // Check if existing item to update
    const existingItem = inventory.find(
      (entry) =>
        entry.warehouseId === values.warehouseId &&
        entry.zoneId === values.zoneId &&
        entry.binId === values.binId &&
        entry.sku === values.sku &&
        entry.condition === values.condition &&
        entry.expirationDate === values.expirationDate
    );

    if (existingItem) {
      const { error } = await client
        .from("warehouse_inventory")
        .update({
          quantity: existingItem.quantity + values.quantity,
          updated_at: now,
        })
        .eq("id", existingItem.id);
      if (error) toast.error("Failed to sync inventory update");
    } else {
      const { error } = await client.from("warehouse_inventory").insert({
        id: generateId(),
        warehouse_id: values.warehouseId,
        zone_id: values.zoneId,
        bin_id: values.binId,
        item_name: values.itemName,
        sku: values.sku,
        category: values.category,
        condition: values.condition,
        quantity: values.quantity,
        expiration_date: values.expirationDate,
        updated_at: now,
      });
      if (error) toast.error("Failed to sync new inventory");
    }

    const logEntry: MovementLogEntry = {
      id: generateId(),
      warehouseId: values.warehouseId,
      warehouseName:
        warehouse?.stewardDisplayName ??
        warehouse?.displayName ??
        "Unknown warehouse",
      type: "intake",
      sku: values.sku,
      itemName: values.itemName,
      quantity: values.quantity,
      byDisplayName: stewardName,
      createdAt: now,
      notes: values.notes,
      locationLabel: [zone?.name, bin?.label].filter(Boolean).join(" → "),
      zoneId: zone?.id,
      binId: bin?.id,
    };
    setMovementLogs((prev) => [logEntry, ...prev]);

    await client.from("warehouse_movement_logs").insert({
      id: logEntry.id,
      warehouse_id: logEntry.warehouseId,
      type: "intake",
      sku: logEntry.sku,
      item_name: logEntry.itemName,
      quantity: logEntry.quantity,
      by_display_name: logEntry.byDisplayName,
      created_at: logEntry.createdAt,
      notes: logEntry.notes,
      zone_id: logEntry.zoneId,
      bin_id: logEntry.binId,
    });

    intakeForm.reset({
      warehouseId: values.warehouseId,
      zoneId: values.zoneId,
      binId: values.binId,
      itemName: "",
      sku: "",
      category: "",
      quantity: 1,
      condition: values.condition,
      expirationDate: undefined,
      notes: "",
    });
    toast.success("Intake logged");
  };

  const handleTabsValueChange = (value: string) => {
    const mode = value === "existing" ? "existing" : "new";
    setIntakeTabMode(mode);
    if (mode === "new") {
      setSelectedInventoryId("");
      return;
    }
    if (inventory.length > 0) {
      const targetEntry =
        inventory.find((entry) => entry.id === selectedInventoryId) ||
        inventory[0];
      if (targetEntry) {
        handleSelectExistingInventory(targetEntry.id);
      }
    }
  };

  useEffect(() => {
    if (
      selectedInventoryId &&
      !inventory.some((entry) => entry.id === selectedInventoryId)
    ) {
      setSelectedInventoryId("");
    }
  }, [inventory, selectedInventoryId]);

  const handleAddToPickList = async (entry: InventoryEntry) => {
    if (entry.quantity <= 0) {
      toast.error("Nothing available to pick");
      return;
    }

    const client = getSupabaseBrowserClient();
    const existing = pickList.find((item) => item.inventoryId === entry.id);

    if (existing) {
      const newQty = Math.min(existing.quantity + 1, entry.quantity);
      setPickList((prev) =>
        prev.map((item) =>
          item.inventoryId === entry.id ? { ...item, quantity: newQty } : item
        )
      );
      await client
        .from("warehouse_pick_lists")
        .update({ quantity: newQty })
        .eq("id", existing.id);
    } else {
      const newItem: PickListItem = {
        id: generateId(),
        inventoryId: entry.id,
        warehouseId: entry.warehouseId,
        zoneId: entry.zoneId,
        binId: entry.binId,
        itemName: entry.itemName,
        sku: entry.sku,
        quantity: 1,
      };
      setPickList((prev) => [newItem, ...prev]);
      await client.from("warehouse_pick_lists").insert({
        id: newItem.id,
        inventory_id: newItem.inventoryId,
        warehouse_id: newItem.warehouseId,
        zone_id: newItem.zoneId,
        bin_id: newItem.binId,
        item_name: newItem.itemName,
        sku: newItem.sku,
        quantity: newItem.quantity,
        created_by: profile?.id,
      });
    }
    toast.success("Added to pick list");
  };

  const handleGenerateSku = () => {
    const itemName = intakeForm.getValues("itemName")?.trim();
    if (!itemName) {
      toast.info("Enter an item name first");
      return;
    }
    const normalized = slugifyIdentifier(itemName);
    if (!normalized) {
      toast.info("Unable to generate SKU from that name");
      return;
    }
    intakeForm.setValue("sku", normalized, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handlePickQuantityChange = async (pickId: string, nextQty: number) => {
    if (Number.isNaN(nextQty) || nextQty < 1) return;
    const client = getSupabaseBrowserClient();

    setPickList((prev) =>
      prev.map((item) => {
        if (item.id !== pickId) return item;
        const entry = inventory.find(
          (candidate) => candidate.id === item.inventoryId
        );
        const maxAvailable = entry?.quantity ?? nextQty;
        const finalQty = Math.min(nextQty, maxAvailable);

        // Fire and forget update
        client
          .from("warehouse_pick_lists")
          .update({ quantity: finalQty })
          .eq("id", pickId)
          .then();

        return { ...item, quantity: finalQty };
      })
    );
  };

  const handleRemovePickItem = async (pickId: string) => {
    const client = getSupabaseBrowserClient();
    setPickList((prev) => prev.filter((item) => item.id !== pickId));
    await client.from("warehouse_pick_lists").delete().eq("id", pickId);
  };

  const handleConfirmPickList = async () => {
    if (pickList.length === 0) {
      toast.info("Add at least one item to the pick list");
      return;
    }
    const client = getSupabaseBrowserClient();
    const now = new Date().toISOString();
    let hasBlockingError = false;
    const inventoryUpdates = new Map<string, InventoryEntry>();
    const newLogs: MovementLogEntry[] = [];

    for (const pick of pickList) {
      const entry = inventory.find(
        (candidate) => candidate.id === pick.inventoryId
      );
      if (!entry) {
        toast.error(`Inventory row for ${pick.itemName} is missing`);
        hasBlockingError = true;
        break;
      }
      if (pick.quantity > entry.quantity) {
        toast.error(
          `Only ${entry.quantity} units of ${pick.itemName} are available at the selected location.`
        );
        hasBlockingError = true;
        break;
      }
      const updatedEntry: InventoryEntry = {
        ...entry,
        quantity: entry.quantity - pick.quantity,
        updatedAt: now,
      };
      inventoryUpdates.set(entry.id, updatedEntry);
      const warehouse =
        savedWarehouses.find(
          (candidate) => candidate.id === entry.warehouseId
        ) ?? null;
      const zone = warehouse?.zones.find(
        (candidate) => candidate.id === entry.zoneId
      );
      const bin = zone?.bins.find((candidate) => candidate.id === entry.binId);
      newLogs.push({
        id: generateId(),
        warehouseId: entry.warehouseId,
        warehouseName:
          warehouse?.stewardDisplayName ??
          warehouse?.displayName ??
          "Unknown warehouse",
        type: "outflow",
        sku: entry.sku,
        itemName: entry.itemName,
        quantity: pick.quantity,
        byDisplayName: stewardName,
        createdAt: now,
        notes: undefined,
        locationLabel: [zone?.name, bin?.label].filter(Boolean).join(" → "),
        zoneId: zone?.id,
        binId: bin?.id,
      });
    }

    if (hasBlockingError) return;

    // Optimistic update
    setInventory((prev) => {
      const next = prev
        .map((entry) => inventoryUpdates.get(entry.id) ?? entry)
        .filter((entry) => entry.quantity > 0);
      return next;
    });
    setMovementLogs((prev) => [...newLogs, ...prev]);
    setPickList([]);

    // DB Updates
    // 1. Update Inventory
    for (const [id, entry] of inventoryUpdates) {
      await client
        .from("warehouse_inventory")
        .update({
          quantity: entry.quantity,
          updated_at: now,
        })
        .eq("id", id);
    }

    // 2. Insert Logs
    const logsPayload = newLogs.map((l) => ({
      id: l.id,
      warehouse_id: l.warehouseId,
      type: "outflow",
      sku: l.sku,
      item_name: l.itemName,
      quantity: l.quantity,
      by_display_name: l.byDisplayName,
      created_at: l.createdAt,
      zone_id: l.zoneId,
      bin_id: l.binId,
    }));
    await client.from("warehouse_movement_logs").insert(logsPayload);

    // 3. Mark Pick List as Confirmed
    const pickIds = pickList.map((p) => p.id);
    await client
      .from("warehouse_pick_lists")
      .update({
        confirmed: true,
        confirmed_at: now,
        confirmed_by: profile?.id,
      })
      .in("id", pickIds);

    // Move to confirmed list
    const confirmedItems = pickList.map((item) => ({
      ...item,
      confirmed: true,
      confirmedAt: now,
      confirmedBy: profile?.id,
      confirmedByDisplayName: stewardName,
    }));
    setConfirmedPickLists((prev) => [...confirmedItems, ...prev]);

    toast.success("Pick list confirmed");
  };

  const handleUpdateConfirmedPickQuantity = async (
    pickId: string,
    quantity: number
  ) => {
    if (Number.isNaN(quantity) || quantity < 1) return;
    const client = getSupabaseBrowserClient();

    // Find the confirmed pick item
    const confirmedItem = confirmedPickLists.find((item) => item.id === pickId);
    if (!confirmedItem) return;

    const oldQuantity = confirmedItem.quantity;
    const quantityDiff = quantity - oldQuantity;

    // Find the inventory entry
    const inventoryEntry = inventory.find(
      (entry) => entry.id === confirmedItem.inventoryId
    );
    if (!inventoryEntry) {
      toast.error("Inventory entry not found");
      return;
    }

    // Check if we have enough inventory for an increase
    if (quantityDiff > 0 && inventoryEntry.quantity < quantityDiff) {
      toast.error(`Only ${inventoryEntry.quantity} units available`);
      return;
    }

    // Update confirmed pick list
    setConfirmedPickLists((prev) =>
      prev.map((item) => (item.id === pickId ? { ...item, quantity } : item))
    );

    // Adjust inventory (decrease if quantity increased, increase if quantity decreased)
    const newInventoryQuantity = inventoryEntry.quantity - quantityDiff;
    setInventory((prev) =>
      prev
        .map((entry) =>
          entry.id === confirmedItem.inventoryId
            ? {
                ...entry,
                quantity: newInventoryQuantity,
                updatedAt: new Date().toISOString(),
              }
            : entry
        )
        .filter((entry) => entry.quantity > 0)
    );

    // Update database
    await client
      .from("warehouse_pick_lists")
      .update({ quantity })
      .eq("id", pickId);

    await client
      .from("warehouse_inventory")
      .update({
        quantity: newInventoryQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", confirmedItem.inventoryId);

    toast.success("Quantity updated");
  };

  const handleRemoveConfirmedPickItem = async (pickId: string) => {
    const client = getSupabaseBrowserClient();

    // Find the confirmed pick item
    const confirmedItem = confirmedPickLists.find((item) => item.id === pickId);
    if (!confirmedItem) return;

    // Return quantity back to inventory
    setInventory((prev) =>
      prev.map((entry) =>
        entry.id === confirmedItem.inventoryId
          ? {
              ...entry,
              quantity: entry.quantity + confirmedItem.quantity,
              updatedAt: new Date().toISOString(),
            }
          : entry
      )
    );

    // Update inventory in database
    const inventoryEntry = inventory.find(
      (entry) => entry.id === confirmedItem.inventoryId
    );
    if (inventoryEntry) {
      await client
        .from("warehouse_inventory")
        .update({
          quantity: inventoryEntry.quantity + confirmedItem.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", confirmedItem.inventoryId);
    }

    setConfirmedPickLists((prev) => prev.filter((item) => item.id !== pickId));
    await client.from("warehouse_pick_lists").delete().eq("id", pickId);
    toast.success("Item removed and quantity returned to inventory");
  };

  const handleDeleteConfirmedPickList = async (
    warehouseId: string,
    confirmedAt: string
  ) => {
    const client = getSupabaseBrowserClient();

    // Find all items in this confirmed list
    const itemsToDelete = confirmedPickLists.filter(
      (item) =>
        item.warehouseId === warehouseId && item.confirmedAt === confirmedAt
    );

    if (itemsToDelete.length === 0) return;

    setConfirmedPickLists((prev) =>
      prev.filter(
        (item) =>
          !(
            item.warehouseId === warehouseId && item.confirmedAt === confirmedAt
          )
      )
    );

    const pickIds = itemsToDelete.map((item) => item.id);
    await client.from("warehouse_pick_lists").delete().in("id", pickIds);
    toast.success("Confirmed pick list deleted");
  };

  const handleDeleteInventory = async (inventoryId: string) => {
    const client = getSupabaseBrowserClient();

    // Remove from local state
    setInventory((prev) => prev.filter((entry) => entry.id !== inventoryId));

    // Delete from database
    await client.from("warehouse_inventory").delete().eq("id", inventoryId);
    toast.success("Inventory item deleted");
  };

  const handleUpdateInventory = async (
    inventoryId: string,
    quantity: number
  ) => {
    const client = getSupabaseBrowserClient();

    // Update local state
    setInventory((prev) =>
      prev.map((entry) =>
        entry.id === inventoryId ? { ...entry, quantity } : entry
      )
    );

    // Update database
    await client
      .from("warehouse_inventory")
      .update({ quantity })
      .eq("id", inventoryId);
    toast.success("Inventory item updated");
  };

  const watchWarehouseId = intakeForm.watch("warehouseId");
  const watchZoneId = intakeForm.watch("zoneId");
  const watchBinId = intakeForm.watch("binId");

  const selectedWarehouse = useMemo(
    () =>
      savedWarehouses.find((warehouse) => warehouse.id === watchWarehouseId),
    [savedWarehouses, watchWarehouseId]
  );
  const availableZones = useMemo(
    () => selectedWarehouse?.zones ?? [],
    [selectedWarehouse]
  );
  const selectedZone = useMemo(
    () => availableZones.find((zone) => zone.id === watchZoneId),
    [availableZones, watchZoneId]
  );
  const availableBins = useMemo(() => selectedZone?.bins ?? [], [selectedZone]);
  const existingInventoryOptions = useMemo(() => {
    return inventory.map((entry) => {
      const location = resolveInventoryLocation(entry, savedWarehouses);
      return {
        id: entry.id,
        label: `${entry.itemName} (${entry.sku}) — ${location.warehouseName}${
          location.zoneName ? ` / ${location.zoneName}` : ""
        }${location.binName ? ` → ${location.binName}` : ""}`,
      };
    });
  }, [inventory, savedWarehouses]);
  const selectedInventoryEntry = useMemo(
    () => inventory.find((entry) => entry.id === selectedInventoryId),
    [inventory, selectedInventoryId]
  );
  const selectedInventoryLocation = selectedInventoryEntry
    ? resolveInventoryLocation(selectedInventoryEntry, savedWarehouses)
    : null;

  const handleSelectExistingInventory = useCallback(
    (inventoryId: string) => {
      setSelectedInventoryId(inventoryId);
      const entry = inventory.find((candidate) => candidate.id === inventoryId);
      if (!entry) return;
      intakeForm.setValue("warehouseId", entry.warehouseId, {
        shouldDirty: true,
        shouldValidate: true,
      });
      intakeForm.setValue("zoneId", entry.zoneId, {
        shouldDirty: true,
        shouldValidate: true,
      });
      intakeForm.setValue("binId", entry.binId, {
        shouldDirty: true,
        shouldValidate: true,
      });
      intakeForm.setValue("itemName", entry.itemName, {
        shouldDirty: true,
        shouldValidate: true,
      });
      intakeForm.setValue("sku", entry.sku, {
        shouldDirty: true,
        shouldValidate: true,
      });
      intakeForm.setValue("category", entry.category, {
        shouldDirty: true,
        shouldValidate: true,
      });
      intakeForm.setValue("condition", entry.condition, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [inventory, intakeForm]
  );

  const handleLoadStandardItem = (
    itemName: string,
    category: string,
    defaultSku?: string
  ) => {
    setIntakeTabMode("new");
    setSelectedInventoryId("");
    intakeForm.setValue("itemName", itemName, {
      shouldDirty: true,
      shouldValidate: true,
    });
    intakeForm.setValue("category", category, {
      shouldDirty: true,
      shouldValidate: true,
    });
    intakeForm.setValue("sku", defaultSku ?? slugifyIdentifier(itemName), {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.success(`Loaded ${itemName}`);
  };

  useEffect(() => {
    if (
      intakeTab === "existing" &&
      inventory.length > 0 &&
      selectedInventoryId === ""
    ) {
      const firstEntry = inventory[0];
      if (firstEntry) {
        handleSelectExistingInventory(firstEntry.id);
      }
    }
  }, [
    intakeTab,
    inventory,
    selectedInventoryId,
    handleSelectExistingInventory,
  ]);

  useEffect(() => {
    if (!selectedWarehouse) {
      if (watchZoneId !== "") {
        intakeForm.setValue("zoneId", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (watchBinId !== "") {
        intakeForm.setValue("binId", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      return;
    }
    if (
      !watchZoneId ||
      !availableZones.some((zone) => zone.id === watchZoneId)
    ) {
      const fallbackZone = availableZones[0];
      if (fallbackZone && fallbackZone.id !== watchZoneId) {
        intakeForm.setValue("zoneId", fallbackZone.id, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [
    selectedWarehouse,
    selectedWarehouse?.id,
    availableZones,
    watchZoneId,
    watchBinId,
    intakeForm,
  ]);

  useEffect(() => {
    if (!selectedZone) {
      if (watchBinId !== "") {
        intakeForm.setValue("binId", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      return;
    }
    if (!watchBinId || !availableBins.some((bin) => bin.id === watchBinId)) {
      const fallbackBin = availableBins[0];
      if (fallbackBin && fallbackBin.id !== watchBinId) {
        intakeForm.setValue("binId", fallbackBin.id, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [selectedZone, selectedZone?.id, availableBins, watchBinId, intakeForm]);

  const derivedStats = useMemo(() => {
    const totalZones = savedWarehouses.reduce(
      (acc, warehouse) => acc + warehouse.zones.length,
      0
    );
    const totalBins = savedWarehouses.reduce(
      (acc, warehouse) =>
        acc +
        warehouse.zones.reduce(
          (zoneAcc, zone) => zoneAcc + zone.bins.length,
          0
        ),
      0
    );
    const coldChainSites = savedWarehouses.filter((warehouse) =>
      warehouse.capabilities.includes("refrigeration")
    ).length;
    return { totalZones, totalBins, coldChainSites };
  }, [savedWarehouses]);

  return (
    <WarehouseDashboardLayout
      profileDisplayName={profile?.display_name}
      savedWarehouses={savedWarehouses}
      inventory={inventory}
      movementLogs={movementLogs}
      pickList={pickList}
      intakeTab={intakeTab}
      intakeForm={intakeForm}
      derivedStats={derivedStats}
      watchWarehouseId={watchWarehouseId}
      watchZoneId={watchZoneId}
      watchBinId={watchBinId}
      availableZones={availableZones}
      availableBins={availableBins}
      catalogItems={catalogItems}
      handleIntakeSubmit={handleIntakeSubmit}
      handleTabsValueChange={handleTabsValueChange}
      handleLoadStandardItem={handleLoadStandardItem}
      isIntakeSheetOpen={isIntakeSheetOpen}
      onIntakeSheetOpenChange={setIsIntakeSheetOpen}
      handleAddToPickList={handleAddToPickList}
      handleGenerateSku={handleGenerateSku}
      handlePickQuantityChange={handlePickQuantityChange}
      handleRemovePickItem={handleRemovePickItem}
      handleConfirmPickList={handleConfirmPickList}
      handleWarehouseUpdate={handleWarehouseUpdate}
      confirmedPickLists={confirmedPickLists}
      handleUpdateConfirmedPickQuantity={handleUpdateConfirmedPickQuantity}
      handleRemoveConfirmedPickItem={handleRemoveConfirmedPickItem}
      handleDeleteConfirmedPickList={handleDeleteConfirmedPickList}
      handleDeleteInventory={handleDeleteInventory}
      handleUpdateInventory={handleUpdateInventory}
    />
  );
}

// Helpers
function mergeInventoryEntries({
  previous,
  submission,
  now,
  createId,
}: {
  previous: InventoryEntry[];
  submission: InventorySubmission;
  now: string;
  createId: () => string;
}): InventoryEntry[] {
  // Logic to merge inventory
  // If same SKU, same location, same condition, same expiration -> merge
  const existingIndex = previous.findIndex(
    (entry) =>
      entry.warehouseId === submission.warehouseId &&
      entry.zoneId === submission.zoneId &&
      entry.binId === submission.binId &&
      entry.sku === submission.sku &&
      entry.condition === submission.condition &&
      entry.expirationDate === submission.expirationDate
  );

  if (existingIndex >= 0) {
    const existing = previous[existingIndex];
    if (!existing) return previous;
    const updated: InventoryEntry = {
      ...existing,
      quantity: existing.quantity + submission.quantity,
      updatedAt: now,
    };
    const next = [...previous];
    next[existingIndex] = updated;
    return next;
  }

  const newEntry: InventoryEntry = {
    id: createId(),
    warehouseId: submission.warehouseId,
    zoneId: submission.zoneId,
    binId: submission.binId,
    itemName: submission.itemName,
    sku: submission.sku,
    category: submission.category,
    condition: submission.condition,
    quantity: submission.quantity,
    expirationDate: submission.expirationDate,
    updatedAt: now,
  };
  return [newEntry, ...previous];
}
