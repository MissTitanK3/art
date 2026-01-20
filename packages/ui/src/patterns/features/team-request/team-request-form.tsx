"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Label } from "@workspace/ui/primitives/label";
import { Input } from "@workspace/ui/primitives/input";
import { Textarea } from "@workspace/ui/primitives/textarea";
import { Button } from "@workspace/ui/primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Switch } from "@workspace/ui/primitives/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/primitives/collapsible";
import { DateTimePicker } from "@workspace/ui/patterns/common/date-time-picker";
import { SelectableCard } from "@workspace/ui/patterns/common/selectable-card";
import { SelectableRoleCard } from "@workspace/ui/patterns/common/selectable-role-card";
import DistanceUnitToggle from "@workspace/ui/patterns/common/distance-unit-toggle";
import { US_STATES } from "@workspace/ui/lib/constants/states";
import { humanize } from "@workspace/ui/lib/utils";
import { resolveLocationInfo } from "@workspace/ui/lib/location-resolver";
import { kmToMi, miToKm } from "@workspace/ui/lib/distance";
import { usePreferencesStore } from "@workspace/store/usePreferencesStore";
import {
  ACTION_PRESETS_GROUPED,
  FIELD_ROLE_DETAILS,
  TEAM_CONFIG_PRESETS,
} from "@workspace/store/types/roles.ts";
import type { DispatchType } from "@workspace/store/types/dispatch.ts";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import { makeDispatchSubmission } from "@workspace/store/utils/generator";

type StepData = {
  basicInfo?: {
    location_label?: string;
    location?: { lat: number; lng: number };
    state?: string;
    type?: DispatchType;
    visibility_radius_km?: number;
    date_of_event?: string;
  };
  eventType?: keyof typeof TEAM_CONFIG_PRESETS;
  actions?: {
    intended_action_preset?: string;
    intended_actions?: string[];
    intended_action_notes?: string;
    intended_actions_custom?: string;
  };
  rolesNeeded?: {
    required_roles?: string[];
    required_roles_by_type?: Partial<Record<string, number>>;
  };
  training?: boolean;
};

interface TeamRequestFormProps {
  onSubmitted?: (submission: DispatchSubmission) => void;
  onCreateSubmission: (submission: DispatchSubmission) => void | Promise<void>;
  initialData?: StepData;
  onCancel?: () => void;
}

const RESPONSE_TYPES: DispatchType[] = [
  "rapid_response",
  "planned_event",
  "training",
  "community_aid",
  "technical_aid",
  "other",
];

const DEFAULT_RADIUS_KM = 9.66; // roughly 6 miles

export default function TeamRequestForm({
  onSubmitted,
  onCreateSubmission,
  initialData,
  onCancel,
}: TeamRequestFormProps) {
  const unit = usePreferencesStore((s) => s.distanceUnit);
  const lastUnitRef = useRef(unit);
  const initialRadiusKm =
    initialData?.basicInfo?.visibility_radius_km ?? DEFAULT_RADIUS_KM;
  const [locationLabel, setLocationLabel] = useState(
    initialData?.basicInfo?.location_label ?? ""
  );
  const [responseType, setResponseType] = useState<DispatchType>(
    initialData?.basicInfo?.type ?? "rapid_response"
  );
  const [stateCode, setStateCode] = useState(
    initialData?.basicInfo?.state ?? ""
  );
  const [eventType, setEventType] = useState<
    keyof typeof TEAM_CONFIG_PRESETS | undefined
  >(initialData?.eventType);
  const [dateOfEvent, setDateOfEvent] = useState<string | undefined>(
    initialData?.basicInfo?.date_of_event ?? new Date().toISOString()
  );
  const [location] = useState(initialData?.basicInfo?.location);
  const [radiusInput, setRadiusInput] = useState<number>(() => {
    const base = unit === "mi" ? kmToMi(initialRadiusKm) : initialRadiusKm;
    return Math.round(base * 100) / 100;
  });
  const [resolvedOnce, setResolvedOnce] = useState(false);
  const [showDetails, setShowDetails] = useState(
    Boolean(
      initialData?.actions?.intended_actions?.length ||
        initialData?.rolesNeeded?.required_roles?.length
    )
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [actions, setActions] = useState<{
    intended_actions: string[];
    intended_action_notes?: string;
    intended_actions_custom?: string;
  }>({
    intended_actions: initialData?.actions?.intended_actions ?? [],
    intended_action_notes: initialData?.actions?.intended_action_notes ?? "",
    intended_actions_custom:
      initialData?.actions?.intended_actions_custom ?? "",
  });
  const [actionsDirty, setActionsDirty] = useState(
    Boolean(initialData?.actions?.intended_actions?.length)
  );
  const [roles, setRoles] = useState<{
    required_roles: string[];
    required_roles_by_type: Partial<Record<string, number>>;
  }>({
    required_roles: initialData?.rolesNeeded?.required_roles ?? [],
    required_roles_by_type:
      initialData?.rolesNeeded?.required_roles_by_type ?? {},
  });
  const [rolesDirty, setRolesDirty] = useState(
    Boolean(initialData?.rolesNeeded?.required_roles?.length)
  );
  const [training, setTraining] = useState(initialData?.training ?? false);

  // Convert radius when preference changes
  useEffect(() => {
    if (unit !== lastUnitRef.current) {
      setRadiusInput((prev) => {
        const km = lastUnitRef.current === "mi" ? miToKm(prev) : prev;
        const converted = unit === "mi" ? kmToMi(km) : km;
        return Math.round(converted * 100) / 100;
      });
      lastUnitRef.current = unit;
    }
  }, [unit]);

  // Resolve state + friendly label from coordinates (when provided)
  useEffect(() => {
    if (!location) return;
    if (resolvedOnce) return;
    let active = true;
    resolveLocationInfo(location.lat, location.lng).then((info) => {
      if (!active) return;
      const resolvedStateCode =
        info.stateCode && info.stateCode.length === 2
          ? info.stateCode.toUpperCase()
          : info.state
            ? US_STATES.find(
                (s) => s.name.toLowerCase() === info.state?.toLowerCase()
              )?.code
            : undefined;
      const locality = info.city ?? info.county ?? null;
      const stateDisplay = resolvedStateCode ?? info.state ?? "";
      const resolvedLabel =
        locality && stateDisplay
          ? `${locality}, ${stateDisplay}`
          : (locality ??
            `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);

      setLocationLabel((prev) => (prev?.trim()?.length ? prev : resolvedLabel));
      setStateCode((prev) => (prev?.length ? prev : (resolvedStateCode ?? "")));
      setResolvedOnce(true);
    });
    return () => {
      active = false;
    };
  }, [location, resolvedOnce]);

  // Apply presets when event type changes (unless user modified)
  useEffect(() => {
    if (!eventType) return;
    const preset = TEAM_CONFIG_PRESETS[eventType];
    if (!actionsDirty) {
      setActions((prev) => ({
        ...prev,
        intended_actions: preset.actions,
      }));
    }
    if (!rolesDirty) {
      setRoles({
        required_roles: Object.keys(preset.roles),
        required_roles_by_type: preset.roles,
      });
    }
  }, [actionsDirty, rolesDirty, eventType]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!locationLabel.trim())
      next.location_label = "Location label is required.";
    if (!stateCode.trim()) next.state = "State is required.";
    if (!responseType) next.type = "Select a response type.";
    if (!dateOfEvent) next.date_of_event = "Event time is required.";
    if (!eventType)
      next.eventType = "Choose an event type to set expectations.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const normalizeRoleCounts = (
    counts?: Partial<Record<string, number>>
  ): Record<string, number> | undefined => {
    if (!counts) return undefined;
    const entries = Object.entries(counts).filter(
      ([, value]) => typeof value === "number"
    );
    if (entries.length === 0) return undefined;
    return Object.fromEntries(entries) as Record<string, number>;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const preset = eventType ? TEAM_CONFIG_PRESETS[eventType] : undefined;
    const radiusKm = unit === "mi" ? miToKm(radiusInput) : radiusInput;
    const normalizedRoleCounts = normalizeRoleCounts(
      roles.required_roles_by_type
    );
    const presetRoleCounts = normalizeRoleCounts(preset?.roles);

    const submission = makeDispatchSubmission({
      type: responseType,
      date_of_event: dateOfEvent,
      state: stateCode,
      location_label: locationLabel.trim(),
      location,
      visibility_radius_km: radiusKm,
      intended_action_preset: eventType,
      intended_actions:
        actions.intended_actions.length > 0
          ? actions.intended_actions
          : preset?.actions,
      intended_action_notes: actions.intended_action_notes?.trim()
        ? actions.intended_action_notes.trim()
        : undefined,
      intended_actions_custom: actions.intended_actions_custom?.trim()
        ? actions.intended_actions_custom.trim()
        : undefined,
      required_roles:
        roles.required_roles.length > 0
          ? roles.required_roles
          : preset
            ? Object.keys(preset.roles)
            : undefined,
      required_roles_by_type:
        normalizedRoleCounts ?? presetRoleCounts,
      training,
    });

    try {
      await onCreateSubmission(submission);
      toast.success("Dispatch request submitted", {
        description:
          "We captured the essentials. You can refine details later.",
      });
      onSubmitted?.(submission);
    } catch (error: any) {
      toast.error("Failed to submit dispatch", {
        description: error?.message ?? "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderedEventTypes = useMemo(
    () =>
      Object.keys(TEAM_CONFIG_PRESETS).map((type) => ({
        key: type as keyof typeof TEAM_CONFIG_PRESETS,
        label: humanize(type),
      })),
    []
  );

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Essentials</CardTitle>
          <p className="text-sm text-muted-foreground">
            We just need the basics to spin up a dispatch. Everything else can
            be edited later.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 w-full">
          <div className="grid gap-4 md:grid-cols-1">
            <div className="w-full flex flex-col md:flex-row gap-4">
              <div className="w-2/3">
                <Label className="flex items-center gap-2 w-full mb-2">
                  Location label <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={locationLabel}
                  aria-invalid={Boolean(errors.location_label)}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  placeholder="Mission District, SF"
                />
                {errors.location_label && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.location_label}
                  </p>
                )}
                {location && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Coordinates from map: {location.lat.toFixed(4)},{" "}
                    {location.lng.toFixed(4)}
                  </p>
                )}
              </div>
              <div className="w-1/3">
                <Label className="flex items-center gap-2 mb-2 w-full">
                  Response type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={responseType}
                  onValueChange={(v) => setResponseType(v as DispatchType)}
                >
                  <SelectTrigger aria-invalid={Boolean(errors.type)}>
                    <SelectValue placeholder="Select response type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESPONSE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {humanize(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-xs text-destructive mt-1">{errors.type}</p>
                )}
              </div>
              <div className="w-1/3">
                <Label className="flex items-center gap-2 mb-2 w-full">
                  State <span className="text-destructive">*</span>
                </Label>
                <Select value={stateCode} onValueChange={setStateCode}>
                  <SelectTrigger aria-invalid={Boolean(errors.state)}>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.state}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="w-full">
                <DateTimePicker
                  label="Date of Event"
                  value={dateOfEvent}
                  onChange={setDateOfEvent}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  For planned events, set in the future. Defaults to now.
                </p>
                {errors.date_of_event && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.date_of_event}
                  </p>
                )}
              </div>

              <div className="w-full"></div>
            </div>
          </div>

          <div className="w-full">
            <Label className="flex items-center gap-2 mb-2 w-full">
              Event type <span className="text-destructive">*</span>
            </Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {renderedEventTypes.map((item) => (
                <Button
                  key={item.key}
                  type="button"
                  variant={eventType === item.key ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setEventType(item.key)}
                  aria-pressed={eventType === item.key}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            {errors.eventType && (
              <p className="text-xs text-destructive mt-1">
                {errors.eventType}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4 w-full">
            <div>
              <Label className="text-base">Training dispatch</Label>
              <p className="text-xs text-muted-foreground">
                Mark if this is a drill or training scenario.
              </p>
            </div>
            <Switch
              checked={training}
              onCheckedChange={setTraining}
              aria-label="Mark as training dispatch"
            />
          </div>
        </CardContent>
      </Card>

      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Add detail (optional)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fine-tune dispatch expectations. Skip for now if you&apos;re in
                a rush.
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" type="button">
                {showDetails ? "Hide" : "Add details"}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Intended actions</Label>
                  <span className="text-xs text-muted-foreground">
                    Tap to select. Defaults to preset after choosing event type.
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(ACTION_PRESETS_GROUPED).map(
                    ([group, items]) => (
                      <div key={group} className="space-y-2">
                        <p className="text-sm font-semibold">{group}</p>
                        <div className="space-y-2">
                          {items.map((action) => (
                            <SelectableCard
                              key={action}
                              label={action}
                              selected={actions.intended_actions.includes(
                                action
                              )}
                              onToggle={() => {
                                setActionsDirty(true);
                                setActions((prev) => {
                                  const selected = prev.intended_actions;
                                  const next = selected.includes(action)
                                    ? selected.filter((a) => a !== action)
                                    : [...selected, action];
                                  return { ...prev, intended_actions: next };
                                });
                              }}
                              color="emerald"
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="mb-1 block">Notes</Label>
                    <Textarea
                      value={actions.intended_action_notes}
                      onChange={(e) => {
                        setActionsDirty(true);
                        setActions((prev) => ({
                          ...prev,
                          intended_action_notes: e.target.value,
                        }));
                      }}
                      placeholder="Add context or clarifications..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Custom action</Label>
                    <Input
                      value={actions.intended_actions_custom}
                      onChange={(e) => {
                        setActionsDirty(true);
                        setActions((prev) => ({
                          ...prev,
                          intended_actions_custom: e.target.value,
                        }));
                      }}
                      placeholder="Describe a custom plan..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Roles needed</Label>
                    <p className="text-xs text-muted-foreground">
                      Suggested counts populate from the event type preset.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Optional
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {FIELD_ROLE_DETAILS.sort((a, b) =>
                    a.role.localeCompare(b.role)
                  ).map((r) => (
                    <SelectableRoleCard
                      key={r.role}
                      role={r.role}
                      label={humanize(r.role)}
                      selected={roles.required_roles.includes(r.role)}
                      suggested={eventType ? rolesDirty === false : false}
                      count={roles.required_roles_by_type[r.role]}
                      onToggle={() => {
                        setRolesDirty(true);
                        setRoles((prev) => {
                          const already = prev.required_roles.includes(r.role);
                          if (already) {
                            const nextCounts = {
                              ...prev.required_roles_by_type,
                            };
                            delete nextCounts[r.role];
                            return {
                              required_roles: prev.required_roles.filter(
                                (x) => x !== r.role
                              ),
                              required_roles_by_type: nextCounts,
                            };
                          }
                          return {
                            required_roles: [...prev.required_roles, r.role],
                            required_roles_by_type: prev.required_roles_by_type,
                          };
                        });
                      }}
                      onCountChange={(val) => {
                        setRolesDirty(true);
                        setRoles((prev) => {
                          const nextCounts = { ...prev.required_roles_by_type };
                          if (val === undefined) {
                            delete nextCounts[r.role];
                          } else {
                            nextCounts[r.role] = val;
                          }
                          return {
                            ...prev,
                            required_roles_by_type: nextCounts,
                          };
                        });
                      }}
                      color="amber"
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Visibility radius ({unit})</Label>
                    <DistanceUnitToggle />
                  </div>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={radiusInput}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setRadiusInput(
                        Number.isNaN(val) ? 0 : Math.round(val * 100) / 100
                      );
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used to alert nearby responders. Defaults to ~6 miles.
                  </p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit & Start Dispatch"}
        </Button>
      </div>
    </form>
  );
}
