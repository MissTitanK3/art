import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { HeartHandshake, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Need = {
  id: number;
  category: string;
  description: string;
  urgency: string;
  location: { label: string } | null;
  updated_at: string;
};

export function NeedsCard() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNeeds() {
      try {
        const res = await fetch("/api/meet-a-need?limit=5");
        const data = await res.json();
        if (data.needs) {
          setNeeds(data.needs);
        }
      } catch (e) {
        console.error("Failed to fetch needs", e);
      } finally {
        setLoading(false);
      }
    }
    fetchNeeds();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Meet a Need</CardTitle>
        <HeartHandshake className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : needs.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {needs.length} Opportunities Match You
              </span>
            </div>
            <div className="space-y-3">
              {needs.map((need) => (
                <div
                  key={need.id}
                  className="flex flex-col gap-1 p-2 bg-muted/50 rounded-md"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">{need.category}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {need.updated_at
                        ? formatDistanceToNow(new Date(need.updated_at), {
                            addSuffix: true,
                          })
                        : "Unknown"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {need.location?.label || "Unknown Location"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
            <HeartHandshake className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No matching needs right now</p>
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full mt-4">
          Browse All Needs
        </Button>
      </CardContent>
    </Card>
  );
}
