"use client";
import { Button } from "@workspace/ui/primitives/button";
import { useShipStore } from "@/store/useShipStore";
import { toast } from "sonner";
export function RepairInterface() {
  const condition = useShipStore((s) => s.ship_condition);
  const setCondition = useShipStore((s) => s.setCondition);
  const componentIntegrity = useShipStore((s) => s.component_integrity);
  const repairComponent = useShipStore((s) => s.repairComponent);
  const handleHullRepair = () => {
    // In real app, check resources
    setCondition(Math.min(100, condition + 10));
    toast.success("Hull repaired");
  };
  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <h3 className="text-lg font-medium">Repair Station</h3>
      <div className="flex items-center justify-between">
        <span>Hull Condition: {condition}%</span>
        <Button onClick={handleHullRepair} disabled={condition >= 100}>
          Repair Hull (+10%)
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Components</h4>
        {Object.entries(componentIntegrity).length === 0 && (
          <div className="text-sm text-muted-foreground">
            No damaged components detected.
          </div>
        )}
        {Object.entries(componentIntegrity).map(([id, integrity]) => (
          <div key={id} className="flex items-center justify-between text-sm">
            <span>{id}</span>
            <div className="flex items-center gap-2">
              <span>{integrity}%</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  repairComponent(id, 10);
                  toast.success(`Repaired ${id}`);
                }}
                disabled={integrity >= 100}
              >
                Repair
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
