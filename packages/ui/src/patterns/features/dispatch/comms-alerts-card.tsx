"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/primitives/card";
import { Input } from "@workspace/ui/primitives/input";
import { Textarea } from "@workspace/ui/primitives/textarea";
import { Label } from "@workspace/ui/primitives/label";
import { Button } from "@workspace/ui/primitives/button";
import { Checkbox } from "@workspace/ui/primitives/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/primitives/drawer";
import { useLocalStorage } from "@workspace/ui/hooks/use-local-storage";

type Props = {
  onLog?: (entry: {
    message: string;
    message_type: "Routine" | "Priority" | "Emergency";
    importance: "Low" | "Normal" | "High";
  }) => void | Promise<void>;
  alerts?: { id: string; direction: string; description: string }[];
  onCreateAlert?: (input: {
    direction: string;
    description: string;
  }) => Promise<string> | string | void;
  onUpdateAlert?: (
    id: string,
    patch: Partial<{ direction: string; description: string }>
  ) => Promise<void> | void;
  onDeleteAlert?: (id: string) => Promise<void> | void;
  storageKey?: string; // legacy localStorage fallback if CRUD not provided
};

type CustomAlert = { id: string; direction: string; description: string };
type PresetAlert = {
  id: string;
  label: string;
  direction: string;
  description: string;
  group: "basic" | "code";
};

const NOOP_STORAGE: Storage = {
  get length() {
    return 0;
  },
  clear() {
    /* noop */
  },
  getItem() {
    return null;
  },
  key() {
    return null;
  },
  removeItem() {
    /* noop */
  },
  setItem() {
    /* noop */
  },
};

const BASIC_PRESETS: readonly PresetAlert[] = [
  {
    id: "basic-consolidate",
    group: "basic",
    label: "Consolidate ×3",
    direction: "Consolidate ×3",
    description:
      'Call it three times on the net: "Consolidate, Consolidate, Consolidate — link up at {location}." Assign a lead to confirm headcount and report when the rally is complete.',
  },
  {
    id: "basic-break",
    group: "basic",
    label: "Break ×3 (urgent)",
    direction: "Break ×3 (urgent)",
    description:
      'Announce "Break, Break, Break — priority traffic" to seize the channel, then deliver the message and direct a specific unit to acknowledge so the net stays orderly.',
  },
  {
    id: "basic-silence",
    group: "basic",
    label: "Radio silence",
    direction: "Radio silence",
    description:
      'Order "All stations, radio silence — traffic pending at {location}." Name who can break the silence, note the trigger that will lift it, and log the time it went into effect.',
  },
];

const CODE_PRESETS: readonly PresetAlert[] = [
  {
    id: "code-black",
    group: "code",
    label: "Code Black",
    direction: "Code Black",
    description:
      'Call twice with the location: "Code Black, Code Black — {location}." Order immediate shelter-in-place, lock doors, move to hard cover, and await law-enforcement confirmation before clearing.',
  },
  {
    id: "code-blue",
    group: "code",
    label: "Code Blue",
    direction: "Code Blue {Location}",
    description:
      'Transmit "Code Blue — {location}." Immediately designate a 911 caller, assign airway/bleeding control, deploy an AED runner, and stage an escort for arriving responders.',
  },
  {
    id: "code-silver",
    group: "code",
    label: "Code Silver",
    direction: "Code Silver {Location}",
    description:
      'Announce "Code Silver — {location}." Describe the individual, establish a buffer zone, keep eyes-on from cover, and relay behavior until security relieves you.',
  },
  {
    id: "code-red",
    group: "code",
    label: "Code Red",
    direction: "Code Red {Avoid Location}",
    description:
      'Broadcast "Code Red — avoid {location}." Confirm alarms are pulled, direct teams to evac routes, and broadcast wind/exposure notes so units stay clear of smoke and flame.',
  },
  {
    id: "code-gold",
    group: "code",
    label: "Code Gold",
    direction: "Code Gold {Location}",
    description:
      'State "Code Gold — {location}." Establish a 300 ft (100 m) exclusion zone, stop radios within line-of-sight if advised, and log anyone entering or exiting the cordon.',
  },
  {
    id: "code-green",
    group: "code",
    label: "Code Green",
    direction: "Code Green {All Clear}",
    description:
      'Declare "Code Green — all clear." Direct teams to resume prior assignments, reset accountability, and note any zones that remain restricted before full reopening.',
  },
];

const ALL_PRESETS: readonly PresetAlert[] = [...BASIC_PRESETS, ...CODE_PRESETS];

const EXAMPLES: CustomAlert[] = BASIC_PRESETS.map((preset) => ({
  id: preset.id,
  direction: preset.direction,
  description: preset.description,
}));

export function CommsAlertsCard({
  alerts: extAlerts,
  onCreateAlert,
  onUpdateAlert,
  onDeleteAlert,
  storageKey = "comms-alerts:default",
}: Props): React.ReactElement {
  const shouldPersist = Boolean(storageKey);
  const [localAlerts, setLocalAlerts] = useLocalStorage<CustomAlert[]>(
    storageKey || "__comms-alerts__noop__",
    EXAMPLES,
    {
      sync: shouldPersist,
      storage: shouldPersist ? undefined : NOOP_STORAGE,
      serialize: (value) => JSON.stringify(value),
      deserialize: (raw) => {
        try {
          const parsed = JSON.parse(raw) as unknown;
          return Array.isArray(parsed)
            ? (parsed as CustomAlert[])
            : EXAMPLES.map((example) => ({ ...example }));
        } catch {
          return EXAMPLES.map((example) => ({ ...example }));
        }
      },
      migrate: (payload) => {
        if (Array.isArray(payload)) {
          return payload
            .map((entry) => {
              if (!entry || typeof entry !== "object") return undefined;
              const candidate = entry as Partial<CustomAlert>;
              const direction =
                typeof candidate.direction === "string"
                  ? candidate.direction
                  : "";
              const description =
                typeof candidate.description === "string"
                  ? candidate.description
                  : "";
              const id =
                typeof candidate.id === "string" && candidate.id
                  ? candidate.id
                  : typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `alert-${Math.random().toString(36).slice(2, 11)}`;
              return { id, direction, description } as CustomAlert;
            })
            .filter((entry): entry is CustomAlert => Boolean(entry));
        }
        return EXAMPLES.map((example) => ({ ...example }));
      },
    }
  );
  const useExternal = Array.isArray(extAlerts);
  const alerts = useExternal ? (extAlerts ?? []) : localAlerts;

  const generateId = React.useCallback(() => {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `alert-${Math.random().toString(36).slice(2, 11)}`;
  }, []);

  const [editorDrawerOpen, setEditorDrawerOpen] = React.useState(false);
  const [presetDrawerOpen, setPresetDrawerOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<
    Pick<CustomAlert, "direction" | "description">
  >({
    direction: "",
    description: "",
  });
  const [editingAlertId, setEditingAlertId] = React.useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [selectedPresetIds, setSelectedPresetIds] = React.useState<string[]>(
    []
  );
  const [isPresetAdding, setIsPresetAdding] = React.useState(false);
  const presetSectionRefs = React.useRef<
    Record<PresetAlert["group"], HTMLElement | null>
  >({
    basic: null,
    code: null,
  });

  const togglePresetSelection = (presetId: string) => {
    setSelectedPresetIds((prev) =>
      prev.includes(presetId)
        ? prev.filter((id) => id !== presetId)
        : [...prev, presetId]
    );
  };

  const clearPresetSelection = () => setSelectedPresetIds([]);

  const selectedPresetObjects = React.useMemo(
    () => ALL_PRESETS.filter((preset) => selectedPresetIds.includes(preset.id)),
    [selectedPresetIds]
  );
  const selectedPresetCount = selectedPresetObjects.length;

  const scrollToPresetSection = (group: PresetAlert["group"]) => {
    const node = presetSectionRefs.current[group];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const addPresets = async (presets: readonly PresetAlert[]) => {
    if (!presets.length) return;
    setIsPresetAdding(true);
    try {
      for (const preset of presets) {
        await createAlert({
          direction: preset.direction,
          description: preset.description,
        });
      }
      clearPresetSelection();
      setPresetDrawerOpen(false);
    } finally {
      setIsPresetAdding(false);
    }
  };

  const addSelectedPresets = async () => {
    await addPresets(selectedPresetObjects);
  };

  const addPresetGroup = async (group: PresetAlert["group"]) => {
    await addPresets(group === "basic" ? BASIC_PRESETS : CODE_PRESETS);
  };

  const removeAlert = async (id: string) => {
    if (useExternal && onDeleteAlert) {
      await onDeleteAlert(id);
    } else {
      setLocalAlerts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const updateAlert = async (id: string, patch: Partial<CustomAlert>) => {
    if (useExternal && onUpdateAlert) {
      await onUpdateAlert(id, patch);
    } else {
      setLocalAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
      );
    }
  };

  const createAlert = async (
    payload: Pick<CustomAlert, "direction" | "description">
  ) => {
    if (useExternal && onCreateAlert) {
      await onCreateAlert(payload);
    } else {
      setLocalAlerts((prev) => [...prev, { id: generateId(), ...payload }]);
    }
  };

  const handleEditorDrawerClose = () => {
    setEditorDrawerOpen(false);
    setEditingAlertId(null);
  };

  const openCreateDrawer = () => {
    setFormState({ direction: "", description: "" });
    setEditingAlertId(null);
    setEditorDrawerOpen(true);
  };

  const openEditDrawer = (alert: CustomAlert) => {
    setFormState({
      direction: alert.direction,
      description: alert.description,
    });
    setEditingAlertId(alert.id);
    setEditorDrawerOpen(true);
  };

  const handleSaveAlert = async () => {
    const direction = formState.direction.trim();
    const description = formState.description.trim();
    if (!direction || !description) return;
    setIsSaving(true);
    try {
      if (editingAlertId) {
        await updateAlert(editingAlertId, { direction, description });
      } else {
        await createAlert({ direction, description });
      }
      handleEditorDrawerClose();
    } finally {
      setIsSaving(false);
    }
  };

  const resetExamples = async () => {
    const exampleSet = EXAMPLES.map((e) => ({ ...e, id: generateId() }));
    if (
      useExternal &&
      onDeleteAlert &&
      onCreateAlert &&
      Array.isArray(extAlerts)
    ) {
      await Promise.all(extAlerts.map((a) => onDeleteAlert(a.id)));
      for (const ex of exampleSet) {
        await onCreateAlert({
          direction: ex.direction,
          description: ex.description,
        });
      }
    } else {
      setLocalAlerts(exampleSet);
    }
  };

  const canSave = Boolean(
    formState.direction.trim() && formState.description.trim()
  );
  const hasAlerts = alerts.length > 0;
  const presetSections: Array<{
    id: PresetAlert["group"];
    title: string;
    description: string;
    presets: readonly PresetAlert[];
  }> = [
    {
      id: "code",
      title: "Emergency codes",
      description: "Structured color codes for fast-problem broadcasts.",
      presets: CODE_PRESETS,
    },
    {
      id: "basic",
      title: "Plain-talk basics",
      description: "Foundational radio etiquette cues for quick reminders.",
      presets: BASIC_PRESETS,
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Alerts & Etiquette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <section className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium">Custom alerts</p>
                <p className="text-muted-foreground text-xs">
                  Condensed list stays screenshot ready. Use the drawer to add
                  or edit alerts without cluttering the view.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPresetDrawerOpen(true)}
                  className="w-full sm:w-auto"
                >
                  Preset library
                </Button>
                <Button
                  size="sm"
                  onClick={openCreateDrawer}
                  className="w-full sm:w-auto"
                >
                  Add custom alert
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/5">
              {hasAlerts ? (
                <ol className="divide-y">
                  {alerts.map((alert) => (
                    <li
                      key={alert.id}
                      className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0 space-y-2">
                        <p className="font-semibold leading-tight">
                          {alert.direction || "Untitled alert"}
                        </p>
                        <p className="text-muted-foreground text-xs leading-snug border-l border-border pl-4">
                          {alert.description ||
                            "Add a description for quick context."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDrawer(alert)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => void removeAlert(alert.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="p-4 text-muted-foreground text-xs">
                  No alerts yet. Click “Add alert” or “Reset to examples” to
                  start a share-ready list.
                </div>
              )}
            </div>
          </section>

          <div className="grid gap-2">
            <p className="font-medium">Standard radio identification format</p>
            <p className="text-muted-foreground">
              To identify yourself on a radio, state the recipient’s call sign
              followed by “this is” and your own call sign, then “over”. For
              example: “Nighthawk, this is Drifter 23, over”. Use the
              recipient’s call sign first, then your call sign to make it clear
              who you are calling and who is doing the calling. In an event
              context, use your team’s established call signs and procedures for
              the specific situation.
            </p>
            <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
              <li>Identify the recipient: state their call sign.</li>
              <li>Use “this is”: precede your call sign with “this is”.</li>
              <li>Identify yourself: state your team/individual call sign.</li>
              <li>
                End with “over”: indicates you are waiting for a response.
              </li>
            </ul>
          </div>

          <div className="grid gap-2">
            <p className="font-medium">Civilian VHF — do’s and don’ts</p>
            <div className="grid gap-1">
              <p className="font-semibold">Do’s</p>
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                <li>
                  Monitor Channel 16 when not actively talking on another
                  channel.
                </li>
                <li>
                  Hail on Channel 16, then switch immediately to a working
                  channel to converse.
                </li>
                <li>
                  Be clear and concise: speak slowly, use standard phrases, keep
                  messages brief.
                </li>
                <li>
                  Use proper terminology: “Roger”/“Copy that” to acknowledge;
                  “Over” to yield; “Out” to end.
                </li>
                <li>
                  Identify your vessel or party at the start and end of
                  transmissions.
                </li>
                <li>
                  Listen first: ensure the channel is clear before transmitting.
                </li>
                <li>
                  Perform radio checks on a working channel with a specific
                  station (e.g., a marina).
                </li>
              </ul>
            </div>
            <div className="grid gap-1">
              <p className="font-semibold">Don’ts</p>
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                <li>
                  Don’t use Channel 16 for casual chat; it’s for distress and
                  hailing only.
                </li>
                <li>Don’t use profanity; transmissions are public.</li>
                <li>
                  Don’t monopolize channels; keep transmissions short so others
                  can use them.
                </li>
                <li>
                  Don’t interrupt or talk over others, especially during
                  distress traffic.
                </li>
                <li>
                  Don’t say “Over and out”; they are contradictory—use one or
                  the other appropriately.
                </li>
                <li>
                  Don’t transmit false distress calls; it’s a serious offense.
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Drawer
        open={presetDrawerOpen}
        direction="bottom"
        onOpenChange={(open) => {
          if (open) {
            setPresetDrawerOpen(true);
          } else {
            setPresetDrawerOpen(false);
            if (!isPresetAdding) {
              clearPresetSelection();
            }
          }
        }}
      >
        <DrawerContent className="bg-card text-card-foreground h-full max-h-[95vh]">
          <DrawerHeader>
            <DrawerTitle>Preset library</DrawerTitle>
            <DrawerDescription className="text-xs">
              Pick individual codes or plain-talk examples, or drop entire
              groups at once. Descriptions stay visible so everyone knows what
              you’re sharing.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-6 p-4 h-full overflow-y-auto">
            {presetSections.map((section) => (
              <section
                key={section.id}
                ref={(node) => {
                  presetSectionRefs.current[section.id] = node;
                }}
                className="space-y-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{section.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {section.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => void addPresetGroup(section.id)}
                    disabled={isPresetAdding}
                  >
                    Add entire group
                  </Button>
                </div>
                <div className="space-y-2 rounded-lg border bg-muted/20 p-2">
                  {section.presets.map((preset) => {
                    const checked = selectedPresetIds.includes(preset.id);
                    return (
                      <label
                        key={preset.id}
                        htmlFor={`preset-${preset.id}`}
                        className="flex cursor-pointer gap-3 rounded-md border bg-background/80 p-3 text-sm shadow-sm transition hover:border-primary/50"
                      >
                        <Checkbox
                          id={`preset-${preset.id}`}
                          checked={checked}
                          onCheckedChange={() =>
                            togglePresetSelection(preset.id)
                          }
                          className="mt-0.5"
                        />
                        <div className="space-y-1">
                          <p className="font-semibold leading-tight">
                            {preset.direction}
                          </p>
                          <p className="text-muted-foreground text-xs leading-snug">
                            {preset.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          <DrawerFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isPresetAdding}
              onClick={() => {
                clearPresetSelection();
                setPresetDrawerOpen(false);
              }}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => void addSelectedPresets()}
              disabled={selectedPresetCount === 0 || isPresetAdding}
            >
              {isPresetAdding
                ? "Adding…"
                : selectedPresetCount > 0
                  ? `Add ${selectedPresetCount} selected`
                  : "Add selected"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={editorDrawerOpen}
        direction="bottom"
        onOpenChange={(open) => {
          if (open) {
            setEditorDrawerOpen(true);
          } else {
            handleEditorDrawerClose();
          }
        }}
      >
        <DrawerContent className="bg-card text-card-foreground">
          <DrawerHeader>
            <DrawerTitle>
              {editingAlertId ? "Edit alert" : "Add alert"}
            </DrawerTitle>
            <DrawerDescription>
              Direction is the short cue you’ll transmit; description carries
              the scripted language.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4 p-4">
            <div className="grid gap-1">
              <Label htmlFor="alert-direction">Direction</Label>
              <Input
                id="alert-direction"
                placeholder="e.g., Consolidate ×3"
                value={formState.direction}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    direction: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="alert-description">Description</Label>
              <Textarea
                id="alert-description"
                placeholder="e.g., Consolidate, Consolidate, Consolidate — {location}."
                value={formState.description}
                rows={3}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DrawerFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isSaving}
              onClick={handleEditorDrawerClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSaveAlert()}
              disabled={!canSave || isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingAlertId
                  ? "Update alert"
                  : "Add alert"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default CommsAlertsCard;
