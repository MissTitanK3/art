import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { InventoryEntry, WarehouseRecord, resolveInventoryLocation } from "./types";

export function InventorySnapshotCard({
    inventory,
    warehouses,
}: {
    inventory: InventoryEntry[];
    warehouses: WarehouseRecord[];
}) {
    const totalUnits = inventory.reduce((sum, entry) => sum + entry.quantity, 0);
    const categoryCount = new Set(inventory.map((entry) => entry.category)).size;
    const rows = [...inventory]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory snapshot</CardTitle>
                <CardDescription>
                    {totalUnits} units tracked across {inventory.length} SKU rows.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Categories: {categoryCount}</span>
                    <span>SKUs: {inventory.length}</span>
                </div>
                {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Log your first intake to populate the snapshot.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Location</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((entry) => {
                                const location = resolveInventoryLocation(entry, warehouses);
                                return (
                                    <TableRow key={entry.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{entry.itemName}</span>
                                                <span className="text-xs text-muted-foreground">{entry.sku}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{entry.quantity}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            <span className="text-foreground">{location.warehouseName}</span>
                                            {location.zoneName ? ` / ${location.zoneName}` : ""}
                                            {location.binName ? ` → ${location.binName}` : ""}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
