import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Shield } from "lucide-react";

export function SafetyCard() {
  const rules = [
    {
      title: "No PII",
      detail:
        "Warehouses only store profiles.display_name. Share instructions over Signal when needed.",
    },
    {
      title: "Admin-only notes",
      detail: "Quick notes stay private to Admin Dispatchers.",
    },
    {
      title: "Region isolation",
      detail:
        "Every record is scoped to the current region_id. Nothing syncs across regions.",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Safety guardrails</CardTitle>
        <CardDescription>
          Hard constraints for the decentralized network.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.title}
            className="flex items-start gap-3 rounded-lg border p-3"
          >
            <Shield className="mt-1 size-4 text-primary" />
            <div>
              <p className="font-medium">{rule.title}</p>
              <p className="text-sm text-muted-foreground">{rule.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
