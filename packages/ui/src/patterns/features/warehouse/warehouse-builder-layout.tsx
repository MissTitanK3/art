import {
  UseFormReturn,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from "react-hook-form";
import { PageHeader } from "@workspace/ui/patterns/common/page-header";
import { Button } from "@workspace/ui/primitives/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/primitives/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@workspace/ui/primitives/form";
import { Input } from "@workspace/ui/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Textarea } from "@workspace/ui/primitives/textarea";
import { VisibilitySelector } from "@workspace/ui/patterns/features/permissions/visibility-selector";
import { VisibilityScope } from "@workspace/store/utils/permissions/types";
import { ZoneCard } from "./zone-card";
import { PlanPreviewCard } from "./plan-preview-card";
import {
  WarehouseFormValues,
  WarehouseRecord,
  capabilityOptions,
  regionZoneOptions,
  siteTypeOptions,
  capacityOptions,
  urbanTypes,
  MAX_ZONES,
} from "./types";

const NEW_WAREHOUSE_VALUE = "__new-warehouse";

export interface WarehouseBuilderLayoutProps {
  stewardName: string;
  stewardLabel: string;
  savedWarehouses: WarehouseRecord[];
  syncing: boolean;
  editingWarehouseId: string | null;
  form: UseFormReturn<WarehouseFormValues>;
  zoneFields: FieldArrayWithId<WarehouseFormValues, "zones", "id">[];
  appendZone: UseFieldArrayAppend<WarehouseFormValues, "zones">;
  removeZone: UseFieldArrayRemove;
  watchedPlan: WarehouseFormValues;
  visibility: VisibilityScope;

  // Handlers
  onSubmit: (values: WarehouseFormValues) => Promise<void>;
  handleSelectWarehouse: (id: string) => void;
  startNewWarehouse: () => void;
  useMyNameForSteward: () => void;
  ensureZoneRemovalSafe: (id: string) => boolean;
  ensureBinRemovalSafe: (id: string) => boolean;
  setVisibility: (scope: VisibilityScope) => void;
  setShowInviteModal: (show: boolean) => void;
}

export function WarehouseBuilderLayout({
  stewardName,
  stewardLabel,
  savedWarehouses,
  syncing,
  editingWarehouseId,
  form,
  zoneFields,
  appendZone,
  removeZone,
  watchedPlan,
  visibility,
  onSubmit,
  handleSelectWarehouse,
  startNewWarehouse,
  useMyNameForSteward,
  ensureZoneRemovalSafe,
  ensureBinRemovalSafe,
  setVisibility,
  setShowInviteModal,
}: WarehouseBuilderLayoutProps) {
  return (
    <div className="space-y-8 px-4 py-8">
      <PageHeader
        title="Warehouse Builder"
        description="Configure a new warehouse or edit an existing one."
        actions={
          <Button
            size="sm"
            type="button"
            onClick={() => form.handleSubmit(onSubmit)()}
            disabled={!form.formState.isValid || syncing}
          >
            {syncing ? "Syncing…" : "Save warehouse"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              4-step flow: context → zones → bins → admin notes. Set the steward
              you are configuring for — currently{" "}
              <span className="font-semibold">{stewardLabel}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3 lg:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold">Active steward</p>
                <p className="text-sm text-muted-foreground">
                  {stewardLabel} —{" "}
                  {editingWarehouseId
                    ? "Editing existing warehouse"
                    : "Drafting a new warehouse"}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Select
                  value={editingWarehouseId ?? NEW_WAREHOUSE_VALUE}
                  onValueChange={handleSelectWarehouse}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Load saved warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NEW_WAREHOUSE_VALUE}>
                      New warehouse
                    </SelectItem>
                    {savedWarehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.stewardDisplayName ?? warehouse.displayName}{" "}
                        — {warehouse.regionZone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={startNewWarehouse}
                  >
                    Start new
                  </Button>
                  {stewardName ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={useMyNameForSteward}
                    >
                      Use my display name
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <section className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="stewardDisplayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Steward Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Appears on pick lists and movement logs. Type any
                          steward’s display name or use the shortcut above if
                          you are the steward.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="regionZone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region zone</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select zone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regionZoneOptions.map((zone) => (
                              <SelectItem key={zone} value={zone}>
                                {zone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Matches dispatcher routing map.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urbanType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urban type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select context" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {urbanTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Helps dispatch estimate travel time.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="siteType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pick the host type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {siteTypeOptions.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxCapacityRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity rating</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {capacityOptions.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          High-level load tolerance (no square footage).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem className="md:col-span-2 space-y-2">
                    <FormLabel>Visibility</FormLabel>
                    <VisibilitySelector
                      value={visibility}
                      onChange={setVisibility}
                      onInviteUsers={() => setShowInviteModal(true)}
                    />
                    <FormDescription>
                      Choose who can view or manage this warehouse. Inviting
                      users opens the share modal.
                    </FormDescription>
                  </FormItem>
                </section>

                <FormField
                  control={form.control}
                  name="capabilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capabilities</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {capabilityOptions.map((capability) => {
                          const active = field.value?.includes(
                            capability.value
                          );
                          return (
                            <Button
                              key={capability.value}
                              type="button"
                              variant={active ? "default" : "outline"}
                              size="sm"
                              className="rounded-full"
                              onClick={() => {
                                if (!field.value) {
                                  field.onChange([capability.value]);
                                } else if (active) {
                                  field.onChange(
                                    field.value.filter(
                                      (val) => val !== capability.value
                                    )
                                  );
                                } else {
                                  field.onChange([
                                    ...field.value,
                                    capability.value,
                                  ]);
                                }
                              }}
                            >
                              {capability.label}
                            </Button>
                          );
                        })}
                      </div>
                      <FormDescription>
                        Toggle only what stewards can actually support in the
                        next 48h.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold">Zones & bins</h3>
                      <p className="text-sm text-muted-foreground">
                        Keep zones under five and bins actionable. Sort order
                        matches the pull path.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={zoneFields.length >= MAX_ZONES}
                      onClick={() =>
                        appendZone({
                          id: crypto.randomUUID(),
                          name: `Zone ${zoneFields.length + 1}`,
                          sortOrder: zoneFields.length + 1,
                          bins: [
                            {
                              id: crypto.randomUUID(),
                              label: "Shelf A",
                              sortOrder: 1,
                            },
                            {
                              id: crypto.randomUUID(),
                              label: "Tote 1",
                              sortOrder: 2,
                            },
                          ],
                        })
                      }
                    >
                      Add zone
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {zoneFields.map((zone, index) => (
                      <ZoneCard
                        key={zone.id}
                        zoneId={zone.id}
                        index={index}
                        canRemove={zoneFields.length > 1}
                        removeZone={removeZone}
                        control={form.control}
                        onZoneDeleteAttempt={ensureZoneRemovalSafe}
                        onBinDeleteAttempt={ensureBinRemovalSafe}
                      />
                    ))}
                  </div>
                </section>

                <FormField
                  control={form.control}
                  name="quickNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin-only quick notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Porch pickup, dogs present, steep driveway…"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Only Admin Dispatchers see these notes. Volunteers only
                        see generated pull instructions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      startNewWarehouse();
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid || syncing}
                  >
                    {syncing ? "Syncing…" : "Save warehouse"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <PlanPreviewCard plan={watchedPlan} stewardName={stewardLabel} />
        </div>
      </div>
    </div>
  );
}
