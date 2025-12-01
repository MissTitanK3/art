import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Package, CheckCircle2, ClipboardCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type PickListItem = {
  id: string;
  item_name: string;
  quantity: number;
  confirmed_at: string;
};

export function WarehouseCard() {
  const [pickLists, setPickLists] = useState<PickListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPickLists() {
      try {
        const res = await fetch("/api/warehouse/pick-list/confirmed?limit=5");
        const data = await res.json();
        if (data.pickLists) {
          setPickLists(data.pickLists);
        }
      } catch (e) {
        console.error("Failed to fetch pick lists", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPickLists();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Warehouse Status</CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : pickLists.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
              <ClipboardCheck className="h-4 w-4" />
              <span className="text-sm font-medium">
                Recent Confirmed Picks
              </span>
            </div>
            <div className="space-y-2">
              {pickLists.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0"
                >
                  <span>{item.item_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.confirmed_at
                        ? formatDistanceToNow(new Date(item.confirmed_at), {
                            addSuffix: true,
                          })
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm">No recent confirmed picks</p>
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full mt-4">
          Manage Inventory
        </Button>
      </CardContent>
    </Card>
  );
}
