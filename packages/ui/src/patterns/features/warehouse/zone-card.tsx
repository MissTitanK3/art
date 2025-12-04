import { Control, useFieldArray } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Badge } from "@workspace/ui/primitives/badge";
import { Button } from "@workspace/ui/primitives/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@workspace/ui/primitives/form";
import { Input } from "@workspace/ui/primitives/input";
import { WarehouseFormValues } from "./types";

const generateId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function ZoneCard({
  zoneId,
  index,
  canRemove,
  removeZone,
  control,
  onZoneDeleteAttempt,
  onBinDeleteAttempt,
}: {
  zoneId: string;
  index: number;
  canRemove: boolean;
  removeZone: (index: number) => void;
  control: Control<WarehouseFormValues>;
  onZoneDeleteAttempt: (zoneId: string) => boolean;
  onBinDeleteAttempt: (binId: string) => boolean;
}) {
  const {
    fields: binFields,
    append: appendBin,
    remove: removeBin,
  } = useFieldArray({
    control,
    name: `zones.${index}.bins` as const,
  });

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">
          Zone {index + 1}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{binFields.length} bins</Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canRemove}
            onClick={() => {
              if (!canRemove) return;
              if (onZoneDeleteAttempt(zoneId)) {
                removeZone(index);
              }
            }}
          >
            Remove
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            name={`zones.${index}.name`}
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zone name</FormLabel>
                <FormControl>
                  <Input placeholder="Garage, hall closet…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name={`zones.${index}.sortOrder`}
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort order (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value ? Number(value) : null);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Matches the steward’s pull path.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          {binFields.map((bin, binIndex) => (
            <div
              key={bin.id}
              className="grid gap-4 rounded-lg border p-3 md:grid-cols-[1fr_auto]"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  name={`zones.${index}.bins.${binIndex}.label`}
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bin label</FormLabel>
                      <FormControl>
                        <Input placeholder="Shelf B, Tote 2…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={`zones.${index}.bins.${binIndex}.sortOrder`}
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={field.value ?? ""}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value ? Number(value) : null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (onBinDeleteAttempt(bin.id)) {
                      removeBin(binIndex);
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendBin({
                id: generateId(),
                label: `Bin ${binFields.length + 1}`,
              })
            }
          >
            Add bin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
