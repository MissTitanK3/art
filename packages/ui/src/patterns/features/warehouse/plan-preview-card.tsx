import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/primitives/table";
import { WarehouseFormValues, siteTypeOptions } from "./types";

export function PlanPreviewCard({
  plan,
  stewardName,
}: {
  plan: WarehouseFormValues;
  stewardName: string;
}) {
  const binPreview = (plan?.zones ?? [])
    .flatMap((zone) =>
      zone.bins.map((bin) => ({
        zoneName: zone.name,
        label: bin.label,
      }))
    )
    .slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live plan preview</CardTitle>
        <CardDescription>
          Updates as you type. Use it to brief dispatch or confirm over Signal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Steward:{" "}
            <span className="font-medium text-foreground">{stewardName}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Zones: {plan?.zones?.length ?? 0} | Bins:{" "}
            {plan?.zones?.reduce((acc, zone) => acc + zone.bins.length, 0) ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">
            Site type:{" "}
            {siteTypeOptions.find((opt) => opt.value === plan?.siteType)
              ?.label ?? "N/A"}
          </p>
        </div>
        {binPreview.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead>
                <TableHead>Bin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {binPreview.map((bin) => (
                <TableRow key={`${bin.zoneName}-${bin.label}`}>
                  <TableCell className="font-medium">{bin.zoneName}</TableCell>
                  <TableCell>{bin.label}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add bins to see quick pick-list instructions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
