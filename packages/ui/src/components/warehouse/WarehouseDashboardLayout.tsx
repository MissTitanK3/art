import { UseFormReturn } from "react-hook-form";
import { Boxes, Sparkles, Warehouse, Plus } from "lucide-react";
import { PageHeader } from "@workspace/ui/components/page-header";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { StatCard } from "./StatCard";
import { CycleCountCard } from "./CycleCountCard";
import { SafetyCard } from "./SafetyCard";
import { InventorySnapshotCard } from "./InventorySnapshotCard";
import { MovementLogCard } from "./MovementLogCard";
import { PickListBuilderCard } from "./PickListBuilderCard";
import { SavedWarehousesList } from "./SavedWarehousesList";
import { InventoryIntakeForm } from "./InventoryIntakeForm";
import { ConfirmedPickListsCard } from "./ConfirmedPickListsCard";
import {
    InventoryIntakeValues,
    WarehouseRecord,
    InventoryEntry,
    MovementLogEntry,
    PickListItem,
    CatalogItem,
} from "./types";

export interface WarehouseDashboardLayoutProps {
    profileDisplayName?: string;
    savedWarehouses: WarehouseRecord[];
    inventory: InventoryEntry[];
    movementLogs: MovementLogEntry[];
    pickList: PickListItem[];
    intakeTab: string;
    intakeForm: UseFormReturn<InventoryIntakeValues>;
    derivedStats: { totalZones: number; totalBins: number; coldChainSites: number };
    watchWarehouseId: string;
    watchZoneId: string;
    watchBinId: string;
    availableZones: { id: string; name: string }[];
    availableBins: { id: string; label: string }[];
    catalogItems: CatalogItem[];
    // Handlers
    handleIntakeSubmit: (values: InventoryIntakeValues) => void;
    handleTabsValueChange: (value: string) => void;
    handleLoadStandardItem: (name: string, cat: string, sku?: string) => void;
    handleAddToPickList: (entry: InventoryEntry) => void;
    handleGenerateSku: () => void;
    handlePickQuantityChange: (id: string, qty: number) => void;
    handleRemovePickItem: (id: string) => void;
    handleConfirmPickList: () => void;
    handleWarehouseUpdate?: (warehouseId: string, updates: Partial<WarehouseRecord>) => void;
    confirmedPickLists: PickListItem[];
    handleUpdateConfirmedPickQuantity: (pickId: string, quantity: number) => void;
    handleRemoveConfirmedPickItem: (pickId: string) => void;
    handleDeleteConfirmedPickList: (warehouseId: string, confirmedAt: string) => void;
    handleDeleteInventory?: (inventoryId: string) => void;
    handleUpdateInventory?: (inventoryId: string, quantity: number) => void;
}

export function WarehouseDashboardLayout({
    profileDisplayName,
    savedWarehouses,
    inventory,
    movementLogs,
    pickList,
    intakeTab,
    intakeForm,
    derivedStats,
    watchWarehouseId,
    watchZoneId,
    watchBinId,
    availableZones,
    availableBins,
    catalogItems,
    handleIntakeSubmit,
    handleTabsValueChange,
    handleLoadStandardItem,
    handleAddToPickList,
    handleGenerateSku,
    handlePickQuantityChange,
    handleRemovePickItem,
    handleConfirmPickList,
    handleWarehouseUpdate,
    confirmedPickLists,
    handleUpdateConfirmedPickQuantity,
    handleRemoveConfirmedPickItem,
    handleDeleteConfirmedPickList,
    handleDeleteInventory,
    handleUpdateInventory,
}: WarehouseDashboardLayoutProps) {
    return (
        <div className="space-y-8 py-8">
            <PageHeader
                title="Always Ready Warehouses"
                description="Model pods, home hubs, and storage units — no PII, no guesswork."
                actions={
                    <Button asChild size="sm">
                        <a href="/warehouse/new">
                            <Plus className="mr-2 size-4" />
                            Create Warehouse
                        </a>
                    </Button>
                }
            />

            {!profileDisplayName ? (
                <Alert variant="destructive">
                    <AlertTitle>Profile missing display name</AlertTitle>
                    <AlertDescription>
                        Add a display name to your profile so the warehouse can be tied to a steward.
                    </AlertDescription>
                </Alert>
            ) : null}

            <section className="grid gap-4 md:grid-cols-3">
                <StatCard
                    icon={Warehouse}
                    label="Warehouses ready"
                    value={savedWarehouses.length}
                    caption="Local offline cache"
                />
                <StatCard
                    icon={Boxes}
                    label="Zones tracked"
                    value={derivedStats.totalZones}
                    caption="Keep it under 5 per site"
                />
                <StatCard
                    icon={Sparkles}
                    label="Cold-chain ready"
                    value={derivedStats.coldChainSites}
                    caption="Sites with refrigeration flag"
                />
            </section>

            <div className="flex flex-col lg:flex-row gap-6 m-auto max-w-5xl mb-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory intake</CardTitle>
                            <CardDescription>
                                Search or create an item, place it in a zone/bin, and write the movement
                                log.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InventoryIntakeForm
                                savedWarehouses={savedWarehouses}
                                inventory={inventory}
                                catalogItems={catalogItems}
                                intakeTab={intakeTab}
                                intakeForm={intakeForm}
                                watchWarehouseId={watchWarehouseId}
                                watchZoneId={watchZoneId}
                                watchBinId={watchBinId}
                                availableZones={availableZones}
                                availableBins={availableBins}
                                handleIntakeSubmit={handleIntakeSubmit}
                                handleTabsValueChange={handleTabsValueChange}
                                handleLoadStandardItem={handleLoadStandardItem}
                                handleGenerateSku={handleGenerateSku}
                            />
                        </CardContent>
                    </Card>

                </div>
            </div>

            <ConfirmedPickListsCard
                confirmedPickLists={confirmedPickLists}
                warehouses={savedWarehouses}
                inventory={inventory}
                onQuantityChange={handleUpdateConfirmedPickQuantity}
                onRemoveItem={handleRemoveConfirmedPickItem}
                onDeleteList={handleDeleteConfirmedPickList}
            />

            <PickListBuilderCard
                inventory={inventory}
                warehouses={savedWarehouses}
                pickList={pickList}
                confirmedPickLists={confirmedPickLists}
                onAdd={handleAddToPickList}
                onQuantityChange={handlePickQuantityChange}
                onRemoveItem={handleRemovePickItem}
                onConfirm={handleConfirmPickList}
                onDeleteInventory={handleDeleteInventory}
                onUpdateInventory={handleUpdateInventory}
            />
            <SavedWarehousesList warehouses={savedWarehouses} onWarehouseUpdate={handleWarehouseUpdate} />

            <InventorySnapshotCard inventory={inventory} warehouses={savedWarehouses} />
            <MovementLogCard movementLogs={movementLogs} />
        </div>
    );
}

