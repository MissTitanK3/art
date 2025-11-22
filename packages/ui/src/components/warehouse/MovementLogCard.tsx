import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { MovementLogEntry } from "./types";

export function MovementLogCard({ movementLogs }: { movementLogs: MovementLogEntry[] }) {
    const latest = movementLogs.slice(0, 6);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Movement history</CardTitle>
                <CardDescription>Audit log for intake, outflow, and cycle counts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {latest.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Movement logs appear after you log intake or perform cycle counts.
                    </p>
                ) : (
                    latest.map((log) => (
                        <div
                            key={log.id}
                            className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <p className="font-medium">
                                    {log.quantity}× {log.itemName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {log.type} • {log.locationLabel || "Location pending"} •{" "}
                                    {new Date(log.createdAt).toLocaleString()}
                                </p>
                                {log.notes ? (
                                    <p className="text-xs text-muted-foreground">Note: {log.notes}</p>
                                ) : null}
                            </div>
                            <div className="text-sm text-muted-foreground text-right">
                                <div className="font-semibold text-foreground">Location: {log.warehouseName}</div>
                                <div>by {log.byDisplayName}</div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
