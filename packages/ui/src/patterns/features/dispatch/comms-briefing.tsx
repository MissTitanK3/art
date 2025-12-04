"use client";

import * as React from "react";
import type { ComBriefing } from "@workspace/store/types/comms.ts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@workspace/ui/primitives/card";
import { Button } from "@workspace/ui/primitives/button";
import { MarkdownEditor } from "@workspace/ui/patterns/common/markdown-editor";
import { MarkdownPreview } from "@workspace/ui/patterns/common/markdown-preview";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/primitives/popover";
import { cn } from "@workspace/ui/lib/utils";
import { Info, Sparkles } from "lucide-react";

type Props = {
  briefing: ComBriefing | null;
  onSave?: (patch: Partial<ComBriefing>) => void | Promise<void>;
  className?: string;
};
type SectionKey = "overview" | "comms_plan" | "safety_notes";

type BriefingForm = Record<SectionKey, string>;

const SECTION_CONFIG: Array<{
  key: SectionKey;
  label: string;
  placeholder: string;
  description: string;
}> = [
  {
    key: "overview",
    label: "Overview",
    placeholder: "Plain summary + arrival checklist",
    description:
      "Give a one-minute story and a quick checklist for anyone walking in.",
  },
  {
    key: "comms_plan",
    label: "Comms Plan",
    placeholder: "Primary/backup channels, who to hail, check-in timing",
    description: "List how to reach folks and what to do if the line fails.",
  },
  {
    key: "safety_notes",
    label: "Safety Notes",
    placeholder: "Weather, health concerns, evacuation cues, support info",
    description: "Call out anything that keeps people safe and calm.",
  },
];

const DEFAULT_TEMPLATE: BriefingForm = {
  overview: `## Mission Snapshot (what a new volunteer needs)

- Who's asking for help and what do they need?
- Where is the action happening? (address or landmark)
- What's the current condition? (calm, busy, smoky, etc.)

### Arrival Checklist
- [ ] Greet arrivals + share today's goal in plain language
  - [ ] Make a round of introductions with pronouns and role for event
- [ ] Point out restrooms / water / medical support
- [ ] Hand them a radio or buddy contact
- [ ] Confirm safety reminders + where to log questions
- [ ] Show where to record updates when they finish a task
`,
  comms_plan: `## Staying in Touch

- Main channel / platform:
- Backup or text thread if the main one drops:
- Who is the primary point of contact? (name + role)
- When should folks check in? (ex: "Quick update every 60 min")
- If something urgent happens, call/text:
`,
  safety_notes: `## Safety & Wellbeing

- Weather or neighborhood notes (heat, smoke, traffic, crowding)
- Health reminders (hydration, meds, allergies, accessibility needs)
- When to pause and call for help (describe the red flags)
- Where to regroup or rest:
- Support resources to share with community members:

> Speak plainly, stay kind, and repeat the why behind each instruction.
`,
};

const MARKDOWN_KEY: Array<{ label: string; syntax: string; preview: string }> =
  [
    {
      label: "Heading",
      syntax: "## Section Title",
      preview: "## Section Title",
    },
    {
      label: "Bullets",
      syntax: "- Item one\n- Item two",
      preview: "- Item one\n- Item two",
    },
    {
      label: "Numbered list",
      syntax: "1. First step\n2. Second step",
      preview: "1. First step\n2. Second step",
    },
    {
      label: "Callout",
      syntax: "> Radio reminder",
      preview: "> Radio reminder",
    },
    {
      label: "Checklist",
      syntax: "- [ ] Pending\n- [x] Done",
      preview: "- [ ] Pending\n- [x] Done",
    },
    {
      label: "Emphasis",
      syntax: "**Bold** and _italics_",
      preview: "**Bold** and _italics_",
    },
  ];

const BRIEFING_TIPS = [
  "Write like you're texting a friend who just tuned in.",
  "Explain acronyms the first time you use them (or skip them).",
  "Include what to do *and* why it matters to the community.",
  "Stamp every update with a time + name so handoffs are easy.",
];

const TeachingMoment = () => (
  <div className="rounded-lg border border-dashed bg-muted/40 px-3 py-3 text-xs">
    <div className="flex items-center gap-2 font-medium text-sm">
      <Sparkles className="h-4 w-4" />
      New to comms? Start here.
    </div>
    <ul className="mt-2 list-disc space-y-1 pl-5">
      {BRIEFING_TIPS.map((tip) => (
        <li key={tip}>{tip}</li>
      ))}
    </ul>
  </div>
);

const MarkdownKey = () => (
  <div className="rounded-lg border bg-muted/30 p-3 text-xs">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-semibold uppercase tracking-wide">
        Markdown helper
      </p>
      <p className="text-[11px] text-muted-foreground">Tap the i to see how</p>
    </div>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {MARKDOWN_KEY.map((item) => (
        <Popover key={item.label}>
          <div className="flex items-center justify-between rounded-md border bg-background/80 px-3 py-2 shadow-sm">
            <div>
              <p className="text-[12px] font-medium">{item.label}</p>
              <p className="text-[11px] text-muted-foreground">
                Show me an example
              </p>
            </div>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground"
                aria-label={`Show ${item.label} markdown example`}
              >
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent
            align="end"
            className="w-72 space-y-2 text-xs"
            sideOffset={8}
          >
            <div>
              <p className="text-[12px] font-semibold">Syntax you type</p>
              <pre className="mt-1 rounded-md bg-muted px-2 py-1 font-mono text-[11px] whitespace-pre-wrap">
                {item.syntax}
              </pre>
            </div>
            <div>
              <p className="text-[12px] font-semibold">
                What teammates will see
              </p>
              <MarkdownPreview
                className="prose-xs"
                source={item.preview}
                emptyText=""
              />
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  </div>
);

const createTemplate = (): BriefingForm => ({ ...DEFAULT_TEMPLATE });

const deriveBriefingState = (briefing: ComBriefing | null): BriefingForm => {
  const base = createTemplate();
  if (!briefing) return base;
  return {
    overview: briefing.overview ?? base.overview,
    comms_plan: briefing.comms_plan ?? base.comms_plan,
    safety_notes: briefing.safety_notes ?? base.safety_notes,
  };
};

export function CommsBriefing({ briefing, onSave, className }: Props) {
  const [editing, setEditing] = React.useState(false);
  const persisted = React.useMemo(
    () => deriveBriefingState(briefing),
    [briefing]
  );
  const [form, setForm] = React.useState<BriefingForm>(persisted);

  React.useEffect(() => {
    if (!editing) {
      setForm(persisted);
    }
  }, [persisted, editing]);

  const handleChange = React.useCallback((key: SectionKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetToTemplate = React.useCallback(() => {
    setForm(createTemplate());
  }, []);

  const toggleEditing = React.useCallback(() => {
    if (editing) {
      setForm(persisted);
      setEditing(false);
    } else {
      setEditing(true);
    }
  }, [editing, persisted]);

  const save = React.useCallback(async () => {
    if (!onSave) {
      setEditing(false);
      return;
    }
    await onSave(form);
    setEditing(false);
  }, [form, onSave]);

  const contentToDisplay = editing ? form : persisted;
  const isDirty = React.useMemo(
    () =>
      SECTION_CONFIG.some(
        (section) => form[section.key] !== persisted[section.key]
      ),
    [form, persisted]
  );
  const isTemplate = React.useMemo(
    () =>
      SECTION_CONFIG.every(
        (section) => form[section.key] === DEFAULT_TEMPLATE[section.key]
      ),
    [form]
  );

  const lastUpdatedLabel = React.useMemo(() => {
    if (!briefing?.updated_at) return null;
    const date = new Date(briefing.updated_at);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
  }, [briefing?.updated_at]);

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Briefing</CardTitle>
          <CardDescription>
            Standard reference for every comms operator shift.
          </CardDescription>
          {lastUpdatedLabel ? (
            <p className="text-xs text-muted-foreground">
              Last updated {lastUpdatedLabel}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              No saved briefing yet — using default template.
            </p>
          )}
        </div>
        {onSave ? (
          <Button size="sm" variant="outline" onClick={toggleEditing}>
            {editing ? "Close" : "Edit"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <TeachingMoment />
        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
          {SECTION_CONFIG.map((section) => (
            <section key={section.key} className="space-y-2">
              {editing ? (
                <MarkdownEditor
                  label={section.label}
                  description={section.description}
                  value={form[section.key]}
                  placeholder={section.placeholder}
                  onChange={(value) => handleChange(section.key, value)}
                />
              ) : (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold">{section.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <MarkdownPreview
                    source={contentToDisplay[section.key]}
                    emptyText="No notes yet."
                  />
                </div>
              )}
            </section>
          ))}
          <MarkdownKey />
        </div>
        {editing && onSave ? (
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Supports Markdown basics (headings, bullets, checklists).
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={resetToTemplate}
                disabled={isTemplate}
              >
                Reset to template
              </Button>
              <Button size="sm" onClick={save} disabled={!isDirty}>
                Save briefing
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default CommsBriefing;
