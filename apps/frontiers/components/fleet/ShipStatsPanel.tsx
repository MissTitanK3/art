"use client";

import * as React from "react";
import { useShipStore } from "@/store/useShipStore";

function StatBar({ label, value, colorClass }: { label: string; value: number; colorClass?: string }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="h-2 w-full rounded bg-muted overflow-hidden border border-border/50">
                <div
                    className={`h-full ${colorClass || "bg-primary"}`}
                    style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                />
            </div>
        </div>
    );
}

export function ShipStatsPanel() {
    const condition = useShipStore((s) => s.ship_condition);
    const morale = useShipStore((s) => s.crew_morale);
    const fatigue = useShipStore((s) => s.fatigue);

    return (
        <div className="space-y-4 p-4 border rounded-md bg-card">
            <h3 className="text-lg font-medium">Ship Status</h3>

            <StatBar
                label="Hull Condition"
                value={condition}
                colorClass={condition < 30 ? "bg-red-500" : "bg-green-500"}
            />

            <StatBar
                label="Crew Morale"
                value={morale}
                colorClass={morale < 30 ? "bg-red-500" : "bg-blue-500"}
            />

            <StatBar
                label="Fatigue"
                value={fatigue}
                colorClass={fatigue > 70 ? "bg-red-500" : "bg-yellow-500"}
            />
        </div>
    );
}
