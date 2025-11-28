"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { useShipStore } from "@/store/useShipStore";
import { toast } from "sonner";

export function ResupplyInterface() {
    const resupply = useShipStore((s) => s.resupply);

    return (
        <div className="space-y-4 p-4 border rounded-md bg-card">
            <h3 className="text-lg font-medium">Resupply Station</h3>
            <div className="flex gap-2">
                <Button onClick={() => {
                    resupply("fuel", 100);
                    toast.success("Refueled");
                }}>
                    Refuel
                </Button>
                <Button onClick={() => {
                    resupply("supplies", 50);
                    toast.success("Resupplied");
                }}>
                    Restock Supplies
                </Button>
            </div>
        </div>
    );
}
