import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { WarehouseRecord } from "./types";

export function CycleCountCard({ warehouses }: { warehouses: WarehouseRecord[] }) {
    const tasks = warehouses.slice(0, 3).map((warehouse, index) => ({
        id: warehouse.id,
        steward:
            warehouse.stewardDisplayName ?? warehouse.displayName ?? "Assigned steward",
        dueIn: `${index + 1} day${index === 0 ? "" : "s"}`,
        zones: warehouse.zones.length,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cycle count queue</CardTitle>
                <CardDescription>Full counts monthly, weekly spot checks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Save a warehouse to auto-generate cycle count reminders.
                    </p>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                        >
                            <div>
                                <p className="font-semibold">{task.steward}</p>
                                <p className="text-xs text-muted-foreground">
                                    {task.zones} zones • Due in {task.dueIn}
                                </p>
                            </div>
                            <Badge variant="outline">Spot check</Badge>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
