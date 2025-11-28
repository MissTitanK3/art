"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useShipStore } from "@/store/useShipStore";
import { toast } from "sonner";

export function ShipCustomization() {
    const customization = useShipStore((s) => s.customization);
    const setCustomization = useShipStore((s) => s.setCustomization);
    const [name, setName] = React.useState(customization.name || "");
    const [color, setColor] = React.useState(customization.color || "#ffffff");

    const handleSave = () => {
        setCustomization({ ...customization, name, color });
        // In a real app, we would also save to the server here
        toast.success("Ship customization saved");
    };

    return (
        <div className="space-y-4 p-4 border rounded-md bg-card">
            <h3 className="text-lg font-medium">Ship Customization</h3>
            <div className="space-y-2">
                <Label htmlFor="ship-name">Ship Name</Label>
                <Input
                    id="ship-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter ship name"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="ship-color">Hull Color</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="ship-color"
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-12 h-10 p-1"
                    />
                    <span className="text-sm text-muted-foreground">{color}</span>
                </div>
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
        </div>
    );
}
